"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import CodingCommunity, { QuestionItem, Category } from '@/components/CodingCommunity';
import { api } from '@/lib/request';
import StudentCamp from '@/components/StudentCamp';
import Home from '@/components/Home';
import LoginModal from '@/components/LoginModal';
import { UserProfileModal } from '@/components/UserProfileModal';
import { UserAvatar } from '@/components/UserAvatar';
import { useSession, signOut } from '@/lib/auth-client';

interface MainPageProps {
  initialTab?: string;
  initialQuestionId?: string;
  serverGreetingConfig?: Record<string, string>;
  initialQuestions?: QuestionItem[];
  initialCategories?: Category[];
}

export default function MainPage({ 
  initialTab = '面试题库', 
  initialQuestionId, 
  serverGreetingConfig,
  initialQuestions,
  initialCategories
}: MainPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set([initialTab]));

  useEffect(() => {
    setActiveTab(initialTab);
    setVisitedTabs(prev => new Set(prev).add(initialTab));
  }, [initialTab]);

  const [currentQuestionId, setCurrentQuestionId] = useState(initialQuestionId);
  const [communityKey, setCommunityKey] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: session } = useSession();
  
  // Data for search and CodingCommunity
  const [questions, setQuestions] = useState<QuestionItem[] | undefined>(initialQuestions);
  const [categories, setCategories] = useState<Category[] | undefined>(initialCategories);

  useEffect(() => {
    if (initialQuestions && initialCategories) return;

    const fetchData = async () => {
      try {
        const [questionsRes, categoriesRes] = await Promise.all([
          api.get<any>('/questions'),
          api.get<any>('/questions/categories')
        ]);
        
        const questionsData = Array.isArray(questionsRes) ? questionsRes : (questionsRes?.data || []);
        const categoriesData = Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes?.data || []);
        
        setQuestions(questionsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // If fetch fails, set to empty array to stop loading state
        setQuestions([]);
        setCategories([]);
      }
    };
    fetchData();
  }, [initialQuestions, initialCategories]);

  const filteredSearchResults = useMemo(() => {
    if (!searchQuery || !questions) return [];
    return questions.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [questions, searchQuery]);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Search Box Animations
  const [searchPlaceholder, setSearchPlaceholder] = useState('');
  const [isSearchIconAnimating, setIsSearchIconAnimating] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Typewriter effect logic
  useEffect(() => {
    const phrases = ["搜索面试题...", "查找知识点...", "React", "Vue", "Next.js", "算法题"];
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    const type = () => {
      const currentPhrase = phrases[currentPhraseIndex];
      
      if (isDeleting) {
        setSearchPlaceholder(currentPhrase.substring(0, currentCharIndex - 1));
        currentCharIndex--;
        typingSpeed = 50;
      } else {
        setSearchPlaceholder(currentPhrase.substring(0, currentCharIndex + 1));
        currentCharIndex++;
        typingSpeed = 150;
      }

      if (!isDeleting && currentCharIndex === currentPhrase.length) {
        isDeleting = true;
        typingSpeed = 2000; // Pause at end
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        typingSpeed = 500; // Pause before new word
      }
    };

    const timer = setTimeout(type, typingSpeed);
    
    // Recursive loop
    const loop = () => {
       type();
       setTimeout(loop, typingSpeed);
    }
    
    // Actually, simple timeout chaining is better to control variable speed
    let timeoutId: NodeJS.Timeout;
    
    const runTyping = () => {
       const currentPhrase = phrases[currentPhraseIndex];
       
       if (isDeleting) {
         setSearchPlaceholder(currentPhrase.substring(0, currentCharIndex));
         currentCharIndex--;
         typingSpeed = 50;
       } else {
         setSearchPlaceholder(currentPhrase.substring(0, currentCharIndex));
         currentCharIndex++;
         typingSpeed = 150;
       }

       let nextDelay = typingSpeed;

       if (!isDeleting && currentCharIndex === currentPhrase.length + 1) {
         isDeleting = true;
         nextDelay = 2000;
       } else if (isDeleting && currentCharIndex === -1) {
         isDeleting = false;
         currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
         currentCharIndex = 0;
         nextDelay = 500;
       }
       
       timeoutId = setTimeout(runTyping, nextDelay);
    };

    runTyping();

    return () => clearTimeout(timeoutId);
  }, []);

  // Icon animation logic
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSearchIconAnimating(true);
      setTimeout(() => setIsSearchIconAnimating(false), 1000); // Animation duration
    }, 10000); // Trigger every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      // Simple logic to sync tab with URL if needed
      // Ideally, we parse the URL path
      const path = window.location.pathname;
      if (path === '/camp') {
        setActiveTab('同学营活动');
        setVisitedTabs(prev => new Set(prev).add('同学营活动'));
      } else if (path === '/' || path.startsWith('/questions') || path.startsWith('/question/')) {
        setActiveTab('面试题库');
        setVisitedTabs(prev => new Set(prev).add('面试题库'));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);



  useEffect(() => {
    setCurrentQuestionId(initialQuestionId);
  }, [initialQuestionId]);

  const [greetingConfig, setGreetingConfig] = useState<Record<string, string>>(serverGreetingConfig || {});

  useEffect(() => {
    // If we already have server config, we might skip fetching or fetch to update
    if (serverGreetingConfig && Object.keys(serverGreetingConfig).length > 0) {
       // Optional: Still fetch to ensure latest client-side if needed, but for now we can skip or just update silently
       // Let's keep fetching to be safe but the initial render is already covered
    }
    
    const fetchConfig = async () => {
      try {
        const greetingKeys = [
          'greeting_0_7', 'greeting_7_9', 'greeting_9_12', 
          'greeting_12_14', 'greeting_14_18', 'greeting_18_24'
        ];
        
        // Use batch fetch to avoid 401 on full config list
        const res = await api.post('/system/config/batch', { keys: greetingKeys });
        
        // Handle wrapped response { code, message, data }
        const data = res?.data || res;
        
        if (Array.isArray(data)) {
          const configMap = data.reduce((acc: any, item: any) => {
            acc[item.key] = item.value;
            return acc;
          }, {});
          setGreetingConfig(configMap);
        }
      } catch (e) {
        console.error("Failed to fetch system config", e);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    setCurrentTime(new Date());
    // Update every minute is enough for greeting
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleTabChange = (tab: string, url?: string) => {
    setActiveTab(tab);
    setVisitedTabs(prev => {
      const newSet = new Set(prev);
      newSet.add(tab);
      return newSet;
    });
    if (url) {
      window.history.pushState({}, '', url);
    }
  };

  const getGreeting = (date: Date) => {
    const hour = date.getHours();
    let text = '';
    if (hour >= 0 && hour < 7) text = greetingConfig['greeting_0_7'] || '夜深露重，愿你好梦相伴';
    else if (hour >= 7 && hour < 9) text = greetingConfig['greeting_7_9'] || '朝阳初升，今天的你也很棒';
    else if (hour >= 9 && hour < 12) text = greetingConfig['greeting_9_12'] || '阳光正好，用代码编织未来';
    else if (hour >= 12 && hour < 14) text = greetingConfig['greeting_12_14'] || '茶余饭后，给自己一段放空时光';
    else if (hour >= 14 && hour < 18) text = greetingConfig['greeting_14_18'] || '午后静谧，灵感在指尖流淌';
    else text = greetingConfig['greeting_18_24'] || '卸下疲惫，享受属于你的宁静夜晚';
    
    return { text };
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleAvatarClick = () => {
    if (session) {
      setIsUserMenuOpen(!isUserMenuOpen);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      setIsUserMenuOpen(false);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { name: '面试题库' },
    { name: '同学营活动', hot: true }
    // { name: '首页' },
  ];

  const showNavSearch = activeTab !== '面试题库' || (!!currentQuestionId && currentQuestionId !== '');

  return (
    <div className="flex flex-col h-screen bg-neutral-white overflow-hidden font-sans text-primary-900 selection:bg-accent-gold/20">
      {/* Navbar */}
      <nav className="bg-primary-900 shadow-subtle py-[0.8rem] flex-shrink-0 border-b border-primary-800 z-50 relative">
        <div className="max-w-full m-0 px-10 flex items-center justify-between">
          <div className="flex items-center min-w-[100px] mr-10">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => router.push('/')}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-gold via-[#eac14d] to-[#b8860b] flex items-center justify-center shadow-lg shadow-black/20 border border-white/10 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary-900">
                  <path d="M16 18l6-6-6-6" />
                  <path d="M8 6l-6 6 6 6" />
                </svg>
              </div>
              <div className="flex flex-col justify-center -space-y-1">
                <span className="text-[13px] font-bold text-accent-gold tracking-wide ml-[1px] group-hover:text-white transition-colors duration-300">
                  大前端
                </span>
                <span className="text-[20px] font-black text-neutral-white tracking-wider group-hover:text-accent-gold transition-colors duration-300">
                  同学营
                </span>
              </div>
            </div>
          </div>
          <ul className="flex justify-start list-none gap-[15px] m-0 p-0 mr-4">
            {navItems.map((item) => (
              <li key={item.name} className="relative">
                <a
                  href="#"
                  className={`no-underline text-primary-100/80 text-[15px] font-medium transition-all duration-300 px-5 py-[8px] rounded-md hover:text-neutral-white hover:bg-primary-800 ${
                    activeTab === item.name ? '!text-neutral-white !bg-primary-800 !font-semibold shadow-inner ring-1 ring-primary-700' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.name === '面试题库') {
                      if (activeTab === '面试题库') {
                        // If already on this tab, maybe reset/refresh?
                        // For now just do nothing or maybe scroll to top if implemented
                        setCommunityKey(prev => prev + 1);
                        setCurrentQuestionId(undefined); // Reset selection on re-click
                        handleTabChange('面试题库', '/');
                      } else {
                        // Switching back to this tab
                        const targetUrl = currentQuestionId ? `/questions/${currentQuestionId}` : '/';
                        handleTabChange('面试题库', targetUrl);
                      }
                    } else if (item.name === '同学营活动') {
                      handleTabChange('同学营活动', '/camp');
                    } else if (item.name === '首页') {
                      router.push('/');
                    }
                  }}
                >
                  {item.name}
                </a>
                {item.hot && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    HOT
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* Search Box - Absolute Centered */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className={`w-full max-w-md pointer-events-auto px-4 hidden md:block transition-all duration-300 ${showNavSearch ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
              <div className="relative group" ref={searchContainerRef}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <svg 
                    className={`h-5 w-5 text-primary-400 group-focus-within:text-accent-gold transition-all duration-300 ${isSearchIconAnimating ? 'scale-125 text-accent-gold' : ''}`} 
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
                  className="block w-full pl-10 pr-10 py-2 border border-primary-700 rounded-xl leading-5 bg-primary-800/50 text-white font-medium tracking-wide placeholder-primary-300 focus:outline-none focus:bg-primary-800 focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold/50 sm:text-sm transition-all duration-300 shadow-inner hover:bg-primary-800/80 hover:border-primary-600 backdrop-blur-sm"
                  placeholder={searchPlaceholder}
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
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchFocused(true);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500 hover:text-accent-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    
                    {/* Search Dropdown Results */}
                    <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-white rounded-xl shadow-xl border border-primary-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 py-1">
                      <div className="max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary-300">
                       {filteredSearchResults.length > 0 ? (
                          <ul className="">
                            {filteredSearchResults.map(q => (
                               <li 
                                 key={q.id}
                                 className="px-4 py-3 hover:bg-primary-50 cursor-pointer border-b border-primary-50 last:border-none transition-colors group/item"
                                 onClick={() => {
                                   setSearchQuery('');
                                   setIsSearchFocused(false);
                                   setCurrentQuestionId(q.id);
                                   handleTabChange('面试题库', `/questions/${q.id}`);
                                 }}
                               >
                                 <div className="flex items-center justify-between">
                                   <div className="text-sm font-medium text-primary-900 truncate group-hover/item:text-accent-copper transition-colors">{q.title}</div>
                                   <span className="text-[10px] text-primary-400 bg-primary-50 px-1.5 py-0.5 rounded border border-primary-100 whitespace-nowrap ml-2">
                                     {categories?.find(c => c.id === q.categoryId)?.name || '未分类'}
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
            </div>
          </div>
          
          {/* Time Widget - Always render container to prevent layout shift */}
          <div className="flex-1 flex justify-end mr-4 hidden md:flex items-center h-full select-none">
            <div className={`flex items-center gap-2 text-[14px] text-primary-100 font-bold leading-none tracking-wide transition-opacity duration-500 ${currentTime ? 'opacity-100' : 'opacity-0'}`}>
              <span>{currentTime ? getGreeting(currentTime).text : 'Loading...'}</span>
            </div>
          </div>

          <div className="flex items-center justify-end relative" ref={userMenuRef}>
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={handleAvatarClick}
              title={session ? `已登录: ${session.user.name || session.user.email}` : "点击登录"}
            >
              <UserAvatar 
                user={session?.user} 
                size="md"
                className="group-hover:ring-2 ring-primary-200 transition-all"
              />
              {session?.user && (
                <span className="text-[14px] font-medium text-primary-100 group-hover:text-white transition-colors hidden md:block max-w-[120px] truncate">
                  {session.user.name || session.user.email?.split('@')[0] || 'User'}
                </span>
              )}
            </div>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && session && (
              <div className="absolute top-full -right-4 mt-2 w-40 bg-white rounded-xl shadow-lg border border-primary-100 overflow-hidden z-50">
                {/* User Info Header */}
                <div className="p-4 border-b border-gray-100 bg-primary-50/50">
                  <div className="font-bold text-primary-900 truncate">
                    {session.user.name || 'User'}
                  </div>
                  <div className="text-xs text-primary-500 truncate mt-0.5">
                    {session.user.email}
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button 
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors flex items-center gap-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    个人信息
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    模拟预约
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    我的课程
                  </button>
                  <button 
                    onClick={() => {
                      // Re-enable floating note icon
                      localStorage.setItem('noteIconVisible', 'true');
                      window.dispatchEvent(new Event('SHOW_NOTE_ICON'));
                      
                      // Close menu
                      setIsUserMenuOpen(false);
                      
                      // Navigate to Coding Community
                      setActiveTab('面试题库');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors flex items-center gap-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    我的笔记
                  </button>
                  <button 
                    onClick={() => {
                      window.open('/favorites', '_blank');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors flex items-center gap-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    题目收藏
                  </button>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-gray-100 py-2">
                  <button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? (
                      <svg className="animate-spin h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                    )}
                    {isLoggingOut ? '正在退出...' : '退出登录'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full m-0 p-0 overflow-hidden flex flex-col">
        <div className={`h-full w-full ${activeTab === '面试题库' ? 'block' : 'hidden'}`}>
          <CodingCommunity 
            key={communityKey}
            onLoginRequest={() => setIsLoginModalOpen(true)} 
            viewMode="default"
            initialQuestionId={currentQuestionId}
            onQuestionSelect={(id) => setCurrentQuestionId(id || undefined)}
            questions={questions}
            categories={categories}
            searchPlaceholder={searchPlaceholder}
          />
        </div>
        
        <div className={`h-full w-full ${activeTab === '同学营活动' ? 'block' : 'hidden'}`}>
          {(visitedTabs.has('同学营活动') || activeTab === '同学营活动') && (
            <StudentCamp />
          )}
        </div>

        {activeTab === '首页' && <Home onChangeTab={setActiveTab} />}
      </main>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      {/* Profile Modal */}
      {session?.user && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={{
            id: session.user.id,
            name: session.user.name || undefined,
            image: session.user.image || undefined,
            email: session.user.email
          }}
          onUpdate={() => {
            // Optional: trigger local state update if needed, but we rely on reload for now
          }}
        />
      )}
    </div>
  );
}
