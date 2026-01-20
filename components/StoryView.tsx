import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Story } from '../types';

interface StoryViewProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
}

const StoryView: React.FC<StoryViewProps> = ({ stories, initialStoryIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (!currentStory) return;
    
    setProgress(0);
    const duration = 5000; // 5 seconds per story
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, stories.length]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setProgress(0); // Restart current story if it's the first one
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div className="relative w-full max-w-lg h-full md:h-[90vh] md:rounded-2xl overflow-hidden shadow-2xl bg-gray-900 flex flex-col">
        
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 p-2 flex gap-1 z-20">
          {stories.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-75 ease-linear"
                style={{ 
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 right-0 px-4 py-2 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <img src={currentStory.user?.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
            <div className="text-white">
              <p className="font-bold text-sm leading-none">{currentStory.user?.handle}</p>
              <p className="text-[10px] opacity-70">2h ago</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-white p-2 hover:bg-white/10 rounded-full"><MoreHorizontal size={20} /></button>
            <button onClick={onClose} className="text-white p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
          </div>
        </div>

        {/* Media Content */}
        <div className="flex-1 relative flex items-center justify-center cursor-pointer overflow-hidden">
          {/* Click areas for navigation */}
          <div className="absolute inset-y-0 left-0 w-1/4 z-30" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
          <div className="absolute inset-y-0 right-0 w-1/4 z-30" onClick={(e) => { e.stopPropagation(); handleNext(); }} />
          
          <img 
            src={currentStory.mediaUrl} 
            className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-300" 
            alt="Story content" 
          />
        </div>

        {/* Footer */}
        <div className="p-4 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 z-20">
          <input 
            type="text" 
            placeholder={`Reply to ${currentStory.user?.handle}...`} 
            className="flex-1 bg-transparent border border-white/30 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-white placeholder-white/50"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
};

export default StoryView;