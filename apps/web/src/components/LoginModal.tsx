"use client";

import React, { useState } from 'react';
import { signIn, signUp } from '@/lib/auth-client';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loadingType, setLoadingType] = useState<'email' | 'github' | null>(null);
  const loading = loadingType !== null;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingType('email');
    try {
      if (isLogin) {
        await signIn.email({ 
          email, 
          password,
          callbackURL: '/',
        }, {
          onSuccess: () => {
             onClose();
          },
          onError: (ctx) => {
            alert(ctx.error.message);
          }
        });
      } else {
        await signUp.email({ 
          email, 
          password, 
          name,
          callbackURL: '/',
        }, {
          onSuccess: () => {
            alert('Verification email sent! Please check your inbox.');
            onClose();
          },
          onError: (ctx) => {
            alert(ctx.error.message);
          }
        });
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setLoadingType(null);
    }
  };

  const handleSocialLogin = async (provider: 'github') => {
    setLoadingType(provider);
    try {
      await signIn.social({ 
        provider, 
        callbackURL: typeof window !== 'undefined' ? window.location.origin : '/' 
      });
    } catch (error) {
      console.error(error);
      setLoadingType(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-primary-900/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-neutral-white rounded-2xl shadow-2xl w-full max-w-[400px] p-8 border border-white/20 overflow-hidden animate-modal-in transform transition-all">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-primary-400 hover:text-primary-800 hover:bg-primary-50 rounded-full transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="flex flex-col items-center mb-8 mt-2">
          <h2 className="text-3xl font-extrabold text-primary-900 tracking-tight">
            {isLogin ? '欢迎回来' : '加入社区'}
          </h2>
          <p className="text-primary-500 text-sm mt-2 font-medium">
            {isLogin ? '登录以继续您的学习之旅' : '创建一个新账户开始学习'}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {!isLogin && (
             <div className="space-y-1.5">
             <label className="text-sm font-medium text-primary-700 ml-1">用户名</label>
             <input 
               type="text" 
               placeholder="请输入用户名"
               value={name}
               disabled={loading}
               onChange={(e) => setName(e.target.value)}
               className="w-full px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl outline-none text-primary-900 placeholder-primary-400 transition-all focus:border-accent-copper focus:bg-white focus:ring-4 focus:ring-accent-copper/10 disabled:opacity-60 disabled:cursor-not-allowed"
             />
           </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-primary-700 ml-1">邮箱</label>
            <input 
              type="email" 
              placeholder="example@email.com"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl outline-none text-primary-900 placeholder-primary-400 transition-all focus:border-accent-copper focus:bg-white focus:ring-4 focus:ring-accent-copper/10 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-primary-700">密码</label>
              {isLogin && <a href="#" className="text-xs text-accent-copper hover:text-accent-copper/80 font-medium transition-colors">忘记密码？</a>}
            </div>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl outline-none text-primary-900 placeholder-primary-400 transition-all focus:border-accent-copper focus:bg-white focus:ring-4 focus:ring-accent-copper/10 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-primary-900 hover:bg-primary-800 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loadingType === 'email' && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loadingType === 'email' ? (isLogin ? '正在登录...' : '正在注册...') : (isLogin ? '登 录' : '注 册')}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-primary-100 flex flex-col items-center gap-4">
          <p className="text-sm text-primary-500">
            {isLogin ? '还没有账号? ' : '已有账号? '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent-copper font-bold hover:underline focus:outline-none hover:text-accent-copper/80 transition-colors"
            >
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </p>

          <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
            <span className="text-xs text-primary-300">或</span>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSocialLogin('github')}
              className="p-1.5 rounded-full bg-primary-50 text-primary-500 hover:bg-[#24292e] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              title="使用 GitHub 登录"
            >
              {loadingType === 'github' ? (
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
