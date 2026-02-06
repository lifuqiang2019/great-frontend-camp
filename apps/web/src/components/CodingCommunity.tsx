"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // Light theme code highlighting
import mermaid from 'mermaid';
import { api } from '../lib/request';
import { useSession } from '../lib/auth-client';
import NotePadModal from './NotePadModal';
import { UserAvatar } from './UserAvatar';

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
  searchPlaceholder?: string;
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
    <div className="relative">
      <div
        onClick={() => onSelect(item)}
        className={`group w-full py-1.5 pl-2 pr-1 rounded-md cursor-pointer text-sm transition-colors duration-200 ease-in-out overflow-hidden flex items-start gap-2 ${
          isSelected 
            ? 'text-primary-900 bg-primary-100 font-medium' 
            : 'text-primary-500 hover:text-primary-900 hover:bg-primary-50 bg-transparent'
        }`}
      >
          <span className={`text-xs font-mono min-w-[1.2rem] shrink-0 pt-[3px] text-left ${
            isHot && index === 0 ? 'text-[#FF2D55] font-black italic text-sm scale-110 drop-shadow-sm' :
            isHot && index === 1 ? 'text-[#FF9500] font-extrabold italic' :
            isHot && index === 2 ? 'text-[#FFCC00] font-bold italic' :
            'text-primary-300'
          }`}>
            {index + 1}.
          </span>
          <div className="flex-1 leading-relaxed truncate min-w-0">
            {item.title}
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
  searchPlaceholder,
  questions: propQuestions,
  categories: propCategories
}: CodingCommunityProps) {
  const { data: session } = useSession();
  const [hotLimit, setHotLimit] = useState(10);
  const [hotExpandedLimit, setHotExpandedLimit] = useState(20);
  
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  const filteredSearchResults = useMemo(() => {
    if (!searchQuery) return [];
    return questions.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [questions, searchQuery]);

  // Click outside handler for search
  useEffect(() => {
    function handleClickOutsideSearch(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSearch);
    };
  }, []);

  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [solutionHtml, setSolutionHtml] = useState('');
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const [transcriptHtml, setTranscriptHtml] = useState('');
  const [activeTab, setActiveTab] = useState('solution');
  // Initialize isLoading based on props availability to avoid unnecessary loading state if data is already there
  const [isLoading, setIsLoading] = useState(!(propQuestions && propCategories));
  // Skeleton transition state
  const [showSkeleton, setShowSkeleton] = useState(true);

  // Track mount time to ensure minimum loading display if needed
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!isLoading) {
      // Data loaded, wait for fade out animation before removing skeleton from DOM
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 500); // Match CSS duration
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(true);
    }
  }, [isLoading]);

  const [hoveredQuestionId, setHoveredQuestionId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isHotExpanded, setIsHotExpanded] = useState(false);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  // Floating Note Icon Visibility State
  const [showNoteIcon, setShowNoteIcon] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const savedVisibility = localStorage.getItem('noteIconVisible');
    if (savedVisibility === 'false') {
      setShowNoteIcon(false);
    }

    // Listen for custom event to re-enable icon
    const handleShowIcon = () => {
      setShowNoteIcon(true);
      localStorage.setItem('noteIconVisible', 'true');
    };

    window.addEventListener('SHOW_NOTE_ICON', handleShowIcon);
    return () => {
      window.removeEventListener('SHOW_NOTE_ICON', handleShowIcon);
    };
  }, []);

  // Resizable Sidebar Logic
  const [sidebarWidth, setSidebarWidth] = useState(390);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const sidebarLeft = sidebarRef.current.getBoundingClientRect().left;
        const newWidth = mouseMoveEvent.clientX - sidebarLeft;
        // Min 240px, Max 600px
        if (newWidth >= 240 && newWidth <= 600) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, resize, stopResizing]);

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
      // If we started with loading=true (because props were missing initially), 
      // enforce a minimum loading time to avoid flashing
      if (isLoading) {
        const elapsedTime = Date.now() - mountTimeRef.current;
        const minLoadingTime = 800;
        
        if (elapsedTime < minLoadingTime) {
          const timer = setTimeout(() => {
            setIsLoading(false);
          }, minLoadingTime - elapsedTime);
          return () => clearTimeout(timer);
        } else {
          setIsLoading(false);
        }
      } else {
        // If already loaded (SSR case), just ensure state is synced
        setIsLoading(false);
      }
      return;
    }

    const fetchData = async () => {
      // Reset start time for client-side fetch
      const fetchStartTime = Date.now();
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
        // Ensure minimum skeleton display time
        const elapsedTime = Date.now() - fetchStartTime;
        const minLoadingTime = 800; // Minimum 800ms loading time
        
        if (elapsedTime < minLoadingTime) {
          setTimeout(() => {
            setIsLoading(false);
          }, minLoadingTime - elapsedTime);
        } else {
          setIsLoading(false);
        }
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

  const [hotQuestionsOffset, setHotQuestionsOffset] = useState(0);
  const [isRefreshingHot, setIsRefreshingHot] = useState(false);

  // Hot Questions sorted by hotScore (Pool of top 50)
  const allHotQuestions = useMemo(() => {
    return [...questions]
      .sort((a, b) => (b.hotScore || 0) - (a.hotScore || 0))
      .slice(0, 50);
  }, [questions]);

  const hotQuestions = useMemo(() => {
    const start = hotQuestionsOffset % Math.max(1, allHotQuestions.length);
    const end = start + 10;
    let result = allHotQuestions.slice(start, end);
    // If not enough items, wrap around
    if (result.length < 10 && allHotQuestions.length > 10) {
        result = [...result, ...allHotQuestions.slice(0, 10 - result.length)];
    }
    return result;
  }, [allHotQuestions, hotQuestionsOffset]);

  const handleRefreshHot = () => {
    setIsRefreshingHot(true);
    setTimeout(() => setIsRefreshingHot(false), 500); // Animation duration
    setHotQuestionsOffset(prev => (prev + 10) % Math.max(10, allHotQuestions.length));
  };

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
      <div 
        ref={sidebarRef}
        style={{ width: sidebarWidth }}
        className="relative flex flex-col h-full shrink-0"
      >
        {/* Resizer Handle */}
        <div
          onMouseDown={startResizing}
          className={`absolute -right-[15px] top-0 bottom-0 w-[10px] cursor-col-resize z-50 flex justify-center items-center hover:bg-primary-200/30 transition-colors rounded-full my-2 ${isResizing ? 'bg-primary-200/50' : ''}`}
          title="拖动调整宽度"
        >
          <div className="w-[2px] h-8 bg-primary-300 rounded-full" />
        </div>
        
        <div className="flex-1 overflow-y-auto pl-[10px] pr-0.5 pb-[10px] m-0 pt-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-primary-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          {isLoading ? (
            <div className="px-3 pb-2 pt-2 animate-pulse select-none">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="mb-4">
                  {/* Category Header Skeleton */}
                  <div className="flex items-center py-1 px-2 gap-3 mb-2">
                    <div className="w-3 h-3 rounded bg-primary-200/50 shrink-0" />
                    <div className="h-4 bg-primary-200/50 rounded w-24" />
                    <div className="ml-auto w-8 h-4 bg-primary-100/50 rounded-full" />
                  </div>
                  
                  {/* Fake items for first few categories */}
                  {i <= 2 && (
                    <div className="pl-6 space-y-3">
                      <div className="flex items-center gap-2">
                         <div className="w-4 h-3 bg-primary-100/50 rounded shrink-0" />
                         <div className="h-3 bg-primary-100/50 rounded w-3/4" />
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-4 h-3 bg-primary-100/50 rounded shrink-0" />
                         <div className="h-3 bg-primary-100/50 rounded w-1/2" />
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-4 h-3 bg-primary-100/50 rounded shrink-0" />
                         <div className="h-3 bg-primary-100/50 rounded w-2/3" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (viewMode === 'favorites-only') ? (
             // Favorites Only Mode: Flat List
            <ul className="list-none m-0 p-0">
              {filteredQuestions.length === 0 ? (
                <div className="p-4 text-center text-primary-400 text-sm">
                  {viewMode === 'favorites-only' ? '暂无收藏题目' : '无匹配题目'}
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
                {/* Hot Questions Removed */}

                {categories.map((category) => {
                  const categoryQuestions = groupedQuestions[category.id] || [];
                  const isExpanded = expandedCategoryIds.includes(category.id);
                  const isActiveCategory = selectedQuestion?.categoryId === category.id;
                  
                  if (categoryQuestions.length === 0) return null;

                  return (
                    <div key={category.id} className="mb-0.5">
                      <div 
                        onClick={() => toggleCategory(category.id)}
                        className={`
                          flex items-center py-2 px-2 cursor-pointer rounded-lg transition-all duration-200 group select-none
                          ${isExpanded 
                            ? 'text-primary-900 font-medium' 
                            : 'text-primary-600 hover:text-primary-900 hover:bg-primary-50'
                          }
                        `}
                      >
                         <div className="flex items-center gap-2 min-w-0 w-full">
                            <svg 
                              className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90 text-primary-500' : 'text-primary-400 group-hover:text-primary-600'}`} 
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                               <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>

                            <span className="text-[14px] tracking-tight truncate min-w-0">
                              {category.name}
                            </span>
                            
                            <span className="ml-auto text-[11px] text-primary-400 bg-primary-50 px-1.5 py-0.5 rounded-full group-hover:bg-primary-100 transition-colors">
                               {categoryQuestions.length}
                            </span>
                         </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="pl-6 space-y-0.5 animate-in slide-in-from-top-1 fade-in duration-200">
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
                    if (onQuestionSelect) onQuestionSelect(null);
                    window.history.pushState({}, '', '/');
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-primary-400 hover:text-accent-copper hover:bg-primary-50 transition-all duration-200 group border border-transparent hover:border-primary-100"
                  title="返回列表"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
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
                    <div className="shrink-0">
                      <UserAvatar user={session?.user} size="md" />
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
        ) : (initialQuestionId && questions.length === 0) ? (
          <div className="flex flex-col h-full w-full items-center justify-center p-6 bg-neutral-white/30 text-primary-400">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-accent-gold rounded-full animate-spin mb-4"></div>
            <p>正在加载题目...</p>
          </div>
        ) : (initialQuestionId && !selectedQuestion) ? (
          <div className="flex flex-col h-full w-full items-center justify-center p-6 bg-neutral-white/30 text-primary-400">
             <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4 text-2xl">?</div>
             <p className="mb-4">未找到该题目</p>
             <button 
               onClick={() => {
                 onQuestionSelect?.(null);
                 window.history.pushState({}, '', '/');
               }}
               className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm"
             >
               返回题目列表
             </button>
          </div>
        ) : (
          <div className="flex flex-col h-full w-full p-6 overflow-hidden bg-neutral-white/30">

            <div className="flex-1 min-h-0 w-full max-w-full mx-auto flex flex-col overflow-y-auto scrollbar-hide px-4">
              <div className="hidden">
                <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner">
                  �
                </div>
                {/* SEARCH_BOX_HERE */}
              </div>
               <div className="flex flex-col items-center justify-start h-full w-full max-w-3xl mx-auto px-4 pt-[15vh]">
                <div className="w-full relative group" ref={searchContainerRef}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <svg 
                        className={`h-6 w-6 text-primary-400 group-focus-within:text-accent-gold transition-all duration-300`} 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-12 pr-12 py-4 border border-primary-200 rounded-2xl leading-5 bg-white text-primary-900 font-medium tracking-wide placeholder-primary-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold/50 text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                      placeholder={searchPlaceholder || "搜索面试题..."}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchFocused(true);
                      }}
                      onFocus={() => setIsSearchFocused(true)}
                    />
                    {searchQuery && isSearchFocused && (
                      <>
                        <div 
                          className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                          onClick={() => {
                            setSearchQuery('');
                            setIsSearchFocused(true);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-400 hover:text-accent-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        
                        {/* Search Dropdown Results */}
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-primary-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 py-2">
                          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                           {filteredSearchResults.length > 0 ? (
                              <ul className="">
                                {filteredSearchResults.map(q => (
                                   <li 
                                     key={q.id}
                                     className="px-6 py-3 hover:bg-primary-50 cursor-pointer border-b border-primary-50 last:border-none transition-colors group/item"
                                    onClick={() => {
                                      setSearchQuery('');
                                      setIsSearchFocused(false);
                                      if (onQuestionSelect) onQuestionSelect(q.id);
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="text-sm font-medium text-primary-900 truncate group-hover/item:text-accent-copper transition-colors">
                                        {q.title.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) => 
                                          part.toLowerCase() === searchQuery.toLowerCase() ? 
                                            <span key={i} className="text-accent-copper font-bold">{part}</span> : 
                                            part
                                        )}
                                      </div>
                                      <span className="text-xs text-primary-500 bg-primary-100/50 px-2 py-1 rounded border border-primary-100 whitespace-nowrap ml-3">
                                        {categories.find(c => c.id === q.categoryId)?.name || '未分类'}
                                      </span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                           ) : (
                              <div className="p-8 text-center flex flex-col items-center justify-center text-primary-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span className="text-sm">未找到相关内容</span>
                              </div>
                           )}
                          </div>
                        </div>
                      </>
                    )}
                 </div>
                 
                 {/* Quick Tips */}
                 <div className={`mt-8 flex flex-wrap justify-center gap-3 opacity-60 hover:opacity-100 transition-all duration-300 visible opacity-60 h-auto`}>
                   {['React', 'Vue', 'Next.js', '性能优化', '算法'].map(tag => (
                     <button 
                       key={tag}
                       onClick={() => {
                         setSearchQuery(tag);
                         setIsSearchFocused(true);
                       }}
                       className="px-4 py-1.5 rounded-full bg-white border border-primary-100 text-sm text-primary-600 hover:border-accent-copper hover:text-accent-copper transition-colors shadow-sm"
                     >
                       {tag}
                     </button>
                   ))}
                 </div>

                 {/* Hot Questions List */}
                <div className={`w-full flex justify-center transition-all duration-300 visible opacity-100 translate-y-0`}>
                  <div className="mt-8 w-full max-w-2xl bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm p-6">
                     <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-primary-800 flex items-center gap-2">
                          <div className="p-1 rounded-md bg-gradient-to-br from-orange-400 to-red-500 shadow-sm text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.45-.412-1.725a1 1 0 00-2 0c.001.046.002.092.003.139.002.096.005.196.008.3.006.216.015.45.029.7.027.498.07.994.137 1.487.135.986.417 1.948.835 2.857A9.97 9.97 0 0010 18a9.97 9.97 0 005.323-2.637 1 1 0 00-.323-1.637c-.34-.145-.69-.264-1.048-.354-.647-.164-1.306-.272-1.968-.323a1.106 1.106 0 01-.977-1.332c.118-.617.29-1.228.513-1.828.225-.602.502-1.19.829-1.758.324-.564.693-1.107 1.104-1.623.398-.5.842-.96 1.328-1.372a1 1 0 00-.395-1.734z" clipRule="evenodd" />
                            </svg>
                          </div>
                          社区热榜
                        </span>
                        <button 
                          onClick={handleRefreshHot}
                          className="text-xs text-primary-500 hover:text-primary-800 transition-colors flex items-center gap-1 group/refresh px-2 py-1 rounded-md hover:bg-primary-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ${isRefreshingHot ? 'animate-spin' : 'group-hover/refresh:rotate-180 transition-transform duration-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          换一批
                        </button>
                     </div>
                     <div className="relative grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      {/* Real Content Layer - Always render if data exists */}
                      <div className={`col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                        {hotQuestions.length > 0 ? (
                          hotQuestions.map((q, index) => {
                           const rank = hotQuestionsOffset + index + 1;
                           return (
                             <div 
                               key={q.id}
                             className="flex items-center gap-3 group cursor-pointer p-2 rounded-lg hover:bg-white/60 transition-all duration-200"
                             onClick={() => {
                               if (onQuestionSelect) onQuestionSelect(q.id);
                             }}
                           >
                              <span className={`text-sm font-black italic w-6 text-center shrink-0 font-mono ${
                                rank === 1 ? 'text-amber-500' :
                                rank === 2 ? 'text-slate-500' :
                                rank === 3 ? 'text-orange-700' :
                                'text-primary-300 font-medium not-italic'
                              }`}>
                                {rank}
                              </span>
                              <span className="text-sm text-primary-700 group-hover:text-primary-900 truncate flex-1 transition-colors font-medium">
                                {q.title}
                              </span>
                              {rank <= 3 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 scale-90 ${
                                    rank === 1 ? 'bg-amber-100 text-amber-700' :
                                    'bg-orange-50 text-orange-600'
                                }`}>
                                    Hot
                                </span>
                              )}
                           </div>
                         );
                       })
                      ) : (
                         /* No Data State */
                         <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-12 text-primary-400 min-h-[300px]">
                           <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           <span className="text-sm">暂无热门问题</span>
                         </div>
                      )}
                       </div>

                       {/* Skeleton Layer - Overlay */}
                       {showSkeleton && (
                         <div className={`absolute inset-0 w-full bg-white/50 backdrop-blur-sm z-10 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 transition-opacity duration-500 ${!isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg animate-pulse">
                               <div className="w-6 h-4 rounded bg-primary-200/50 shrink-0" />
                               <div className="h-4 bg-primary-200/50 rounded flex-1" />
                            </div>
                          ))}
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
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

      {/* Floating Note Button */}
      {session?.user && showNoteIcon && (
        <button
          className="absolute bottom-8 right-8 w-14 h-14 bg-accent-gold text-white rounded-full shadow-lg hover:bg-accent-gold/90 transition-all duration-300 flex items-center justify-center z-50 hover:scale-110 active:scale-95 group"
          title="我的笔记 (右键关闭)"
          onClick={() => {
            setIsNoteModalOpen(true);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowNoteIcon(false);
            localStorage.setItem('noteIconVisible', 'false');
            showToast('笔记图标已隐藏，可在“我的笔记”中重新开启');
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </button>
      )}

      {/* NotePad Modal */}
      <NotePadModal 
        isOpen={isNoteModalOpen} 
        onClose={() => setIsNoteModalOpen(false)} 
      />

    </div>
  );
}
