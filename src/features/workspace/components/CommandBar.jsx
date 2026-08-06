import React, { useState, useEffect } from 'react';

export const CommandBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Handle Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/5 border border-gray-100">
        
        {/* Input */}
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            autoFocus
            placeholder="Search patients, bookings, or type a command..."
            className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:block font-sans text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">ESC</kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2">
          
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 tracking-wider">
            QUICK ACTIONS
          </div>
          
          <ul className="space-y-1 mb-4">
            <li>
              <button className="w-full flex items-center px-3 py-3 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-black transition-colors focus:bg-gray-50 focus:outline-none">
                <span className="w-6 h-6 mr-3 flex items-center justify-center bg-blue-50 text-blue-600 rounded-md">
                  +
                </span>
                Start New Session
              </button>
            </li>
            <li>
              <button className="w-full flex items-center px-3 py-3 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-black transition-colors focus:bg-gray-50 focus:outline-none">
                <span className="w-6 h-6 mr-3 flex items-center justify-center bg-gray-100 text-gray-600 rounded-md">
                  📝
                </span>
                Create Clinical Note
              </button>
            </li>
          </ul>

        </div>
      </div>
    </div>
  );
};
