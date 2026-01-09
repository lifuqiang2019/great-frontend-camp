"use client";

import React, { useState } from 'react';
import CodingCommunity from '@/components/CodingCommunity';
import LoginModal from '@/components/LoginModal';
import { useSession, signOut } from '@/lib/auth-client';

export default function Home() {
  const [activeTab, setActiveTab] = useState('编程社区题库');
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
    { name: '主页' },
    { name: '刷题路线' },
    { name: '开始面试' },
    { name: '编程社区题库' }
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="bg-primary-900 shadow-subtle py-[0.8rem] flex-shrink-0 border-b border-primary-800">
        <div className="max-w-full m-0 px-10 flex items-center justify-between">
          <div className="flex items-center min-w-[100px]">
            <div className="text-accent-gold font-bold text-[18px] bg-primary-800 px-[12px] py-[6px] rounded font-data border border-primary-700 shadow-sm">LOGO</div>
          </div>
          <ul className="flex justify-center list-none gap-[15px] m-0 p-0 flex-1">
            {navItems.map((item) => (
              <li key={item.name}>
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
        {activeTab === '编程社区题库' ? (
          <CodingCommunity />
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
