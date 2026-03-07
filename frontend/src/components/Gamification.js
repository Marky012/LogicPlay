import React from 'react';

const Gamification = ({ points, level, badges }) => {
  const pointsToNextLevel = level * 100;
  const progressPercent = Math.min(100, Math.max(0, (points / pointsToNextLevel) * 100));

  return (
    <div className="flex items-center gap-6 bg-surface px-6 py-3 rounded-full shadow-md border border-gray-700">
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400 uppercase tracking-widest">Level</span>
        <span className="text-2xl font-bold text-primary leading-none">{level}</span>
      </div>
      
      <div className="flex flex-col w-32">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-300">{points} pts</span>
          <span className="text-gray-500">{pointsToNextLevel}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-secondary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      
      <div className="flex gap-2 items-center">
         {badges && badges.length > 0 ? (
             badges.map((badge, i) => (
               <div key={i} className="w-8 h-8 rounded-full bg-yellow-500 text-yellow-900 flex items-center justify-center font-bold text-xs" title={badge}>
                 {badge.charAt(0)}
               </div>
             ))
         ) : (
             <span className="text-xs text-gray-500 italic">No badges yet</span>
         )}
      </div>
    </div>
  );
};

export default Gamification;
