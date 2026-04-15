import React, { useState, useEffect } from 'react';
import { getChallenges } from '../utils/api';

const DIFFICULTY = {
  1: { label: 'Beginner',     color: '#39ff14', stars: 1 },
  2: { label: 'Intermediate', color: '#00d4ff', stars: 2 },
  3: { label: 'Advanced',     color: '#bf5fff', stars: 3 },
  4: { label: 'Expert',       color: '#f59e0b', stars: 4 },
};

const getDifficulty = (points) => {
  if (points <= 20)  return DIFFICULTY[1];
  if (points <= 50)  return DIFFICULTY[2];
  if (points <= 100) return DIFFICULTY[3];
  return DIFFICULTY[4];
};

const Stars = ({ count, color }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4].map(i => (
      <span key={i} className="text-[11px]" style={{ color: i <= count ? color : 'var(--c-border)' }}>★</span>
    ))}
  </div>
);

const FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

const ChallengeList = ({ onSelectChallenge, selectedChallengeId }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('All');
  const [expanded, setExpanded]     = useState(null);

  useEffect(() => {
    getChallenges()
      .then(data => setChallenges(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All'
    ? challenges
    : challenges.filter(c => getDifficulty(c.points_reward).label === filter);

  if (loading) return (
    <div className="flex items-center gap-2 text-xs p-3" style={{ color: 'var(--c-text-muted)' }}>
      <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/>
      </svg>
      Loading challenges…
    </div>
  );

  return (
    <div className="flex flex-col gap-2" style={{ minWidth: '200px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--neon-blue)' }}>
          Challenges
        </h2>
        <span className="badge-chip text-[10px]"
              style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)', color: 'var(--neon-blue)' }}>
          {challenges.length}
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1">
        {FILTERS.map(f => (
          <button key={f}
                  onClick={() => setFilter(f)}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all duration-150"
                  style={{
                    background: filter === f ? 'color-mix(in srgb, var(--neon-blue), transparent 85%)' : 'var(--c-surface-2)',
                    border: `1px solid ${filter === f ? 'color-mix(in srgb, var(--neon-blue), transparent 60%)' : 'var(--c-border-dim)'}`,
                    color: filter === f ? 'var(--neon-blue)' : 'var(--c-text-muted)',
                  }}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-1.5 pr-0.5">
        {filtered.length === 0 ? (
          <p className="text-xs italic p-2" style={{ color: 'var(--c-text-muted)' }}>No challenges in this category.</p>
        ) : (
          filtered.map(c => {
            const diff = getDifficulty(c.points_reward);
            const isSelected = selectedChallengeId === c.id;
            const isExpanded = expanded === c.id;

            return (
              <div key={c.id}
                   className="rounded-xl overflow-hidden transition-all duration-200"
                   style={{
                     background: isSelected ? 'color-mix(in srgb, var(--neon-blue), transparent 93%)' : 'var(--c-surface-2)',
                     border: `1px solid ${isSelected ? 'color-mix(in srgb, var(--neon-blue), transparent 60%)' : 'var(--c-border-dim)'}`,
                   }}>

                {/* Challenge item header */}
                <div className="flex items-start gap-2 p-2.5 cursor-pointer transition-colors"
                     onClick={() => {
                       onSelectChallenge(c);
                       setExpanded(isExpanded ? null : c.id);
                     }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="text-xs font-bold truncate" style={{ color: 'var(--c-text)' }}>{c.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stars count={diff.stars} color={diff.color} />
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: `${diff.color}18`, color: diff.color }}>
                        +{c.points_reward} XP
                      </span>
                    </div>
                  </div>
                  <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: 'var(--c-text-muted)' }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-2.5 pb-2.5 animate-slide-up">
                    <div className="h-px mb-2" style={{ background: 'rgba(0,212,255,0.1)' }} />
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>{c.description}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: `${diff.color}15`, color: diff.color, border: `1px solid ${diff.color}30` }}>
                        {diff.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChallengeList;
