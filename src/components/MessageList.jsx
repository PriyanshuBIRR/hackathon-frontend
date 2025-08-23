import React from 'react';

const MessageList = ({ messages }) => {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-6">
      {messages.map((message) => (
        <div key={message.id} className="flex gap-4 max-w-3xl mx-auto">
          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
            message.isUser 
              ? 'bg-gray-200 dark:bg-gray-700' 
              : 'bg-primary'
          }`}>
            {!message.isUser && (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            )}
          </div>
          <div className="flex-1">
            <div className="font-medium dark:text-white mb-1">{message.sender}</div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:text-gray-200">
              {message.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
