
import React, { useState, useMemo } from 'react';
// Added Heart to imports
import { ChevronLeft, Filter, SlidersHorizontal, Clock, BarChart, Flame, Check, Heart } from 'lucide-react';
import { Post } from '../types';

interface CollectionsViewProps {
  posts: Post[];
  onOpenRecipe: (post: Post) => void;
  onBack: () => void;
}

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Healthy', 'Italian', 'Asian', 'Quick', 'Vegan'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const CollectionsView: React.FC<CollectionsViewProps> = ({ posts, onOpenRecipe, onBack }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [maxTime, setMaxTime] = useState<number>(180);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const recipe = post.recipe;
      if (!recipe) return false;

      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.some(cat => recipe.tags.includes(cat));
      
      const matchesDifficulty = !selectedDifficulty || recipe.difficulty === selectedDifficulty;
      
      const matchesTime = recipe.cookingTime <= maxTime;

      return matchesCategory && matchesDifficulty && matchesTime;
    });
  }, [posts, selectedCategories, selectedDifficulty, maxTime]);

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-in slide-in-from-right duration-500">
      {/* Filters Sidebar */}
      <aside className="w-full md:w-64 space-y-8 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition md:hidden">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-black text-gray-900">Filters</h2>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Category</h3>
          <div className="flex flex-wrap md:flex-col gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  selectedCategories.includes(cat)
                    ? 'bg-brand-orange/10 text-brand-orange'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {cat}
                {selectedCategories.includes(cat) && <Check size={14} strokeWidth={4} />}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Difficulty</h3>
          <div className="flex gap-2">
            {DIFFICULTIES.map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-brand-green text-white shadow-lg shadow-green-100'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Cooking Time */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Max Time</h3>
            <span className="text-xs font-black text-brand-orange">{maxTime} min</span>
          </div>
          <input 
            type="range" 
            min="5" 
            max="180" 
            step="5"
            value={maxTime}
            onChange={(e) => setMaxTime(parseInt(e.target.value))}
            className="w-full accent-brand-orange cursor-pointer"
          />
        </div>

        <button 
          onClick={() => {
            setSelectedCategories([]);
            setSelectedDifficulty(null);
            setMaxTime(180);
          }}
          className="w-full py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
        >
          Reset All Filters
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition hidden md:block">
                <ChevronLeft size={24} />
             </button>
             <div>
                <h1 className="text-3xl font-black text-gray-900 leading-none">All Collections</h1>
                <p className="text-sm text-gray-500 mt-2 font-medium">{filteredPosts.length} recipes found</p>
             </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl text-xs font-bold text-gray-500">
             <SlidersHorizontal size={16} />
             Sort: Recommended
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <div 
              key={post.id} 
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              onClick={() => onOpenRecipe(post)}
            >
              <div className="relative aspect-video overflow-hidden">
                <img src={post.contentUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black shadow-sm text-gray-900">
                   {post.recipe?.difficulty}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-black text-lg text-gray-900 line-clamp-1 group-hover:text-brand-orange transition-colors">
                    {post.recipe?.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {post.recipe?.description}
                  </p>
                </div>
                <div className="flex items-center justify-between py-3 border-y border-gray-50">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                    <Clock size={14} className="text-brand-orange" /> {post.recipe?.cookingTime}m
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                    <Flame size={14} className="text-red-500" /> {post.recipe?.nutrition.calories}cal
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                    <BarChart size={14} className="text-brand-green" /> {post.recipe?.nutrition.protein}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                   <div className="flex items-center gap-2">
                      <img src={post.user.avatar} className="w-6 h-6 rounded-full" alt="" />
                      <span className="text-[10px] font-black text-gray-900 uppercase tracking-wider">{post.user.handle}</span>
                   </div>
                   <div className="flex items-center gap-1 text-red-500">
                      <Heart size={14} fill="currentColor" />
                      <span className="text-xs font-black">{post.likes}</span>
                   </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredPosts.length === 0 && (
            <div className="col-span-full py-32 text-center">
               <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-gray-200">
                  <Filter size={32} className="text-gray-300" />
               </div>
               <h3 className="text-xl font-black text-gray-900">No results found</h3>
               <p className="text-gray-500 mt-2 max-w-xs mx-auto">Try broadning your filters to see more delicious recipes.</p>
               <button 
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedDifficulty(null);
                    setMaxTime(180);
                  }}
                  className="mt-6 text-brand-orange font-black text-sm hover:underline"
               >
                  Clear all filters
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionsView;
