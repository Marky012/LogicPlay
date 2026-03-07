import React from 'react';

const OfflineBanner = ({ isOffline }) => {
  if (!isOffline) return null;

  return (
    <div className="bg-yellow-600 text-yellow-50 text-center py-2 px-4 shadow-md font-medium text-sm w-full sticky top-0 z-50 flex items-center justify-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.368 8.368zm1.415-1.414L6.524 5.11a6 6 0 018.368 8.368z" clipRule="evenodd" />
      </svg>
      You are currently working offline. Circuits will be saved locally and synced when you reconnect.
    </div>
  );
};

export default OfflineBanner;
