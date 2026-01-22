
import React, { useState, useMemo } from 'react';
import { Search, UserPlus, UserMinus, MessageSquare, ChefHat, Users, ArrowLeftRight } from 'lucide-react';
import { User } from '../types';

interface MembersViewProps {
  users: User[];
  currentUser: User;
  onToggleFollow: (userId: string) => void;
  onStartChat: (user: User) => void;
}

const MembersView: React.FC<MembersViewProps> = ({ users, currentUser, onToggleFollow, onStartChat }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.id !== currentUser.id && 
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       u.handle.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [users, currentUser.id, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-brand-orange/10 rounded-lg sm:rounded-xl">
            <Users className="text-brand-orange fill-brand-orange" size={20} className="sm:w-7 sm:h-7" />
          </div>
          Community Members
        </h2>
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} className="sm:w-5 sm:h-5" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chefs by name or handle..." 
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all placeholder:text-gray-400 text-sm sm:text-base" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {filteredUsers.map(user => {
          const isFollowing = currentUser.followingList?.includes(user.id);
          const followsYou = user.followingList?.includes(currentUser.id);
          
          return (
            <div 
              key={user.id} 
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 sm:border-4 border-gray-50 shadow-md overflow-hidden mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-300 relative">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                {followsYou && (
                    <div className="absolute bottom-0 right-0 bg-brand-green text-white text-[8px] sm:text-[9px] font-black px-1 sm:px-1.5 py-0.5 rounded-full border-2 border-white" title="Follows you">
                        <ArrowLeftRight size={8} className="sm:w-[10px] sm:h-[10px]" />
                    </div>
                )}
              </div>
              
              <h3 className="font-black text-base sm:text-lg text-gray-900 leading-none">{user.name}</h3>
              <p className="text-brand-orange text-[10px] sm:text-xs font-bold mt-1 uppercase tracking-widest">{user.handle}</p>
              
              <p className="text-gray-500 text-xs sm:text-sm mt-2 sm:mt-3 line-clamp-2 min-h-[32px] sm:min-h-[40px] px-1 sm:px-2 leading-relaxed">
                {user.bio || "Passionate home chef sharing culinary secrets."}
              </p>

              <div className="flex gap-4 sm:gap-6 mt-3 sm:mt-4 py-2 sm:py-3 border-y border-gray-50 w-full justify-center">
                 <div className="text-center">
                    <p className="font-black text-xs sm:text-sm text-gray-900">{user.followers}</p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Followers</p>
                 </div>
                 <div className="text-center">
                    <p className="font-black text-xs sm:text-sm text-gray-900">{user.following}</p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Following</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full mt-4 sm:mt-6">
                <button 
                  onClick={() => onToggleFollow(user.id)}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black shadow-lg transition-all active:scale-95 min-h-[36px] sm:min-h-[40px] ${
                    isFollowing 
                    ? 'bg-gray-100 text-gray-800 shadow-gray-100 hover:bg-gray-200' 
                    : 'bg-brand-orange text-white shadow-orange-100 hover:bg-orange-600'
                  }`}
                >
                  {isFollowing 
                    ? <><UserMinus size={12} className="sm:w-[14px] sm:h-[14px]" /> Unfollow</> 
                    : followsYou 
                        ? <><UserPlus size={12} className="sm:w-[14px] sm:h-[14px]" /> Follow Back</>
                        : <><UserPlus size={12} className="sm:w-[14px] sm:h-[14px]" /> Follow</>
                  }
                </button>
                <button 
                  onClick={() => onStartChat(user)}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 bg-gray-900 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black shadow-lg shadow-gray-200 hover:bg-black transition-all active:scale-95 min-h-[36px] sm:min-h-[40px]"
                >
                  <MessageSquare size={12} className="sm:w-[14px] sm:h-[14px]" /> Chat
                </button>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="col-span-full py-12 sm:py-20 text-center bg-white rounded-2xl sm:rounded-3xl border-2 border-dashed border-gray-100">
             <ChefHat size={32} className="sm:w-12 sm:h-12 mx-auto text-gray-200 mb-4" />
             <h3 className="text-lg sm:text-xl font-black text-gray-900">No chefs found</h3>
             <p className="text-gray-400 mt-2 text-sm">Try searching for a different handle or name.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersView;
