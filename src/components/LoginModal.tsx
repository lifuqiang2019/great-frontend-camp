"use client";

import React, { useState } from 'react';
import { signIn, signUp } from '@/lib/auth-client';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleWeChatLogin = () => {
    alert('WeChat login is currently under maintenance. Please use Email login.');
    // TODO: Implement WeChat login once credentials are provided
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-neutral-white rounded-xl shadow-elevated w-full max-w-[400px] p-8 border border-primary-100 overflow-hidden animate-modal-in">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-primary-400 hover:text-primary-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-primary-800 rounded-full flex items-center justify-center text-accent-gold text-xl font-bold border border-primary-700 shadow-sm mb-4">
            L
          </div>
          <h2 className="text-2xl font-bold text-primary-900">
            {isLogin ? '欢迎回来' : '加入社区'}
          </h2>
          <p className="text-primary-500 text-sm mt-1">
            {isLogin ? '登录以继续您的学习之旅' : '创建一个新账户开始学习'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
             <div className="space-y-1">
             <label className="text-xs font-semibold text-primary-700 uppercase tracking-wider ml-1">用户名</label>
             <input 
               type="text" 
               placeholder="请输入用户名"
               value={name}
               onChange={(e) => setName(e.target.value)}
               className="w-full px-4 py-[10px] bg-primary-50 border border-primary-200 rounded-lg outline-none text-primary-900 placeholder-primary-400 transition-all focus:border-accent-copper focus:bg-white focus:shadow-[0_0_0_2px_rgba(205,133,63,0.1)]"
             />
           </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-primary-700 uppercase tracking-wider ml-1">邮箱 / 手机号</label>
            <input 
              type="text" 
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-[10px] bg-primary-50 border border-primary-200 rounded-lg outline-none text-primary-900 placeholder-primary-400 transition-all focus:border-accent-copper focus:bg-white focus:shadow-[0_0_0_2px_rgba(205,133,63,0.1)]"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-semibold text-primary-700 uppercase tracking-wider">密码</label>
              {isLogin && <a href="#" className="text-xs text-accent-copper hover:text-accent-copper/80 font-medium transition-colors">忘记密码?</a>}
            </div>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-[10px] bg-primary-50 border border-primary-200 rounded-lg outline-none text-primary-900 placeholder-primary-400 transition-all focus:border-accent-copper focus:bg-white focus:shadow-[0_0_0_2px_rgba(205,133,63,0.1)]"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-[10px] mt-2 bg-primary-800 hover:bg-primary-700 text-accent-gold font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] border border-primary-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? '处理中...' : (isLogin ? '登 录' : '注 册')}
          </button>

          <div className="relative flex items-center justify-center mt-4">
             <div className="absolute inset-0 flex items-center">
               <span className="w-full border-t border-primary-200"></span>
             </div>
             <span className="relative z-10 bg-neutral-white px-2 text-xs text-primary-400 uppercase">Or continue with</span>
          </div>

          <button
            type="button"
            onClick={handleWeChatLogin}
            className="w-full py-[10px] flex items-center justify-center gap-2 bg-[#07C160] hover:bg-[#06ad56] text-white font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M8.5,13.5c-4.2,0-7.5-3.1-7.5-7s3.3-7,7.5-7s7.5,3.1,7.5,7S12.7,13.5,8.5,13.5z M8.5,1.5c-3.1,0-5.5,2.5-5.5,5.5s2.5,5.5,5.5,5.5s5.5-2.5,5.5-5.5S11.6,1.5,8.5,1.5z"/>
              <path d="M17.5,13.5c-0.8,0-1.6-0.2-2.3-0.5c-0.5,0.8-1.3,1.5-2.2,1.5c-1.7,0-3-1.3-3-3s1.3-3,3-3c0.9,0,1.7,0.4,2.2,1.1c0.7-0.3,1.5-0.5,2.3-0.5c2.5,0,4.5,2,4.5,4.5S20,13.5,17.5,13.5z"/>
            </svg>
            微信登录
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-primary-100 text-center">
          <p className="text-sm text-primary-500">
            {isLogin ? '还没有账号? ' : '已有账号? '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent-copper font-semibold hover:underline focus:outline-none"
            >
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
