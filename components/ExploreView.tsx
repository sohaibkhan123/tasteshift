
import React, { useState, useMemo } from 'react';
import { Search, Flame, TrendingUp, Sparkles, ChefHat } from 'lucide-react';
import { Post } from '../types';

interface ExploreViewProps {
  posts: Post[];
  onOpenRecipe: (post: Post) => void;
  onViewAllCollections: () => void;
}

const CATEGORIES = ['All', 'Italian', 'American', 'Japanese', 'Breakfast', 'Dinner', 'Salad', 'Healthy'];

// Helper to safely extract YouTube ID
const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Helper to determine the best thumbnail to show
const getThumbnail = (post: Post) => {
  if (post.type === 'video') {
    const id = getYouTubeId(post.contentUrl);
    // If it's a YouTube video, use the high-quality thumbnail, otherwise fallback to contentUrl (for raw video files, this might fail in img tag without a poster)
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : post.contentUrl;
  }
  return post.contentUrl;
};

const ExploreView: React.FC<ExploreViewProps> = ({ posts, onOpenRecipe, onViewAllCollections }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const recipe = post.recipe;
      if (!recipe) return false;

      const matchesSearch =
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.user.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        activeCategory === 'All' ||
        recipe.tags.some(tag => tag.toLowerCase() === activeCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, activeCategory]);

  const trendingPosts = useMemo(() => posts.slice(0, 3), [posts]);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Search Header */}
      <div className="space-y-4">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="p-2 bg-brand-orange/10 rounded-xl">
            <Sparkles className="text-brand-orange fill-brand-orange" size={28} />
          </div>
          Discover Inspiration
        </h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes, chefs, ingredients..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat
                ? 'bg-brand-orange text-white shadow-lg shadow-orange-100'
                : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Trending Section */}
      {!searchQuery && activeCategory === 'All' && trendingPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Flame className="text-brand-orange" size={20} />
              Trending Collections
            </h3>
            <button
              onClick={onViewAllCollections}
              className="text-sm font-bold text-brand-orange hover:underline"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {trendingPosts.map(post => (
              <div
                key={post.id}
                className="aspect-[4/5] relative rounded-2xl overflow-hidden shadow-sm group cursor-pointer hover:shadow-xl transition-all duration-300"
                onClick={() => onOpenRecipe(post)}
              >
                <img
                  src={getThumbnail(post)}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  alt={post.recipe?.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange mb-1">Trending</p>
                  <p className="font-black text-sm leading-tight group-hover:text-brand-orange transition-colors line-clamp-2">{post.recipe?.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Results Grid */}
      <section className="space-y-4">
        <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2 px-1">
          <ChefHat className="text-brand-green" size={20} />
          {searchQuery ? `Results for "${searchQuery}"` : 'Curated for You'}
        </h3>
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredPosts.map(post => (
              <div
                key={post.id}
                className="aspect-square relative rounded-2xl overflow-hidden shadow-sm group cursor-pointer hover:shadow-lg transition-all"
                onClick={() => onOpenRecipe(post)}
              >
                <img
                  src={getThumbnail(post)}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                  alt={post.recipe?.title}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 backdrop-blur p-1.5 rounded-lg shadow-sm">
                    <TrendingUp size={14} className="text-brand-orange" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] font-bold text-white bg-black/40 backdrop-blur-md px-2 py-1 rounded-full truncate">
                    {post.recipe?.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
            <Search size={40} className="mx-auto text-gray-200 dark:text-gray-600 mb-3" />
            <p className="text-gray-400 font-bold">No recipes found matching your criteria</p>
            <p className="text-gray-400 text-xs mt-1">Try adjusting your search or category filters.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ExploreView;
