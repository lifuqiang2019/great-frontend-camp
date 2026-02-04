import React, { useState } from 'react';
import { signIn, signUp, authClient } from '@/lib/auth-client';
import { Loader2, Check, X, Mail, Lock, User, Github, ArrowRight } from 'lucide-react';

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
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const [emailSent, setEmailSent] = useState(false);
  
  // OTP Sending States
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      alert("请先输入邮箱");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("请输入有效的邮箱地址");
      return;
    }

    setSendingOtp(true);
    try {
      let baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3002/api/auth';
      // Remove trailing slash if present
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      
      const res = await fetch(`${baseUrl}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "发送验证码失败");
      }
      
      setOtpSent(true);
      setOtpSuccess(true);
      setCountdown(60);
      
      // Clear success state after 2 seconds to show countdown
      setTimeout(() => {
        setOtpSuccess(false);
      }, 2000);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // alert("验证码已发送，请查收邮件"); // Removed alert for better UX
    } catch (error: any) {
      console.error("Send OTP error:", error);
      alert(error.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingType('email');
    console.log("🚀 Starting registration submission...");
    console.log("   URL:", process.env.NEXT_PUBLIC_BETTER_AUTH_URL);
    
    try {
      if (isLogin) {
        // ... login logic ...
        await signIn.email({ 
          email, 
          password,
          callbackURL: '/',
        }, {
          onSuccess: () => {
             console.log("✅ Login successful");
             onClose();
          },
          onError: (ctx) => {
            console.error("❌ Login failed:", ctx);
            alert(`登录失败: ${ctx.error.message}`);
          }
        });
      } else {
        // Sign Up Flow
        if (!otp) {
          alert("请输入验证码");
          setLoadingType(null);
          return;
        }

        console.log("🚀 Calling signUp.email...");
        await signUp.email({ 
          email, 
          password, 
          name,
          otp, // Pass OTP here
          callbackURL: '/',
        } as any, { // Cast to any to avoid type errors if otp is not in standard types
          onSuccess: async (ctx) => {
            console.log("✅ SignUp successful!", ctx);
            onClose();
            alert("注册成功！");
          },
          onError: (ctx) => {
            console.error("❌ SignUp failed:", ctx);
            alert(`注册失败: ${ctx.error.message}`);
          }
        });
      }
    } catch (error: any) {
      console.error("❌ Unexpected error in handleSubmit:", error);
      alert(`发生意外错误: ${error.message || error}`);
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
      {/* Backdrop with Blur and subtle gradient */}
      <div 
        className="absolute inset-0 bg-primary-900/60 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white/95 backdrop-blur-2xl rounded-[28px] shadow-2xl w-full max-w-[440px] p-8 border border-white/50 overflow-hidden animate-modal-in transform transition-all ring-1 ring-black/5">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-accent-copper/10 rounded-full blur-3xl pointer-events-none mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none mix-blend-multiply" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-primary-400 hover:text-primary-800 hover:bg-primary-50 rounded-full transition-all duration-300 group z-10"
        >
          <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
        </button>

        <div className="flex flex-col items-center mb-8 mt-2 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-white to-primary-50 rounded-2xl flex items-center justify-center mb-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-white/60 text-primary-600 transform transition-transform duration-500 hover:scale-110 hover:rotate-3">
             {isLogin ? <User className="w-7 h-7" /> : <Mail className="w-7 h-7" />}
          </div>
          <h2 className="text-2xl font-bold text-primary-900 tracking-tight">
            {isLogin ? '欢迎回来' : (emailSent ? '验证邮件已发送' : '加入社区')}
          </h2>
          <p className="text-primary-500 text-sm mt-2 font-medium text-center max-w-[280px]">
            {isLogin ? '登录以继续您的学习之旅' : (emailSent ? `请检查您的邮箱 ${email} 并点击链接激活账户` : '创建一个新账户开始学习')}
          </p>
        </div>

        <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
          {!emailSent ? (
            <>
              {!isLogin && (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary-400 group-focus-within:text-accent-copper transition-colors duration-300">
                    <User className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="用户名"
                    value={name}
                    disabled={loading}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-primary-50/50 border border-primary-100 rounded-xl outline-none text-primary-900 placeholder-primary-400 transition-all duration-300 focus:border-accent-copper/50 focus:bg-white focus:ring-4 focus:ring-accent-copper/10 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                  />
                </div>
              )}
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary-400 group-focus-within:text-accent-copper transition-colors duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  placeholder="邮箱地址"
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-primary-50/50 border border-primary-100 rounded-xl outline-none text-primary-900 placeholder-primary-400 transition-all duration-300 focus:border-accent-copper/50 focus:bg-white focus:ring-4 focus:ring-accent-copper/10 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                />
              </div>

              {!isLogin && (
                <div className="flex gap-3">
                  <div className="relative group flex-1">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary-400 group-focus-within:text-accent-copper transition-colors duration-300">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="验证码"
                      value={otp}
                      disabled={loading}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-primary-50/50 border border-primary-100 rounded-xl outline-none text-primary-900 placeholder-primary-400 transition-all duration-300 focus:border-accent-copper/50 focus:bg-white focus:ring-4 focus:ring-accent-copper/10 disabled:opacity-60 disabled:cursor-not-allowed font-medium text-center tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || sendingOtp || countdown > 0}
                    className={`px-4 py-2 font-semibold rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap min-w-[110px] flex items-center justify-center text-sm shadow-sm
                      ${otpSuccess 
                        ? 'bg-green-50 text-green-600 border border-green-200' 
                        : 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 hover:border-primary-300 hover:shadow-md'
                      }
                    `}
                  >
                    {sendingOtp ? (
                       <Loader2 className="w-4 h-4 animate-spin" />
                    ) : otpSuccess ? (
                      <div className="flex items-center gap-1.5 animate-in zoom-in duration-300">
                        <Check className="w-4 h-4" />
                        <span>已发送</span>
                      </div>
                    ) : countdown > 0 ? (
                      <span className="font-mono">{countdown}s</span>
                    ) : (
                      '获取验证码'
                    )}
                  </button>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary-400 group-focus-within:text-accent-copper transition-colors duration-300">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    type="password" 
                    placeholder="密码"
                    value={password}
                    disabled={loading}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-primary-50/50 border border-primary-100 rounded-xl outline-none text-primary-900 placeholder-primary-400 transition-all duration-300 focus:border-accent-copper/50 focus:bg-white focus:ring-4 focus:ring-accent-copper/10 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                  />
                </div>
                 {isLogin && (
                    <div className="flex justify-end px-1">
                      <a href="#" className="text-xs text-primary-400 hover:text-accent-copper font-medium transition-colors duration-200">忘记密码？</a>
                    </div>
                 )}
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-6 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 bg-[length:200%_100%] hover:bg-[100%_0] text-white font-bold rounded-xl transition-all duration-500 shadow-lg shadow-primary-900/20 hover:shadow-xl hover:shadow-primary-900/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 group"
              >
                {loadingType === 'email' && (
                  <Loader2 className="w-5 h-5 animate-spin text-white/80" />
                )}
                <span>
                  {loadingType === 'email' 
                    ? (isLogin ? '正在登录...' : '正在注册...') 
                    : (isLogin ? '立即登录' : '创建账户')
                  }
                </span>
                {!loadingType && <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />}
              </button>
            </>
          ) : (
            <div className="space-y-8 py-8 animate-fade-in flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20 duration-1000"></div>
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 text-green-600 rounded-full flex items-center justify-center shadow-inner border border-green-100 relative z-10">
                  <Mail className="w-10 h-10" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-xl font-bold text-primary-900">请查收验证邮件</h3>
                <p className="text-primary-500 text-sm max-w-[280px] leading-relaxed">
                  我们已向 <span className="font-semibold text-primary-900 bg-primary-50 px-2 py-0.5 rounded">{email}</span> 发送了一封确认邮件。<br/>请点击邮件中的链接完成注册。
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-10 py-3 bg-primary-50 text-primary-900 font-bold rounded-xl hover:bg-primary-100 transition-colors duration-200"
              >
                我知道了
              </button>
            </div>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-primary-50 flex flex-col items-center gap-5 relative z-10">
          <p className="text-sm text-primary-500 font-medium">
            {isLogin ? '还没有账号? ' : '已有账号? '}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
              }}
              className="text-accent-copper font-bold hover:underline focus:outline-none hover:text-accent-copper/80 transition-colors ml-1"
            >
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </p>
          
          <div className="flex items-center gap-4 w-full">
            <div className="h-px bg-gradient-to-r from-transparent via-primary-100 to-transparent flex-1"></div>
            <span className="text-xs text-primary-300 font-medium uppercase tracking-wider">OR</span>
            <div className="h-px bg-gradient-to-r from-transparent via-primary-100 to-transparent flex-1"></div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSocialLogin('github')}
            className="w-full py-3 rounded-xl border border-primary-200 bg-white text-primary-700 hover:bg-gray-50 hover:border-primary-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold group shadow-sm hover:shadow-md"
          >
            {loadingType === 'github' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
               <Github className="w-5 h-5 text-primary-900 transition-transform duration-300 group-hover:scale-110" />
                <span>使用 GitHub 继续</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
