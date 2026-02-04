"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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

      // Attach copy listeners
      const handleCopy = async (e: Event) => {
        const btn = e.currentTarget as HTMLElement;
        const container = btn.closest('.code-block-wrapper');
        if (!container) return;
        
        const codeEl = container.querySelector('code');
        if (!codeEl) return;
        
        const text = codeEl.textContent || '';
        
        try {
          await navigator.clipboard.writeText(text);
          
          // Visual feedback
          const originalIcon = btn.innerHTML;
          btn.innerHTML = `
            <svg class="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          `;
          setTimeout(() => {
            btn.innerHTML = originalIcon;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      };

      attachListener('.copy-code-btn', handleCopy);

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

export interface Category {
  id: string;
  name: string;
}

export interface QuestionItem {
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
  initialQuestionId?: string;
  onQuestionSelect?: (id: string | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  questions?: QuestionItem[];
  categories?: Category[];
}

const QuestionListItem = ({ 
  item, 
  index, 
  isSelected,
  onSelect,
  isHot = false
}: { 
  item: QuestionItem; 
  index: number; 
  isSelected: boolean;
  onSelect: (item: QuestionItem) => void;
  isHot?: boolean;
}) => {
  return (
    <div className="relative mb-0.5">
      <div
        onClick={() => onSelect(item)}
        className={`group w-full p-2 rounded-md cursor-pointer text-sm transition-colors duration-200 ease-in-out overflow-hidden ${
          isSelected 
            ? 'text-primary-900 bg-primary-100 font-medium' 
            : 'text-primary-500 hover:text-primary-900 hover:bg-primary-50 bg-transparent'
        }`}
      >
        <div className="flex items-start gap-2">
          <span className={`text-xs font-mono min-w-[1rem] shrink-0 pt-0.5 text-center ${
            isHot && index === 0 ? 'text-[#FF2D55] font-black italic text-sm scale-110 drop-shadow-sm' :
            isHot && index === 1 ? 'text-[#FF9500] font-extrabold italic' :
            isHot && index === 2 ? 'text-[#FFCC00] font-bold italic' :
            'text-primary-300'
          }`}>
            {index + 1}
          </span>
          <div className="flex-1 leading-relaxed line-clamp-1 break-all">
            {item.title}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CodingCommunity({ 
  onLoginRequest, 
  viewMode = 'default', 
  onCloseFavorites, 
  initialQuestionId,
  onQuestionSelect,
  searchQuery: externalSearchQuery,
  onSearchChange,
  questions: propQuestions,
  categories: propCategories
}: CodingCommunityProps) {
  const { data: session } = useSession();
  const [hotLimit, setHotLimit] = useState(10);
  const [hotExpandedLimit, setHotExpandedLimit] = useState(20);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [limitRes, expandedLimitRes] = await Promise.all([
          api.get('/system/config/hot_questions_limit'),
          api.get('/system/config/hot_questions_expanded_limit')
        ]);
        if (limitRes) setHotLimit(Number(limitRes));
        if (expandedLimitRes) setHotExpandedLimit(Number(expandedLimitRes));
      } catch (e) {
        console.error("Failed to fetch config", e);
      }
    };
    fetchConfig();
  }, []);

  const [internalQuestions, setInternalQuestions] = useState<QuestionItem[]>([]);
  const [internalCategories, setInternalCategories] = useState<Category[]>([]);
  
  const questions = propQuestions || internalQuestions;
  const categories = propCategories || internalCategories;
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>(['hot']);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  
  // Use external search query if provided, otherwise use internal
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = onSearchChange || setInternalSearchQuery;

  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [solutionHtml, setSolutionHtml] = useState('');
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const [transcriptHtml, setTranscriptHtml] = useState('');
  const [activeTab, setActiveTab] = useState('solution');
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredQuestionId, setHoveredQuestionId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isHotExpanded, setIsHotExpanded] = useState(false);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  const isFavorite = useMemo(() => {
    return selectedQuestion ? favoriteIds.has(selectedQuestion.id) : false;
  }, [selectedQuestion, favoriteIds]);

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
  // useEffect(() => {
  //   if (selectedQuestion) {
  //     setIsFavorite(favoriteIds.has(selectedQuestion.id));
  //   }
  // }, [selectedQuestion, favoriteIds]);

  const toggleFavorite = async () => {
    if (!session?.user) {
      onLoginRequest?.();
      return;
    }

    if (!selectedQuestion) return;

    try {
      // Optimistic update
      const newStatus = !isFavorite;
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
      heading({ text, depth }: any) {
        const cleanText = text.replace(/<[^>]*>?/gm, '');
        const id = cleanText.trim().replace(/\s+/g, '-').toLowerCase().replace(/[^\w\u4e00-\u9fa5-]/g, '');
        return `<h${depth} id="${id}">${text}</h${depth}>`;
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
        return `
          <div class="code-block-wrapper group/code relative my-6 rounded-xl overflow-hidden border border-primary-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-neutral-white transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <div class="flex items-center justify-between px-4 py-3 bg-primary-50/30 border-b border-primary-100/50 backdrop-blur-sm rounded-t-xl">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_2px_rgba(0,0,0,0.1)] border border-black/5 hover:scale-110 transition-transform duration-200"></div>
                <div class="w-3 h-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_2px_rgba(0,0,0,0.1)] border border-black/5 hover:scale-110 transition-transform duration-200"></div>
                <div class="w-3 h-3 rounded-full bg-[#28c840] shadow-[inset_0_0_2px_rgba(0,0,0,0.1)] border border-black/5 hover:scale-110 transition-transform duration-200"></div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-[10px] font-mono font-medium text-primary-400 uppercase tracking-wider select-none opacity-0 group-hover/code:opacity-100 transition-opacity">
                  ${language}
                </div>
                <button class="copy-code-btn opacity-0 group-hover/code:opacity-100 transition-opacity p-1.5 hover:bg-primary-100 rounded-md text-primary-400 hover:text-primary-600" title="复制/Copy">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <pre class="!my-0 !border-none !rounded-none !bg-transparent !shadow-none overflow-x-auto custom-scrollbar"><code class="hljs language-${language} !bg-transparent font-mono text-[13px] leading-relaxed">${text}</code></pre>
          </div>
        `;
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

  // Extract TOC from solutionHtml
  useEffect(() => {
    if (!solutionHtml) {
      setToc([]);
      return;
    }
    const div = document.createElement('div');
    div.innerHTML = solutionHtml;
    const headings = Array.from(div.querySelectorAll('h1, h2, h3'));
    const newToc = headings.map((h, index) => {
      let id = h.id;
      if (!id) {
         id = `heading-${index}`;
      }
      return {
        id,
        text: h.textContent || '',
        level: parseInt(h.tagName.substring(1))
      };
    });
    setToc(newToc);
  }, [solutionHtml]);



  useEffect(() => {
    if (propQuestions && propCategories) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [questionsData, categoriesData] = await Promise.all([
          api.get<QuestionItem[]>('/questions'),
          api.get<Category[]>('/questions/categories')
        ]);
        setInternalQuestions(questionsData);
        setInternalCategories(categoriesData);
        // Expand all categories by default, including 'hot'
        setExpandedCategoryIds(['hot', ...categoriesData.map(c => c.id)]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [propQuestions, propCategories]);

  // Sync expanded categories when props change
  useEffect(() => {
    if (propCategories && propCategories.length > 0 && expandedCategoryIds.length === 1 && expandedCategoryIds[0] === 'hot') {
      setExpandedCategoryIds(['hot', ...propCategories.map(c => c.id)]);
    }
  }, [propCategories]);


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
      .slice(0, 20);
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

  const selectQuestion = useCallback(async (item: QuestionItem, updateUrl = true) => {
    setSelectedQuestion(item);
    if (onQuestionSelect) onQuestionSelect(item.id);
    setActiveTab('solution');
    
    if (updateUrl) {
      window.history.pushState({}, '', `/questions/${item.id}`);
    }
    
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
  }, [marked]);

  // Handle initial question selection
  useEffect(() => {
    if (questions.length > 0) {
      if (initialQuestionId) {
        const q = questions.find(q => q.id === initialQuestionId);
        if (q) {
          // If it's the initial load from URL, we don't need to push state again
          // But we DO need to select it.
          // We compare with currently selected to avoid infinite loops if selectQuestion causes re-render that triggers this
          // (though selectQuestion is not in dependency array, so it's fine)
          if (selectedQuestion?.id !== q.id) {
              selectQuestion(q, false);
          }
        }
      } else {
        // Fix: Explicitly clear selection if initialQuestionId is undefined/null
        // This ensures that when navigating to the main tab (clearing the ID), we return to the list view
        // even if the component doesn't fully remount or state is preserved
        if (selectedQuestion) {
          setSelectedQuestion(null);
          if (onQuestionSelect) onQuestionSelect(null);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, initialQuestionId, selectQuestion]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      
      // Check if we are on a question page
      const match = path.match(/\/questions\/([^\/]+)/);
      if (match) {
        const id = match[1];
        if (questions.length > 0) {
           const q = questions.find(q => q.id === id);
           if (q && q.id !== selectedQuestion?.id) {
              selectQuestion(q, false);
           }
        }
      } else if (path === '/' || path === '') {
        // If we are back at root, deselect
        if (selectedQuestion) {
          setSelectedQuestion(null);
          if (onQuestionSelect) onQuestionSelect(null);
        }
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [questions, selectedQuestion, selectQuestion]);

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
        
        <div className="flex-1 overflow-y-auto p-[10px] m-0 pt-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-primary-200 [&::-webkit-scrollbar-thumb]:rounded-full">
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
                filteredQuestions.map((item) => (
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
                <div className="mb-6">
                  <div className="flex items-center gap-2.5 px-2 py-3 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 text-orange-500 shadow-sm ring-1 ring-orange-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="transform transition-transform hover:scale-110">
                        <path d="M12 2a5 5 0 0 1 3.5 1.5 5 5 0 0 1 1 3.5v.5c0 3.5-2.5 6-5.5 6S5.5 11 5.5 7.5v-.5a5 5 0 0 1 1-3.5A5 5 0 0 1 12 2z"></path>
                        <path d="M12 14c-4 0-6 2-6 5v2h12v-2c0-3-2-5-6-5z"></path>
                        <path d="M12 2v.5"></path>
                        <path d="M15.5 5.5l.5-.5"></path>
                        <path d="M8.5 5.5l-.5-.5"></path>
                      </svg>
                    </div>
                    <span className="text-[15px] font-bold text-gray-800 tracking-tight">热门题目</span>
                    <span className="ml-auto text-[10px] font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">TOP 20</span>
                  </div>
                  
                  <div className="px-1 mt-1 relative space-y-1">
                    {hotQuestions.map((item, index) => (
                      <QuestionListItem 
                        key={`hot-${item.id}`}
                        item={item} 
                        index={index} 
                        isSelected={selectedQuestion?.id === item.id}
                        onSelect={selectQuestion}
                        isHot={true}
                      />
                    ))}
                  </div>
                </div>

                {categories.map((category) => {
                  const categoryQuestions = groupedQuestions[category.id] || [];
                  const isExpanded = expandedCategoryIds.includes(category.id);
                  const isActiveCategory = selectedQuestion?.categoryId === category.id;
                  
                  if (categoryQuestions.length === 0) return null;

                  return (
                    <div key={category.id} className="mb-1">
                      <div 
                        onClick={() => toggleCategory(category.id)}
                        className={`
                          flex items-center justify-between px-3 py-3 cursor-pointer rounded-lg transition-all duration-200 group select-none
                          ${isExpanded 
                            ? 'bg-gray-100 text-gray-900' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                         <div className="flex items-center gap-3 min-w-0">
                            {/* Decorative Dot (Only visible when expanded) */}
                            <div className={`
                               w-1.5 h-1.5 rounded-full transition-all duration-300 shrink-0
                               ${isExpanded ? 'bg-primary-500 scale-100' : 'bg-transparent scale-0 w-0'}
                            `} />

                            <span className={`text-[14px] tracking-tight truncate transition-all duration-200 ${isExpanded ? 'font-bold' : 'font-medium'}`}>
                              {category.name}
                            </span>
                         </div>

                         <div className="flex items-center gap-3">
                            <span className={`text-[12px] font-medium transition-colors ${
                              isExpanded ? 'text-gray-500' : 'text-gray-300 group-hover:text-gray-400'
                            }`}>
                               {categoryQuestions.length}
                            </span>
                            <svg 
                              className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-gray-600' : 'text-gray-300 group-hover:text-gray-500'}`} 
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                               <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                         </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-1 relative px-1 space-y-0.5 animate-in slide-in-from-top-1 fade-in duration-200">
                          {categoryQuestions.map((item, index) => (
                            <QuestionListItem 
                              key={item.id} 
                              item={item} 
                              index={index} 
                              isSelected={selectedQuestion?.id === item.id}
                              onSelect={selectQuestion}
                            />
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
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setSelectedQuestion(null);
                    window.history.pushState({}, '', '/questions');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-primary-500 hover:text-primary-800 hover:bg-white hover:shadow-sm transition-all duration-200 border border-transparent hover:border-primary-100 group"
                  title="返回首页"
                >
                  <div className="w-6 h-6 rounded-md bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:-translate-x-0.5 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  </div>
                  <span className="text-sm font-medium">返回列表</span>
                </button>
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
              </div>

              {/* Favorite Button */}
              <div 
                onClick={toggleFavorite}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-200 border select-none min-w-[92px] ${
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
                   <div className="flex items-start gap-3">
                     <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0 text-xl border border-primary-200">
                       🤖
                     </div>
                     <div className="flex-1 min-w-0 flex flex-col items-start max-w-[85%]">
                       <div className="bg-white border border-primary-200 p-4 rounded-2xl rounded-tl-none shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative">
                         <div className="text-primary-800 leading-relaxed whitespace-pre-wrap">
                           {selectedQuestion.interviewerQuestion || '请简述一下这个知识点。'}
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* User Answer */}
                   <div className="flex items-start gap-3 flex-row-reverse">
                     <div className="w-10 h-10 rounded-full bg-accent-copper/10 flex items-center justify-center shrink-0 text-accent-copper font-bold text-sm border border-accent-copper/20">
                       ME
                     </div>
                     <div className="flex-1 min-w-0 flex flex-col items-end max-w-[85%]">
                       <div className="bg-primary-50 border border-primary-100 p-4 rounded-2xl rounded-tr-none shadow-sm relative overflow-hidden text-left">
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
          <div className="flex flex-col h-full w-full p-6 overflow-hidden bg-neutral-white/30">

            <div className="flex-1 min-h-0 w-full max-w-full mx-auto flex flex-col overflow-y-auto scrollbar-hide px-4">
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
                   <span className="text-sm">🔥</span>
                </div>
                <h3 className="text-lg font-bold text-primary-900 tracking-tight">热门推荐</h3>
              </div>
              
              {/* Top Cards */}
              <div className="grid grid-cols-4 grid-rows-2 gap-4 mb-6 flex-1 min-w-[800px] min-h-[600px]">
                {hotQuestions.slice(0, 5).map((item, index) => {
                  const isTop1 = index === 0;
                  const isTop2 = index === 1;
                  const isTop3 = index === 2;
                  
                  return (
                  <div 
                    key={`hot-grid-${item.id}`}
                    onClick={() => selectQuestion(item)}
                    onMouseEnter={() => setHoveredQuestionId(item.id)}
                    onMouseLeave={() => setHoveredQuestionId(null)}
                    className={`
                      relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer group flex flex-col justify-between
                      ${isTop1 ? 'col-span-2 row-span-2 bg-white border-2 border-red-100 shadow-xl shadow-red-100/50 hover:shadow-2xl hover:shadow-red-200/50' : ''}
                      ${isTop2 ? 'col-span-1 row-span-1 bg-gradient-to-br from-[#FFFAF0] to-white border border-orange-100 shadow-lg shadow-orange-100/30 hover:shadow-xl hover:shadow-orange-200/40' : ''}
                      ${isTop3 ? 'col-span-1 row-span-1 bg-gradient-to-br from-[#FFFDF0] to-white border border-yellow-100 shadow-lg shadow-yellow-100/30 hover:shadow-xl hover:shadow-yellow-200/40' : ''}
                      ${index > 2 ? 'col-span-1 row-span-1 bg-white border border-primary-100 hover:border-accent-copper/50 hover:shadow-md' : ''}
                    `}
                  >


                    {/* Background Decor Numbers */}
                    {(index < 3) && (
                      <div className={`absolute -right-2 -bottom-4 font-black leading-none opacity-5 select-none pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${
                        isTop1 ? 'text-[100px] text-red-600' : isTop2 ? 'text-[80px] text-orange-500' : 'text-[80px] text-yellow-500'
                      }`}>
                        {index + 1}
                      </div>
                    )}

                    {/* Video Preview Popup - Disabled for Top 1 as it has dedicated video block */}
                    {hoveredQuestionId === item.id && !isTop1 && (item.videoUrl || item.id === hotQuestions[0].id) && (
                      <VideoPreview 
                        url={item.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"} 
                        title={item.title} 
                      />
                    )}

                    <div className="p-4 z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-3 mb-2 shrink-0">
                         <div className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-black italic shadow-sm shrink-0 ${
                           isTop1 ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white ring-1 ring-red-100' :
                           isTop2 ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white ring-1 ring-orange-100' :
                           isTop3 ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white ring-1 ring-yellow-100' :
                           'bg-primary-100 text-primary-600'
                         }`}>
                           {index < 3 ? 'TOP ' + (index + 1) : '#' + (index + 1)}
                         </div>
                         {index < 3 && (
                           <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/50 border border-black/5 text-primary-600 backdrop-blur-sm shrink-0">
                             🔥 爆表
                           </div>
                         )}
                      </div>

                      <h4 className={`font-bold leading-snug group-hover:text-accent-copper transition-colors mb-2 ${
                        isTop1 ? 'text-xl text-primary-900 line-clamp-2' : 
                        index < 3 ? 'text-base text-primary-900 line-clamp-2' : 
                        'text-sm text-primary-800 line-clamp-2'
                      }`}>
                        {item.title}
                      </h4>

                      {isTop1 ? (
                        <p className="text-primary-500 text-xs line-clamp-2 leading-relaxed opacity-80 mb-3">
                          这是一道非常经典的前端面试题，考察了浏览器渲染机制的核心流程。掌握它不仅能应对面试，更能帮助你理解性能优化的底层原理。
                        </p>
                      ) : (
                        <div className="relative">
                           <div className="absolute top-0 left-0 w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center text-xs border border-primary-100 -mt-1 select-none">
                              {['👨‍💻', '👩‍💻', '🧑‍🎓', '🦁', '🦊', '🐼', '🐯', '🐮', '🐵', '🚀'][item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10]}
                           </div>
                           <p className="text-primary-500 text-xs line-clamp-4 leading-relaxed opacity-80 mb-3 break-all indent-[3em]">
                            {item.transcript 
                              ? item.transcript.replace(/[#*`\[\]()>]/g, '').replace(/\s+/g, ' ').slice(0, 300)
                              : (item.solution 
                                  ? item.solution.replace(/[#*`\[\]()>]/g, '').replace(/\s+/g, ' ').slice(0, 300)
                                  : '暂无详细记录...'
                                )
                            }
                           </p>
                        </div>
                      )}

                      {/* Top 1 Video Block */}
                      {isTop1 && (
                        <div 
                          className="relative w-full flex-1 min-h-0 rounded-xl overflow-hidden mb-3 group-hover:shadow-md transition-all bg-black/5 z-20"
                          onClick={(e) => e.stopPropagation()} 
                        >
                          <video 
                            src={item.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
                            className="w-full h-full object-cover"
                            controls
                            muted
                            playsInline
                            // Removed autoPlay and loop as requested: default paused and muted
                          />
                          <div className="absolute top-2 right-2 bg-black/20 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            Video
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-auto pt-3 flex items-center justify-between border-t border-black/5 shrink-0 min-w-0">
                         <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                           <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border truncate ${
                             isTop1 ? 'bg-red-50 border-red-100 text-red-600' : 
                             isTop2 ? 'bg-orange-50 border-orange-100 text-orange-600' :
                             isTop3 ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
                             'bg-primary-50 border-primary-100 text-primary-500'
                           }`}>
                             {categories.find(c => c.id === item.categoryId)?.name || '未分类'}
                           </span>
                           <span className="text-primary-400 text-[10px] flex items-center gap-0.5 shrink-0">
                             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                             </svg>
                             {item.hotScore || 0}
                           </span>
                         </div>
                         
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shrink-0 ${
                            isTop1 ? 'bg-red-500 text-white shadow-md shadow-red-500/30' :
                            isTop2 ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' :
                            isTop3 ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/30' :
                            'bg-primary-100 text-primary-400 group-hover:bg-accent-copper group-hover:text-white'
                         }`}>
                           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                           </svg>
                         </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>


            </div>
          </div>
        )}

      </div>

      {/* Right Sidebar */}
      {selectedQuestion && (
        <div className="w-[240px] hidden xl:flex flex-col shrink-0 h-full transition-all duration-300">
           
           {/* TOC Content (Solution Tab) */}
           {activeTab === 'solution' && toc.length > 0 && (
             <div className="flex flex-col bg-neutral-white rounded-xl border border-primary-100 shadow-[0_4px_12px_rgba(45,31,31,0.03)] overflow-hidden max-h-full min-h-[200px]">
               <div className="p-4 border-b border-primary-100/50 bg-primary-50/30">
                 <h3 className="font-bold text-primary-900 text-sm flex items-center gap-2">
                   <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                   </svg>
                   目录
                 </h3>
               </div>
               <div className="overflow-y-auto p-4 custom-scrollbar">
                 <ul className="space-y-2 text-sm relative">
                   {toc.map((item, idx) => (
                     <li key={idx} className="relative">
                       <a 
                         href={`#${item.id}`} 
                         onClick={(e) => {
                           e.preventDefault();
                           const el = document.getElementById(item.id);
                           if (el && contentScrollRef.current) {
                              el.scrollIntoView({ behavior: 'smooth' });
                           }
                         }}
                         className={`block text-primary-500 hover:text-accent-copper transition-colors truncate py-1 ${item.level > 1 ? 'ml-2 text-xs' : 'font-medium'}`}
                         title={item.text}
                       >
                         {item.text}
                       </a>
                     </li>
                   ))}
                 </ul>
               </div>
             </div>
           )}

           {/* Interview Tips & Keywords (Answer Tab) */}
           {activeTab === 'answer' && (
              <div className="flex flex-col gap-4">
                {/* Interview Tips */}
                <div className="bg-neutral-white rounded-xl border border-primary-100 shadow-[0_4px_12px_rgba(45,31,31,0.03)] overflow-hidden">
                  <div className="p-4 border-b border-primary-100/50 bg-amber-50/50">
                    <h3 className="font-bold text-amber-800 text-sm flex items-center gap-2">
                      <span className="text-lg">💡</span>
                      面试锦囊
                    </h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-3">
                      <li className="text-xs text-primary-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                        <span className="leading-relaxed">使用 <strong>STAR 法则</strong> (情境、任务、行动、结果) 组织你的回答，逻辑更清晰。</span>
                      </li>
                      <li className="text-xs text-primary-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                        <span className="leading-relaxed">先说<strong>核心结论</strong>，再展开技术细节，避免漫无边际的铺垫。</span>
                      </li>
                      <li className="text-xs text-primary-600 flex items-start gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                         <span className="leading-relaxed">遇到不会的问题，可以尝试联系相关知识点，或诚实表达并展现学习态度。</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Key Concepts (Mock Data) */}
                <div className="bg-neutral-white rounded-xl border border-primary-100 shadow-[0_4px_12px_rgba(45,31,31,0.03)] overflow-hidden min-h-[150px]">
                   <div className="p-4 border-b border-primary-100/50 bg-blue-50/50">
                    <h3 className="font-bold text-blue-800 text-sm flex items-center gap-2">
                      <span className="text-lg">🔑</span>
                      核心关键词
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                       {['原理分析', '源码解读', '性能优化', '最佳实践', '常见坑点', '对比分析'].map((tag, i) => (
                         <span key={i} className="px-2 py-1 bg-primary-50 text-primary-600 text-xs rounded border border-primary-100">
                           {tag}
                         </span>
                       ))}
                       {/* Dynamic tags based on category could go here */}
                       <span className="px-2 py-1 bg-accent-copper/10 text-accent-copper text-xs rounded border border-accent-copper/20">
                          {categories.find(c => c.id === selectedQuestion.categoryId)?.name || '通用'}
                       </span>
                    </div>
                    <p className="text-[10px] text-primary-400 mt-4 text-center">
                      回答时覆盖这些要点，通过率更高哦
                    </p>
                  </div>
                </div>
              </div>
           )}

           {/* Related Recommendations (Explanation Tab) */}
           {activeTab === 'explanation' && (
             <div className="flex flex-col gap-4">
                <div className="bg-neutral-white rounded-xl border border-primary-100 shadow-[0_4px_12px_rgba(45,31,31,0.03)] overflow-hidden min-h-[200px]">
                   <div className="p-4 border-b border-primary-100/50 bg-indigo-50/50">
                    <h3 className="font-bold text-indigo-800 text-sm flex items-center gap-2">
                      <span className="text-lg">📚</span>
                      相关推荐
                    </h3>
                  </div>
                  <div className="p-2">
                    {questions
                      .filter(q => q.categoryId === selectedQuestion.categoryId && q.id !== selectedQuestion.id)
                      .slice(0, 5)
                      .map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => selectQuestion(item)}
                          className="p-3 mb-1 rounded-lg hover:bg-primary-50 cursor-pointer transition-colors group"
                        >
                          <div className="text-xs font-medium text-primary-800 line-clamp-2 group-hover:text-accent-copper mb-1">
                            {item.title}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-primary-400">
                            <span>热度 {item.hotScore || 0}</span>
                            <span>•</span>
                            <span>{categories.find(c => c.id === item.categoryId)?.name}</span>
                          </div>
                        </div>
                    ))}
                    {questions.filter(q => q.categoryId === selectedQuestion.categoryId && q.id !== selectedQuestion.id).length === 0 && (
                       <div className="p-4 text-center text-primary-400 text-xs">
                         暂无同类推荐
                       </div>
                    )}
                  </div>
                </div>
             </div>
           )}

           {/* Empty placeholder fallback */}
           {((activeTab === 'solution' && toc.length === 0)) && (
              <div className="w-full h-full"></div>
           )}
        </div>
      )}

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

      {/* Custom Tooltip */}
      {/* {activeTooltip && (
        <div 
          className="fixed z-[100] px-3 py-2 bg-gray-900/90 text-white text-xs rounded shadow-lg max-w-xs break-words pointer-events-none animate-in fade-in zoom-in-95 duration-100"
          style={{ 
            left: activeTooltip.x, 
            top: activeTooltip.y 
          }}
        >
          {activeTooltip.content}
        </div>
      )} */}

    </div>
  );
}
