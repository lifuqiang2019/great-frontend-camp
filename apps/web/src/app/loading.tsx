export default function Loading() {
  return (
    <div className="flex flex-col h-screen bg-neutral-white overflow-hidden">
      {/* Navbar Skeleton */}
      <div className="bg-primary-900 h-[60px] flex items-center px-10 border-b border-primary-800">
        <div className="w-9 h-9 rounded-xl bg-white/10 animate-pulse" />
        <div className="ml-10 flex gap-8">
           <div className="w-20 h-5 bg-white/10 rounded animate-pulse" />
           <div className="w-20 h-5 bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Skeleton */}
        <div className="w-[390px] bg-primary-50 border-r border-primary-200 p-5 hidden md:block">
           <div className="space-y-4">
             {[1, 2, 3, 4, 5].map((i) => (
               <div key={i} className="flex flex-col gap-2">
                 <div className="flex items-center gap-3">
                   <div className="w-4 h-4 bg-primary-200/50 rounded animate-pulse" />
                   <div className="w-32 h-5 bg-primary-200/50 rounded animate-pulse" />
                 </div>
                 {i < 3 && (
                   <div className="pl-7 space-y-2">
                     <div className="w-48 h-4 bg-primary-100/50 rounded animate-pulse" />
                     <div className="w-40 h-4 bg-primary-100/50 rounded animate-pulse" />
                   </div>
                 )}
               </div>
             ))}
           </div>
        </div>

        {/* Content Area Skeleton */}
        <div className="flex-1 bg-white/30 p-8 flex flex-col items-center justify-center">
           <div className="w-16 h-16 bg-primary-100 rounded-full animate-bounce mb-4 flex items-center justify-center text-primary-300">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
             </svg>
           </div>
           <div className="text-primary-400 font-medium animate-pulse">正在加载题库数据...</div>
        </div>
      </div>
    </div>
  );
}
