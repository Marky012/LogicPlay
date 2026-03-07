import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { register, getUser } from '../utils/api';

const Home = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      // First try to get the user
      await getUser(username);
      login(username);
      navigate('/playground');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // User not found, try to register
        try {
          await register(username);
          login(username);
          navigate('/playground');
        } catch (regErr) {
          setError('Failed to register user.');
        }
      } else {
        setError('An error occurred during login.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">LogicPlay</h1>
        <p className="text-center mb-6 text-gray-300">
          Learn digital logic through interactive gamified challenges!
        </p>
        
        {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="block mb-2 text-sm font-medium">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:ring-primary focus:border-primary"
              placeholder="Enter your username"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full mt-4">
            Start Playing
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
