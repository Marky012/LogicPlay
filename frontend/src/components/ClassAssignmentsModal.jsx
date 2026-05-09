import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssignments, dismissAssignment } from '../utils/api';

const formatDate = (dt) => {
  if (!dt) return null;
  const d = new Date(dt);
  const now = new Date();
  const isLate = d < now;
  return { text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), isLate };
};

const ClassAssignmentsModal = ({ isOpen, classData, studentUsername, onCancel }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen || !classData || !studentUsername) return;
    setLoading(true);
    getAssignments(studentUsername)
      .then((data) => {
        // Filter by classroom
        const filtered = data.filter(a => a.classroom_id === classData.id);
        setAssignments(filtered);
      })
      .catch((err) => console.error("Failed to load class assignments", err))
      .finally(() => setLoading(false));
  }, [isOpen, classData, studentUsername]);

  if (!isOpen || !classData) return null;

  const handleStartAssignment = (a) => {
    navigate('/playground', { state: { loadAssignment: a } });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ background: 'var(--c-bg-glass)', backdropFilter: 'blur(10px)' }}>
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 flex flex-col gap-5 animate-slide-up relative"
           style={{ border: '1px solid var(--c-border-dim)', background: 'var(--c-surface)' }}>
           
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black" style={{ color: 'var(--c-text)' }}>{classData.name} Assignments</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>Select an assignment to start answering</p>
          </div>
          <button onClick={onCancel} className="transition-colors p-1 absolute top-4 right-4" style={{ color: 'var(--c-text-muted)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="var(--neon-blue)" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/>
            </svg>
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center text-center py-10 px-4 animate-fade-in">
            <div className="text-3xl mb-3 opacity-30">📚</div>
            <p className="text-sm font-bold" style={{ color: 'var(--c-text)' }}>No assignments posted yet</p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
              Check back later!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1 hidden-scrollbar">
            {assignments.map(a => {
              const due = formatDate(a.due_date);
              return (
                <div key={a.id} className="p-4 rounded-xl transition-all duration-200 flex flex-col gap-2 relative group/card"
                     style={{
                       background: 'var(--c-surface-2)',
                       border: '1px solid var(--c-border-dim)',
                     }}>
                  {/* Dismiss Button */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (window.confirm(`Hide "${a.title}" from your list?`)) {
                        try {
                          await dismissAssignment(a.id, studentUsername);
                          setAssignments(prev => prev.filter(item => item.id !== a.id));
                        } catch (err) {
                          alert("Failed to hide assignment");
                        }
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover/card:opacity-100 transition-all hover:bg-red-500/10 text-red-500/50 hover:text-red-500"
                    title="Remove from list"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-sm leading-tight" style={{ color: 'var(--c-text)' }}>{a.title}</p>
                    <span className="text-[10px] font-bold" style={{ color: 'var(--neon-amber)' }}>+{a.points_reward} XP</span>
                  </div>
                  {a.description && <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>{a.description}</p>}
                  
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {due && (
                      <span className="text-[10px] font-bold" style={{ color: due.isLate ? 'var(--neon-red)' : 'var(--neon-green)' }}>
                        {due.isLate ? '⚠ Was due ' : '📅 Due '}{due.text}
                      </span>
                    )}
                    {a.has_submitted && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(57,255,20,0.1)', color: 'var(--neon-green)', border: '1px solid rgba(57,255,20,0.3)' }}>
                        ✓ Already Submitted
                      </span>
                    )}
                  </div>
                  
                  {!a.has_submitted && (
                    <button 
                      onClick={() => handleStartAssignment(a)}
                      className="mt-2 w-full py-2.5 rounded-lg text-xs font-black transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                      style={{ 
                        background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', 
                        color: 'white', 
                        boxShadow: 'var(--glow-blue)' 
                      }}
                    >
                      Answer Assignment
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default ClassAssignmentsModal;
