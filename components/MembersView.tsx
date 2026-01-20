
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
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <div className="p-2 bg-brand-orange/10 rounded-xl">
            <Users className="text-brand-orange fill-brand-orange" size={28} />
          </div>
          Community Members
        </h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chefs by name or handle..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all placeholder:text-gray-400" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredUsers.map(user => {
          const isFollowing = currentUser.followingList?.includes(user.id);
          const followsYou = user.followingList?.includes(currentUser.id);
          
          return (
            <div 
              key={user.id} 
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-20 h-20 rounded-full border-4 border-gray-50 shadow-md overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300 relative">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                {followsYou && (
                    <div className="absolute bottom-0 right-0 bg-brand-green text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-white" title="Follows you">
                        <ArrowLeftRight size={10} />
                    </div>
                )}
              </div>
              
              <h3 className="font-black text-lg text-gray-900 leading-none">{user.name}</h3>
              <p className="text-brand-orange text-xs font-bold mt-1 uppercase tracking-widest">{user.handle}</p>
              
              <p className="text-gray-500 text-sm mt-3 line-clamp-2 min-h-[40px] px-2 leading-relaxed">
                {user.bio || "Passionate home chef sharing culinary secrets."}
              </p>

              <div className="flex gap-6 mt-4 py-3 border-y border-gray-50 w-full justify-center">
                 <div className="text-center">
                    <p className="font-black text-sm text-gray-900">{user.followers}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Followers</p>
                 </div>
                 <div className="text-center">
                    <p className="font-black text-sm text-gray-900">{user.following}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Following</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full mt-6">
                <button 
                  onClick={() => onToggleFollow(user.id)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 ${
                    isFollowing 
                    ? 'bg-gray-100 text-gray-800 shadow-gray-100 hover:bg-gray-200' 
                    : 'bg-brand-orange text-white shadow-orange-100 hover:bg-orange-600'
                  }`}
                >
                  {isFollowing 
                    ? <><UserMinus size={14} /> Unfollow</> 
                    : followsYou 
                        ? <><UserPlus size={14} /> Follow Back</>
                        : <><UserPlus size={14} /> Follow</>
                  }
                </button>
                <button 
                  onClick={() => onStartChat(user)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black shadow-lg shadow-gray-200 hover:bg-black transition-all active:scale-95"
                >
                  <MessageSquare size={14} /> Chat
                </button>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
             <ChefHat size={48} className="mx-auto text-gray-200 mb-4" />
             <h3 className="text-xl font-black text-gray-900">No chefs found</h3>
             <p className="text-gray-400 mt-2">Try searching for a different handle or name.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersView;
