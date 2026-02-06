import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/request';

interface Note {
  id: string;
  content: string;
  updatedAt: string;
}

interface NotePadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotePadModal({ isOpen, onClose }: NotePadModalProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dragging state refs (no re-renders for smooth drag)
  const modalRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  // Resizing state refs
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // Initialize position on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Position at bottom-right with min size initially
      const initialWidth = 600;
      const initialHeight = 400;
      const margin = 24; // 24px margin
      const initialX = typeof window !== 'undefined' ? (window.innerWidth - initialWidth - margin) : 100;
      const initialY = typeof window !== 'undefined' ? (window.innerHeight - initialHeight - margin) : 100;
      
      modalRef.current.style.left = `${Math.max(0, initialX)}px`;
      modalRef.current.style.top = `${Math.max(0, initialY)}px`;
      modalRef.current.style.width = `${initialWidth}px`;
      modalRef.current.style.height = `${initialHeight}px`;
      
      fetchNotes();
    }
  }, [isOpen]);

  // Handle global mouse move/up for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Handle Dragging
      if (dragStartRef.current && modalRef.current) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        
        modalRef.current.style.left = `${dragStartRef.current.left + dx}px`;
        modalRef.current.style.top = `${dragStartRef.current.top + dy}px`;
        return;
      }

      // Handle Resizing
      if (resizeStartRef.current && modalRef.current) {
        const dx = e.clientX - resizeStartRef.current.x;
        const dy = e.clientY - resizeStartRef.current.y;
        
        const newWidth = Math.max(600, resizeStartRef.current.width + dx); // Min width 600
        const newHeight = Math.max(400, resizeStartRef.current.height + dy); // Min height 400
        
        modalRef.current.style.width = `${newWidth}px`;
        modalRef.current.style.height = `${newHeight}px`;
      }
    };
    
    const handleMouseUp = () => {
      dragStartRef.current = null;
      resizeStartRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the header area
    // Prevent dragging if clicking on buttons or interactive elements
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('textarea')) {
      return;
    }
    
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        left: rect.left,
        top: rect.top
      };
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height
      };
      document.body.style.cursor = 'nwse-resize';
      document.body.style.userSelect = 'none';
    }
  };

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Note[]>('/notes');
      setNotes(data);
      if (data.length > 0) {
        // Select first note by default if none selected
        if (!activeNoteId) {
          setActiveNoteId(data[0].id);
          setContent(data[0].content);
        }
      } else {
        // Create a default note if empty
        createNote();
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async () => {
    try {
      const newNote = await api.post<Note>('/notes', { content: '' });
      setNotes(prev => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
      setContent('');
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const deleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('确定要删除这页笔记吗？')) return;
    
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(n => n.id !== id));
      if (activeNoteId === id) {
        const remaining = notes.filter(n => n.id !== id);
        if (remaining.length > 0) {
          setActiveNoteId(remaining[0].id);
          setContent(remaining[0].content);
        } else {
          setActiveNoteId(null);
          setContent('');
          createNote(); // Create new if all deleted
        }
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
  };

  const saveNote = async (id: string | null, text: string) => {
    if (!id) return;
    setIsSaving(true);
    try {
      await api.patch(`/notes/${id}`, { content: text });
      setNotes(prev => prev.map(n => n.id === id ? { ...n, content: text, updatedAt: new Date().toISOString() } : n));
      setIsSaving(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save note:', error);
      setIsSaving(false);
    }
  };

  // Switch note
  const handleNoteSelect = (note: Note) => {
    // Save current before switching if needed? 
    // Actually handleContentChange already schedules save. 
    // Ideally we should flush save immediately.
    if (saveTimeoutRef.current && activeNoteId) {
      clearTimeout(saveTimeoutRef.current);
      saveNote(activeNoteId, content);
    }
    
    setActiveNoteId(note.id);
    setContent(note.content);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed z-[100] bg-[#fdfbf7] rounded-xl shadow-2xl flex overflow-hidden border border-[#e0e0e0] animate-in fade-in duration-200"
      style={{ 
        // Initial styles will be set by useEffect
        visibility: 'visible'
      }}
    >
      
      {/* Drag Handle Overlay - Centered Top */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-6 z-50 cursor-grab active:cursor-grabbing hover:bg-black/5 transition-colors rounded-b-lg flex justify-center items-center"
        onMouseDown={handleMouseDown}
        title="按住拖动"
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full opacity-50"></div>
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 z-20 p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      {/* Sidebar - Note List */}
      {isSidebarOpen && (
        <div className="w-48 bg-[#f0f0f0] border-r border-[#e0e0e0] flex flex-col">
          <div className="p-4 border-b border-[#e0e0e0] flex items-center justify-between bg-[#eaeaea]">
            <h3 className="font-bold text-gray-700 text-sm">笔记本</h3>
            <button 
              onClick={createNote}
              className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
              title="新建页面"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoading && notes.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">加载中...</div>
            ) : (
              notes.map(note => (
                <div 
                  key={note.id}
                  onClick={() => handleNoteSelect(note)}
                  className={`group p-3 rounded-lg cursor-pointer transition-all border ${
                    activeNoteId === note.id 
                      ? 'bg-white border-primary-200 shadow-sm' 
                      : 'hover:bg-white border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-medium text-gray-700 line-clamp-1 mb-1">
                      {note.content.trim().split('\n')[0] || '无标题笔记'}
                    </div>
                    <button 
                      onClick={(e) => deleteNote(e, note.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-0.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(note.updatedAt).toLocaleDateString()} {new Date(note.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col bg-[#fdfbf7] relative">
        {/* Toolbar / Status */}
        <div className="h-12 border-b border-[#f0f0f0] flex items-center justify-between px-6 bg-white/50">
           <div className="text-xs text-gray-400 flex items-center gap-2">
             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-1.5 border border-gray-200 rounded-md text-gray-500 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm ${isSidebarOpen ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-white'}`}
                title={isSidebarOpen ? "隐藏侧边栏" : "显示侧边栏"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
             </button>
             <div className="h-4 w-px bg-gray-200 mx-1"></div>
             <button 
                  onClick={() => saveNote(activeNoteId, content)}
                  className="px-3 py-1 bg-white border border-gray-200 rounded-md text-gray-600 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  保存
                </button>
                <div className="h-4 w-px bg-gray-200 mx-1"></div>
                {isSaving ? (
                  <span className="flex items-center gap-1 text-primary-500">
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    保存中...
                  </span>
                ) : lastSaved ? (
                  <span>已保存 {lastSaved.toLocaleTimeString()}</span>
                ) : (
                  <span>准备就绪</span>
                )}
             </div>
             <div className="text-xs text-gray-400 flex items-center gap-1 mr-8">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                 <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
               </svg>
               内容已加密
             </div>
          </div>

          {/* Paper Style Editor */}
          <div className="flex-1 overflow-hidden relative">
             <textarea
                spellCheck={false}
                value={content}
                onChange={handleContentChange}
                placeholder="开始写作..."
                className="w-full h-full px-8 py-0 resize-none outline-none bg-transparent text-gray-800 text-lg leading-[2rem] font-serif custom-scrollbar"
                style={{
                  backgroundImage: 'linear-gradient(transparent 96%, #e5e5e5 96%)',
                  backgroundSize: '100% 2rem', // Line height 2rem (32px) matching leading-loose
                  backgroundAttachment: 'local',
                  marginTop: '0.1rem' // Slight offset to align text baseline with line
                }}
             />
          </div>
        </div>

      {/* Resize Handle */}
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-20 hover:bg-black/5"
        onMouseDown={handleResizeMouseDown}
        title="调整大小"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 absolute bottom-0.5 right-0.5 pointer-events-none">
          <polyline points="22 17 17 22"></polyline>
          <polyline points="22 12 12 22"></polyline>
        </svg>
      </div>

    </div>
  );
}
