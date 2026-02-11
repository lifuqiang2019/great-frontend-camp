import React, { useState, useEffect } from 'react';
import { signIn, signUp, authClient } from '@/lib/auth-client';
import { Loader2, Check, X, Mail, Lock, User, Github, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loadingType, setLoadingType] = useState<'email' | 'github' | null>(null);
  const loading = loadingType !== null;
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const [emailSent, setEmailSent] = useState(false);
  
  // OTP Sending States
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmailError("");
      setPasswordError("");
      setNameError("");
      setOtpError("");
    }
  }, [isOpen]);

  const checkEmailAvailability = async (emailToCheck: string) => {
    if (!emailToCheck || isLogin) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToCheck)) return;

    setCheckingEmail(true);
    try {
      let baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3002/api/auth';
      if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
      
      const res = await fetch(`${baseUrl}/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToCheck })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setEmailError("该邮箱已被注册，请直接登录");
        } else {
          setEmailError("");
        }
      }
    } catch (error) {
      console.error("Failed to check email:", error);
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSendOtp = async () => {
    if (emailError) return;

    if (!email) {
      setEmailError("请先输入邮箱");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("请输入有效的邮箱地址");
      return;
    }
    
    setSendingOtp(true);
    try {
      let baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3002/api/auth';
      // Remove trailing slash if present
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      
      // Double check availability before sending (in case user didn't blur)
      if (!isLogin) {
         const checkRes = await fetch(`${baseUrl}/check-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        if (checkRes.ok) {
           const checkData = await checkRes.json();
           if (checkData.exists) {
             setEmailError("该邮箱已被注册，请直接登录");
             setSendingOtp(false);
             return;
           }
        }
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
      toast.success("验证码已发送，请查收邮件");
      
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
      
    } catch (error: any) {
      console.error("Send OTP error:", error);
      // For system errors, we might still want a toast, but maybe we can put it in emailError if it's relevant?
      // Let's keep toast for network/system errors as they are not validation errors.
      toast.error(error.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingType('email');
    
    // Clear previous errors
    setEmailError("");
    setPasswordError("");
    setNameError("");
    setOtpError("");

    try {
      if (isLogin) {
        let hasError = false;
        if (!email.trim()) {
          setEmailError("请输入邮箱地址");
          hasError = true;
        }
        if (!password) {
          setPasswordError("请输入密码");
          hasError = true;
        }
        
        if (hasError) {
          setLoadingType(null);
          return;
        }

        // ... login logic ...
        await signIn.email({ 
          email, 
          password,
        }, {
          onSuccess: () => {
             console.log("✅ Login successful");
             toast.success("登录成功");
             onClose();
          },
          onError: (ctx) => {
            console.error("❌ Login failed:", ctx);
            toast.error(`登录失败: ${ctx.error.message}`);
          }
        });
      } else {
        // Sign Up Flow
        let hasError = false;
        if (!name.trim()) {
          setNameError("请输入用户名");
          hasError = true;
        }
        if (!email.trim()) {
          setEmailError("请输入邮箱地址");
          hasError = true;
        }
        if (!password) {
          setPasswordError("请输入密码");
          hasError = true;
        }
        if (!otp) {
          setOtpError("请输入验证码");
          hasError = true;
        }
        
        if (hasError) {
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
            toast.success("注册成功！");
          },
          onError: (ctx) => {
            console.error("❌ SignUp failed:", ctx);
            toast.error(`注册失败: ${ctx.error.message}`);
          }
        });
      }
    } catch (error: any) {
      console.error("❌ Unexpected error in handleSubmit:", error);
      toast.error(`发生意外错误: ${error.message || error}`);
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
      toast.error("Github 登录失败");
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
      <div className="relative bg-white/95 backdrop-blur-2xl rounded-[28px] shadow-2xl w-full max-w-[420px] border border-white/50 overflow-hidden animate-modal-in transform transition-all ring-1 ring-black/5 flex flex-col">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-accent-copper/10 rounded-full blur-3xl pointer-events-none mix-blend-multiply opacity-50 md:opacity-100" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none mix-blend-multiply opacity-50 md:opacity-100" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-primary-400 hover:text-primary-800 hover:bg-primary-50 rounded-full transition-all duration-300 group z-20"
        >
          <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
        </button>

        <div className="p-6 md:p-8 w-full relative z-10">
        <div className={`flex flex-col items-center relative z-10 transition-all duration-300 ${!isLogin ? 'mb-4 mt-0' : 'mb-6 mt-2'}`}>
          <div className={`bg-gradient-to-br from-white to-primary-50 rounded-2xl flex items-center justify-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-white/60 text-primary-600 transform transition-transform duration-500 hover:scale-110 hover:rotate-3 ${!isLogin ? 'w-10 h-10 mb-2' : 'w-14 h-14 mb-4'}`}>
             {isLogin ? <User className={`${!isLogin ? 'w-5 h-5' : 'w-7 h-7'}`} /> : <Mail className={`${!isLogin ? 'w-5 h-5' : 'w-7 h-7'}`} />}
          </div>
          <h2 className={`font-bold text-primary-900 tracking-tight ${!isLogin ? 'text-xl' : 'text-2xl'}`}>
            {isLogin ? '欢迎回来' : (emailSent ? '验证邮件已发送' : '加入社区')}
          </h2>
          {isLogin && (
            <p className="text-primary-500 text-sm mt-2 font-medium text-center max-w-[280px]">
              登录以继续您的学习之旅
            </p>
          )}
          {!isLogin && emailSent && (
            <p className="text-primary-500 text-sm mt-1 font-medium text-center max-w-[280px]">
               请检查您的邮箱 {email} 并点击链接激活账户
            </p>
          )}
          {!isLogin && !emailSent && (
             <p className="text-primary-500 text-xs mt-1 font-medium text-center max-w-[280px] opacity-80">
                创建一个新账户开始学习
             </p>
          )}
        </div>

        <form className={`relative z-10 ${!isLogin ? 'space-y-3' : 'space-y-4'}`} onSubmit={handleSubmit}>
          {!emailSent ? (
            <>
              {!isLogin && (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-400 group-focus-within:text-accent-copper transition-colors duration-300">
                    <User className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="用户名"
                    value={name}
                    disabled={loading}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError("");
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-primary-50/50 border rounded-xl outline-none text-primary-900 placeholder-primary-400 text-sm transition-all duration-300 focus:bg-white focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed font-medium
                      ${nameError 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                        : 'border-primary-100 focus:border-accent-copper/50 focus:ring-accent-copper/10'
                      }
                    `}
                  />
                  {nameError && (
                    <p className="mt-1 ml-1 text-[10px] text-red-500 font-medium animate-in slide-in-from-top-1 fade-in duration-200">
                      {nameError}
                    </p>
                  )}
                </div>
              )}
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-400 group-focus-within:text-accent-copper transition-colors duration-300">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  placeholder="邮箱地址"
                  value={email}
                  disabled={loading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  onBlur={() => checkEmailAvailability(email)}
                  className={`w-full pl-10 pr-4 py-3 bg-primary-50/50 border rounded-xl outline-none text-primary-900 placeholder-primary-400 text-sm transition-all duration-300 focus:bg-white focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed font-medium
                    ${emailError 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                      : 'border-primary-100 focus:border-accent-copper/50 focus:ring-accent-copper/10'
                    }
                  `}
                />
                {emailError && (
                  <p className="mt-1 ml-1 text-[10px] text-red-500 font-medium animate-in slide-in-from-top-1 fade-in duration-200">
                    {emailError}
                  </p>
                )}
                {checkingEmail && !emailError && (
                   <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-3.5 h-3.5 text-primary-400 animate-spin" />
                   </div>
                )}
              </div>

              {!isLogin && (
                <div className="flex gap-3">
                  <div className="relative group flex-1">
                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-400 group-focus-within:text-accent-copper transition-colors duration-300">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="验证码"
                      value={otp}
                      disabled={loading}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        if (otpError) setOtpError("");
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-primary-50/50 border rounded-xl outline-none text-primary-900 placeholder-primary-400 text-sm transition-all duration-300 focus:bg-white focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed font-medium text-center tracking-widest
                        ${otpError 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                          : 'border-primary-100 focus:border-accent-copper/50 focus:ring-accent-copper/10'
                        }
                      `}
                      maxLength={6}
                    />
                    {otpError && (
                      <p className="mt-1 ml-1 text-[10px] text-red-500 font-medium animate-in slide-in-from-top-1 fade-in duration-200 absolute -bottom-5 left-0 whitespace-nowrap">
                        {otpError}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || sendingOtp || countdown > 0}
                    className={`px-3 py-2 font-semibold rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap min-w-[100px] flex items-center justify-center text-xs shadow-sm
                      ${otpSuccess 
                        ? 'bg-green-50 text-green-600 border border-green-200' 
                        : 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 hover:border-primary-300 hover:shadow-md'
                      }
                    `}
                  >
                    {sendingOtp ? (
                       <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : otpSuccess ? (
                      <div className="flex items-center gap-1 animate-in zoom-in duration-300">
                        <Check className="w-3.5 h-3.5" />
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
              
              <div className="space-y-1.5">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-400 group-focus-within:text-accent-copper transition-colors duration-300">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type="password" 
                    placeholder="密码"
                    value={password}
                    disabled={loading}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-primary-50/50 border rounded-xl outline-none text-primary-900 placeholder-primary-400 text-sm transition-all duration-300 focus:bg-white focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed font-medium
                      ${passwordError 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                        : 'border-primary-100 focus:border-accent-copper/50 focus:ring-accent-copper/10'
                      }
                    `}
                  />
                  {passwordError && (
                    <p className="mt-1 ml-1 text-[10px] text-red-500 font-medium animate-in slide-in-from-top-1 fade-in duration-200">
                      {passwordError}
                    </p>
                  )}
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
                className={`w-full ${!isLogin ? 'py-3 mt-4' : 'py-3.5 mt-6'} bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 bg-[length:200%_100%] hover:bg-[100%_0] text-white font-bold rounded-xl transition-all duration-500 shadow-lg shadow-primary-900/20 hover:shadow-xl hover:shadow-primary-900/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 group text-sm`}
              >
                {loadingType === 'email' && (
                  <Loader2 className="w-4 h-4 animate-spin text-white/80" />
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

        <div className={`border-t border-primary-50 flex flex-col items-center gap-4 relative z-10 transition-all duration-300 ${!isLogin ? 'mt-6 pt-5' : 'mt-8 pt-6'}`}>
          <p className="text-xs text-primary-500 font-medium">
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
          
          <div className="flex items-center gap-4 w-full opacity-60">
            <div className="h-px bg-gradient-to-r from-transparent via-primary-100 to-transparent flex-1"></div>
            <span className="text-[10px] text-primary-300 font-medium uppercase tracking-wider">OR</span>
            <div className="h-px bg-gradient-to-r from-transparent via-primary-100 to-transparent flex-1"></div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSocialLogin('github')}
            className="w-full py-2.5 rounded-xl border border-primary-200 bg-white text-primary-700 hover:bg-gray-50 hover:border-primary-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold group shadow-sm hover:shadow-md text-sm"
          >
            {loadingType === 'github' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
               <Github className="w-4 h-4 text-primary-900 transition-transform duration-300 group-hover:scale-110" />
                <span>使用 GitHub 继续</span>
              </>
            )}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
