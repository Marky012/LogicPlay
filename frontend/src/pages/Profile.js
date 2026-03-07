import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUser, getCircuits } from '../utils/api';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [circuits, setCircuits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.username) {
        try {
          const data = await getUser(user.username);
          setProfileData(data);
          const userCircuits = await getCircuits(user.username);
          setCircuits(userCircuits);
        } catch (error) {
          console.error("Error fetching profile", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-xl">Loading profile...</div>;
  if (!user || !profileData) return <div className="p-8 text-center text-xl text-red-500">Could not load profile.</div>;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <header className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">Your Profile</h1>
            <Link to="/playground" className="btn-primary">Back to Playground</Link>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
             <div className="text-5xl font-bold text-primary mb-2">{profileData.level}</div>
             <div className="text-gray-400 uppercase tracking-wide text-sm">Current Level</div>
          </div>
          <div className="card text-center">
             <div className="text-5xl font-bold text-secondary mb-2">{profileData.points}</div>
             <div className="text-gray-400 uppercase tracking-wide text-sm">Total Points</div>
          </div>
          <div className="card text-center">
             <div className="text-5xl font-bold text-yellow-500 mb-2">{profileData.badges?.length || 0}</div>
             <div className="text-gray-400 uppercase tracking-wide text-sm">Badges Earned</div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Saved Circuits</h2>
          {circuits.length === 0 ? (
            <p className="text-gray-400 italic">No circuits saved yet. Start building!</p>
          ) : (
            <ul className="space-y-3">
               {circuits.map(c => (
                 <li key={c.id} className="bg-gray-800 p-3 rounded flex justify-between items-center">
                    <div>
                      <span className="font-semibold">{c.circuit_data?.name || `Circuit #${c.id}`}</span>
                      <span className="text-xs text-gray-500 ml-3">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-secondary font-bold">
                       Score: {c.score || 'N/A'}
                    </div>
                 </li>
               ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
