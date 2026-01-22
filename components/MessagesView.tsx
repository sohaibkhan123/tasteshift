
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, Search, User as UserIcon, ChefHat, Loader2, ArrowLeft, MessageSquare } from 'lucide-react';
import { User, Message } from '../types';
import { apiService } from '../services/apiService';

interface MessagesViewProps {
  currentUser: User;
  users: User[];
  initialTargetUser?: User | null;
}

const MessagesView: React.FC<MessagesViewProps> = ({ currentUser, users, initialTargetUser }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(initialTargetUser || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter users to those we follow or are followed by (or anyone we select)
  const conversationUsers = useMemo(() => {
    return users.filter(u => u.id !== currentUser.id);
  }, [users, currentUser.id]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Polling for messages
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!selectedUser) return;
    try {
      const msgs = await apiService.getMessages(currentUser.id, selectedUser.id);
      setMessages(msgs);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const newMsg = await apiService.sendMessage(currentUser.id, selectedUser.id, text);
      setMessages(prev => [...prev, newMsg]);
    } catch (err) {
      console.error("Error sending message", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-240px)] sm:h-[calc(100vh-180px)] lg:h-[calc(100vh-140px)] xl:h-[calc(100vh-100px)] bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in duration-500 mb-20 lg:mb-0">
      {/* Sidebar - Contacts */}
      <div className={`w-full sm:w-72 lg:w-80 border-r dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-900 ${selectedUser ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 sm:p-6 border-b dark:border-gray-800 bg-white dark:bg-gray-900">
          <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-[14px] h-[14px] sm:w-4 sm:h-4" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-9 sm:pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg sm:rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-orange/10 dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {conversationUsers.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 sm:p-4 flex items-center gap-2 sm:gap-3 transition-colors min-h-[60px] sm:min-h-[68px] ${selectedUser?.id === user.id ? 'bg-brand-orange/10 border-r-4 border-brand-orange dark:bg-brand-orange/20' : 'hover:bg-white dark:hover:bg-gray-800 border-r-4 border-transparent'}`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm shrink-0">
                <img src={user.avatar} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-bold text-gray-900 dark:text-white truncate text-xs sm:text-sm">{user.name}</p>
                <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider truncate">{user.handle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900 ${!selectedUser ? 'hidden lg:flex' : 'flex'}`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-2 sm:gap-3">
                <button onClick={() => setSelectedUser(null)} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full lg:hidden text-gray-600 dark:text-white min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <ArrowLeft className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                </button>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700">
                  <img src={selectedUser.avatar} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <p className="font-black text-gray-900 dark:text-white leading-none text-xs sm:text-sm">{selectedUser.name}</p>
                  <p className="text-[9px] sm:text-[10px] text-brand-orange font-bold uppercase tracking-tighter mt-1">Active Now</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 bg-gray-50/30 dark:bg-gray-900 no-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 gap-3 sm:gap-4 opacity-50">
                  <ChefHat className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={1} />
                  <div>
                    <p className="font-black text-xs sm:text-sm uppercase tracking-widest">Start the Conversation</p>
                    <p className="text-[10px] sm:text-xs mt-1">Say hi to @{selectedUser.handle.replace('@','')}</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                      <div className={`max-w-[85%] sm:max-w-[75%] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium ${
                        isMe 
                        ? 'bg-brand-orange text-white rounded-tr-none shadow-lg shadow-orange-100' 
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 pb-safe">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all dark:text-white"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="bg-brand-orange text-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-orange-600 disabled:opacity-50 transition-all active:scale-90 shadow-lg shadow-orange-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  {isSending ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6 opacity-30">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Your Inbox</h3>
                <p className="text-gray-500 max-w-xs mt-2 font-medium">Select a chef from the left sidebar to start messaging and sharing recipes!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;
