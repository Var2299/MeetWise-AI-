'use client';

import { useState,useRef } from 'react';
import SkeletonLoader from './SkeletonLoader';
import ShareModal from './ShareModal';
import Toast from './Toast';

export default function Workspace() {
  const [transcript, setTranscript] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toast, setToast] = useState(null);

  const [modelUsed, setModelUsed] = useState(null);
  const [serverError, setServerError] = useState(null);
  const fileInputRef = useRef(null); // ✅ define ref

  // Template options for quick-fill
  const TEMPLATES = {
    'detailed-summary': 'Provide a comprehensive summary including main topics discussed, decisions made, and follow-up actions.',
    'action-items-only': 'List action items only. For each action item include: task, owner, and due date (if available).',
    'key-points': 'Summarize the meeting in 5 concise key points with one-line descriptions each.',
    'execution-summary': 'Provide an execution-oriented summary: tasks, owners, blockers, and next steps for implementation.',
  };

  // control which template is selected in the dropdown ('custom' means user-typed)
  const [selectedTemplate, setSelectedTemplate] = useState('custom');

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTranscript(event.target?.result || '');
      };
      reader.readAsText(file);
    }
  };

  function handleTemplateChange(e) {
    const key = e.target.value;
    if (key === 'custom') {
      setSelectedTemplate('custom');
      // keep existing customPrompt (do not overwrite)
      return;
    }

    const templateText = TEMPLATES[key] || '';
    setCustomPrompt(templateText);
    setSelectedTemplate(key);
  }

  // if user manually types in the customPrompt textarea, switch select to 'custom'
  function handleCustomPromptChange(e) {
    setCustomPrompt(e.target.value);
    if (selectedTemplate !== 'custom') {
      setSelectedTemplate('custom');
    }
  }
   const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate = async () => {
    if (!transcript.trim() || !customPrompt.trim()) {
      setToast({ message: 'Please provide both transcript and custom prompt', type: 'error' });
      return;
    }

    setLoading(true);
    setServerError(null);
    setModelUsed(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, customPrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.error || 'Failed to generate summary';
        const details = data?.details ? `\n\nDetails: ${JSON.stringify(data.details, null, 2)}` : '';
        const fullMessage = `${message}${details}`;

        setToast({ message: message, type: 'error' });
        setServerError(data?.details || { message });
        throw new Error(fullMessage);
      }

      setGeneratedSummary(data.summary || '');
      setEditedSummary(data.summary || '');
      if (data.modelUsed) setModelUsed(data.modelUsed);
      setToast({ message: 'Summary generated successfully!', type: 'success' });

      await fetch('/api/summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          customPrompt,
          generatedSummary: data.summary,
          editedSummary: data.summary,
          modelUsed: data.modelUsed || null,
        }),
      });
    } catch (error) {
      console.error('Error:', error);
      if (!toast) {
        setToast({ message: error.message || 'Failed to generate summary', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (recipients, subject) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          summary: editedSummary || generatedSummary,
          subject,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setShowShareModal(false);
      setToast({ message: 'Summary shared successfully!', type: 'success' });
    } catch (error) {
      console.error('Error:', error);
      setToast({ message: error.message || 'Failed to share summary', type: 'error' });
    }
  };
return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transcript</h2>

            {/* File controls: hidden input + Upload label + explicit "Choose file" button */}
            <div className="flex items-center gap-2">
              {/* hidden file input (single source of truth) */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
                aria-hidden="true"
              />

              {/* Original styled label (keeps same look/behavior) */}
              <label
                onClick={openFileDialog}
                className="cursor-pointer px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm font-medium"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openFileDialog(); }}
              >
                Upload .txt
              </label>

              {/* new explicit button to open desktop file picker */}
              <button
                type="button"
                onClick={openFileDialog}
                className="px-3 py-2 bg-white dark:bg-gray-800 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                aria-label="Choose text file from desktop"
              >
                Choose file
              </button>
            </div>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your transcript here or upload a .txt file..."
            className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all resize-none"
          />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 transition-all">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Custom Instructions</h2>

            {/* Templates dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="template-select" className="sr-only">Quick Templates</label>
              <select
                id="template-select"
                value={selectedTemplate}
                onChange={handleTemplateChange}
                className="px-3 py-2 border rounded bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="custom">Custom (type your own)</option>
                <option value="detailed-summary">Detailed Summary</option>
                <option value="action-items-only">Action Items Only</option>
                <option value="key-points">Key Points</option>
                <option value="execution-summary">Execution Summary</option>
              </select>
            </div>
          </div>

          <textarea
            value={customPrompt}
            onChange={handleCustomPromptChange}
            placeholder="e.g., Summarize in three bullet points, highlight all action items in bold, and list decisions separately."
            className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all resize-none"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !transcript.trim() || !customPrompt.trim()}
          className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
        >
          {loading ? 'Generating Summary...' : 'Generate Summary'}
        </button>

        {serverError && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm rounded">
            <strong className="text-red-700 dark:text-red-200">Server diagnostics:</strong>
            <pre className="whitespace-pre-wrap mt-2 text-xs text-red-600 dark:text-red-200">{JSON.stringify(serverError, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 transition-all flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Generated Summary</h2>
            {(editedSummary || generatedSummary) && (
              <div className="flex items-center gap-3">
                {modelUsed && (
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200 rounded">
                    model: {modelUsed}
                  </span>
                )}
                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-sm font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <SkeletonLoader />
          ) : (editedSummary || generatedSummary) ? (
            <textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              className="w-full flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all resize-none"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg">Your summary will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          summary={editedSummary || generatedSummary}
          onClose={() => setShowShareModal(false)}
          onShare={handleShare}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}