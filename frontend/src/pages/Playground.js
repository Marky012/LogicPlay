import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Playground = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-surface p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold text-primary">LogicPlay Playground</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, <span className="font-semibold text-secondary">{user.username}</span></span>
          <button onClick={logout} className="btn-secondary text-sm">Logout</button>
        </div>
      </header>
      
      <main className="flex-1 flex p-4 gap-4 bg-background">
        <div className="w-64 bg-surface rounded-lg shadow-lg p-4">
          <h2 className="text-xl font-bold mb-4">Toolbar</h2>
          <p className="text-gray-400 text-sm">Circuit components will go here...</p>
        </div>
        
        <div className="flex-1 bg-gray-900 rounded-lg shadow-inner flex items-center justify-center border-2 border-gray-700 relative overflow-hidden">
          <p className="text-gray-500">Circuit Canvas Area</p>
        </div>
        
        <div className="w-80 bg-surface rounded-lg shadow-lg p-4 flex flex-col gap-4">
           <h2 className="text-xl font-bold">Properties</h2>
           <div className="flex-1 p-4 bg-gray-800 rounded">
             <p className="text-gray-400 text-sm text-center">Select an element to view properties</p>
           </div>
           <button className="btn-primary w-full">Grade Circuit</button>
           <button className="btn-secondary w-full">Save Circuit</button>
        </div>
      </main>
    </div>
  );
};

export default Playground;
