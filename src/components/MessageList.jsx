import React from 'react';

const MessageList = ({ messages }) => {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-6">
      {messages.map((message) => (
        <div key={message.id} className="flex gap-4 max-w-3xl mx-auto">
          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${message.isUser
              ? 'bg-gray-200 dark:bg-gray-700'
              : message.isError
                ? 'bg-red-500'
                : 'bg-primary'
            }`}>
            {!message.isUser && (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-medium dark:text-white">{message.sender}</div>
              {message.isStreaming && (
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-xs">Streaming...</span>
                </div>
              )}
            </div>
            <div className={`rounded-lg p-4 shadow-sm ${message.isError
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                : 'bg-white dark:bg-gray-800 dark:text-gray-200'
              }`}>
              {message.content ?
                <div className="whitespace-pre-wrap">
                  {message.content}
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-5 bg-gray-400 dark:bg-gray-500 animate-pulse ml-1 align-text-bottom"></span>
                  )}
                </div>
                :
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span>Generating response...</span>
                </div>
              }

            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
