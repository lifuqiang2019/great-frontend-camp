"use client";

import React, { useState, useMemo } from 'react';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { request } from '../lib/request';

interface QuestionItem {
  title: string;
  fileName: string;
}

const allQuestions: Record<string, QuestionItem[]> = {
  '大前端宝典': [
    { title: '什么是重绘与回流？如何优化？', fileName: '001_什么是重绘与回流？如何优化？.md' },
    { title: '代码分析：以下代码触发了多少次回流？', fileName: '002_代码分析：以下代码触发了多少次回流？.md' },
    { title: 'Margin 塌陷与 BFC 详解', fileName: '003_Margin 塌陷与 BFC 详解.md' },
    { title: '如何隐藏一个元素？各种方式对比', fileName: '004_如何隐藏一个元素？各种方式对比.md' },
    { title: 'CSS overflow 属性详解', fileName: '005_CSS overflow 属性详解.md' },
    { title: '三栏布局的实现方式（圣杯模型）', fileName: '006_三栏布局的实现方式（圣杯模型）.md' },
    { title: 'calc() 方法', fileName: '007_calc() 方法.md' },
    { title: '实现 一个固定长宽div 在屏幕上 垂直 水平居中', fileName: '008_实现 一个固定长宽div 在屏幕上 垂直 水平居中.md' },
    { title: '渐进增强（progressive enhancement）和优雅降级（graceful degradation）', fileName: '009_渐进增强（progressive enhancement）和优雅降级（graceful degradation）.md' },
    { title: 'iframe 有哪些优缺点及使用场景', fileName: '010_iframe 有哪些优缺点及使用场景.md' },
    { title: 'CSS 盒子模型', fileName: '011_CSS 盒子模型.md' },
    { title: 'HTML5 的特性', fileName: '012_HTML5 的特性.md' },
    { title: 'CSS3 的特性', fileName: '013_CSS3 的特性.md' },
    { title: 'CSS 中选择器的优先级，权重计算方式。', fileName: '014_CSS 中选择器的优先级，权重计算方式。.md' },
    { title: 'HTML5 input 元素 type 属性', fileName: '015_HTML5 input 元素 type 属性.md' },
    { title: 'CSS 中属性的 继承性', fileName: '016_CSS 中属性的 继承性.md' },
    { title: '画一条 0.5 px 的线', fileName: '017_画一条 0.5 px 的线.md' },
    { title: 'position 的值', fileName: '018_position 的值.md' },
    { title: '什么是浮动，浮动会引起什么问题，有何解决方案？', fileName: '019_什么是浮动，浮动会引起什么问题，有何解决方案？.md' },
    { title: 'line-height 和 height 的区别', fileName: '020_line-height 和 height 的区别.md' },
    { title: '设置一个元素的背景颜色会填充的区域。', fileName: '021_设置一个元素的背景颜色会填充的区域。.md' },
    { title: 'inline-block、inline 和 block 的区别', fileName: '022_inline-block、inline 和 block 的区别.md' },
    { title: '为什么 img 是 inline 但是可以设置宽高', fileName: '023_为什么 img 是 inline 但是可以设置宽高.md' },
    { title: 'box-sizing 的作用，如何使用？', fileName: '024_box-sizing 的作用，如何使用？.md' },
    { title: 'CSS 实现动画', fileName: '025_CSS 实现动画.md' },
    { title: 'transition 和 animation 的区别？', fileName: '026_transition 和 animation 的区别？.md' },
    { title: '如何实现在某个容器中居中的？', fileName: '027_如何实现在某个容器中居中的？.md' },
    { title: '如何改变一个 DOM 元素的字体颜色？', fileName: '028_如何改变一个 DOM 元素的字体颜色？.md' },
    { title: '相对布局和绝对布局，positionrelative 和 absolute 。', fileName: '029_相对布局和绝对布局，positionrelative 和 absolute 。.md' },
    { title: '弹性盒子 flex 布局', fileName: '030_弹性盒子 flex 布局.md' },
    { title: 'Less 和 SCSS 的区别', fileName: '031_Less 和 SCSS 的区别.md' },
    { title: 'CSS3 伪类 ，伪元素', fileName: '032_CSS3 伪类 ，伪元素.md' },
    { title: 'before 和 after 中双冒号和单冒号的区别', fileName: '033_before 和 after 中双冒号和单冒号的区别.md' },
    { title: '响应式布局的实现方案', fileName: '034_响应式布局的实现方案.md' },
    { title: 'link 标签和 import 标签的区别？', fileName: '035_link 标签和 import 标签的区别？.md' },
    { title: '块元素、行元素、置换元素的区别', fileName: '036_块元素、行元素、置换元素的区别.md' },
    { title: '单行元素的文本省略号实现方式', fileName: '037_单行元素的文本省略号实现方式.md' },
    { title: 'HTML 语义化标签', fileName: '038_HTML 语义化标签.md' },
    { title: 'px ，rpx， vw ，vh，rem， em 的区别', fileName: '039_px ，rpx， vw ，vh，rem， em 的区别.md' },
    { title: '以下哪段代码运行效率更高（隐藏类）', fileName: '040_以下哪段代码运行效率更高（隐藏类）.md' }
  ]
};

export default function CodingCommunity() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Configure marked with highlight.js
  const marked = useMemo(() => {
    return new Marked(
      markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang) {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          return hljs.highlight(code, { language }).value;
        }
      })
    );
  }, []);

  const filteredQuestions = useMemo(() => {
    let questions: QuestionItem[] = [];
    Object.values(allQuestions).forEach(list => {
      questions = [...questions, ...list];
    });

    if (searchQuery) {
      questions = questions.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return questions;
  }, [searchQuery]);

  const selectQuestion = async (index: number, item: QuestionItem) => {
    setSelectedIndex(index);
    try {
      // 使用封装的 request 请求静态文件
      // 注意：request 拦截器直接返回 data，所以不需要 .json() 或 .text()，但 axios 默认解析 JSON。
      // 对于 Markdown 文件，我们需要文本格式。
      const data = await request.get<string>(`/大前端宝典_test/${item.fileName}`, {
        responseType: 'text'
      });
      
      const html = await marked.parse(data);
      setCurrentContent(html);
    } catch (error) {
      console.error('Failed to load content:', error);
      setCurrentContent('<p>加载失败，请稍后重试</p>');
    }
  };

  return (
    <div className="flex h-full bg-primary-50 overflow-hidden p-5 gap-5 box-border justify-center">
      {/* Sidebar */}
      <div className="w-[320px] bg-neutral-white flex flex-col shadow-[0_4px_12px_rgba(45,31,31,0.03)] h-full overflow-hidden rounded-xl border border-primary-100">
        <div className="p-5 flex flex-col gap-[15px] relative after:content-[''] after:block after:w-[80%] after:h-[1px] after:bg-primary-100 after:mx-auto after:mt-[5px]">
          <div className="flex items-center">
            <div className="flex-1 min-w-0 relative flex items-center">
              <i className="absolute left-3 text-primary-300 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索..."
                className="w-full box-border py-[10px] pr-3 pl-9 border border-primary-200 rounded-lg text-sm transition-all outline-none bg-primary-50 text-primary-700 focus:border-accent-copper focus:bg-neutral-white focus:shadow-[0_0_0_2px_rgba(205,133,63,0.1)]"
              />
            </div>
          </div>
        </div>
        <ul className="list-none p-[10px] m-0 overflow-y-auto flex-1 custom-scrollbar">
          {filteredQuestions.map((item, index) => (
            <li
              key={index}
              onClick={() => selectQuestion(index, item)}
              className={`group p-[10px_14px] mb-1 cursor-pointer rounded-lg transition-all duration-200 flex items-start gap-3 text-sm text-primary-700 leading-relaxed hover:bg-primary-100 hover:text-primary-900 ${selectedIndex === index ? 'bg-primary-200 text-primary-900 font-medium' : ''}`}
            >
              <span className={`text-primary-400 font-mono text-xs min-w-[20px] h-5 mt-[1px] flex items-center justify-center bg-primary-100 rounded font-semibold
                ${index === 0 ? '!bg-accent-copper/10 !text-accent-copper' : ''}
                ${index === 1 ? '!bg-accent-blue/10 !text-accent-blue' : ''}
                ${index === 2 ? '!bg-primary-200 !text-primary-600' : ''}
                ${selectedIndex === index ? '!bg-primary-700 !text-neutral-white' : ''}
              `}>
                {index + 1}
              </span>
              <span className="flex-1 truncate" title={item.title}>
                {item.title}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-[900px] p-0 bg-neutral-white rounded-xl shadow-[0_4px_12px_rgba(45,31,31,0.03)] flex flex-col overflow-hidden border border-primary-100">
        {currentContent ? (
          <div 
            className="markdown-body p-6 sm:p-[30px] overflow-y-auto flex-1 text-[15px] leading-relaxed text-primary-800 custom-scrollbar
            [&>h1]:text-2xl [&>h1]:pb-3 [&>h1]:border-b [&>h1]:border-primary-200 [&>h1]:mt-0 [&>h1]:mb-5 [&>h1]:font-bold [&>h1]:text-primary-900 [&>h1]:relative [&>h1]:after:content-[''] [&>h1]:after:absolute [&>h1]:after:bottom-[-1px] [&>h1]:after:left-0 [&>h1]:after:w-[50px] [&>h1]:after:h-[3px] [&>h1]:after:bg-accent-copper [&>h1]:after:rounded-[2px]
            [&>h2]:text-xl [&>h2]:mt-[30px] [&>h2]:mb-4 [&>h2]:font-semibold [&>h2]:text-primary-900 [&>h2]:pl-[10px] [&>h2]:border-l-4 [&>h2]:border-accent-copper [&>h2]:leading-[1.4]
            [&>h3]:text-[17px] [&>h3]:mt-6 [&>h3]:mb-[14px] [&>h3]:font-semibold [&>h3]:text-primary-800
            [&>p]:mt-0 [&>p]:mb-4 [&>p]:text-justify
            [&_pre]:p-4 [&_pre]:overflow-auto [&_pre]:text-[13px] [&_pre]:leading-[1.5] [&_pre]:bg-primary-900 [&_pre]:rounded-lg [&_pre]:mb-5 [&_pre]:text-primary-100 [&_pre]:shadow-[0_4px_12px_rgba(0,0,0,0.1)]
            [&_code]:font-mono
            [&_:not(pre)>code]:p-[3px_6px] [&_:not(pre)>code]:mx-[2px] [&_:not(pre)>code]:text-[0.9em] [&_:not(pre)>code]:bg-accent-copper/10 [&_:not(pre)>code]:text-accent-copper [&_:not(pre)>code]:rounded
            [&_blockquote]:p-[16px_20px] [&_blockquote]:text-primary-600 [&_blockquote]:bg-primary-50 [&_blockquote]:border-l-4 [&_blockquote]:border-accent-copper [&_blockquote]:my-6 [&_blockquote]:rounded-r
            [&_ul]:pl-6 [&_ul]:mb-5 [&_ol]:pl-6 [&_ol]:mb-5
            [&_li]:mb-2
            [&_a]:text-accent-copper [&_a]:no-underline [&_a]:font-medium [&_a]:border-b [&_a]:border-dashed [&_a]:border-accent-copper [&_a]:transition-all [&_a]:hover:border-solid [&_a]:hover:opacity-80
            " 
            dangerouslySetInnerHTML={{ __html: currentContent }} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-primary-400">
            <h2 className="text-2xl mb-[10px] text-primary-800">编程社区题库</h2>
            <p>请从左侧选择题目进行练习</p>
          </div>
        )}
      </div>
    </div>
  );
}
