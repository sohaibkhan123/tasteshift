
import React, { useState, useRef, useEffect } from 'react';
import { ChefHat, Send, Loader2, Sparkles, User, Bot, Copy, Check, Info } from 'lucide-react';
import { getRecipeChatResponse } from '../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const AIChef: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Bon Appétit! I'm your AI Chef. I can help you with detailed recipes, ingredient swaps, and professional cooking techniques. What are we cooking today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    setInputText('');
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await getRecipeChatResponse(userText, history);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-6 border-b bg-white/50 backdrop-blur-md flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 rotate-3">
            <ChefHat size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Chef AI Assistant</h2>
            <div className="flex items-center gap-1.5">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Active • Gemini 3 Flash</p>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                <Info size={14} /> Voice Assistant Ready
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/30 no-scrollbar">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-md transition-transform hover:scale-110 ${msg.role === 'user' ? 'bg-white border-gray-100' : 'bg-brand-orange border-orange-600'}`}>
              {msg.role === 'user' ? <User size={18} className="text-gray-600" /> : <Bot size={18} className="text-white" />}
            </div>
            
            <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`group relative p-5 rounded-[2rem] shadow-sm text-sm leading-relaxed whitespace-pre-wrap transition-all hover:shadow-md ${
                  msg.role === 'user' 
                    ? 'bg-gray-900 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-white/50 rounded-tl-none'
                }`}
              >
                {msg.text}
                
                {msg.role === 'model' && (
                    <button 
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="absolute -right-12 top-0 p-2 text-gray-400 hover:text-brand-orange opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy text"
                    >
                        {copiedId === msg.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-2 font-black uppercase tracking-widest px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
           <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-orange flex items-center justify-center shrink-0 shadow-lg animate-pulse">
                 <Bot size={18} className="text-white" />
              </div>
              <div className="bg-white px-6 py-4 rounded-[2rem] rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-3">
                 <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                 </div>
                 <span className="text-xs text-gray-500 font-black uppercase tracking-widest">Chef is thinking...</span>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/50 backdrop-blur-md border-t">
        <form onSubmit={handleSendMessage} className="relative flex items-center gap-3 max-w-4xl mx-auto">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask for a recipe or cooking advice..." 
            className="w-full bg-white border border-gray-100 rounded-3xl pl-6 pr-16 py-5 focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all placeholder:text-gray-400 text-sm font-medium shadow-inner"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 p-3.5 bg-brand-orange text-white rounded-2xl shadow-xl shadow-orange-100 hover:bg-orange-600 disabled:opacity-50 transition-all active:scale-90"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
          </button>
        </form>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
           {["Vegan Pasta Ideas", "High Protein Breakfast", "Best way to sear steak"].map(hint => (
               <button 
                    key={hint}
                    onClick={() => setInputText(hint)} 
                    className="text-[10px] bg-white hover:bg-brand-orange hover:text-white px-4 py-2 rounded-full text-gray-500 font-black uppercase tracking-widest border border-gray-100 transition shadow-sm"
                >
                    {hint}
                </button>
           ))}
        </div>
      </div>
    </div>
  );
};

export default AIChef;
