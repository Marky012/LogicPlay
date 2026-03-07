import React, { useState, useEffect } from 'react';
import { getChallenges } from '../utils/api';

const ChallengeList = ({ onSelectChallenge }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const data = await getChallenges();
        setChallenges(data);
      } catch (e) {
        console.error("Failed to load challenges");
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  if (loading) return <div className="text-gray-400 text-sm">Loading challenges...</div>;

  return (
    <div className="bg-surface rounded-lg shadow-lg p-4 flex flex-col gap-2 overflow-y-auto max-h-64 mt-4 border border-gray-700">
      <h2 className="text-xl font-bold border-b border-gray-700 pb-2 flex justify-between items-center">
         Practice Challenges
         <span className="bg-primary text-xs px-2 py-1 rounded-full">{challenges.length}</span>
      </h2>
      
      {challenges.length === 0 ? (
        <p className="text-gray-400 text-sm italic">No challenges available.</p>
      ) : (
        <ul className="flex flex-col gap-2 mt-2">
           {challenges.map(c => (
             <li 
                key={c.id} 
                className="bg-gray-800 p-3 rounded cursor-pointer hover:bg-gray-700 border border-transparent hover:border-gray-500 transition-colors group"
                onClick={() => onSelectChallenge(c)}
             >
                <div className="flex justify-between items-start mb-1">
                   <h3 className="font-bold text-white group-hover:text-primary transition-colors">{c.title}</h3>
                   <span className="text-xs font-bold text-secondary bg-gray-900 px-2 py-1 rounded">+{c.points_reward} pts</span>
                </div>
                <p className="text-sm text-gray-400">{c.description}</p>
             </li>
           ))}
        </ul>
      )}
    </div>
  );
};

export default ChallengeList;
