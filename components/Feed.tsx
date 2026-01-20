
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Clock, BarChart, Flame, PlayCircle, Video, Star, ChefHat, MoreHorizontal, Trash2, Edit, TrendingUp, Sparkles, ArrowRight, Utensils, Coffee, Zap, Mic, X, CircleDashed } from 'lucide-react';
import { Post, Story, User, Recipe } from '../types';

interface FeedProps {
    stories: Story[];
    posts: Post[];
    currentUser?: User;
    onOpenRecipe: (post: Post) => void;
    onOpenLive: (user?: User) => void;
    onGoLive: () => void;
    onViewStory: (index: number) => void;
    onToggleLike: (postId: string) => void;
    onViewAll?: () => void;
    onDeletePost?: (postId: string) => void;
    onDeleteStory?: (storyId: string) => void;
    onEditPost?: (post: Post) => void;
    onCreatePost?: () => void;
    onExplore?: () => void;
}

// Helper to get YouTube ID
const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};
const getYouTubeThumbnail = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

// --- Components ---

const TrendingTicker = () => {
    const tags = ["#SustainableCooking", "#VeganDesserts", "#SourdoughLove", "#SpicyEats", "#HomeChef", "#MealPrep", "#ZeroWaste", "#ItalianCuisine", "#StreetFood"];
    return (
        <div className="w-full bg-black/5 dark:bg-white/5 backdrop-blur-sm py-2 overflow-hidden flex items-center mb-6 z-0 relative border-b border-gray-200 dark:border-gray-800">
            <div className="flex animate-scroll whitespace-nowrap">
                {[...tags, ...tags, ...tags].map((tag, i) => (
                    <div key={i} className="mx-8 flex items-center gap-2 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] group hover:text-brand-orange transition-colors cursor-pointer">
                        <Sparkles size={10} className="text-brand-orange opacity-0 group-hover:opacity-100 transition-opacity" />
                        {tag}
                    </div>
                ))}
            </div>
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50 dark:from-black to-transparent pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50 dark:from-black to-transparent pointer-events-none"></div>
        </div>
    );
};

const HeroSection = ({ name, onCreatePost, onExplore }: { name: string, onCreatePost?: () => void, onExplore?: () => void }) => {
    const [greeting, setGreeting] = useState('Welcome back');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    return (
        <div className="relative w-full rounded-[3rem] p-8 md:p-14 mb-12 overflow-hidden shadow-2xl group ring-1 ring-white/20 dark:ring-white/5 bg-gradient-to-br from-gray-900 to-black">
            {/* Dynamic Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-orange/20 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] animate-float-slow"></div>
            </div>

            {/* Floating 3D Emojis with Motion */}
            <div className="absolute top-10 right-10 md:right-20 animate-float-slow hidden md:block z-10">
                <div className="text-8xl drop-shadow-2xl opacity-90 hover:scale-110 transition-transform cursor-pointer rotate-12 hover:rotate-[20deg] duration-500">🍕</div>
            </div>
            <div className="absolute bottom-16 right-1/3 animate-float-medium hidden md:block z-10">
                <div className="text-7xl drop-shadow-2xl opacity-80 hover:scale-110 transition-transform cursor-pointer -rotate-12 hover:-rotate-[20deg] duration-500">🥑</div>
            </div>
            <div className="absolute top-1/2 right-10 animate-float-fast hidden md:block z-10">
                <div className="text-6xl drop-shadow-2xl opacity-70 hover:scale-110 transition-transform cursor-pointer rotate-[25deg] hover:rotate-[45deg] duration-500">🥘</div>
            </div>
            <div className="absolute bottom-8 left-1/3 animate-float-slow hidden md:block z-10" style={{ animationDelay: '1s' }}>
                <div className="text-5xl drop-shadow-2xl opacity-60 hover:scale-110 transition-transform cursor-pointer -rotate-[15deg] duration-500">🥐</div>
            </div>

            <div className="relative z-20 max-w-2xl">
                <div className="flex items-center gap-3 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full flex items-center gap-2">
                        <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></span>
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">
                            Live Kitchen
                        </span>
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-white leading-[1] mb-6 animate-fade-up tracking-tighter" style={{ animationDelay: '0.2s' }}>
                    {greeting}, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-yellow-400 to-brand-orange bg-300% animate-gradient">{name || 'Chef'}</span>.
                </h1>

                <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-lg leading-relaxed animate-fade-up font-medium" style={{ animationDelay: '0.3s' }}>
                    Unleash your culinary creativity. Share flavors, discover recipes, and connect with foodies worldwide.
                </p>

                <div className="flex flex-wrap items-center gap-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
                    <button
                        onClick={onCreatePost}
                        className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-brand-orange/20 hover:bg-white hover:text-brand-orange hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group/btn relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">Create Recipe <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" /></span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
                    </button>
                    <button
                        onClick={onExplore}
                        className="px-8 py-4 rounded-2xl font-bold text-white border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm flex items-center gap-2"
                    >
                        Explore Community
                    </button>
                </div>
            </div>
        </div>
    );
};

const StoryRail = ({ stories, currentUser, onOpenLive, onGoLive, onViewStory, onDeleteStory }: { stories: Story[], currentUser?: User, onOpenLive: (u: User) => void, onGoLive: () => void, onViewStory: (idx: number) => void, onDeleteStory?: (id: string) => void }) => {
    return (
        <div className="relative mb-12">
            <div className="flex gap-6 overflow-x-auto pb-6 pt-2 px-2 no-scrollbar mask-linear items-start">
                {/* Go Live / Create Story Button */}
                <div className="flex flex-col items-center gap-3 min-w-[80px] cursor-pointer group" onClick={onGoLive}>
                    <div className="w-[80px] h-[80px] rounded-[2.5rem] border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-800 relative transition-all duration-300 group-hover:-translate-y-2 group-hover:border-brand-orange group-hover:shadow-xl group-hover:shadow-brand-orange/10">
                        <div className="absolute inset-0 bg-brand-orange/5 rounded-[2.5rem] group-hover:bg-brand-orange/10 transition"></div>
                        <div className="bg-brand-orange text-white p-2.5 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                            <Video size={22} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-brand-green text-white p-1 rounded-full border-2 border-white dark:border-gray-800">
                            <Zap size={10} fill="currentColor" />
                        </div>
                    </div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Go Live</span>
                </div>

                {stories.map((story, idx) => {
                    if (!story || !story.user) return null;
                    const isOwner = currentUser && story.user.id === currentUser.id;

                    return (
                        <div
                            key={story.id}
                            className="flex flex-col items-center gap-3 min-w-[80px] cursor-pointer group animate-fade-up relative"
                            style={{ animationDelay: `${idx * 0.1}s` }}
                            onClick={() => story.isLive ? onOpenLive(story.user) : onViewStory(idx)}
                        >
                            <div className={`w-[80px] h-[80px] p-[3px] rounded-[2.5rem] relative transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl ${story.isLive ? 'bg-gradient-to-tr from-red-500 via-orange-500 to-yellow-500 animate-pulse' : story.isViewed ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gradient-to-tr from-brand-orange via-pink-500 to-purple-500'}`}>
                                <div className="w-full h-full rounded-[2.2rem] overflow-hidden border-[3px] border-white dark:border-gray-800 bg-white dark:bg-gray-800 relative">
                                    <img
                                        src={story.user.avatar || 'https://via.placeholder.com/150'}
                                        alt={story.user.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(story.user.name)}&background=FF6B35&color=fff`; }}
                                    />
                                </div>
                                {story.isLive && (
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black border-2 border-white dark:border-gray-800 shadow-sm z-10 tracking-wider">
                                        LIVE
                                    </div>
                                )}
                            </div>

                            {/* Delete Button for Owner */}
                            {isOwner && onDeleteStory && !story.isLive && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteStory(story.id); }}
                                    className="absolute top-0 right-0 bg-white dark:bg-gray-800 text-red-500 rounded-full p-1.5 shadow-md border border-gray-100 dark:border-gray-700 z-20 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 duration-200"
                                    title="Delete Story"
                                >
                                    <X size={10} strokeWidth={3} />
                                </button>
                            )}

                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 truncate w-20 text-center group-hover:text-brand-orange transition-colors">
                                {story.user.handle?.replace('@', '')}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ModernRecipeCard: React.FC<{
    post: Post,
    currentUser?: User,
    onOpenRecipe: (p: Post) => void,
    onToggleLike: (id: string) => void,
    onDelete?: (id: string) => void,
    onEdit?: (p: Post) => void,
    index: number
}> = ({ post, currentUser, onOpenRecipe, onToggleLike, onDelete, onEdit, index }) => {
    const { recipe } = post;
    const [showMenu, setShowMenu] = useState(false);

    if (!recipe) return null;

    const isOwner = currentUser && post.user && currentUser.id === post.user.id;
    const youtubeId = post.type === 'video' ? getYouTubeId(post.contentUrl) : null;
    const thumbnail = post.type === 'video' ? (youtubeId ? getYouTubeThumbnail(youtubeId) : post.contentUrl) : post.contentUrl;

    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer flex flex-col h-full animate-fade-up"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => onOpenRecipe(post)}
            onMouseLeave={() => setShowMenu(false)}
        >
            {/* Media Section */}
            <div className="relative aspect-video overflow-hidden bg-gray-900">
                {post.type === 'video' ? (
                    <div className="w-full h-full relative">
                        <img src={thumbnail} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" alt={recipe.title} />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/40 transition-all duration-300 group-hover:scale-110 shadow-xl group-hover:bg-brand-orange group-hover:border-brand-orange group-hover:text-white">
                            <PlayCircle size={28} fill="currentColor" className="opacity-90" />
                        </div>
                    </div>
                ) : (
                    <img src={post.contentUrl} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {recipe.tags.slice(0, 1).map(tag => (
                        <span key={tag} className="bg-white/90 dark:bg-black/80 backdrop-blur text-gray-900 dark:text-white text-[10px] font-black uppercase px-2 py-1 rounded-lg shadow-sm tracking-wider">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Owner Actions */}
                {isOwner && (
                    <div className="absolute top-3 right-3 z-20" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setShowMenu(!showMenu)} className="p-2 bg-black/40 text-white rounded-full hover:bg-black/60 backdrop-blur-md border border-white/10 transition">
                            <MoreHorizontal size={18} />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in duration-200 p-1">
                                <button onClick={() => onEdit && onEdit(post)} className="w-full text-left px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 transition"><Edit size={14} /> Edit</button>
                                <button onClick={() => onDelete && onDelete(post.id)} className="w-full text-left px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition"><Trash2 size={14} /> Delete</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1 relative bg-white dark:bg-gray-800">
                {/* Floating Avatar */}
                <div className="absolute -top-5 right-5 w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-md overflow-hidden">
                    <img
                        src={post.user.avatar || 'https://via.placeholder.com/30'}
                        className="w-full h-full object-cover"
                        alt=""
                        onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name)}&background=FF6B35&color=fff`; }}
                    />
                </div>

                <div className="flex justify-between items-start mb-2 pr-12">
                    <h3 className="font-black text-xl text-gray-900 dark:text-white leading-tight group-hover:text-brand-orange transition-colors line-clamp-1 tracking-tight">{recipe.title}</h3>
                </div>

                {/* Description Summary */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed font-medium">
                    {recipe.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-4 mt-auto">
                    <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md"><Clock size={14} className="text-brand-orange" /> {recipe.cookingTime}m</span>
                    <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md"><BarChart size={14} className="text-blue-500" /> {recipe.difficulty}</span>
                    <span className="flex items-center gap-1.5 ml-auto"><Star size={12} className="text-yellow-400 fill-yellow-400" /> 4.8</span>
                </div>

                {/* Footer: User & Like */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-gray-900 dark:text-white truncate max-w-[120px]">By {post.user.name}</span>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleLike(post.id); }}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition active:scale-95 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg"
                    >
                        <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} className={post.isLiked ? "text-red-500" : ""} />
                        <span className="text-xs font-black">{post.likes}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const Feed: React.FC<FeedProps> = ({ stories, posts, currentUser, onOpenRecipe, onOpenLive, onGoLive, onViewStory, onToggleLike, onViewAll, onDeletePost, onDeleteStory, onEditPost, onCreatePost, onExplore }) => {
    const featuredRecipes = posts.filter(p => p.recipe?.tags.includes('Featured') || p.likes > 50);
    const recentRecipes = posts.filter(p => !p.recipe?.tags.includes('Featured') && p.likes <= 50);

    return (
        <div className="flex flex-col pb-24 md:pb-12 w-full max-w-7xl mx-auto">
            <TrendingTicker />

            <div className="px-4 md:px-8">
                <HeroSection name={currentUser?.name.split(' ')[0] || 'Chef'} onCreatePost={onCreatePost} onExplore={onExplore} />

                <div className="mb-12">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-brand-orange to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 dark:shadow-none">
                            <CircleDashed size={20} />
                        </div>
                        Kitchen Stories
                    </h2>
                    <StoryRail stories={stories} currentUser={currentUser} onOpenLive={onOpenLive} onGoLive={onGoLive} onViewStory={onViewStory} onDeleteStory={onDeleteStory} />
                </div>

                {/* Featured / Popular Grid */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                            <TrendingUp className="text-brand-orange" size={32} />
                            Trending Now
                        </h2>
                        <button onClick={onViewAll} className="group flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-brand-orange transition-colors bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm">
                            View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(featuredRecipes.length > 0 ? featuredRecipes : posts.slice(0, 3)).map((post, idx) => (
                            <ModernRecipeCard
                                key={post.id}
                                post={post}
                                index={idx}
                                currentUser={currentUser}
                                onOpenRecipe={onOpenRecipe}
                                onToggleLike={onToggleLike}
                                onDelete={onDeletePost}
                                onEdit={onEditPost}
                            />
                        ))}
                    </div>
                </section>

                {/* Fresh / Recent Grid */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-blue-500/10 rounded-2xl">
                            <Sparkles className="text-blue-500 fill-blue-500" size={24} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Fresh from the Kitchen</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(recentRecipes.length > 0 ? recentRecipes : posts.slice(3)).map((post, idx) => (
                            <ModernRecipeCard
                                key={post.id}
                                post={post}
                                index={idx} // Stagger index
                                currentUser={currentUser}
                                onOpenRecipe={onOpenRecipe}
                                onToggleLike={onToggleLike}
                                onDelete={onDeletePost}
                                onEdit={onEditPost}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Feed;
