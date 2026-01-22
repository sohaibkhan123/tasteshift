
import React, { useState } from 'react';
import { Image as ImageIcon, Video, X, ChefHat, Link as LinkIcon } from 'lucide-react';

interface CreatePostProps {
  onCancel: () => void;
  onShareStory?: (mediaUrl: string) => void;
  onSharePost?: (postData: any) => void;
}

const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const CreatePost: React.FC<CreatePostProps> = ({ onCancel, onShareStory, onSharePost }) => {
  const [activeTab, setActiveTab] = useState<'recipe' | 'story'>('recipe');
  const [mediaMode, setMediaMode] = useState<'upload' | 'youtube'>('upload');
  const [preview, setPreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  // Recipe State
  const [recipeTitle, setRecipeTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleYoutubeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      setYoutubeUrl(url);
      const id = getYouTubeId(url);
      if (id) {
          setPreview(`https://img.youtube.com/vi/${id}/mqdefault.jpg`);
          setMimeType('video/youtube');
      } else {
          setPreview(null);
          setMimeType('');
      }
  };

  const handleShare = () => {
    if (!preview && mediaMode === 'upload') return;
    if (mediaMode === 'youtube' && !youtubeUrl) return;

    let finalContentUrl = preview;
    let type = 'recipe';

    if (mediaMode === 'youtube') {
        finalContentUrl = youtubeUrl;
        type = 'video';
    } else if (mimeType.startsWith('video')) {
        type = 'video';
    }

    if (activeTab === 'story' && onShareStory && finalContentUrl) {
      onShareStory(finalContentUrl);
    } else if (onSharePost && finalContentUrl) {
      
      const postData: any = {
        type,
        contentUrl: finalContentUrl,
        caption: description
      };

      if (activeTab === 'recipe') {
        postData.recipe = {
            title: recipeTitle,
            description: description,
            ingredients: ingredients.split('\n').filter(i => i.trim()),
            instructions: instructions.split('\n').filter(i => i.trim()),
            nutrition: { calories: Math.floor(Math.random() * 500) + 100, protein: '15g', carbs: '30g', fat: '10g' }, // Defaults for demo
            cookingTime: parseInt(cookingTime) || 30,
            difficulty,
            tags: ['Homemade', difficulty]
        };
      }
      
      onSharePost(postData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-bold flex items-center gap-2">
            <ChefHat className="text-brand-orange" />
            Create New
         </h2>
         <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
      </div>

      <div className="flex border-b mb-6">
        <button 
          onClick={() => setActiveTab('recipe')}
          className={`flex-1 pb-3 text-sm font-semibold transition-colors ${activeTab === 'recipe' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-gray-500'}`}
        >
          New Recipe
        </button>
        <button 
          onClick={() => setActiveTab('story')}
          className={`flex-1 pb-3 text-sm font-semibold transition-colors ${activeTab === 'story' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-gray-500'}`}
        >
          Add Story
        </button>
      </div>

      <div className="space-y-4">
        {/* Media Selector Switch */}
        <div className="flex gap-2 mb-2 bg-gray-100 p-1 rounded-lg">
            <button 
                onClick={() => { setMediaMode('upload'); setPreview(null); setYoutubeUrl(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mediaMode === 'upload' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
                Upload File
            </button>
            <button 
                onClick={() => { setMediaMode('youtube'); setPreview(null); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mediaMode === 'youtube' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
            >
                YouTube URL
            </button>
        </div>

        {/* Media Input Area */}
        {mediaMode === 'youtube' ? (
            <div className="space-y-3">
                 <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        value={youtubeUrl}
                        onChange={handleYoutubeChange}
                        placeholder="Paste YouTube Link (e.g., https://youtu.be/...)" 
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-orange outline-none bg-gray-50 text-sm"
                    />
                 </div>
                 {preview && (
                     <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-gray-100">
                         <img src={preview} alt="YouTube Preview" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                             <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                                 <Video className="text-white" size={24} fill="currentColor" />
                             </div>
                         </div>
                     </div>
                 )}
            </div>
        ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 cursor-pointer relative hover:bg-gray-100 transition min-h-[200px]">
              {preview ? (
                <>
                  {mimeType.startsWith('video') ? (
                      <video src={preview} controls className="max-h-64 rounded shadow-md object-contain" />
                  ) : (
                      <img src={preview} alt="Preview" className="max-h-64 rounded shadow-md object-contain" />
                  )}
                  <button onClick={() => setPreview(null)} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50 hover:text-red-500 transition"><X size={16} /></button>
                </>
              ) : (
                <>
                  <div className="flex gap-4 mb-4 text-gray-400">
                     <ImageIcon size={32} />
                     <Video size={32} />
                  </div>
                  <p className="text-gray-500 font-medium text-center">Drag & Drop or Click to Upload</p>
                  <p className="text-xs text-gray-400 mt-1 text-center">Images, Videos up to 500MB</p>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*,video/*" />
                </>
              )}
            </div>
        )}

        {activeTab === 'recipe' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
             <input 
                type="text" 
                placeholder="Recipe Title" 
                value={recipeTitle}
                onChange={(e) => setRecipeTitle(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-orange outline-none font-bold" 
             />
             <textarea 
                placeholder="Description of your dish..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-orange outline-none h-20 resize-none text-sm"
             />
             <textarea 
                placeholder="Ingredients (one per line)" 
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-orange outline-none h-24 text-sm font-mono bg-gray-50" 
             />
             <textarea 
                placeholder="Cooking Instructions (one per line)" 
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-orange outline-none h-32 text-sm font-mono bg-gray-50" 
             />
             <div className="grid grid-cols-2 gap-4">
               <input 
                 type="number" 
                 placeholder="Time (mins)" 
                 value={cookingTime}
                 onChange={(e) => setCookingTime(e.target.value)}
                 className="p-3 border rounded-lg text-sm" 
               />
               <select 
                 value={difficulty}
                 onChange={(e) => setDifficulty(e.target.value)}
                 className="p-3 border rounded-lg text-sm"
               >
                 <option>Easy</option>
                 <option>Medium</option>
                 <option>Hard</option>
               </select>
             </div>
          </div>
        )}
        
        {activeTab === 'story' && (
           <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Story posts will be visible for 24 hours.
           </div>
        )}

        <div className="flex justify-end pt-4">
           <button 
             disabled={!preview}
             className="bg-brand-orange text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:shadow-none transform active:scale-95"
             onClick={handleShare}
           >
             {activeTab === 'story' ? 'Share Story' : 'Publish Recipe'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
