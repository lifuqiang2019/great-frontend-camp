import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, Workflow, Rocket, Shield, 
  ArrowRight, Briefcase, FileText, 
  Target, Calendar, Share2, MessageCircle,
  Flame, Gem, BookOpen, ArrowUp, BrainCircuit,
  Database, Cpu, Code2, Layers, Bot, GraduationCap
} from 'lucide-react';

const StudentCamp = () => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [activePhase, setActivePhase] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 600);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Updated Data Structure based on User Request - Single Comprehensive Roadmap
  const AI_SYLLABUS = [
    {
      phase: "Phase 1: 夯实基础",
      color: "from-blue-500 to-cyan-500",
      items: [
        { 
          title: "前置知识体系", 
          desc: "Python/Git/Docker 必备工程化基石",
          icon: <Code2 className="w-6 h-6" />,
          submodules: [
            { name: "Python 进阶", content: "装饰器 / 生成器 / 上下文管理器 / Pydantic 类型校验" },
            { name: "工程化基石", content: "Git Flow 工作流 / Docker 容器编排 / Linux 常用指令" },
            { name: "数据科学栈", content: "NumPy 向量化运算 / Pandas 数据清洗 / Matplotlib 可视化" }
          ]
        },
        { 
          title: "大模型应用基础", 
          desc: "Prompt Engineering 与 API 核心",
          icon: <MessageCircle className="w-6 h-6" />,
          submodules: [
            { name: "Prompt Engineering", content: "COT 思维链 / TOT 思维树 / Few-shot Learning" },
            { name: "API 实战", content: "OpenAI 接口规范 / Stream 流式响应 / Function Calling" },
            { name: "核心概念", content: "Token 计算与成本 / Embedding 向量表征 / 温度系数调优" }
          ]
        },
        { 
          title: "大模型开发框架实战", 
          desc: "LangChain 与 Semantic Kernel 深度应用",
          icon: <Layers className="w-6 h-6" />,
          submodules: [
            { name: "LangChain 核心", content: "Chains 链式调用 / LCEL 表达式 / Memory 记忆组件" },
            { name: "LlamaIndex", content: "Data Loaders / Indexing 策略 / Query Engines" },
            { name: "Semantic Kernel", content: "Plugins 插件体系 / Planners 规划器 / Skills" }
          ]
        }
      ]
    },
    {
      phase: "Phase 2: 核心进阶",
      color: "from-amber-500 to-orange-500",
      items: [
        { 
          title: "RAG 开发实战", 
          desc: "企业级知识库与检索增强生成",
          icon: <Database className="w-6 h-6" />,
          submodules: [
            { name: "数据处理", content: "PDF/Markdown 解析 / Recursive Character Splitter 切分" },
            { name: "检索增强", content: "向量数据库 (Milvus/Pinecone) / 混合检索 (Hybrid Search)" },
            { name: "高级优化", content: "Rerank 重排序 / Parent Document Retriever / Multi-query" }
          ]
        },
        { 
          title: "Agent 开发实战", 
          desc: "构建自主决策的智能体系统",
          icon: <Bot className="w-6 h-6" />,
          submodules: [
            { name: "推理模式", content: "ReAct 框架 / Plan-and-Solve / Self-Reflection" },
            { name: "工具调用", content: "OpenAPI Spec / Tool Use 错误处理 / Human-in-the-loop" },
            { name: "多智能体", content: "AutoGen 协作模式 / CrewAI 角色编排 / 状态共享" }
          ]
        },
        { 
          title: "大模型微调实战", 
          desc: "打造垂直领域的专属模型",
          icon: <Cpu className="w-6 h-6" />,
          submodules: [
            { name: "微调方法", content: "SFT 指令微调 / LoRA 低秩适应 / QLoRA 量化微调" },
            { name: "数据工程", content: "Self-Instruct 数据生成 / 数据清洗与去重 / 格式转换" },
            { name: "训练实战", content: "HuggingFace Transformers / PEFT 库 / Loss 曲线分析" }
          ]
        }
      ]
    },
    {
      phase: "Phase 3: 深度与落地",
      color: "from-purple-500 to-pink-500",
      items: [
        { 
          title: "大模型实战工具", 
          desc: "部署、监控与评估全链路",
          icon: <Workflow className="w-6 h-6" />,
          submodules: [
            { name: "部署运维", content: "Ollama 本地部署 / vLLM 推理加速 / TGI 服务化" },
            { name: "监控评估", content: "LangSmith 链路追踪 / LangFuse 成本监控 / RAGAS 评分" },
            { name: "工程效能", content: "Prompt Management / Dataset Versioning / A/B Testing" }
          ]
        },
        { 
          title: "项目综合实战", 
          desc: "真实场景下的完整应用开发",
          icon: <Briefcase className="w-6 h-6" />,
          submodules: [
            { name: "垂直领域 RAG", content: "法律/医疗文档问答 / 引用源溯源 / 意图识别" },
            { name: "Code Agent", content: "本地文件系统操作 / 代码生成与执行 / 自动化测试" },
            { name: "多模态助手", content: "语音识别 (Whisper) / 图像理解 (GPT-4V) / 实时交互" }
          ]
        },
        { 
          title: "进阶：AI 算法基础", 
          desc: "知其然，更知其所以然",
          icon: <BrainCircuit className="w-6 h-6" />,
          submodules: [
            { name: "Transformer", content: "Self-Attention 机制 / Multi-head Attention / FFN" },
            { name: "架构演进", content: "BERT (Encoder) / GPT (Decoder) / T5 (Enc-Dec)" },
            { name: "底层原理", content: "Backpropagation / Positional Encoding / LayerNorm" }
          ]
        }
      ]
    }
  ];

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-neutral-white overflow-y-auto relative scroll-smooth scrollbar-hide">
      {/* Hero Section */}
      <div className="relative bg-primary-900 text-white py-24 px-6 sm:px-12 overflow-hidden shrink-0 isolate">
        {/* Modern Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        {/* Spotlight Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary-500/20 rounded-[100%] blur-[100px] -z-10"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-accent-gold/10 rounded-[100%] blur-[100px] -z-10"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-accent-gold mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-copper"></span>
            </span>
            前端人的技术避风港
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight drop-shadow-2xl">
            大前端<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold via-accent-copper to-primary-400">同学营</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-200 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            不仅仅是 Coding。这里是<span className="text-white font-medium">拒绝焦虑</span>的开源社区，<br className="hidden md:block" />
            与 <span className="text-accent-gold">500+</span> 伙伴一起，构建你的技术护城河。
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16">
            <button 
              onClick={() => setShowQRCode(true)}
              className="group relative px-8 py-4 bg-white text-primary-900 font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all transform hover:-translate-y-1 text-lg flex items-center gap-3 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-copper" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              立即加入交流群
            </button>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-full border border-white/10 hover:border-white/30 transition-all text-lg backdrop-blur-sm flex items-center gap-2 group">
              探索权益
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { label: "在线活跃伙伴", val: "500+", icon: <Flame className="w-6 h-6 text-accent-copper" />, color: "text-accent-copper" },
              { label: "大厂导师坐镇", val: "Top 5", icon: <Gem className="w-6 h-6 text-accent-blue" />, color: "text-accent-blue" },
              { label: "沉淀技术资源", val: "100GB+", icon: <BookOpen className="w-6 h-6 text-accent-sage" />, color: "text-accent-sage" }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center justify-center gap-4 hover:bg-white/10 transition-colors cursor-default">
                <div className="p-2 bg-white/5 rounded-lg border border-white/5 shadow-inner">
                  {stat.icon}
                </div>
                <div className="text-left">
                  <div className={`text-xl font-bold ${stat.color} font-mono`}>{stat.val}</div>
                  <div className="text-xs text-primary-300 font-medium tracking-wider uppercase">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
        
        {/* AI Full Stack Development Section - Completely Redesigned */}
        <div className="mb-32">
           <div className="text-center mb-16">
              <span className="inline-block py-1 px-3 rounded-full bg-black/5 text-black font-bold text-xs tracking-widest uppercase mb-4">2025 Roadmap</span>
              <h2 className="text-4xl md:text-6xl font-black text-primary-900 tracking-tight mb-6">
                AI 全栈开发 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">实战路线</span>
              </h2>
              <p className="text-xl text-primary-500 max-w-3xl mx-auto leading-relaxed">
                从 Prompt Engineering 到 Agent 落地，我们不讲概念，只讲代码。
                <br className="hidden md:block"/>
                这是一条通往 <span className="font-bold text-primary-900">Next-Gen Developer</span> 的完整进化路径。
              </p>
           </div>

           {/* Syllabus Tabbed Interface */}
           <div className="relative max-w-7xl mx-auto px-4 md:px-0">
              {/* Tab Navigation */}
              <div className="flex flex-col md:flex-row justify-center gap-4 mb-16">
                 {AI_SYLLABUS.map((phase, idx) => {
                    const isActive = activePhase === idx;
                    return (
                       <button
                          key={idx}
                          onClick={() => setActivePhase(idx)}
                          className={`relative group px-8 py-4 rounded-2xl transition-all duration-300 border ${
                             isActive 
                                ? 'bg-white border-primary-200 shadow-xl scale-105 z-10' 
                                : 'bg-white/50 border-transparent hover:bg-white hover:border-primary-100 hover:shadow-lg'
                          }`}
                       >
                          <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                isActive ? `bg-gradient-to-r ${phase.color} text-white` : 'bg-primary-100 text-primary-400 group-hover:bg-primary-200'
                             }`}>
                                <span className="font-black text-lg">{idx + 1}</span>
                             </div>
                             <div className="text-left">
                                <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${isActive ? 'text-primary-500' : 'text-primary-400'}`}>
                                   Phase {idx + 1}
                                </div>
                                <div className={`text-lg font-bold ${isActive ? 'text-primary-900' : 'text-primary-600'}`}>
                                   {phase.phase.split(': ')[1]}
                                </div>
                             </div>
                          </div>
                          {isActive && (
                             <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r ${phase.color} rounded-t-full`}></div>
                          )}
                       </button>
                    );
                 })}
              </div>

              {/* Active Phase Content */}
              <div className="relative min-h-[500px]">
                 {AI_SYLLABUS.map((phase, phaseIdx) => (
                    <div 
                       key={phaseIdx} 
                       className={`transition-all duration-500 absolute inset-0 ${
                          activePhase === phaseIdx 
                             ? 'opacity-100 translate-y-0 z-10 relative' 
                             : 'opacity-0 translate-y-8 z-0 absolute pointer-events-none'
                       }`}
                    >
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {phase.items.map((item, itemIdx) => {
                             const globalIdx = phaseIdx * 3 + itemIdx + 1;
                             
                             return (
                                <div key={itemIdx} className="group relative bg-white rounded-2xl p-6 border border-primary-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                                   {/* Top Decoration */}
                                   <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${phase.color} opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl`}></div>
                                   
                                   {/* Header */}
                                   <div className="flex items-start justify-between mb-6">
                                      <div className={`shrink-0 w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                         <div className={`${phase.color.split(' ')[0].replace('from-', 'text-')}`}>
                                            {item.icon}
                                         </div>
                                      </div>
                                      <div className="text-4xl font-black text-primary-100 select-none">
                                         {globalIdx.toString().padStart(2, '0')}
                                      </div>
                                   </div>

                                   {/* Title & Desc */}
                                   <div className="mb-6">
                                      <h4 className="text-xl font-bold text-primary-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary-900 group-hover:to-primary-700 transition-colors">
                                         {item.title}
                                      </h4>
                                      <p className="text-sm text-primary-500 leading-relaxed min-h-[40px]">
                                         {item.desc}
                                      </p>
                                   </div>

                                   {/* Submodules List */}
                                   <div className="space-y-3 flex-1">
                                      {item.submodules.map((module, mIdx) => (
                                         <div key={mIdx} className="bg-primary-50/50 rounded-lg p-3 border border-primary-100/50 group-hover:bg-white group-hover:border-primary-200 group-hover:shadow-sm transition-all">
                                            <div className="font-bold text-xs text-primary-800 mb-1 flex items-center gap-1.5">
                                               <span className={`w-1 h-1 rounded-full bg-gradient-to-r ${phase.color}`}></span>
                                               {module.name}
                                            </div>
                                            <div className="text-[11px] text-primary-500 leading-relaxed pl-2.5 border-l border-primary-200">
                                               {module.content}
                                            </div>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                             );
                          })}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* 1V1 Mentorship Section */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
              <span className="w-1.5 h-8 bg-accent-copper rounded-full"></span>
              1V1 深度陪跑
            </h2>
            <div className="px-3 py-1 bg-accent-copper/10 text-accent-copper rounded-full text-xs font-bold">
              亦师亦友
            </div>
          </div>

          <div className="bg-primary-900 rounded-[2.5rem] p-8 md:p-12 text-white relative shadow-2xl shadow-primary-900/20 group/container overflow-hidden isolate border border-primary-800">
             {/* Background effects */}
             <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none -z-10">
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-blue/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
               <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-500/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
             </div>

             <div className="relative z-10">
                <div className="flex flex-col gap-16">
                   {/* Top Section: Header & Value Prop */}
                   <div className="text-center max-w-4xl mx-auto">
                      <h3 className="text-3xl md:text-5xl font-black mb-8 leading-tight">
                        别一个人死磕了<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-copper">
                          找个“老司机”带带你
                        </span>
                      </h3>
                      <p className="text-primary-200 mb-10 leading-relaxed text-lg md:px-12">
                        不搞虚头巴脑的 PPT。一对一，手把手，帮你看看代码哪写得烂，简历哪吹得假，面试哪容易挂。像朋友一样聊聊技术，顺便把 Offer 拿了。
                      </p>
                      <button onClick={() => setShowQRCode(true)} className="bg-gradient-to-r from-accent-gold to-accent-copper hover:from-accent-copper hover:to-accent-gold text-primary-900 font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-accent-gold/20 transition-all transform hover:-translate-y-1 text-lg">
                        预约 1V1 咨询
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Mentor Team Section */}
        <div className="mb-24">
           <div className="text-center mb-16">
              <span className="inline-block py-1 px-3 rounded-full bg-accent-blue/10 text-accent-blue font-bold text-xs tracking-widest uppercase mb-4">Mentors</span>
              <h2 className="text-3xl md:text-5xl font-black text-primary-900 tracking-tight mb-6">
                一线大厂 <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-cyan-500">资深导师</span>
              </h2>
              <p className="text-xl text-primary-500 max-w-3xl mx-auto leading-relaxed">
                他们拥有丰富的实战经验与面试官视角，拒绝照本宣科，只教你在工作中真正用得上的硬核技术。
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "张真人",
                  role: "资深前端技术专家",
                  desc: "曾就职于阿里等一线互联网公司，主导过大型电商活动的前端架构设计。擅长性能优化与工程化体系建设。",
                  tags: ["架构设计", "性能优化", "工程化"],
                  avatar: "/img/0.png"
                },
                {
                  name: "袁老师",
                  role: "全栈开发工程师",
                  desc: "多年 Node.js 全栈开发经验，拥有丰富的服务端落地与微服务治理实践。热衷于开源社区与技术分享。",
                  tags: ["Node.js", "全栈开发", "面试指导"],
                  avatar: "/img/1.png"
                },
                {
                  name: "强哥",
                  role: "高级前端工程师",
                  desc: "专注于 React 生态与跨端开发方案。善于将复杂的技术原理抽丝剥茧，帮助学员建立清晰的知识体系。",
                  tags: ["React 源码", "跨端开发", "可视化"],
                  avatar: "/img/3.png"
                }
              ].map((mentor, i) => (
                <div key={i} className="group relative bg-white rounded-2xl p-6 border border-primary-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-100 to-primary-50 rounded-t-2xl group-hover:from-accent-blue group-hover:to-cyan-500 transition-colors"></div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                      <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary-900">{mentor.name}</h3>
                      <div className="text-xs font-bold text-accent-blue bg-accent-blue/10 px-2 py-1 rounded-md inline-block mt-1">
                        {mentor.role}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-primary-600 text-sm leading-relaxed mb-6 min-h-[60px]">
                    {mentor.desc}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {mentor.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-medium px-2 py-1 rounded-full bg-primary-50 text-primary-500 border border-primary-100">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Core Bootcamps Section - Bento Grid Style */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-primary-900 tracking-tight mb-2">
                核心特训营
              </h2>
              <p className="text-primary-500 text-lg">实战驱动，结果导向，拒绝纸上谈兵</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-copper/10 text-accent-copper rounded-full text-xs font-bold border border-accent-copper/20 animate-pulse">
              🔥 火热报名中
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Camp 1: Interview Crash Course */}
            <div className="group relative bg-white rounded-[2rem] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border border-primary-100 overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 group-hover:bg-accent-blue/20 transition-colors"></div>
              
              <div className="relative z-10 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-accent-blue text-white flex items-center justify-center mb-6 shadow-lg shadow-accent-blue/20 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-bold text-primary-900 mb-3 group-hover:text-accent-blue transition-colors">面试突击训练同学营</h3>
                <p className="text-primary-500 leading-relaxed mb-8">
                  针对大厂面试的高频考点与潜规则。从简历优化到模拟面试，我们不教你背题，教你如何像资深工程师一样思考与表达。
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { title: "简历优化", desc: "挖掘亮点，规避坑点", icon: <FileText className="w-5 h-5 text-accent-blue" /> },
                    { title: "模拟面试", desc: "1:1 还原真实场景", icon: <MessageCircle className="w-5 h-5 text-accent-blue" /> },
                    { title: "学习计划", desc: "拒绝盲目刷题", icon: <Calendar className="w-5 h-5 text-accent-blue" /> },
                    { title: "全程陪跑", desc: "亦师亦友，有问必答", icon: <Target className="w-5 h-5 text-accent-blue" /> }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-primary-50 group-hover:bg-accent-blue/5 transition-colors">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-accent-blue">{item.icon}</div>
                      <div>
                        <div className="font-bold text-primary-800 text-sm">{item.title}</div>
                        <div className="text-xs text-primary-400">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-auto pt-6 border-t border-primary-100">
                <button onClick={() => setShowQRCode(true)} className="w-full flex items-center justify-between group/btn">
                  <span className="font-bold text-primary-900 group-hover/btn:text-accent-blue transition-colors">查看课程大纲</span>
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center group-hover/btn:bg-accent-blue group-hover/btn:text-white transition-all">
                    <svg className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Camp 2: Frontend Breakthrough */}
            <div className="group relative bg-white rounded-[2rem] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border border-primary-100 overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-copper/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 group-hover:bg-accent-copper/20 transition-colors"></div>
              
              <div className="relative z-10 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-accent-copper text-white flex items-center justify-center mb-6 shadow-lg shadow-accent-copper/20 group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-bold text-primary-900 mb-3 group-hover:text-accent-copper transition-colors">前端破壁同学营</h3>
                <p className="text-primary-500 leading-relaxed mb-8">
                  告别“只会写业务”，从零编写你的脚手架，亲手搭建 Next.js 全栈应用，并配置 CI/CD、监控与域名，完成一次对“开发-部署-运维”全链路的彻底掌控。
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { title: "自研脚手架", desc: "从零打造 CLI 工具", icon: <Code2 className="w-5 h-5 text-accent-copper" /> },
                    { title: "Next.js 全栈", desc: "独立开发完整应用", icon: <Layers className="w-5 h-5 text-accent-copper" /> },
                    { title: "CI/CD & 运维", desc: "自动化部署与监控", icon: <Shield className="w-5 h-5 text-accent-copper" /> }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-primary-50 group-hover:bg-accent-copper/5 transition-colors">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-accent-copper">{item.icon}</div>
                      <div>
                        <div className="font-bold text-primary-800 text-sm">{item.title}</div>
                        <div className="text-xs text-primary-400">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-auto pt-6 border-t border-primary-100">
                <button onClick={() => setShowQRCode(true)} className="w-full flex items-center justify-between group/btn">
                  <span className="font-bold text-primary-900 group-hover/btn:text-accent-copper transition-colors">查看课程大纲</span>
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center group-hover/btn:bg-accent-copper group-hover/btn:text-white transition-all">
                    <svg className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-primary-100 py-12 mt-auto shrink-0">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-primary-400 font-medium mb-4">大前端同学营 · 陪伴你的每一次技术成长</p>
          <p className="text-primary-300 text-sm">© 2025 Big Frontend Camp. All rights reserved.</p>
        </div>
      </footer>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-primary-900/80 backdrop-blur-sm"
            onClick={() => setShowQRCode(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-modal-in transform transition-all">
            <button 
              onClick={() => setShowQRCode(false)}
              className="absolute top-4 right-4 text-primary-400 hover:text-primary-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-primary-900 mb-2">扫码加入交流群</h3>
              <p className="text-primary-500 text-sm mb-6">与 10000+ 小伙伴一起成长</p>
              
              <div className="w-48 h-48 mx-auto bg-white rounded-xl mb-6 flex items-center justify-center border-2 border-dashed border-primary-200 overflow-hidden relative group">
                {/* Real QR Code with Fallback */}
                {!qrError ? (
                  <img 
                    src="/temp/group_qr.jpg" 
                    alt="大前端同学营交流群二维码" 
                    onError={() => setQrError(true)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-primary-50 text-primary-400 p-4 text-center">
                    <div className="w-8 h-8 mb-2 rounded-full bg-primary-100 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium">图片未找到</span>
                    <span className="text-[10px] mt-1 opacity-70 break-all">public/temp/group_qr.jpg</span>
                  </div>
                )}
              </div>
              
              <div className="bg-primary-50 rounded-lg p-3 text-xs text-primary-700">
                <p>💡 进群暗号：<span className="font-bold">大前端</span></p>
                {/* <p>如二维码失效，请联系管理员：admin_helper</p> */}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Floating Action Buttons Container */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3 items-center">
        {/* Back to Top Button - Typographic Style */}
        <button
          onClick={scrollToTop}
          className={`flex items-center justify-center w-14 h-14 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
            showScrollTop 
              ? 'translate-y-0 opacity-100 scale-100' 
              : 'translate-y-10 opacity-0 scale-75 pointer-events-none'
          } bg-white text-primary-900 border border-primary-100 hover:bg-primary-50 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] hover:scale-110 hover:-translate-y-1 group overflow-hidden`}
          aria-label="Back to top"
        >
          <span className="relative z-10 font-black text-xs tracking-widest group-hover:tracking-[0.25em] transition-all duration-300">
            TOP
          </span>
        </button>

        {/* Join Group Button - Premium Style */}
        <button
          onClick={() => setShowQRCode(true)}
          className="flex items-center justify-center w-14 h-14 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] bg-primary-900 text-accent-gold border border-white/10 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] hover:scale-110 hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative"
          aria-label="Join Group"
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
          
          <MessageCircle className="w-7 h-7 relative z-10 group-hover:rotate-12 transition-transform duration-300" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default StudentCamp;
