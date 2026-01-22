
import React, { useState, useMemo } from 'react';
import { Search, ChefHat, Filter } from 'lucide-react';
import { Post, User } from '../types';
import { Heart, Clock, BarChart, Flame, PlayCircle, Star, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

interface AllRecipesViewProps {
    posts: Post[];
    currentUser?: User;
    onOpenRecipe: (post: Post) => void;
    onDeletePost: (postId: string) => void;
    onEditPost: (post: Post) => void;
    onToggleLike: (postId: string) => void;
}

const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};
const getYouTubeThumbnail = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

const RecipeCard: React.FC<{
    post: Post,
    currentUser?: User,
    onOpen: () => void,
    onDelete: () => void,
    onEdit: () => void,
    onLike: () => void
}> = ({ post, currentUser, onOpen, onDelete, onEdit, onLike }) => {
    const [showMenu, setShowMenu] = useState(false);
    const isOwner = currentUser && post.user && currentUser.id === post.user.id;
    const { recipe } = post;
    const youtubeId = post.type === 'video' ? getYouTubeId(post.contentUrl) : null;

    if (!recipe) return null;

    return (
        <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col"
            onClick={onOpen}
            onMouseLeave={() => setShowMenu(false)}
        >
            <div className="relative aspect-video overflow-hidden bg-gray-900">
                {post.type === 'video' ? (
                    <div className="w-full h-full relative">
                        {youtubeId ? (
                            <img src={getYouTubeThumbnail(youtubeId)} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={recipe.title} />
                        ) : (
                            <video src={post.contentUrl} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-500" muted />
                        )}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
                            <PlayCircle className="text-white" size={24} />
                        </div>
                    </div>
                ) : (
                    <img src={post.contentUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={recipe.title} />
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
                            <div className="absolute right-0 mt-1 w-28 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1">
                                <button onClick={onEdit} className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Edit size={12} /> Edit</button>
                                <button onClick={onDelete} className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"><Trash2 size={12} /> Delete</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-black text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-brand-orange transition-colors">{recipe.title}</h3>

                {/* Description Summary */}
                <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">
                    {recipe.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mb-3">
                    <span className="flex items-center gap-1"><Clock size={12} /> {recipe.cookingTime}m</span>
                    <span className="flex items-center gap-1"><BarChart size={12} /> {recipe.difficulty}</span>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <img src={post.user.avatar} className="w-5 h-5 rounded-full" alt="" />
                        <span className="text-[10px] font-bold text-gray-900 truncate max-w-[80px]">{post.user.handle}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onLike(); }} className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition">
                        <Heart size={14} fill={post.isLiked ? "currentColor" : "none"} className={post.isLiked ? "text-red-500" : ""} />
                        <span className="text-xs font-bold">{post.likes}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const AllRecipesView: React.FC<AllRecipesViewProps> = ({ posts, currentUser, onOpenRecipe, onDeletePost, onEditPost, onToggleLike }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPosts = useMemo(() => {
        return posts.filter(post =>
            post.recipe && (
                post.recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.recipe.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        );
    }, [posts, searchTerm]);

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <ChefHat size={24} className="sm:w-8 sm:h-8 text-brand-orange" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">The Cookbook</h1>
                <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">Explore our entire collection of culinary masterpieces.</p>

                <div className="max-w-full sm:max-w-md mx-auto relative">
                    <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} className="sm:w-5 sm:h-5" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for a recipe..."
                        className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition text-sm sm:text-base"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                {filteredPosts.map(post => (
                    <RecipeCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        onOpen={() => onOpenRecipe(post)}
                        onDelete={() => onDeletePost(post.id)}
                        onEdit={() => onEditPost(post)}
                        onLike={() => onToggleLike(post.id)}
                    />
                ))}
            </div>

            {filteredPosts.length === 0 && (
                <div className="text-center py-12 sm:py-20">
                    <Filter size={32} className="sm:w-12 sm:h-12 mx-auto text-gray-200 mb-4" />
                    <h3 className="text-lg sm:text-xl font-bold text-gray-400">No recipes found</h3>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">Try adjusting your search terms.</p>
                </div>
            )}
        </div>
    );
};

export default AllRecipesView;
