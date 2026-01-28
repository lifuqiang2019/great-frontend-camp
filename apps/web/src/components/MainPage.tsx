"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CodingCommunity from '@/components/CodingCommunity';
import StudentCamp from '@/components/StudentCamp';
import Home from '@/components/Home';
import LoginModal from '@/components/LoginModal';
import { useSession, signOut } from '@/lib/auth-client';

interface MainPageProps {
  initialTab?: string;
  initialQuestionId?: string;
  serverGreetingConfig?: Record<string, string>;
}

export default function MainPage({ initialTab = '面试题库', initialQuestionId, serverGreetingConfig }: MainPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentQuestionId, setCurrentQuestionId] = useState(initialQuestionId);
  const [communityKey, setCommunityKey] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const { data: session } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set([initialTab]));

  useEffect(() => {
    setActiveTab(initialTab);
    setVisitedTabs(prev => new Set(prev).add(initialTab));
  }, [initialTab]);

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

  const handleTabChange = (tabName: string, url: string) => {
    if (tabName === activeTab) return;
    
    // Update State
    setActiveTab(tabName);
    setVisitedTabs(prev => new Set(prev).add(tabName));
    
    // Update URL without full reload
    window.history.pushState({}, '', url);
  };

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system/config`);
        if (res.ok) {
          const data = await res.json();
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

  const handleAvatarClick = () => {
    if (session) {
      setIsUserMenuOpen(!isUserMenuOpen);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  const navItems = [
    { name: '面试题库' },
    { name: '同学营活动', hot: true }
    // { name: '首页' },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="bg-primary-900 shadow-subtle py-[0.8rem] flex-shrink-0 border-b border-primary-800">
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
          <ul className="flex justify-start list-none gap-[15px] m-0 p-0 flex-1">
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
          
          {/* Time Widget */}
          {currentTime && (
             <div className="mr-6 hidden md:flex items-center justify-center h-full animate-fade-in select-none">
                <div className="flex items-center gap-2 text-[14px] text-primary-100 font-bold leading-none tracking-wide">
                  <span>{getGreeting(currentTime).text}</span>
                </div>
             </div>
          )}

          <div className="flex items-center min-w-[100px] justify-end relative" ref={userMenuRef}>
            <div 
              className="w-9 h-9 bg-primary-800 rounded-full flex items-center justify-center text-accent-gold text-[12px] cursor-pointer font-bold border border-primary-700 hover:bg-primary-700 transition-colors shadow-sm overflow-hidden"
              onClick={handleAvatarClick}
              title={session ? `已登录: ${session.user.name || session.user.email}` : "点击登录"}
            >
              {session?.user.image ? (
                <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
              ) : (
                session?.user.name ? session.user.name.charAt(0).toUpperCase() : "登录"
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
                  <button className="w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors flex items-center gap-3">
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
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    退出登录
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
    </div>
  );
}
