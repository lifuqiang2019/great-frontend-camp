import React, { useState, useEffect } from 'react';

interface HomeProps {
  onChangeTab: (tab: string) => void;
}

const BannerCarousel = ({ onChangeTab }: { onChangeTab: (tab: string) => void }) => {
  const slides = [
    { id: 1, title: "2025 前端面试突击", desc: "大厂面试真题，涵盖 React, Vue, Node.js 全栈技术体系", bg: "bg-gradient-to-r from-blue-600 to-indigo-700", cta: "开始刷题", link: "coding" },
    { id: 2, title: "大前端同学营", desc: "寻找志同道合的伙伴，一起开源，一起成长", bg: "bg-gradient-to-r from-orange-500 to-red-600", cta: "加入社群", link: "camp" },
    { id: 3, title: "每日算法挑战", desc: "保持手感，拒绝生疏，每天一道精选算法题", bg: "bg-gradient-to-r from-emerald-500 to-teal-600", cta: "立即挑战", link: "coding" }
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-[360px] rounded-2xl overflow-hidden shadow-lg mb-10 group border border-primary-100">
      {/* Slides */}
      <div 
        className="absolute inset-0 flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className={`w-full flex-shrink-0 h-full bg-primary-900 flex items-center justify-center p-10 relative overflow-hidden`}>
            {/* Abstract Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent-gold rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-700 rounded-full translate-y-1/2 -translate-x-1/4 blur-[100px]"></div>
              {/* Code Pattern Overlay */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            </div>
            
            <div className="relative z-10 text-center max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">
                {slide.title}
              </h2>
              <p className="text-xl md:text-2xl text-primary-100 mb-8 font-light">
                {slide.desc}
              </p>
              <button 
                onClick={() => {
                   if (slide.link === 'coding') onChangeTab('面试题库');
                   if (slide.link === 'camp') onChangeTab('同学营活动');
                }}
                className="bg-accent-gold text-primary-900 px-8 py-3 rounded-xl font-bold hover:bg-[#eac14d] transition-all shadow-lg transform hover:-translate-y-1"
              >
                {slide.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentSlide === idx ? 'bg-accent-gold w-8' : 'bg-white/20 hover:bg-white/40 w-2'
            }`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button 
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-white/10"
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button 
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-white/10"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  );
};

export default function Home({ onChangeTab }: HomeProps) {
  return (
    <div className="h-full overflow-y-auto bg-primary-50 p-6 md:p-10 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <BannerCarousel onChangeTab={onChangeTab} />

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { 
              title: "前端题库", 
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              ),
              desc: "精选 1000+ 道大厂面试真题", 
              bg: "bg-blue-50",
              color: "text-blue-600",
              action: () => onChangeTab('面试题库')
            },
            { 
              title: "模拟面试", 
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              ),
              desc: "AI 辅助模拟面试，实时反馈", 
              bg: "bg-purple-50",
              color: "text-purple-600",
              action: () => {} 
            },
            { 
              title: "同学营", 
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              desc: "加入开源社区，共建项目", 
              bg: "bg-orange-50",
              color: "text-orange-600",
              action: () => onChangeTab('同学营活动')
            },
            { 
              title: "知识图谱", 
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              desc: "系统化构建前端知识体系", 
              bg: "bg-green-50",
              color: "text-green-600",
              action: () => {} 
            },
          ].map((item, idx) => (
            <div 
              key={idx} 
              onClick={item.action}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-primary-100 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                {/* Large Background Icon */}
                <div className={`text-9xl ${item.color}`}>
                  {item.icon}
                </div>
              </div>
              
              <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-primary-900 mb-2">{item.title}</h3>
              <p className="text-sm text-primary-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Updates */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary-800 rounded-full"></span>
                最新动态
              </h2>
              <button className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors">查看更多 &rarr;</button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-primary-100 overflow-hidden">
              {[
                { title: "React 19 Beta 发布：新特性速览与实战解析", tag: "React", date: "2小时前", views: 2341 },
                { title: "2025 前端架构师成长路线图 V3.0", tag: "职业发展", date: "5小时前", views: 5120 },
                { title: "深入理解 TypeScript 5.0 装饰器新标准", tag: "TypeScript", date: "1天前", views: 1890 },
                { title: "Next.js App Router 性能优化最佳实践", tag: "Next.js", date: "2天前", views: 3456 },
                { title: "Vue3 + Vite5 工程化配置完全指南", tag: "Engineering", date: "3天前", views: 2789 },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 border-b border-primary-50 last:border-none hover:bg-primary-50/50 transition-colors cursor-pointer group">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-base font-medium text-primary-800 mb-1 group-hover:text-accent-copper truncate transition-colors">{item.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-primary-400">
                      <span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded border border-primary-100">{item.tag}</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                  <div className="text-xs text-primary-300 flex items-center gap-1 group-hover:text-primary-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {item.views}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Challenge & Leaderboard */}
          <div className="flex flex-col gap-6">
            {/* Daily Challenge Card */}
            <div 
              className="bg-gradient-to-br from-primary-900 to-primary-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer border border-primary-700" 
              onClick={() => onChangeTab('前端面试题库')}
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:bg-accent-gold/30 transition-colors duration-500"></div>
               <div className="relative z-10">
                 <div className="flex items-center justify-between mb-4">
                   <span className="bg-white/10 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm border border-white/10 text-accent-gold">每日一题</span>
                   <span className="text-xs text-primary-200 font-mono">2025.01.20</span>
                 </div>
                 <h3 className="text-xl font-bold mb-3 leading-snug group-hover:text-accent-gold transition-colors">实现一个并发限制的异步调度器</h3>
                 <p className="text-primary-200 text-sm mb-6 line-clamp-2 font-light">要求：保证同时运行的任务最多为 N 个，完善 Scheduler 类...</p>
                 <button className="w-full bg-accent-gold text-primary-900 py-2.5 rounded-lg font-bold text-sm hover:bg-[#eac14d] transition-colors shadow-md">
                   立即挑战
                 </button>
               </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl shadow-sm border border-primary-100 p-5 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                  <span className="text-xl">🏆</span> 积分榜
                </h3>
                <span className="text-xs text-primary-400">本周</span>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: "Alex", score: 2840, color: "bg-red-500" },
                  { name: "Sarah", score: 2720, color: "bg-orange-500" },
                  { name: "Mike", score: 2650, color: "bg-yellow-500" },
                  { name: "Emily", score: 2580, color: "bg-green-500" },
                  { name: "David", score: 2430, color: "bg-blue-500" },
                ].map((user, idx) => (
                  <div key={idx} className="flex items-center gap-3 group cursor-default">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                      idx === 1 ? 'bg-gray-100 text-gray-600' : 
                      idx === 2 ? 'bg-orange-100 text-orange-700' : 
                      'text-primary-300'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className={`w-8 h-8 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white`}>
                      {user.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-primary-800 truncate group-hover:text-primary-900">{user.name}</div>
                    </div>
                    <div className="text-sm font-bold text-accent-copper font-mono">{user.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
