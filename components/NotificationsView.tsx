
import React from 'react';
import { Heart, MessageCircle, UserPlus, Bell, ArrowRight } from 'lucide-react';
import { Notification, User } from '../types';

interface NotificationsViewProps {
  notifications: Notification[];
  currentUser: User;
  onFollowBack: (userId: string) => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications, currentUser, onFollowBack }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="text-red-500 fill-red-500" size={20} />;
      case 'comment': return <MessageCircle className="text-blue-500 fill-blue-500" size={20} />;
      case 'follow': return <UserPlus className="text-brand-orange fill-brand-orange" size={20} />;
      default: return <Bell className="text-gray-500" size={20} />;
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Bell size={40} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-black text-gray-900">No Notifications</h3>
        <p className="text-gray-500 mt-2 text-sm">When people interact with you, it'll show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black text-gray-900">Notifications</h2>
        <span className="bg-brand-orange/10 text-brand-orange text-xs font-black px-3 py-1 rounded-full">
            {notifications.filter(n => !n.read).length} New
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {notifications.map((notif) => {
            const isFollowType = notif.type === 'follow';
            const actor = notif.user;
            // Check if I follow them back
            const isFollowingActor = currentUser.followingList?.includes(actor.id);

            return (
                <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-4 items-center">
                    <div className="relative shrink-0">
                        <img src={actor.avatar} alt={actor.name} className="w-12 h-12 rounded-full border border-gray-200 object-cover" />
                        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                            {getIcon(notif.type)}
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                            <span className="font-bold">{actor.name}</span> <span className="text-gray-600">{notif.message}</span>
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                            {new Date(notif.timestamp).toLocaleDateString()} • {new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>

                    {isFollowType && (
                        <button 
                            onClick={() => onFollowBack(actor.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap active:scale-95 ${
                                isFollowingActor
                                ? 'bg-gray-200 text-gray-600'
                                : 'bg-brand-orange text-white shadow-lg shadow-orange-100 hover:bg-orange-600'
                            }`}
                        >
                            {isFollowingActor ? 'Following' : 'Follow Back'}
                        </button>
                    )}
                    
                    {!isFollowType && notif.postId && (
                         <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                             <ArrowRight size={16} className="text-gray-400" />
                         </div>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default NotificationsView;
