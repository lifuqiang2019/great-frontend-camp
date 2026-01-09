"use client";

import React, { useState } from 'react';
import CodingCommunity from '@/components/CodingCommunity';
import StudentCamp from '@/components/StudentCamp';
import LoginModal from '@/components/LoginModal';
import { useSession, signOut } from '@/lib/auth-client';

export default function Home() {
  const [activeTab, setActiveTab] = useState('前端面试题库');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { data: session } = useSession();

  const handleAvatarClick = async () => {
    if (session) {
      if (confirm('确定要退出登录吗？')) {
        await signOut();
      }
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const navItems = [
    { name: '前端面试题库' },
    { name: '同学营活动', hot: true }
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="bg-primary-900 shadow-subtle py-[0.8rem] flex-shrink-0 border-b border-primary-800">
        <div className="max-w-full m-0 px-10 flex items-center justify-between">
          <div className="flex items-center min-w-[100px] mr-10">
            <div className="flex items-center gap-3 cursor-pointer group">
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
                    setActiveTab(item.name);
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
          <div className="flex items-center min-w-[100px] justify-end">
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full m-0 p-0 overflow-hidden flex flex-col">
        {activeTab === '前端面试题库' ? (
          <CodingCommunity />
        ) : activeTab === '同学营活动' ? (
          <StudentCamp />
        ) : (
          <div className="p-5 max-w-[1200px] mx-auto w-full flex-1 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{activeTab}</h2>
            <p className="text-gray-600">正在开发中...</p>
          </div>
        )}
      </main>

      {/* Modals */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
