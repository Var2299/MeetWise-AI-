'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Workspace from '@/components/Workspace';
import HistoryPanel from '@/components/HistoryPanel';

export default function Home() {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null);

  const handleSelectSummary = (summary) => {
    setSelectedSummary(summary);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {showHistory ? 'Summary History' : 'Workspace'}
          </h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium shadow-md hover:shadow-lg flex items-center gap-2"
          >
            {showHistory ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Workspace
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View History
              </>
            )}
          </button>
        </div>

        {showHistory ? (
          <div className="px-6 pb-6">
            <HistoryPanel onSelectSummary={handleSelectSummary} />
          </div>
        ) : (
          <Workspace key={selectedSummary?.id} initialSummary={selectedSummary} />
        )}
      </div>
    </div>
  );
}
