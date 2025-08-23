import React, { useState } from 'react';
import { useMutation } from '../hooks/useAPI';
import { queryAPI } from '../services/apiEndpoints';

const QueryUI = () => {
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use the mutation hook for API calls
  const { mutate: runQuery } = useMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userQuery = query;
    setQuery('');
    setIsLoading(true);

    // Add user query to responses
    const newResponse = {
      id: Date.now(),
      query: userQuery,
      response: null,
      timestamp: new Date()
    };
    setResponses(prev => [...prev, newResponse]);

    try {
      // Replace simulateAPICall with actual API call
      const response = await simulateAPICall(userQuery);
      
      setResponses(prev => 
        prev.map(item => 
          item.id === newResponse.id 
            ? { ...item, response }
            : item
        )
      );
    } catch (error) {
        console.log("this is the error : ", error);
      setResponses(prev => 
        prev.map(item => 
          item.id === newResponse.id 
            ? { ...item, response: 'Error: Failed to get response' }
            : item
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAPICall = async (query) => {
    // Replace simulation with actual API call to your FastAPI backend
    const result = await runQuery(() => queryAPI.runQuery(query));
    return result.result;
  };

  return (
    <div className="flex flex-col w-full h-full p-6">
      {/* Query Input Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold dark:text-white mb-4">Ask a Question</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your question here... (Press Enter to submit, Shift+Enter for new line)"
              className="w-full p-4 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white resize-none"
              rows="4"
            />
            
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Responses Section */}
      <div className="flex-1 overflow-auto space-y-6">
        {responses.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p>Ask your first question to get started</p>
          </div>
        )}

        {responses.map((item) => (
          <div key={item.id} className="space-y-4">
            {/* User Query */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-primary">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium dark:text-white mb-1">Your Question</div>
                  <div className="text-gray-700 dark:text-gray-300">{item.query}</div>
                </div>
              </div>
            </div>

            {/* AI Response */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium dark:text-white mb-2">AI Response</div>
                  {item.response ? (
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {item.response}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      <span>Generating response...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator for new query */}
        {isLoading && responses.length > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
              <span>Processing your question...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryUI;
