import { useState } from 'react';

const MessageInput = ({ onSendMessage, disabled, placeholder, isStreaming, onStopStreaming }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700">
              <button 
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                disabled={disabled}
              >
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </button>
              
              <button 
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                disabled={disabled}
              >
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/>
                </svg>
              </button>
              
              {/* Stop Streaming Button */}
              {isStreaming && onStopStreaming && (
                <button 
                  type="button"
                  onClick={onStopStreaming}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  title="Stop streaming"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/>
                  </svg>
                </button>
              )}
            </div>
            
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="w-full p-4 bg-transparent border-0 focus:ring-0 dark:text-white resize-none focus:outline-none disabled:opacity-50" 
              rows="3" 
              placeholder={placeholder || "Type your message..."}
            />
          </div>
        </form>
      </div>
    </div>
  );
};


export default MessageInput;
