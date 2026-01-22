
import React, { useState } from 'react';
import { Settings, Grid, Bookmark, ChefHat, Heart, MessageCircle, PlayCircle, Clock, BarChart, Flame, MoreHorizontal, Edit, Trash2, UserPlus, UserMinus } from 'lucide-react';
import { Post, User } from '../types';

interface ProfileProps {
  user: User;
  posts: Post[];
  onEditProfile: () => void;
  onOpenSettings: () => void;
  onOpenRecipe: (post: Post) => void;
  onToggleLike: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onEditPost: (post: Post) => void;
  onToggleFollow: (targetUserId: string) => void;
  currentUser?: User;
}

const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};
const getYouTubeThumbnail = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

const ProfileRecipeCard: React.FC<{
  post: Post,
  currentUser?: User,
  onOpen: () => void,
  onLike: () => void,
  onDelete: () => void,
  onEdit: () => void
}> = ({ post, currentUser, onOpen, onLike, onDelete, onEdit }) => {
  const { recipe } = post;
  const [showMenu, setShowMenu] = useState(false);
  if (!recipe) return null;
  const isOwner = currentUser && post.user && currentUser.id === post.user.id;
  const youtubeId = post.type === 'video' ? getYouTubeId(post.contentUrl) : null;

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group/card relative dark:bg-gray-800 dark:border-gray-700"
      onClick={onOpen}
    >
      <div className="relative bg-gray-900 aspect-video overflow-hidden">
        {post.type === 'video' ? (
          <div className="w-full h-full relative">
            {youtubeId ? (
              <img src={getYouTubeThumbnail(youtubeId)} className="w-full h-full object-cover group-hover/card:scale-105 transition duration-700" alt="" />
            ) : (
              <video src={post.contentUrl} className="w-full h-full object-cover group-hover/card:scale-105 transition duration-700" muted loop />
            )}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full">
              <PlayCircle size={18} className="text-white" />
            </div>
          </div>
        ) : (
          <img src={post.contentUrl} className="w-full h-full object-cover group-hover/card:scale-105 transition duration-700" alt="" />
        )}

        {/* Owner Menu */}
        {isOwner && (
          <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 backdrop-blur-sm"
            >
              <MoreHorizontal size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 dark:bg-gray-800 dark:border-gray-700">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <Edit size={12} /> Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); if (confirm('Are you sure you want to delete this recipe?')) onDelete(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-black text-gray-900 leading-tight mb-2 group-hover/card:text-brand-orange transition-colors line-clamp-1 dark:text-white">{recipe.title}</h3>

        {/* Description Summary */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
          {recipe.description}
        </p>

        <div className="flex items-center gap-3 mb-4 text-[10px] font-bold text-gray-400 mt-auto">
          <div className="flex items-center gap-1"><Clock size={12} /> {recipe.cookingTime}m</div>
          <div className="flex items-center gap-1"><BarChart size={12} /> {recipe.difficulty}</div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              className={`flex items-center gap-1 text-[11px] font-bold ${post.isLiked ? 'text-red-500' : 'text-gray-400'}`}
              onClick={(e) => { e.stopPropagation(); onLike(); }}
            >
              <Heart size={16} fill={post.isLiked ? "currentColor" : "none"} />
              {post.likes}
            </button>
            <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
              <MessageCircle size={16} />
              {post.comments.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile: React.FC<ProfileProps> = ({ user, posts, onEditProfile, onOpenSettings, onOpenRecipe, onToggleLike, onDeletePost, onEditPost, onToggleFollow, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const isOwnProfile = currentUser && user.id === currentUser.id;
  const isFollowing = currentUser?.followingList?.includes(user.id);

  return (
    <div className="bg-white sm:rounded-2xl lg:rounded-3xl shadow-sm overflow-hidden min-h-[80vh] animate-in fade-in duration-500 dark:bg-gray-900 dark:text-white">
      <div className="p-4 sm:p-6 lg:p-10 border-b dark:border-gray-800">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start text-center lg:text-left">
          <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 rounded-full border-3 sm:border-4 border-white shadow-xl overflow-hidden shrink-0 transform hover:scale-105 transition-transform duration-300 dark:border-gray-700">
            <img
              src={user.avatar}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=FF6B35&color=fff`; }}
            />
          </div>

          <div className="flex-1 space-y-4 sm:space-y-6 w-full">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{user.handle}</h2>
              <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={onEditProfile}
                      className="px-4 sm:px-6 py-2 bg-brand-orange text-white rounded-lg sm:rounded-xl text-sm font-black shadow-lg shadow-orange-100 hover:bg-orange-600 transition active:scale-95 min-h-[44px] flex items-center"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={onOpenSettings}
                      className="p-2.5 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg sm:rounded-xl transition dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Settings size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onToggleFollow(user.id)}
                    className={`px-6 sm:px-8 py-2 rounded-lg sm:rounded-xl text-sm font-black shadow-lg transition flex items-center gap-2 active:scale-95 min-h-[44px] ${isFollowing
                        ? 'bg-gray-100 text-gray-800 shadow-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200'
                        : 'bg-brand-orange text-white shadow-orange-100 hover:bg-orange-600'
                      }`}
                  >
                    {isFollowing ? <><UserMinus size={16} className="sm:w-[18px] sm:h-[18px]" /> Following</> : <><UserPlus size={16} className="sm:w-[18px] sm:h-[18px]" /> Follow</>}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-center lg:justify-start gap-6 sm:gap-10">
              <div className="flex flex-col items-center lg:items-start">
                <span className="font-black text-lg sm:text-xl leading-none">{posts.length}</span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Posts</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="font-black text-lg sm:text-xl leading-none">{user.followers}</span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Followers</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="font-black text-lg sm:text-xl leading-none">{user.following}</span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Following</span>
              </div>
            </div>

            <div className="max-w-full lg:max-w-md">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{user.name}</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 leading-relaxed dark:text-gray-400">{user.bio || "No bio yet. Start sharing your cooking story!"}</p>
              {user.website && (
                <a href={`https://${user.website}`} target="_blank" rel="noopener noreferrer" className="text-brand-orange text-xs sm:text-sm font-bold hover:underline inline-block mt-2">
                  {user.website}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b dark:border-gray-800">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 sm:py-4 flex items-center justify-center gap-1.5 sm:gap-2 font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all min-h-[48px] ${activeTab === 'posts' ? 'border-b-3 sm:border-b-4 border-brand-orange text-brand-orange bg-brand-orange/[0.02]' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          <Grid size={16} className="sm:w-[18px] sm:h-[18px]" /> {isOwnProfile ? 'My Recipes' : 'Recipes'}
        </button>
        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 sm:py-4 flex items-center justify-center gap-1.5 sm:gap-2 font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all min-h-[48px] ${activeTab === 'saved' ? 'border-b-3 sm:border-b-4 border-brand-orange text-brand-orange bg-brand-orange/[0.02]' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <Bookmark size={16} className="sm:w-[18px] sm:h-[18px]" /> Saved
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6">
        {activeTab === 'posts' ? (
          posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {posts.map(post => (
                <ProfileRecipeCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onOpen={() => onOpenRecipe(post)}
                  onLike={() => onToggleLike(post.id)}
                  onDelete={() => onDeletePost(post.id)}
                  onEdit={() => onEditPost(post)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 sm:py-20 text-center space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <ChefHat size={24} className="sm:w-8 sm:h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <h4 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">{isOwnProfile ? 'The Kitchen is Empty' : 'No Recipes Yet'}</h4>
              <p className="text-gray-400 text-xs sm:text-sm max-w-xs mx-auto">
                {isOwnProfile
                  ? "You haven't posted any recipes yet. Start your journey by sharing a delicious dish!"
                  : "This user hasn't shared any culinary secrets yet."
                }
              </p>
            </div>
          )
        ) : (
          <div className="py-12 sm:py-20 text-center space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <Bookmark size={24} className="sm:w-8 sm:h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <h4 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">No Saved Recipes</h4>
            <p className="text-gray-400 text-xs sm:text-sm max-w-xs mx-auto">Explore recipes and tap the bookmark icon to save them for later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
