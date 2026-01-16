"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // Light theme code highlighting
import mermaid from 'mermaid';
import { api } from '../lib/request';
import { useSession } from '../lib/auth-client';

// Memoized component to render HTML content with Mermaid diagrams
// This prevents React from resetting the DOM (and losing Mermaid SVG) on parent re-renders
const MermaidContent = React.memo(({ html, className }: { html: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!html || !containerRef.current) return;

    // Use setTimeout to ensure DOM is updated
    const timer = setTimeout(async () => {
      // Find unprocessed mermaid blocks within this container
      const mermaidNodes = containerRef.current?.querySelectorAll('.mermaid');
      
        if (mermaidNodes && mermaidNodes.length > 0) {
        try {
          await mermaid.run({
            nodes: mermaidNodes as unknown as ArrayLike<HTMLElement>,
          });

          // Reveal content after successful render
          const containers = containerRef.current?.querySelectorAll('.mermaid-container');
          containers?.forEach(container => {
            const loading = container.querySelector('.mermaid-loading');
            const toolbar = container.querySelector('.mermaid-toolbar');
            const content = container.querySelector('.mermaid');
            
            if (loading) {
              loading.classList.add('opacity-0', 'pointer-events-none');
            }
            if (toolbar) {
              toolbar.classList.remove('opacity-0');
            }
            if (content) {
              content.classList.remove('opacity-0');
            }
          });
        } catch (error) {
          console.error('Mermaid rendering failed:', error);
          // Fallback: show raw content if render fails
          const containers = containerRef.current?.querySelectorAll('.mermaid-container');
          containers?.forEach(container => {
            const loading = container.querySelector('.mermaid-loading');
            const content = container.querySelector('.mermaid');
            if (loading) loading.classList.add('hidden');
            if (content) content.classList.remove('opacity-0');
          });
        }

        // Attach zoom listeners
        const handleZoom = (e: Event, delta: number) => {
          const btn = e.currentTarget as HTMLElement;
          const targetId = btn.getAttribute('data-target');
          if (!targetId) return;

          const el = document.getElementById(targetId);
          const levelEl = document.querySelector(`.zoom-level[data-target="${targetId}"]`);
          
          if (el) {
            let scale = parseFloat(el.getAttribute('data-scale') || '1');
            scale = Math.max(0.5, Math.min(3, scale + delta)); // Limit 0.5x to 3x
            el.style.transform = `scale(${scale})`;
            el.setAttribute('data-scale', scale.toString());
            if (levelEl) levelEl.textContent = `${Math.round(scale * 100)}%`;
          }
        };

        const handleReset = (e: Event) => {
          const btn = e.currentTarget as HTMLElement;
          const targetId = btn.getAttribute('data-target');
          if (!targetId) return;

          const el = document.getElementById(targetId);
          const levelEl = document.querySelector(`.zoom-level[data-target="${targetId}"]`);
          
          if (el) {
            el.style.transform = `scale(1)`;
            el.setAttribute('data-scale', '1');
            if (levelEl) levelEl.textContent = `100%`;
          }
        };

        // Helper to attach listener with cloning to prevent duplicates
        const attachListener = (selector: string, handler: (e: Event) => void) => {
          containerRef.current?.querySelectorAll(selector).forEach(btn => {
            const newBtn = btn.cloneNode(true);
            if (btn.parentNode) {
              btn.parentNode.replaceChild(newBtn, btn);
              newBtn.addEventListener('click', handler);
            }
          });
        };

        attachListener('.zoom-in-btn', (e) => handleZoom(e, 0.1));
        attachListener('.zoom-out-btn', (e) => handleZoom(e, -0.1));
        attachListener('.zoom-reset-btn', handleReset);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [html]);

  return <div ref={containerRef} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
});

MermaidContent.displayName = 'MermaidContent';

interface Category {
  id: string;
  name: string;
}

interface QuestionItem {
  id: string;
  title: string;
  content?: string;
  solution?: string;
  transcript?: string;
  interviewerQuestion?: string;
  categoryId: string;
  category?: Category;
  hotScore?: number;
  videoUrl?: string;
}

interface CodingCommunityProps {
  onLoginRequest?: () => void;
  viewMode?: 'default' | 'favorites' | 'favorites-only';
  onCloseFavorites?: () => void;
}

export default function CodingCommunity({ onLoginRequest, viewMode = 'default', onCloseFavorites }: CodingCommunityProps) {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>(['hot']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [solutionHtml, setSolutionHtml] = useState('');
  const [transcriptHtml, setTranscriptHtml] = useState('');
  const [activeTab, setActiveTab] = useState('solution');
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredQuestionId, setHoveredQuestionId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  // Show toast helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  // Scroll to top when question changes
  useEffect(() => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
  }, [selectedQuestion?.id, activeTab]);

  // Fetch favorites list
  useEffect(() => {
    if (session?.user) {
      api.get<any[]>('/favorites').then(res => {
        setFavoriteIds(new Set(res.map((item: any) => item.questionId)));
      }).catch(console.error);
    } else {
      setFavoriteIds(new Set());
    }
  }, [session]);

  // Check favorite status for selected question
  useEffect(() => {
    if (selectedQuestion) {
      setIsFavorite(favoriteIds.has(selectedQuestion.id));
    }
  }, [selectedQuestion, favoriteIds]);

  const toggleFavorite = async () => {
    if (!session?.user) {
      onLoginRequest?.();
      return;
    }

    if (!selectedQuestion) return;

    try {
      // Optimistic update
      const newStatus = !isFavorite;
      setIsFavorite(newStatus);
      showToast(newStatus ? '已添加到收藏' : '已取消收藏');
      
      // Update local set
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (newStatus) {
          next.add(selectedQuestion.id);
        } else {
          next.delete(selectedQuestion.id);
        }
        return next;
      });

      const res = await api.post<{ isFavorite: boolean }>(`/favorites/${selectedQuestion.id}`, {});
      
      // Sync with server if mismatch
      if (res.isFavorite !== newStatus) {
         setIsFavorite(res.isFavorite);
         setFavoriteIds(prev => {
            const next = new Set(prev);
            if (res.isFavorite) {
              next.add(selectedQuestion.id);
            } else {
              next.delete(selectedQuestion.id);
            }
            return next;
         });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      showToast('操作失败，请重试', 'error');
      setIsFavorite(!isFavorite); // Revert
       setFavoriteIds(prev => {
        const next = new Set(prev);
        if (!isFavorite) { // We tried to set it to true but failed, so revert to false (remove)
           next.delete(selectedQuestion.id);
        } else { // We tried to set it to false but failed, so revert to true (add)
           next.add(selectedQuestion.id);
        }
        return next;
      });
    }
  };

  // Configure marked with highlight.js
  const marked = useMemo(() => {
    const renderer = {
      html(token: any) {
        const text = typeof token === 'string' ? token : token.text;
        return text.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      },
      code({ text, lang }: any) {
        if (lang === 'mermaid') {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          return `
            <div class="mermaid-container my-8 border border-primary-200 rounded-xl bg-white shadow-sm overflow-hidden group/mermaid print:border-none print:shadow-none relative">
              <div class="mermaid-loading absolute inset-0 flex flex-col items-center justify-center bg-white z-10 transition-opacity duration-300">
                  <svg class="animate-spin h-6 w-6 text-primary-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-xs text-primary-400 font-medium">渲染流程图...</span>
              </div>
              
              <div class="mermaid-toolbar flex items-center justify-between px-4 py-2 bg-primary-50 border-b border-primary-100 print:hidden opacity-0 transition-opacity duration-300">
                <span class="text-xs font-medium text-primary-500 flex items-center gap-1.5 select-none">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  流程图
                </span>
                <div class="flex items-center gap-1">
                   <button class="p-1.5 hover:bg-white rounded-md text-primary-500 hover:text-primary-700 transition-colors zoom-out-btn" data-target="${id}" title="缩小">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                   </button>
                   <span class="text-xs font-mono text-primary-400 w-9 text-center zoom-level select-none" data-target="${id}">100%</span>
                   <button class="p-1.5 hover:bg-white rounded-md text-primary-500 hover:text-primary-700 transition-colors zoom-in-btn" data-target="${id}" title="放大">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                   </button>
                   <div class="w-px h-3 bg-primary-200 mx-1"></div>
                   <button class="p-1.5 hover:bg-white rounded-md text-primary-500 hover:text-primary-700 transition-colors zoom-reset-btn" data-target="${id}" title="重置">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                   </button>
                </div>
              </div>
              <div class="overflow-auto p-6 bg-white flex justify-center items-center min-h-[120px] relative">
                 <div id="${id}" class="mermaid transition-opacity duration-300 opacity-0 ease-out origin-center" data-scale="1">${text}</div>
              </div>
            </div>
          `;
        }
        const language = lang || 'plaintext';
        return `<pre><code class="hljs language-${language}">${text}</code></pre>`;
      }
    };

    return new Marked(
      markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang) {
          if (lang === 'mermaid') return code;
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          return hljs.highlight(code, { language }).value;
        }
      }),
      { renderer }
    );
  }, []);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsData, categoriesData] = await Promise.all([
          api.get<QuestionItem[]>('/questions'),
          api.get<Category[]>('/questions/categories')
        ]);
        setQuestions(questionsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategoryIds(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const groupedQuestions = useMemo(() => {
    const groups: Record<string, QuestionItem[]> = {};
    
    // Initialize groups for all categories
    categories.forEach(cat => {
      groups[cat.id] = [];
    });

    // Distribute questions
    questions.forEach(q => {
      if (groups[q.categoryId]) {
        groups[q.categoryId].push(q);
      } else {
        // Handle uncategorized or unknown category
        if (!groups['uncategorized']) groups['uncategorized'] = [];
        groups['uncategorized'].push(q);
      }
    });

    return groups;
  }, [questions, categories]);

  // Expand category when a question is selected
  // useEffect(() => {
  //   if (selectedQuestion && selectedQuestion.categoryId) {
  //     setExpandedCategoryIds(prev => {
  //       if (!prev.includes(selectedQuestion.categoryId)) {
  //         return [...prev, selectedQuestion.categoryId];
  //       }
  //       return prev;
  //     });
  //   }
  // }, [selectedQuestion]);

  const filteredQuestions = useMemo(() => {
    let result = questions;

    if (viewMode === 'favorites-only') {
      result = result.filter(q => favoriteIds.has(q.id));
    }

    if (searchQuery) {
      result = result.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return result;
  }, [questions, searchQuery, viewMode, favoriteIds]);

  // Hot Questions sorted by hotScore
  const hotQuestions = useMemo(() => {
    return [...questions]
      .sort((a, b) => (b.hotScore || 0) - (a.hotScore || 0))
      .slice(0, 5);
  }, [questions]);

  // Video Preview Component
  const VideoPreview = ({ url, title }: { url: string; title: string }) => {
    return (
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 bg-white rounded-lg shadow-xl border border-primary-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
        <div className="relative aspect-video bg-black rounded overflow-hidden mb-2">
          <video 
            src={url} 
            className="w-full h-full object-cover"
            autoPlay 
            muted 
            loop 
            playsInline
          />
        </div>
        <div className="text-xs text-primary-600 font-medium truncate px-1">
          {title}
        </div>
        <div className="text-[10px] text-primary-400 px-1 mt-0.5">
          正在播放视频讲解
        </div>
        {/* Arrow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-primary-200 transform rotate-45"></div>
      </div>
    );
  };

  const favoriteQuestions = useMemo(() => {
    return questions.filter(q => favoriteIds.has(q.id));
  }, [questions, favoriteIds]);

  const selectQuestion = async (item: QuestionItem) => {
    setSelectedQuestion(item);
    setActiveTab('solution');
    
    try {
      if (item.solution) {
        const html = await marked.parse(item.solution);
        setSolutionHtml(html);
      } else {
        setSolutionHtml('<p>暂无题解</p>');
      }

      if (item.transcript) {
        const html = await marked.parse(item.transcript);
        setTranscriptHtml(html);
      } else {
        setTranscriptHtml('');
      }
    } catch (error) {
      console.error('Failed to parse content:', error);
      setSolutionHtml('<p>加载失败，请稍后重试</p>');
    }
  };

  const markdownStyles = `
    [&>h1]:text-2xl [&>h1]:pb-3 [&>h1]:border-b [&>h1]:border-primary-200 [&>h1]:mt-0 [&>h1]:mb-5 [&>h1]:font-bold [&>h1]:text-primary-900 [&>h1]:relative [&>h1]:after:content-[''] [&>h1]:after:absolute [&>h1]:after:bottom-[-1px] [&>h1]:after:left-0 [&>h1]:after:w-[50px] [&>h1]:after:h-[3px] [&>h1]:after:bg-accent-copper [&>h1]:after:rounded-[2px]
    [&>h2]:text-xl [&>h2]:mt-[30px] [&>h2]:mb-4 [&>h2]:font-semibold [&>h2]:text-primary-900 [&>h2]:pl-[10px] [&>h2]:border-l-4 [&>h2]:border-accent-copper [&>h2]:leading-[1.4]
    [&>h3]:text-[17px] [&>h3]:mt-6 [&>h3]:mb-[14px] [&>h3]:font-semibold [&>h3]:text-primary-800
    [&>p]:mt-0 [&>p]:mb-4 [&>p]:text-justify
    [&_pre]:p-4 [&_pre]:overflow-auto [&_pre]:text-[13px] [&_pre]:leading-[1.5] [&_pre]:bg-white [&_pre]:rounded-lg [&_pre]:mb-5 [&_pre]:text-primary-800 [&_pre]:shadow-sm [&_pre]:border [&_pre]:border-primary-200
    [&_pre_code.hljs]:bg-transparent [&_pre_code.hljs]:p-0
    [&_code]:font-mono
    [&_:not(pre)>code]:p-[3px_6px] [&_:not(pre)>code]:mx-[2px] [&_:not(pre)>code]:text-[0.9em] [&_:not(pre)>code]:bg-accent-copper/10 [&_:not(pre)>code]:text-accent-copper [&_:not(pre)>code]:rounded
    [&_blockquote]:p-[16px_20px] [&_blockquote]:text-primary-600 [&_blockquote]:bg-primary-50 [&_blockquote]:border-l-4 [&_blockquote]:border-accent-copper [&_blockquote]:my-6 [&_blockquote]:rounded-r
    [&_ul]:pl-6 [&_ul]:mb-5 [&_ol]:pl-6 [&_ol]:mb-5
    [&_li]:mb-2
    [&_a]:text-accent-copper [&_a]:no-underline [&_a]:font-medium [&_a]:border-b [&_a]:border-dashed [&_a]:border-accent-copper [&_a]:transition-all [&_a]:hover:border-solid [&_a]:hover:opacity-80
  `;

  return (
    <div className="flex h-full bg-primary-50 p-5 gap-5 box-border relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-200 ${
          toast.type === 'success' ? 'bg-white text-green-600 border border-green-100' : 'bg-white text-red-600 border border-red-100'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-[320px] bg-neutral-white flex flex-col shadow-[0_4px_12px_rgba(45,31,31,0.03)] h-full overflow-hidden rounded-xl border border-primary-100 shrink-0">
        <div className="p-4 flex flex-col gap-[15px] relative after:content-[''] after:block after:w-[80%] after:h-[1px] after:bg-primary-100 after:mx-auto after:mt-[5px]">
          <div className="flex items-center">
            <div className="flex-1 min-w-0 relative flex items-center">
              <i className="absolute left-3 text-primary-300 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索题目..."
                className="w-full box-border py-[10px] pr-3 pl-9 border border-primary-200 rounded-lg text-sm transition-all outline-none bg-primary-50 text-primary-700 focus:border-accent-copper focus:bg-neutral-white focus:shadow-[0_0_0_2px_rgba(205,133,63,0.1)]"
              />
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-[10px] m-0 pt-0">
          {isLoading ? (
            <div className="p-4 text-center text-primary-400 text-sm">加载中...</div>
          ) : (searchQuery || viewMode === 'favorites-only') ? (
             // Search Mode or Favorites Only Mode: Flat List
            <ul className="list-none m-0 p-0">
              {filteredQuestions.length === 0 ? (
                <div className="p-4 text-center text-primary-400 text-sm">
                  {viewMode === 'favorites-only' && !searchQuery ? '暂无收藏题目' : '无匹配题目'}
                </div>
              ) : (
                filteredQuestions.map((item, index) => (
                  <li
                    key={item.id}
                    onClick={() => selectQuestion(item)}
                    className={`group p-[10px_14px] mb-1 cursor-pointer rounded-lg transition-all duration-200 flex items-start gap-3 text-sm text-primary-700 leading-relaxed hover:bg-primary-100 hover:text-primary-900 ${selectedQuestion?.id === item.id ? 'bg-primary-200 text-primary-900 font-medium' : ''}`}
                  >
                    <span className="flex-1 truncate" title={item.title}>
                      {item.title}
                    </span>
                    <span className="text-xs text-primary-400 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                      {categories.find(c => c.id === item.categoryId)?.name || '未分类'}
                    </span>
                  </li>
                ))
              )}
            </ul>
          ) : (
             // Tree View Mode
            <div className="flex flex-col">
              <div className="px-3 pb-2 pt-0">
                {/* Hot Questions Category */}
                <div className="mb-1">
                  <div 
                    onClick={() => {
                      toggleCategory('hot');
                      setSelectedQuestion(null);
                    }}
                    className={`flex items-center gap-2 p-2 px-3 cursor-pointer rounded-lg transition-colors text-sm group ${
                      !selectedQuestion && expandedCategoryIds.includes('hot') // Highlight if open and no specific selection? Or just rely on item selection
                        ? 'text-primary-900 bg-primary-50 font-medium' 
                        : 'text-primary-700 hover:bg-gray-50'
                    }`}
                  >
                     <svg 
                      className={`w-3.5 h-3.5 text-primary-400 transition-transform duration-200 ${expandedCategoryIds.includes('hot') ? 'rotate-90' : ''}`} 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <div className="flex items-center gap-2 flex-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M12 2a5 5 0 0 1 3.5 1.5 5 5 0 0 1 1 3.5v.5c0 3.5-2.5 6-5.5 6S5.5 11 5.5 7.5v-.5a5 5 0 0 1 1-3.5A5 5 0 0 1 12 2z"></path><path d="M12 14c-4 0-6 2-6 5v2h12v-2c0-3-2-5-6-5z"></path><path d="M12 2v.5"></path><path d="M15.5 5.5l.5-.5"></path><path d="M8.5 5.5l-.5-.5"></path></svg>
                      <span>热门题目</span>
                    </div>
                  </div>
                  
                  {expandedCategoryIds.includes('hot') && (
                    <div className="ml-4 pl-3 border-l border-primary-100 mt-1 relative">
                      {hotQuestions.map((item, index) => (
                        <div key={item.id} className="relative h-9 mb-0.5 z-0 hover:z-20">
                          <div
                            onClick={() => selectQuestion(item)}
                            className={`group absolute top-0 left-0 w-full p-2 rounded-md cursor-pointer text-sm transition-all duration-300 ease-in-out overflow-hidden max-h-9 hover:max-h-[200px] hover:shadow-lg ${
                              selectedQuestion?.id === item.id 
                                ? 'text-primary-900 bg-primary-100 font-medium z-10' 
                                : 'text-primary-500 hover:text-primary-900 hover:bg-white bg-transparent'
                            }`}
                          >
                            <div className="flex gap-2">
                              <span className={`text-xs font-mono min-w-[1rem] pt-0.5 text-center ${
                                index === 0 ? 'text-[#FF2D55] font-black italic text-sm scale-110 drop-shadow-sm' :
                                index === 1 ? 'text-[#FF9500] font-extrabold italic' :
                                index === 2 ? 'text-[#FFCC00] font-bold italic' :
                                'text-primary-300'
                              }`}>
                                {index + 1}
                              </span>
                              <div className="truncate group-hover:whitespace-normal group-hover:text-clip transition-none flex-1">
                                {item.title}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {categories.map(category => {
                  const categoryQuestions = groupedQuestions[category.id] || [];
                  const isExpanded = expandedCategoryIds.includes(category.id);
                  const isActiveCategory = selectedQuestion?.categoryId === category.id;
                  
                  if (categoryQuestions.length === 0) return null;

                  return (
                    <div key={category.id} className="mb-1">
                      <div 
                        onClick={() => toggleCategory(category.id)}
                        className={`flex items-center gap-2 p-2 px-3 cursor-pointer rounded-lg transition-colors text-sm group ${
                          isActiveCategory && !selectedQuestion 
                            ? 'text-primary-900 bg-primary-50 font-medium' 
                            : 'text-primary-700 hover:bg-gray-50'
                        }`}
                      >
                         <svg 
                          className={`w-3.5 h-3.5 text-primary-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="flex-1">{category.name}</span>
                        <span className="text-xs text-primary-300 bg-white px-1.5 py-0.5 rounded border border-primary-100 group-hover:border-primary-200 transition-colors">
                          {categoryQuestions.length}
                        </span>
                      </div>
                      
                      {isExpanded && (
                        <div className="ml-4 pl-3 border-l border-primary-100 mt-1">
                          {categoryQuestions.map((item, index) => (
                            <div key={item.id} className="relative h-9 mb-0.5 z-0 hover:z-20">
                              <div
                                onClick={() => selectQuestion(item)}
                                className={`group absolute top-0 left-0 w-full p-2 rounded-md cursor-pointer text-sm transition-all duration-300 ease-in-out overflow-hidden max-h-9 hover:max-h-[200px] hover:shadow-lg ${
                                  selectedQuestion?.id === item.id 
                                    ? 'text-primary-900 bg-primary-100 font-medium z-10' 
                                    : 'text-primary-500 hover:text-primary-900 hover:bg-white bg-transparent'
                                }`}
                              >
                                <div className="flex gap-2">
                                  <span className="text-xs font-mono min-w-[1rem] pt-0.5 text-center text-primary-300">
                                    {index + 1}
                                  </span>
                                  <div className="truncate group-hover:whitespace-normal group-hover:text-clip transition-none flex-1">
                                    {item.title}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-0 bg-neutral-white rounded-xl shadow-[0_4px_12px_rgba(45,31,31,0.03)] flex flex-col overflow-hidden border border-primary-100 relative">
        {selectedQuestion ? (
          <>
            <div className="flex items-center justify-between px-8 py-4 border-b border-primary-100 bg-neutral-white">
              <div className="flex p-1.5 bg-primary-50 rounded-xl">
                <button
                  onClick={() => setActiveTab('solution')}
                  className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === 'solution'
                      ? 'bg-neutral-white text-accent-copper shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                      : 'text-primary-500 hover:text-primary-700'
                  }`}
                >
                  题解
                </button>
                <button
                  onClick={() => setActiveTab('answer')}
                  className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === 'answer'
                      ? 'bg-neutral-white text-accent-copper shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                      : 'text-primary-500 hover:text-primary-700'
                  }`}
                >
                  模拟回答
                </button>
                <button
                  onClick={() => setActiveTab('explanation')}
                  className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === 'explanation'
                      ? 'bg-neutral-white text-accent-copper shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                      : 'text-primary-500 hover:text-primary-700'
                  }`}
                >
                  好题精讲
                </button>
              </div>

              {/* Favorite Button */}
              <div 
                onClick={toggleFavorite}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 border select-none ${
                  isFavorite 
                    ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100' 
                    : 'bg-white text-gray-400 border-gray-200 hover:text-gray-600 hover:border-gray-300'
                }`}
                title={isFavorite ? "取消收藏" : "收藏题目"}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill={isFavorite ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={`w-5 h-5 transition-transform duration-200 ${isFavorite ? 'scale-110' : ''}`}
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="text-sm font-medium">{isFavorite ? "已收藏" : "收藏"}</span>
              </div>
            </div>
            
            {activeTab === 'solution' ? (
              <div 
                ref={contentScrollRef}
                className={`markdown-body p-6 sm:p-[30px] overflow-y-auto flex-1 text-[15px] leading-relaxed text-primary-800 custom-scrollbar ${markdownStyles}`}
              >
                <div className="max-w-4xl mx-auto min-h-full flex flex-col">
                  <MermaidContent html={solutionHtml} className="flex-1" />
                  
                  {/* Bottom Navigation */}
                  <div className="mt-12 pt-8 border-t border-primary-100 flex justify-between items-center text-sm">
                    <button className="group flex items-center gap-2 px-4 py-2 rounded-lg text-primary-500 hover:text-primary-900 hover:bg-primary-50 transition-all cursor-not-allowed opacity-50" disabled>
                      <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>上一题</span>
                    </button>
                    
                    <button className="group flex items-center gap-2 px-4 py-2 rounded-lg text-primary-500 hover:text-primary-900 hover:bg-primary-50 transition-all cursor-not-allowed opacity-50" disabled>
                      <span>下一题</span>
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'answer' ? (
              <div 
                ref={contentScrollRef}
                className="flex-1 p-6 sm:p-[30px] overflow-y-auto custom-scrollbar bg-neutral-white/50"
              >
                <div className="flex flex-col gap-8 max-w-3xl mx-auto">
                   {/* Interviewer Question */}
                   <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0 text-xl border border-primary-200">
                       🤖
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-1.5">
                         <span className="text-sm font-bold text-primary-900">面试官</span>
                         <span className="text-xs text-primary-400">Interviewer</span>
                       </div>
                       <div className="bg-white border border-primary-200 p-4 rounded-2xl rounded-tl-none shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative">
                         <div className="text-primary-800 leading-relaxed whitespace-pre-wrap">
                           {selectedQuestion.interviewerQuestion || '请简述一下这个知识点。'}
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* User Answer */}
                   <div className="flex items-start gap-4 flex-row-reverse">
                     <div className="w-10 h-10 rounded-full bg-accent-copper/10 flex items-center justify-center shrink-0 text-accent-copper font-bold text-sm border border-accent-copper/20">
                       ME
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-1.5 flex-row-reverse">
                         <span className="text-sm font-bold text-primary-900">我</span>
                         <span className="text-xs text-primary-400">Candidate</span>
                       </div>
                       <div className="bg-primary-50 border border-primary-100 p-4 rounded-2xl rounded-tr-none shadow-sm relative overflow-hidden">
                         {transcriptHtml ? (
                            <MermaidContent 
                              html={transcriptHtml} 
                              className={`markdown-body text-primary-800 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 ${markdownStyles}`}
                            />
                          ) : (
                           <p className="text-primary-400 italic">暂无回答记录</p>
                         )}
                       </div>
                     </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 p-6 sm:p-[30px] overflow-y-auto custom-scrollbar bg-neutral-white/50 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4 text-3xl">
                  🎥
                </div>
                <h3 className="text-lg font-bold text-primary-800 mb-2">好题精讲</h3>
                <p className="text-primary-500 text-sm">该题目的深度解析视频/文章即将上线，敬请期待！</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-primary-400 p-8 overflow-y-auto custom-scrollbar">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-3 text-primary-800">编程社区题库</h2>
              <p className="text-primary-500">精选面试真题，助你斩获 Offer</p>
            </div>

            <div className="w-full max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔥</span>
                <h3 className="text-lg font-bold text-primary-800">热门推荐</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotQuestions.map((item, index) => (
                  <div 
                    key={`hot-grid-${item.id}`}
                    onClick={() => selectQuestion(item)}
                    onMouseEnter={() => setHoveredQuestionId(item.id)}
                    onMouseLeave={() => setHoveredQuestionId(null)}
                    className="bg-white p-4 rounded-xl border border-primary-100 shadow-sm hover:shadow-md hover:border-accent-copper/30 transition-all cursor-pointer group relative"
                  >
                    {/* Video Preview Popup for Grid Item */}
                    {hoveredQuestionId === item.id && (item.videoUrl || item.id === hotQuestions[0].id) && (
                      <VideoPreview 
                        url={item.videoUrl || "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"} 
                        title={item.title} 
                      />
                    )}

                    <div className="flex items-start gap-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                        index < 3 ? 'bg-red-50 text-red-600' : 'bg-primary-100 text-primary-600'
                      }`}>
                        TOP {index + 1}
                      </span>
                      <h4 className="font-medium text-primary-800 group-hover:text-accent-copper transition-colors line-clamp-2 flex-1">
                        {item.title}
                      </h4>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-primary-400">
                       <span>{categories.find(c => c.id === item.categoryId)?.name || '未分类'}</span>
                       <span className="group-hover:translate-x-1 transition-transform">立即练习 →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Favorites Floating Panel (Moved outside Main Content) */}
      {viewMode === 'favorites' && (
        <div className="absolute right-5 top-5 bottom-5 w-[260px] bg-white/95 backdrop-blur-md shadow-2xl border border-primary-100 flex flex-col z-20 overflow-hidden rounded-xl animate-in fade-in slide-in-from-right-10 duration-500 ease-out">
          <div className="p-4 border-b border-primary-100/50 bg-gradient-to-r from-primary-50/80 to-white flex items-center justify-between backdrop-blur-sm">
             <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded-md bg-accent-gold/10 flex items-center justify-center text-accent-gold">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                   <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                 </svg>
               </div>
               <div>
                 <h3 className="text-sm font-bold text-primary-900 leading-tight">我的收藏</h3>
                 <p className="text-[10px] text-primary-500 mt-0.5">共 {favoriteQuestions.length} 题</p>
               </div>
             </div>
             <button 
               onClick={onCloseFavorites}
               className="w-6 h-6 flex items-center justify-center text-primary-400 hover:text-primary-800 hover:bg-primary-100 rounded-full transition-all duration-200"
               title="关闭面板"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <line x1="18" y1="6" x2="6" y2="18"></line>
                 <line x1="6" y1="6" x2="18" y2="18"></line>
               </svg>
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-3 bg-primary-50/30">
             {favoriteQuestions.length > 0 ? (
               <div className="flex flex-col gap-2">
                 {favoriteQuestions.map((item, index) => (
                   <div 
                     key={`fav-list-${item.id}`}
                     onClick={() => selectQuestion(item)}
                     className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer group relative overflow-hidden ${
                        selectedQuestion?.id === item.id 
                          ? 'bg-white border-accent-copper shadow-sm ring-1 ring-accent-copper/20' 
                          : 'bg-white border-primary-100/60 hover:border-accent-copper/40 hover:shadow-md hover:shadow-accent-copper/5 hover:-translate-y-0.5'
                     }`}
                   >
                     {selectedQuestion?.id === item.id && (
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-copper"></div>
                     )}
                     <div className="flex items-start gap-2">
                       <span className={`text-[10px] font-bold px-1 py-0.5 rounded border mt-0.5 shrink-0 ${
                          selectedQuestion?.id === item.id
                            ? 'bg-accent-copper/10 text-accent-copper border-accent-copper/20'
                            : 'bg-primary-50 text-primary-400 border-primary-100 group-hover:border-accent-copper/20 group-hover:text-accent-copper/80'
                       }`}>
                         #{index + 1}
                       </span>
                       <h4 className={`text-xs font-medium leading-snug line-clamp-2 transition-colors ${
                          selectedQuestion?.id === item.id ? 'text-primary-900' : 'text-primary-700 group-hover:text-primary-900'
                       }`}>
                         {item.title}
                       </h4>
                     </div>
                     
                     <div className="mt-2 flex items-center justify-between">
                       <div className="flex items-center gap-1">
                         <span className="text-[10px] text-primary-400 bg-primary-50 px-1.5 py-0.5 rounded-full border border-primary-100/50 scale-90 origin-left">
                           {categories.find(c => c.id === item.categoryId)?.name || '未分类'}
                         </span>
                       </div>
                       <div className={`text-accent-copper opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300 ${selectedQuestion?.id === item.id ? '!opacity-100 !translate-x-0' : ''}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M5 12h14"></path>
                           <path d="M12 5l7 7-7 7"></path>
                         </svg>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-center p-6">
                 <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-3 text-3xl shadow-inner border border-primary-100">
                   📭
                 </div>
                 <h4 className="text-primary-800 font-bold mb-1 text-sm">暂无收藏</h4>
                 <p className="text-xs text-primary-400 max-w-[150px] leading-relaxed">
                   点击题目右上角的“收藏”按钮添加
                 </p>
               </div>
             )}
           </div>
        </div>
      )}

    </div>
  );
}
