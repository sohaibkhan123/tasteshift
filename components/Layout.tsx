
import React, { useState } from 'react';
import { Home, Search, PlusSquare, UserCircle, Bot, Settings, Bell, Menu, X, BookOpen, Users, MessageCircle } from 'lucide-react';
import { ViewState, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  currentUser: User;
  unreadCount?: number;
  messageCount?: number; // Added message count prop
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, currentUser, unreadCount = 0, messageCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavItem = ({ view, icon: Icon, label, badge }: { view: ViewState, icon: any, label: string, badge?: number }) => (
    <button
      onClick={() => {
        setView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full relative ${currentView === view || (view === ViewState.PROFILE && currentView === ViewState.EDIT_PROFILE)
          ? `bg-brand-orange/10 text-brand-orange font-bold shadow-sm dark:bg-brand-orange/20`
          : 'text-gray-600 hover:bg-gray-50 hover:text-brand-dark dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
        }`}
    >
      <div className="relative">
        <Icon size={24} strokeWidth={currentView === view ? 2.5 : 2} />
        {/* Badge on Icon for specific items if collapsed/mobile logic required, but mostly using label badge below */}
      </div>
      <span className="text-sm md:text-base flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-brand-orange text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center shadow-sm">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex flex-col md:flex-row transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 h-screen sticky top-0 z-50 transition-colors">
        <div className="p-6">
          <h1 className="text-2xl font-black text-brand-orange tracking-tight">Taste Shift</h1>
          <p className="text-xs text-gray-400 mt-1">The Culinary Social Network</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
          <NavItem view={ViewState.FEED} icon={Home} label="Home" />
          <NavItem view={ViewState.ALL_RECIPES} icon={BookOpen} label="All Recipes" />
          <NavItem view={ViewState.EXPLORE} icon={Search} label="Explore" />
          <NavItem view={ViewState.AI_CHEF} icon={Bot} label="Chef AI" />
          <NavItem view={ViewState.MEMBERS} icon={Users} label="Members" />
          <NavItem view={ViewState.MESSAGES} icon={MessageCircle} label="Messages" badge={messageCount} />
          <NavItem view={ViewState.CREATE} icon={PlusSquare} label="Create Post" />
          <NavItem view={ViewState.NOTIFICATIONS} icon={Bell} label="Notifications" badge={unreadCount} />
          <NavItem view={ViewState.PROFILE} icon={UserCircle} label="Profile" />
          <NavItem view={ViewState.SETTINGS} icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t dark:border-gray-800">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => setView(ViewState.PROFILE)}>
            <img src={currentUser.avatar} alt="Me" className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-700" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-gray-900 dark:text-white">{currentUser.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.handle}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-50 px-4 py-3 flex items-center justify-between transition-colors">
        <h1 className="text-xl font-black text-brand-orange">Taste Shift</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(ViewState.MESSAGES)} className="p-2 text-gray-600 dark:text-gray-300 relative">
            <MessageCircle size={22} />
            {messageCount > 0 && (
              <span className="absolute top-1 right-1 bg-brand-orange text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold border border-white dark:border-gray-900">
                {messageCount}
              </span>
            )}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-800 dark:text-white relative">
            {isMobileMenuOpen ? <X size={24} /> : (
              <>
                <Menu size={24} />
                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
              </>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white dark:bg-gray-900 pt-16 px-4 space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <NavItem view={ViewState.FEED} icon={Home} label="Home" />
          <NavItem view={ViewState.ALL_RECIPES} icon={BookOpen} label="All Recipes" />
          <NavItem view={ViewState.EXPLORE} icon={Search} label="Explore" />
          <NavItem view={ViewState.AI_CHEF} icon={Bot} label="Chef AI" />
          <NavItem view={ViewState.MEMBERS} icon={Users} label="Members" />
          <NavItem view={ViewState.MESSAGES} icon={MessageCircle} label="Messages" badge={messageCount} />
          <NavItem view={ViewState.CREATE} icon={PlusSquare} label="Create Post" />
          <NavItem view={ViewState.NOTIFICATIONS} icon={Bell} label="Notifications" badge={unreadCount} />
          <NavItem view={ViewState.PROFILE} icon={UserCircle} label="Profile" />
          <NavItem view={ViewState.SETTINGS} icon={Settings} label="Settings" />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto md:p-6 overflow-y-auto min-h-screen">
        {children}
      </main>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t dark:border-gray-800 px-4 py-2 flex justify-between items-center z-50 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.02)] transition-colors">
        <button onClick={() => setView(ViewState.FEED)} className={`p-2 relative ${currentView === ViewState.FEED ? 'text-brand-orange' : 'text-gray-400 dark:text-gray-500'}`}>
          <Home size={24} strokeWidth={currentView === ViewState.FEED ? 2.5 : 2} />
        </button>
        <button onClick={() => setView(ViewState.EXPLORE)} className={`p-2 relative ${currentView === ViewState.EXPLORE ? 'text-brand-orange' : 'text-gray-400 dark:text-gray-500'}`}>
          <Search size={24} strokeWidth={currentView === ViewState.EXPLORE ? 2.5 : 2} />
        </button>
        <button onClick={() => setView(ViewState.CREATE)} className="p-3 bg-brand-orange text-white rounded-full -mt-8 shadow-xl border-4 border-gray-50 dark:border-[#121212] transform active:scale-90 transition-transform">
          <PlusSquare size={24} />
        </button>
        <button onClick={() => setView(ViewState.MEMBERS)} className={`p-2 relative ${currentView === ViewState.MEMBERS ? 'text-brand-orange' : 'text-gray-400 dark:text-gray-500'}`}>
          <Users size={24} strokeWidth={currentView === ViewState.MEMBERS ? 2.5 : 2} />
        </button>
        <button onClick={() => setView(ViewState.PROFILE)} className={`p-2 relative ${currentView === ViewState.PROFILE ? 'text-brand-orange' : 'text-gray-400 dark:text-gray-500'}`}>
          <UserCircle size={24} strokeWidth={currentView === ViewState.PROFILE ? 2.5 : 2} />
        </button>
      </div>
    </div>
  );
};

export default Layout;
