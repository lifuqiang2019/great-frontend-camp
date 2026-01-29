"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CodingCommunity from '@/components/CodingCommunity';
import LoginModal from '@/components/LoginModal';
import { useSession, signOut } from '@/lib/auth-client';

export default function FavoritesPage() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data: session } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

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
    setIsLoggingOut(true);
    try {
      await signOut();
      setIsUserMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error(error);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { name: '前端面试题库', path: '/' },
    { name: '同学营活动', hot: true, path: '/' }
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
                <button
                  onClick={() => router.push(item.path)}
                  className={`no-underline text-primary-100/80 text-[15px] font-medium transition-all duration-300 px-5 py-[8px] rounded-md hover:text-neutral-white hover:bg-primary-800`}
                >
                  {item.name}
                </button>
                {item.hot && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    HOT
                  </span>
                )}
              </li>
            ))}
          </ul>
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
                <div className="p-4 border-b border-gray-100 bg-primary-50/50">
                  <div className="font-bold text-primary-900 truncate">
                    {session.user.name || 'User'}
                  </div>
                  <div className="text-xs text-primary-500 truncate mt-0.5">
                    {session.user.email}
                  </div>
                </div>

                <div className="py-2">
                  <button 
                    onClick={() => router.push('/')}
                    className="w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors flex items-center gap-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    个人信息
                  </button>
                  <button 
                    onClick={() => router.push('/')}
                    className="w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors flex items-center gap-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    模拟预约
                  </button>
                  <button 
                    onClick={() => router.push('/')}
                    className="w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 hover:text-primary-900 transition-colors flex items-center gap-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    我的课程
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-primary-900 bg-primary-50 font-medium flex items-center gap-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-copper">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    题目收藏
                  </button>
                </div>

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
        <CodingCommunity 
          onLoginRequest={() => setIsLoginModalOpen(true)} 
          viewMode="favorites-only"
        />
      </main>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}