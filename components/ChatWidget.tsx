
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, ChevronLeft, Check, CheckCheck, Loader2 } from 'lucide-react';
import { User, Message } from '../types';
import { apiService } from '../services/apiService';

interface ChatWidgetProps {
    currentUser: User;
    allUsers: User[];
    unreadMessages: Message[];
    onMessageSent: () => void;
    onReadMessages: (senderId: string) => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ currentUser, allUsers, unreadMessages, onMessageSent, onReadMessages }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeUser, setActiveUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Filter users to show in the list (anyone who has messaged us OR people we follow)
    const sortedUsers = React.useMemo(() => {
        const otherUsers = allUsers.filter(u => u.id !== currentUser.id);
        return otherUsers.sort((a, b) => {
            const unreadA = unreadMessages.filter(m => m.senderId === a.id).length;
            const unreadB = unreadMessages.filter(m => m.senderId === b.id).length;
            // Secondary sort: alphabetical
            if (unreadB === unreadA) return a.name.localeCompare(b.name);
            return unreadB - unreadA;
        });
    }, [allUsers, unreadMessages, currentUser.id]);

    useEffect(() => {
        if (isOpen && activeUser) {
            fetchChatHistory(activeUser.id);
            const interval = setInterval(() => fetchChatHistory(activeUser.id), 3000);
            return () => clearInterval(interval);
        }
    }, [isOpen, activeUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchChatHistory = async (otherUserId: string) => {
        try {
            const history = await apiService.getMessages(currentUser.id, otherUserId);
            setMessages(history);

            // If we are looking at this chat, and there are unread messages from them, mark as read
            const hasUnread = history.some(m => m.senderId === otherUserId && !m.read);
            if (hasUnread) {
                await apiService.markMessagesAsRead(otherUserId, currentUser.id);
                onReadMessages(otherUserId);
            }
        } catch (e) {
            console.error("Failed to load chat history", e);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeUser) return;

        const text = inputText.trim();
        setInputText('');

        try {
            const newMsg = await apiService.sendMessage(currentUser.id, activeUser.id, text);
            setMessages(prev => [...prev, newMsg]);
            onMessageSent();
        } catch (e) {
            console.error("Failed to send message", e);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const totalUnreadCount = unreadMessages.length;

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-brand-orange text-white rounded-full shadow-2xl hover:bg-orange-600 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center group"
            >
                <MessageSquare size={24} className="group-hover:animate-bounce" />

                {/* Notification Badge */}
                {totalUnreadCount > 0 && (
                    <div
                        key={totalUnreadCount} // Key change triggers animation
                        className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300 shadow-md"
                    >
                        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                    </div>
                )}
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-[100] w-80 md:w-96 h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="bg-brand-orange text-white p-4 flex items-center justify-between shrink-0">
                {activeUser ? (
                    <div className="flex items-center gap-2">
                        <button onClick={() => setActiveUser(null)} className="hover:bg-white/20 p-1 rounded-full"><ChevronLeft size={20} /></button>
                        <img src={activeUser.avatar} className="w-8 h-8 rounded-full border-2 border-white/50" alt="" />
                        <span className="font-bold text-sm truncate max-w-[150px]">{activeUser.name}</span>
                    </div>
                ) : (
                    <h3 className="font-bold text-lg flex items-center gap-2"><MessageSquare size={20} /> Messages</h3>
                )}
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={20} /></button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 relative">
                {activeUser ? (
                    // Chat Interface
                    <div className="flex flex-col min-h-full p-4">
                        <div className="flex-1 space-y-3">
                            {messages.map((msg) => {
                                const isMe = msg.senderId === currentUser.id;
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${isMe ? 'bg-brand-orange text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm'}`}>
                                            {msg.text}
                                        </div>
                                        {/* Read Receipt */}
                                        {isMe && (
                                            <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 mr-1">
                                                {msg.read ? <span className="text-brand-orange font-bold">Read</span> : "Sent"}
                                                {msg.read ? <CheckCheck size={12} className="text-brand-orange" /> : <Check size={12} />}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                ) : (
                    // User List Interface
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {sortedUsers.map(user => {
                            const userUnreadCount = unreadMessages.filter(m => m.senderId === user.id).length;
                            return (
                                <div
                                    key={user.id}
                                    onClick={() => setActiveUser(user)}
                                    className="p-4 flex items-center gap-3 hover:bg-white dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                >
                                    <div className="relative">
                                        <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="" />
                                        {userUnreadCount > 0 && (
                                            <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                                {userUnreadCount}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                                        <p className="text-xs text-gray-400 truncate">@{user.handle.replace('@', '')}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        {userUnreadCount > 0 && <span className="w-2 h-2 bg-brand-orange rounded-full mb-1"></span>}
                                        <ChevronLeft size={16} className="text-gray-300 rotate-180" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer Input */}
            {activeUser && (
                <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-brand-orange/20 outline-none"
                    />
                    <button type="submit" disabled={!inputText.trim()} className="bg-brand-orange text-white p-2 rounded-full hover:bg-orange-600 disabled:opacity-50 transition-colors">
                        <Send size={18} />
                    </button>
                </form>
            )}
        </div>
    );
};

export default ChatWidget;
