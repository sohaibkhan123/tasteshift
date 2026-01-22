
import React, { useState, useEffect } from 'react';
import { 
  User, Bell, Moon, LogOut, ChevronRight, Smartphone, Mail, Trash2, Heart, Lock, Globe, Shield 
} from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsViewProps {
  currentUser: UserType;
  onLogout: () => void;
  onEditProfile: () => void;
}

const CULINARY_INTERESTS = [
  "Italian", "Mexican", "Vegan", "Baking", "Asian Fusion", 
  "Healthy", "Quick Meals", "Desserts", "Seafood", "Steakhouse"
];

const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500">
    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 ml-2">{title}</h3>
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700 transition-colors">
      {children}
    </div>
  </div>
);

const Row = ({ 
  icon: Icon, 
  label, 
  subLabel, 
  action, 
  isDestructive = false,
  onClick 
}: { 
  icon: any, 
  label: string, 
  subLabel?: string, 
  action?: React.ReactNode, 
  isDestructive?: boolean,
  onClick?: () => void
}) => (
  <div 
    onClick={onClick}
    className={`p-4 flex items-center justify-between border-b border-gray-50 last:border-none transition-colors dark:border-gray-700 ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDestructive ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-brand-orange/10 text-brand-orange dark:bg-brand-orange/20'}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className={`font-bold text-sm ${isDestructive ? 'text-red-500' : 'text-gray-900 dark:text-gray-200'}`}>{label}</p>
        {subLabel && <p className="text-xs text-gray-400 font-medium">{subLabel}</p>}
      </div>
    </div>
    <div>
      {action || (onClick && <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />)}
    </div>
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onChange(); }}
    className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-gray-600'}`}
  >
    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const SettingsView: React.FC<SettingsViewProps> = ({ currentUser, onLogout, onEditProfile }) => {
  // Initialize state from localStorage or defaults
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ts_darkMode') === 'true');
  const [notifications, setNotifications] = useState(() => localStorage.getItem('ts_notifications') !== 'false');
  const [autoplay, setAutoplay] = useState(() => localStorage.getItem('ts_autoplay') !== 'false');
  const [isPrivate, setIsPrivate] = useState(() => localStorage.getItem('ts_private') === 'true');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(() => {
    const saved = localStorage.getItem('ts_interests');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist Dark Mode setting
  useEffect(() => {
    localStorage.setItem('ts_darkMode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist other settings
  useEffect(() => { localStorage.setItem('ts_notifications', String(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('ts_autoplay', String(autoplay)); }, [autoplay]);
  useEffect(() => { localStorage.setItem('ts_private', String(isPrivate)); }, [isPrivate]);
  useEffect(() => { localStorage.setItem('ts_interests', JSON.stringify(selectedInterests)); }, [selectedInterests]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 font-medium dark:text-gray-400">Manage your account and preferences.</p>
      </div>

      <Section title="Account">
        <div className="p-6 flex items-center gap-4 border-b border-gray-50 bg-gradient-to-r from-orange-50/50 to-transparent dark:border-gray-700 dark:from-gray-800 dark:to-transparent">
          <img src={currentUser.avatar} alt={currentUser.name} className="w-16 h-16 rounded-full border-4 border-white shadow-sm dark:border-gray-600" />
          <div className="flex-1">
            <h4 className="font-black text-lg text-gray-900 dark:text-white">{currentUser.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email || 'No email connected'}</p>
          </div>
          <button onClick={onEditProfile} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold shadow-sm hover:bg-gray-50 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
            Edit
          </button>
        </div>
        <Row 
          icon={Mail} 
          label="Email Notifications" 
          subLabel="Receive weekly digests"
          action={<Toggle checked={notifications} onChange={() => setNotifications(!notifications)} />}
        />
        <Row 
          icon={isPrivate ? Lock : Globe} 
          label="Private Account" 
          subLabel={isPrivate ? "Only followers can see your recipes" : "Anyone can see your recipes"}
          action={<Toggle checked={isPrivate} onChange={() => setIsPrivate(!isPrivate)} />}
        />
      </Section>

      <Section title="My Interests">
        <div className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select the cuisines and topics you love. We'll customize your feed.</p>
          <div className="flex flex-wrap gap-2">
            {CULINARY_INTERESTS.map(interest => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                  selectedInterests.includes(interest)
                    ? 'bg-brand-orange text-white border-brand-orange shadow-md shadow-orange-100'
                    : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="App Experience">
        <Row 
          icon={Moon} 
          label="Dark Mode" 
          subLabel="Easy on the eyes"
          action={<Toggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
        />
        <Row 
          icon={Smartphone} 
          label="Autoplay Videos" 
          subLabel="Play videos automatically on Wi-Fi"
          action={<Toggle checked={autoplay} onChange={() => setAutoplay(!autoplay)} />}
        />
        <Row 
            icon={Shield}
            label="Data Saver"
            subLabel="Lower image quality to save data"
            onClick={() => {}}
        />
      </Section>

      <div className="space-y-4">
        <button 
          onClick={onLogout}
          className="w-full bg-white border border-gray-200 text-gray-900 font-bold py-4 rounded-2xl shadow-sm hover:bg-gray-50 transition flex items-center justify-center gap-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
        >
          <LogOut size={20} /> Log Out
        </button>
        
        <button className="w-full text-red-500 text-xs font-bold hover:underline flex items-center justify-center gap-1 opacity-60 hover:opacity-100 transition">
           <Trash2 size={12} /> Delete Account
        </button>

        <p className="text-center text-[10px] text-gray-300 font-black uppercase tracking-widest pt-4 dark:text-gray-600">
          Taste Shift v1.2.1
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
