import React, { useState } from 'react';

const StudentCamp = () => {
  const [showQRCode, setShowQRCode] = useState(false);

  return (
    <div className="flex flex-col h-full bg-neutral-50 overflow-y-auto">
      {/* Hero Section */}
      <div className="relative bg-primary-900 text-white py-20 px-6 sm:px-12 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-700/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
            大前端<span className="text-accent-gold">同学营</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto font-light">
            不仅仅是 Coding。这里是前端人的技术避风港，<br className="hidden md:block" />一起开源，一起成长，拒绝焦虑。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => setShowQRCode(true)}
              className="bg-accent-gold hover:bg-[#eac14d] text-primary-900 font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-lg flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              立即加入交流群
            </button>
            <button className="bg-primary-800/50 hover:bg-primary-800 text-white font-medium py-3 px-8 rounded-full border border-primary-700 hover:border-accent-gold/50 transition-all text-lg backdrop-blur-sm">
              了解更多权益
            </button>
          </div>
          
          <div className="mt-12 flex justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>500+ 在线交流</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-gold"></div>
              <span>大厂导师坐镇</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>每周技术分享</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 w-full">
        {/* Partners / Sponsors Section */}
        <div className="mb-20 overflow-hidden">
          <p className="text-center text-gray-500 text-sm mb-8 tracking-wider uppercase font-medium">Trusted by teams at</p>
          
          <div className="relative w-full overflow-hidden mask-linear-fade flex flex-col gap-8">
            <div className="flex w-max animate-marquee items-center gap-16">
              {[
                { name: "Vercel", logo: "/vercel.svg" },
                { name: "Next.js", logo: "/next.svg" },
                { name: "Global Tech", logo: "/globe.svg" },
                { name: "Window OS", logo: "/window.svg" },
                { name: "File Sys", logo: "/file.svg" },
                { name: "Vercel", logo: "/vercel.svg" },
                { name: "Next.js", logo: "/next.svg" },
                { name: "Global Tech", logo: "/globe.svg" },
                { name: "Window OS", logo: "/window.svg" },
                { name: "File Sys", logo: "/file.svg" },
                { name: "Vercel", logo: "/vercel.svg" },
                { name: "Next.js", logo: "/next.svg" },
                { name: "Global Tech", logo: "/globe.svg" },
                { name: "Window OS", logo: "/window.svg" },
                { name: "File Sys", logo: "/file.svg" },
                { name: "Vercel", logo: "/vercel.svg" },
                { name: "Next.js", logo: "/next.svg" },
                { name: "Global Tech", logo: "/globe.svg" },
                { name: "Window OS", logo: "/window.svg" },
                { name: "File Sys", logo: "/file.svg" },
              ].map((partner, idx) => (
                <div key={idx} className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-pointer">
                  <img src={partner.logo} alt={partner.name} className="h-8 w-auto" />
                  <span className="font-bold text-lg text-primary-800 hidden sm:block">{partner.name}</span>
                </div>
              ))}
            </div>

            <div className="flex w-max animate-marquee items-center gap-16 ml-8">
              {[
                { name: "Vercel", logo: "/vercel.svg" },
                { name: "Next.js", logo: "/next.svg" },
                { name: "Global Tech", logo: "/globe.svg" },
                { name: "Window OS", logo: "/window.svg" },
                { name: "File Sys", logo: "/file.svg" },
                { name: "Vercel", logo: "/vercel.svg" },
                { name: "Next.js", logo: "/next.svg" },
                { name: "Global Tech", logo: "/globe.svg" },
                { name: "Window OS", logo: "/window.svg" },
                { name: "File Sys", logo: "/file.svg" },
                { name: "Vercel", logo: "/vercel.svg" },
                { name: "Next.js", logo: "/next.svg" },
                { name: "Global Tech", logo: "/globe.svg" },
                { name: "Window OS", logo: "/window.svg" },
                { name: "File Sys", logo: "/file.svg" },
                { name: "Vercel", logo: "/vercel.svg" },
                { name: "Next.js", logo: "/next.svg" },
                { name: "Global Tech", logo: "/globe.svg" },
                { name: "Window OS", logo: "/window.svg" },
                { name: "File Sys", logo: "/file.svg" },
              ].map((partner, idx) => (
                <div key={idx} className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-pointer">
                  <img src={partner.logo} alt={partner.name} className="h-8 w-auto" />
                  <span className="font-bold text-lg text-primary-800 hidden sm:block">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            {
              title: "大咖答疑",
              desc: "来自字节、阿里等一线大厂导师在线解答，拒绝难题卡关，让成长少走弯路。",
              icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              ),
              color: "from-blue-500 to-blue-600"
            },
            {
              title: "相互学习",
              desc: "活跃的技术氛围，定期的代码 Review 活动，与优秀的伙伴一起，共同进步。",
              icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ),
              color: "from-purple-500 to-purple-600"
            },
            {
              title: "资源共享",
              desc: "独家面试资料、内推机会一手掌握，紧跟技术前沿，不错过每一个机会。",
              icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              ),
              color: "from-emerald-500 to-emerald-600"
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 group">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Active Study Groups */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-primary-900 flex items-center gap-2 mb-8">
            <span className="w-1.5 h-8 bg-blue-500 rounded-full"></span>
            活跃学习小组
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { title: "算法刷题组", desc: "每日一题，拒绝摆烂。LeetCode 300 题突击。", users: 128, color: "bg-orange-100 text-orange-600" },
               { title: "Vue3 源码读写", desc: "深入响应式原理，尝试手写 mini-vue。", users: 85, color: "bg-green-100 text-green-600" },
               { title: "Rust 前端基建", desc: "探索 SWC/TurboPack 背后的技术栈。", users: 42, color: "bg-gray-100 text-gray-700" },
               { title: "独立开发 101", desc: "从 0 到 1，构建你的第一个盈利产品。", users: 256, color: "bg-purple-100 text-purple-600" }
             ].map((group, idx) => (
               <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all cursor-pointer group">
                 <div className="flex justify-between items-start mb-4">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold ${group.color}`}>
                     # {group.title}
                   </span>
                   <div className="flex items-center text-xs text-gray-400 gap-1">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                     </svg>
                     {group.users}
                   </div>
                 </div>
                 <p className="text-gray-600 text-sm leading-relaxed mb-4 group-hover:text-primary-900 transition-colors">
                   {group.desc}
                 </p>
                 <div className="flex -space-x-2 overflow-hidden">
                   {[...Array(4)].map((_, i) => (
                     <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-200"></div>
                   ))}
                   <div className="flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 text-[10px] text-gray-500 font-medium">
                     +
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Featured Poster Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
              <span className="w-1.5 h-8 bg-accent-gold rounded-full"></span>
              热门活动
            </h2>
            <button className="text-primary-600 font-medium hover:text-primary-800 flex items-center gap-1">
              查看全部 
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="bg-white rounded-3xl p-2 shadow-xl border border-gray-100">
            <div className="relative rounded-2xl overflow-hidden bg-primary-900 text-white min-h-[400px] flex flex-col md:flex-row">
              {/* Left Content */}
              <div className="p-10 md:p-14 md:w-1/2 z-10 flex flex-col justify-center">
                <span className="inline-block bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-6 w-fit flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  OPEN SOURCE
                </span>
                <h3 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  Next.js 企业级<br/>实战项目共建
                </h3>
                <p className="text-gray-300 mb-8 text-lg">
                  拒绝纸上谈兵！从零开始打造一个全栈应用。
                  <br/>
                  涵盖鉴权、支付、部署全流程，代码完全开源，欢迎 PR。
                </p>
                <div className="flex gap-4">
                  <button className="bg-white text-primary-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    GitHub 仓库
                  </button>
                  <button className="px-8 py-3 rounded-xl font-bold border border-white/20 hover:bg-white/10 transition-colors backdrop-blur-sm">
                    查看开发文档
                  </button>
                </div>
              </div>

              {/* Right Visual (Simulated Poster) */}
              <div className="md:w-1/2 relative bg-gradient-to-br from-primary-800 to-primary-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                {/* Abstract Shapes */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-gold rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                
                {/* Code Snippet Decoration */}
                <div className="absolute right-10 top-10 bottom-10 left-10 border border-white/10 rounded-xl bg-black/20 backdrop-blur-md p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-3/4 bg-white/10 rounded"></div>
                    <div className="h-2 w-1/2 bg-white/10 rounded"></div>
                    <div className="h-2 w-full bg-white/10 rounded"></div>
                    <div className="h-2 w-2/3 bg-white/10 rounded"></div>
                    <div className="mt-4 h-2 w-5/6 bg-accent-gold/20 rounded"></div>
                    <div className="h-2 w-4/5 bg-accent-gold/20 rounded"></div>
                  </div>
                  <div className="absolute bottom-6 right-6 text-6xl font-black text-white/5 select-none">
                    JS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-accent-gold to-[#eac14d] rounded-3xl p-10 text-center relative overflow-hidden shadow-lg">
          <div className="absolute top-0 left-0 w-full h-full bg-white/10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">Ready to Build?</h2>
            <p className="text-primary-800 mb-8 max-w-2xl mx-auto">
              不管你是小白还是大佬，这里都有你的位置。<br/>来贡献代码，来分享经验，来寻找志同道合的伙伴。
            </p>
            <button 
              onClick={() => setShowQRCode(true)}
              className="bg-primary-900 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-primary-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              加入开源社区
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-primary-900/60 backdrop-blur-sm"
            onClick={() => setShowQRCode(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-modal-in">
            <button 
              onClick={() => setShowQRCode(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-primary-900 mb-2">扫码加入交流群</h3>
              <p className="text-gray-500 text-sm mb-6">与 10000+ 小伙伴一起成长</p>
              
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl mb-6 flex items-center justify-center border-2 border-dashed border-primary-200">
                {/* Simulated QR Code */}
                <div className="grid grid-cols-5 gap-1 p-2">
                   {[...Array(25)].map((_, i) => (
                     // Use a deterministic pattern instead of Math.random() to ensure purity and avoid hydration mismatches
                     <div key={i} className={`w-full h-full rounded-sm ${(i * 7 + 3) % 5 !== 0 ? 'bg-primary-900' : 'bg-transparent'}`}></div>
                   ))}
                </div>
              </div>
              
              <div className="bg-primary-50 rounded-lg p-3 text-xs text-primary-700">
                <p>💡 进群暗号：<span className="font-bold">大前端</span></p>
                <p>如二维码失效，请联系管理员：admin_helper</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCamp;
