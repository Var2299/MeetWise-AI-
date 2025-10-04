'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function HistoryPanel() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null); // track expanded card

  useEffect(() => {
    fetchSummaries();
  }, []);

  // Normalize one DB/API doc into the UI shape
  const normalize = (doc) => {
    const id = doc.id ?? (doc._id ? String(doc._id) : null);
    const createdAt =
      doc.createdAt ??
      doc.created_at ??
      (doc._id ? new Date().toISOString() : new Date().toISOString());
    const customPrompt = doc.customPrompt ?? doc.custom_prompt ?? '';
    const generatedSummary = doc.generatedSummary ?? doc.generated_summary ?? '';
    const editedSummary = doc.editedSummary ?? doc.edited_summary ?? null;

    return {
      id,
      createdAt,
      customPrompt,
      generatedSummary,
      editedSummary,
    };
  };

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/summaries');
      const data = await response.json();

      // accept either `summaries` or older `items`
      const raw = data?.summaries ?? data?.items ?? [];

      // map + normalize
      const normalized = Array.isArray(raw) ? raw.map(normalize) : [];

      setSummaries(normalized);
    } catch (err) {
      console.error('Error fetching summaries:', err);
      setError('Failed to load summaries');
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this summary?')) return;

    try {
      const response = await fetch(`/api/summaries/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSummaries((prev) => prev.filter((s) => s.id !== id));
        if (expandedId === id) setExpandedId(null);
      } else {
        console.error('Delete failed:', await response.text());
      }
    } catch (err) {
      console.error('Error deleting summary:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Summary History</h2>

      {summaries.length === 0 ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-600">
          <svg
            className="w-12 h-12 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>No summaries yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {summaries.map((summary) => (
            <div
              key={summary.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => setExpandedId(expandedId === summary.id ? null : summary.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {formatDate(summary.createdAt)}
                  </p>

                  {/* ------------------------
                      SHOW FULL PROMPT HERE
                      - allow wrapping and preserve newlines
                      - limit visual height and enable scroll for very long prompts
                      ------------------------ */}
                  <div className="text-sm text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap max-h-16 overflow-y-auto">
                    {summary.customPrompt || 'No prompt'}
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(summary.id, e)}
                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Expanded full summary */}
              {expandedId === summary.id ? (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {summary.editedSummary || summary.generatedSummary}
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {truncateText(summary.editedSummary || summary.generatedSummary, 120)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
