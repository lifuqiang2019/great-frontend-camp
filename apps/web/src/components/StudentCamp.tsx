import React from 'react';

const StudentCamp = () => {
  return (
    <div className="flex flex-col h-full bg-neutral-50 p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-8 text-primary-900">大前端同学营</h1>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-primary-800 border-l-4 border-accent-gold pl-3">正在进行</h2>
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-primary-900 mb-2">第 5 期：React 源码深度剖析</h3>
              <p className="text-gray-600 mb-4">深入理解 React 核心原理，掌握 Fiber 架构、Diff 算法等高级概念。</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>📅 2024.05.01 - 2024.06.01</span>
                <span>👥 120 人已报名</span>
              </div>
            </div>
            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors">
              立即加入
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-primary-800 border-l-4 border-gray-300 pl-3">往期回顾</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[4, 3, 2, 1].map((num) => (
            <div key={num} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100 opacity-80 hover:opacity-100">
              <h3 className="text-lg font-bold text-primary-900 mb-2">第 {num} 期：前端工程化实战</h3>
              <p className="text-gray-600 text-sm mb-3">Webpack, Vite, CI/CD 全流程落地...</p>
              <span className="text-xs text-gray-400">已结束</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentCamp;
