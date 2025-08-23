import React, { useState } from 'react';

const AddConversationModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      await onCreate(title.trim());
      setTitle(''); // Clear form
      onClose(); // Close modal
    } catch (error) {
      console.error('Failed to create conversation:', error);
      // Optionally show error message to user
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setTitle(''); // Clear form on close
    onClose();
  };

  // Handle ESC key press
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClose} // Close on backdrop click
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent backdrop close when clicking inside
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Conversation
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isCreating}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label 
              htmlFor="conversation-title" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Conversation Title
            </label>
            <input
              id="conversation-title"
              type="text"
              placeholder="Enter conversation title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed"
              autoFocus
              disabled={isCreating}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {title.length}/100 characters
            </p>
          </div>

          {/* Modal Footer - Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                         bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                         rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark 
                         rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center gap-2"
              disabled={isCreating || !title.trim()}
            >
              {isCreating && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddConversationModal;
