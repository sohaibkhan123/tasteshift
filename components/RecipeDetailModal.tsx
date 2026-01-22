
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Clock, BarChart, Play, Heart, Share2, Send, MessageCircle, Reply, CornerDownRight, ThumbsUp, ThumbsDown, Minus, Loader2 } from 'lucide-react';
import { Recipe, Post, Comment } from '../types';
import { analyzeCommentSentiment } from '../services/groqService';

interface RecipeDetailModalProps {
  post: Post;
  onClose: () => void;
  onStartCooking: () => void;
  onToggleLike: () => void;
  onAddComment: (text: string, sentiment?: string) => void;
}

const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ post, onClose, onStartCooking, onToggleLike, onAddComment }) => {
  const [commentText, setCommentText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'good' | 'bad' | 'neutral'>('all');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const recipe = post.recipe!;
  const youtubeId = post.type === 'video' ? getYouTubeId(post.contentUrl) : null;

  // Sentiment Stats
  const sentimentStats = useMemo(() => {
    const stats = { good: 0, bad: 0, neutral: 0 };
    post.comments.forEach(c => {
      if (c.sentiment === 'good') stats.good++;
      else if (c.sentiment === 'bad') stats.bad++;
      else stats.neutral++;
    });
    return stats;
  }, [post.comments]);

  const filteredComments = useMemo(() => {
    if (filter === 'all') return post.comments;
    return post.comments.filter(c => c.sentiment === filter);
  }, [post.comments, filter]);

  // Scroll to bottom when a new comment is added or when opening
  useEffect(() => {
    if (commentsEndRef.current && filter === 'all') {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [post.comments.length, filter]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      // Analyze Sentiment via Groq
      const sentiment = await analyzeCommentSentiment(commentText);

      // Pass sentiment to parent handler
      onAddComment(commentText, sentiment);

      setCommentText('');
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    let sentimentColor = 'bg-gray-100 text-gray-500';
    let SentimentIcon = Minus;
    if (comment.sentiment === 'good') {
      sentimentColor = 'bg-green-100 text-green-600';
      SentimentIcon = ThumbsUp;
    } else if (comment.sentiment === 'bad') {
      sentimentColor = 'bg-red-100 text-red-600';
      SentimentIcon = ThumbsDown;
    }

    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 mt-4 border-l-2 border-gray-100 dark:border-gray-800 pl-4' : 'mb-6'} group/comment animate-in fade-in slide-in-from-left-2 duration-300`}>
        <div className="flex gap-3">
          <div className={`w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-black text-xs shrink-0 ${isReply ? 'w-7 h-7 text-[10px]' : ''}`}>
            {comment.userName.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-bold text-sm text-gray-900 dark:text-white">{comment.userName}</span>
              <span className="text-[10px] text-gray-400 font-medium">{comment.timestamp}</span>

              {!isReply && (
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${sentimentColor}`}>
                  <SentimentIcon size={10} /> {comment.sentiment || 'Neutral'}
                </div>
              )}

              {!isReply && (
                <button
                  onClick={() => setReplyingTo(comment)}
                  className="text-[10px] font-bold text-brand-orange opacity-0 group-hover/comment:opacity-100 hover:underline flex items-center gap-0.5 transition-opacity ml-auto"
                >
                  <Reply size={10} /> Reply
                </button>
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{comment.text}</p>
          </div>
        </div>
        {/* Recursively render replies if any */}
        {!isReply && comment.replies && comment.replies.length > 0 && (
          <div className="space-y-1">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-full sm:max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col lg:flex-row shadow-2xl">

        {/* Media Section */}
        <div className="w-full lg:w-1/2 h-48 sm:h-64 md:h-80 lg:h-auto bg-black relative group flex items-center justify-center">
          {post.type === 'video' ? (
            youtubeId ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            ) : (
              <video src={post.contentUrl} controls autoPlay className="w-full h-full object-contain" />
            )
          ) : (
            <img src={post.contentUrl} alt={recipe.title} className="w-full h-full object-cover" />
          )}
          <button
            onClick={onClose}
            className="absolute top-2 sm:top-4 left-2 sm:left-4 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 lg:hidden z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Details Section */}
        <div className="w-full lg:w-1/2 flex flex-col h-full bg-white dark:bg-gray-900 relative">
          <button
            onClick={onClose}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 p-2 text-gray-400 hover:text-gray-800 dark:hover:text-white hidden lg:block z-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 no-scrollbar">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-brand-orange/10 text-brand-orange px-2 py-1 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                  {recipe.tags[0] || 'Recipe'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2 leading-tight">{recipe.title}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">{recipe.description}</p>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between py-3 sm:py-4 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl sm:rounded-2xl px-4 sm:px-6">
              <div className="text-center">
                <span className="block text-gray-400 text-[8px] sm:text-[9px] uppercase font-black tracking-widest mb-1">Time</span>
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1 sm:gap-1.5 justify-center text-xs sm:text-sm"><Clock size={12} className="sm:w-[14px] sm:h-[14px] text-brand-orange" /> {recipe.cookingTime}m</span>
              </div>
              <div className="w-px h-6 sm:h-8 bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-center">
                <span className="block text-gray-400 text-[8px] sm:text-[9px] uppercase font-black tracking-widest mb-1">Level</span>
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1 sm:gap-1.5 justify-center text-xs sm:text-sm"><BarChart size={12} className="sm:w-[14px] sm:h-[14px] text-brand-green" /> {recipe.difficulty}</span>
              </div>
              <div className="w-px h-6 sm:h-8 bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-center">
                <span className="block text-gray-400 text-[8px] sm:text-[9px] uppercase font-black tracking-widest mb-1">Calories</span>
                <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">{recipe.nutrition.calories}</span>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h3 className="font-black text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2 text-gray-900 dark:text-white">Ingredients <span className="text-gray-400 text-xs font-bold">({recipe.ingredients.length})</span></h3>
              <ul className="grid grid-cols-1 gap-2 sm:gap-3">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-300 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700 hover:border-brand-orange/30 transition-colors">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-brand-orange shrink-0"></div>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="font-black text-base sm:text-lg mb-3 sm:mb-4 text-gray-900 dark:text-white">Instructions</h3>
              <div className="space-y-3 sm:space-y-4">
                {recipe.instructions.map((step, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-shadow">
                    <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-brand-orange text-white text-[10px] sm:text-xs font-black shrink-0 shadow-sm shadow-orange-200">
                      {i + 1}
                    </span>
                    <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed pt-0.5 sm:pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6 sm:pt-8 pb-8 sm:pb-10">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h3 className="font-black text-base sm:text-lg flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-white">
                  <div className="p-1.5 sm:p-2 bg-brand-orange/10 rounded-lg sm:rounded-xl">
                    <MessageCircle size={16} className="sm:w-5 sm:h-5 text-brand-orange fill-brand-orange" />
                  </div>
                  Community Thoughts
                </h3>
              </div>

              {/* Sentiment Summary Dashboard */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-green-100 dark:border-green-900 text-center">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase text-green-600 dark:text-green-400 tracking-wider mb-1">Good</p>
                  <p className="text-lg sm:text-xl font-black text-green-700 dark:text-green-300">{sentimentStats.good}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-red-100 dark:border-red-900 text-center">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase text-red-600 dark:text-red-400 tracking-wider mb-1">Bad</p>
                  <p className="text-lg sm:text-xl font-black text-red-700 dark:text-red-300">{sentimentStats.bad}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1">Neutral</p>
                  <p className="text-lg sm:text-xl font-black text-gray-700 dark:text-gray-300">{sentimentStats.neutral}</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto no-scrollbar pb-2">
                {(['all', 'good', 'bad', 'neutral'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold capitalize transition-colors min-h-[32px] flex items-center whitespace-nowrap ${filter === f
                        ? 'bg-brand-orange text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredComments.length > 0 ? (
                  filteredComments.map((comment) => renderComment(comment))
                ) : (
                  <div className="text-center py-8 sm:py-12 px-4 bg-gray-50 dark:bg-gray-800 rounded-2xl sm:rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <MessageCircle size={24} className="sm:w-8 sm:h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-400 text-xs sm:text-sm font-bold">No comments found</p>
                    <p className="text-gray-400 text-[10px] sm:text-xs mt-1">Be the first to share your thoughts!</p>
                  </div>
                )}
                <div ref={commentsEndRef} />
              </div>
            </div>
          </div>

          {/* Sticky Comment Form & Actions */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t dark:border-gray-800 p-3 sm:p-4 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            {/* Reply Indicator */}
            {replyingTo && (
              <div className="bg-brand-orange/5 border border-brand-orange/20 px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl sm:rounded-t-2xl flex justify-between items-center text-[9px] sm:text-[10px] animate-in slide-in-from-bottom-2 duration-300">
                <p className="text-brand-orange font-bold flex items-center gap-1.5 sm:gap-2">
                  <CornerDownRight size={12} className="sm:w-[14px] sm:h-[14px]" strokeWidth={3} /> Replying to <span className="underline underline-offset-2">@{replyingTo.userName}</span>
                </p>
                <button onClick={() => setReplyingTo(null)} className="p-1 text-brand-orange/50 hover:text-brand-orange transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center">
                  <X size={12} className="sm:w-[14px] sm:h-[14px]" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmitComment} className="flex gap-2 mb-3 sm:mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={replyingTo ? "Write your reply..." : "Share your thoughts..."}
                  className={`w-full bg-gray-100 dark:bg-gray-800 border-none px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all placeholder:text-gray-400 dark:text-white ${replyingTo ? 'rounded-b-xl sm:rounded-b-2xl' : 'rounded-xl sm:rounded-2xl'}`}
                  disabled={isAnalyzing}
                />
              </div>
              <button
                type="submit"
                disabled={!commentText.trim() || isAnalyzing}
                className="bg-brand-orange text-white px-4 sm:px-5 rounded-xl sm:rounded-2xl hover:bg-orange-600 disabled:opacity-40 transition-all shadow-lg shadow-orange-100 flex items-center justify-center active:scale-95 min-w-[44px] sm:min-w-[50px] min-h-[44px]"
              >
                {isAnalyzing ? <Loader2 size={16} className="sm:w-5 sm:h-5 animate-spin" /> : <Send size={16} className="sm:w-5 sm:h-5" />}
              </button>
            </form>

            {/* Footer Actions */}
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex gap-1.5 sm:gap-2">
                <button
                  onClick={onToggleLike}
                  className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all border flex items-center gap-1.5 sm:gap-2 active:scale-90 min-h-[44px] ${post.isLiked ? 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900' : 'text-gray-400 border-gray-100 dark:border-gray-800 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                >
                  <Heart size={16} className="sm:w-5 sm:h-5" fill={post.isLiked ? "currentColor" : "none"} strokeWidth={post.isLiked ? 0 : 2} />
                  {post.likes > 0 && <span className="text-[10px] sm:text-xs font-black">{post.likes}</span>}
                </button>
                <button className="p-2.5 sm:p-3.5 text-gray-400 border border-gray-100 dark:border-gray-800 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl sm:rounded-2xl transition-all active:scale-90 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <Share2 size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>
              <button
                onClick={onStartCooking}
                className="flex-1 bg-brand-orange hover:bg-orange-600 text-white font-black py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-xl shadow-orange-100 active:scale-95 text-xs sm:text-sm min-h-[44px]"
              >
                <Play size={14} className="sm:w-[18px] sm:h-[18px]" fill="currentColor" /> Start Cooking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RecipeDetailModal;
