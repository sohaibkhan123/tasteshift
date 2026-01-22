import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Clock, Info } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeStoryViewProps {
  recipe: Recipe;
  onClose: () => void;
}

const RecipeStoryView: React.FC<RecipeStoryViewProps> = ({ recipe, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // If explicit steps exist use them, otherwise create pseudo-steps from instructions
  const steps = recipe.steps || recipe.instructions.map(inst => ({ text: inst, mediaUrl: null }));
  const totalSteps = steps.length;

  useEffect(() => {
    // Reset progress on step change
    setProgress(0);
    
    // Auto-advance logic (simulated for "1 min" request, mostly visual here unless configured)
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
           return 100; 
        }
        return old + 0.5; // Slow progress
      });
    }, 50);

    return () => clearInterval(timer);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      onClose(); // End of story
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black text-white flex flex-col">
      {/* Progress Bars */}
      <div className="flex gap-1 p-2 pt-4 absolute top-0 left-0 right-0 z-10">
        {steps.map((_, idx) => (
          <div key={idx} className="h-1 flex-1 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-white transition-all duration-100 ease-linear ${
                idx < currentStep ? 'w-full' : 
                idx === currentStep ? `w-[${progress}%]` : 'w-0'
              }`}
              style={{ width: idx < currentStep ? '100%' : idx === currentStep ? `${progress}%` : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Header Controls */}
      <div className="absolute top-8 left-0 right-0 p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
            <span className="font-bold text-sm truncate max-w-[150px]">{recipe.title}</span>
        </div>
        <button onClick={onClose} className="p-2 bg-black/20 rounded-full hover:bg-black/40 backdrop-blur-md">
            <X size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-900" onClick={handleNext}>
        {/* Click Zones */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-20" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
        <div className="absolute inset-y-0 right-0 w-1/3 z-20" onClick={(e) => { e.stopPropagation(); handleNext(); }} />

        {/* Media */}
        {steps[currentStep].mediaUrl ? (
             <img src={steps[currentStep].mediaUrl!} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Step" />
        ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-orange to-purple-900 opacity-80" />
        )}
        
        {/* Text Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-16 bg-gradient-to-t from-black via-black/80 to-transparent pt-32">
            <div className="flex items-center gap-2 mb-2 text-brand-orange font-bold uppercase tracking-wider text-sm">
                <span className="bg-brand-orange text-white px-2 py-0.5 rounded text-xs">Step {currentStep + 1}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
                {steps[currentStep].text}
            </h2>
            {currentStep === 0 && (
                <div className="flex gap-4 text-sm text-gray-300 mb-4">
                    <div className="flex items-center gap-1"><Clock size={16} /> {recipe.cookingTime}m</div>
                    <div className="flex items-center gap-1"><Info size={16} /> {recipe.difficulty}</div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RecipeStoryView;
