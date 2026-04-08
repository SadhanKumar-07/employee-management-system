import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { projectApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Send, Loader2, FileText } from 'lucide-react';
import type { ChatMessage } from '@/types';
import { format } from 'date-fns';

export const ChatBox = ({ projectId, channel }: { projectId: string; channel: 'management' | 'team' }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const data = await projectApi.getChatMessages(projectId, channel);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [projectId, channel]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !file) return;
    setLoading(true);
    const fd = new FormData();
    // Defaulting to user's info
    fd.append('sender_id', user?.employee_id || 'U000');
    fd.append('sender_name', user?.username || 'Unknown User');
    fd.append('content', content);
    if (file) fd.append('file', file);

    try {
      const newMsg = await projectApi.sendChatMessage(projectId, channel, fd);
      setMessages(prev => [...prev, newMsg]);
      setContent('');
      setFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border bg-background/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm">
      <div className="bg-muted/30 p-3 border-b">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {channel === 'management' ? 'Management Chat' : 'Team Chat'}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map(msg => {
          const isMe = msg.sender_id === user?.employee_id;
          return (
            <div key={msg.message_id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="text-xs text-muted-foreground mb-1.5 flex items-center gap-2">
                <span className="font-medium text-foreground/80">{msg.sender_name}</span>
                <span className="opacity-70">{format(new Date(msg.timestamp), 'HH:mm')}</span>
              </div>
              <div 
                className={`px-4 py-2.5 rounded-2xl max-w-[85%] sm:max-w-[75%] shadow-sm ${
                  isMe 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-card text-card-foreground border rounded-tl-sm'
                }`}
              >
                {msg.content && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                {msg.file_url && (
                  <a 
                    href={`http://localhost:8000${msg.file_url}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className={`flex items-center gap-2 mt-2 p-2.5 rounded-xl text-sm transition-colors ${
                      isMe ? 'bg-black/10 hover:bg-black/20 text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    <FileText size={16} className="shrink-0" />
                    <span className="truncate max-w-[200px]">{msg.file_name}</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>
      <form onSubmit={handleSend} className="p-3 bg-card border-t flex items-end gap-2">
        <Input 
          type="file" 
          id={`file-upload-${channel}`} 
          className="hidden" 
          onChange={e => e.target.files && setFile(e.target.files[0])}
        />
        <label 
          htmlFor={`file-upload-${channel}`} 
          className={`shrink-0 h-10 w-10 flex items-center justify-center rounded-full cursor-pointer transition-all ${
            file ? 'bg-primary/20 text-primary ring-2 ring-primary/30' : 'hover:bg-muted text-muted-foreground'
          }`}
          title={file ? file.name : "Attach file"}
        >
          <Paperclip size={20} />
        </label>
        <div className="flex-1 relative">
          <Input 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            placeholder="Type a message..." 
            className="w-full bg-muted/50 border-muted-foreground/20 focus-visible:ring-1 pr-10"
            autoComplete="off"
          />
        </div>
        <Button 
          type="submit" 
          size="icon" 
          className="shrink-0 h-10 w-10 rounded-full shadow-sm"
          disabled={loading || (!content.trim() && !file)}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
        </Button>
      </form>
    </div>
  );
};
