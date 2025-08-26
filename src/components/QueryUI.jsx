import { useState, useRef, useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
import api from '../services/api'

const QueryUI = () => {
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userQuery = query;
    setQuery('');
    setIsLoading(true);
    setIsStreaming(true);

    const newResponse = {
      id: Date.now(),
      query: userQuery,
      response: '',
      timestamp: new Date(),
      isStreaming: true
    };
    setResponses(prev => [...prev, newResponse]);

    // Create abort controller
    abortControllerRef.current = new AbortController();
    let accumulatedResponse = '';

    try {
      await fetchEventSource(`${api.defaults.baseURL}/stream/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ query: userQuery }),
        signal: abortControllerRef.current.signal,

        async onopen(response) {
          if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
            console.log('Stream connection established');
            return;
          } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw new FatalError();
          } else {
            throw new RetriableError();
          }
        },

        onmessage(event) {
          console.log('Received message:', event);

          if (event.data === '[DONE]' || event.data === 'done' || event.data === '[COMPLETE]') {
            console.log('Stream completed');
            setResponses(prev =>
              prev.map(item =>
                item.id === newResponse.id
                  ? { ...item, isStreaming: false }
                  : item
              )
            );
            return;
          }

          // if (!event.data || !event.data.trim()) {
          //   return;
          // }

          let content = event.data;
          if (content === '') content = '\n';
          accumulatedResponse += content;
          updateResponse(newResponse.id, accumulatedResponse);
          console.log("this is final : ", accumulatedResponse)
        },

        onclose() {
          console.log('Stream connection closed');
          setResponses(prev =>
            prev.map(item =>
              item.id === newResponse.id
                ? { ...item, isStreaming: false }
                : item
            )
          );
        },

        onerror(err) {
          console.error('Stream error:', err);

          if (err.name === 'AbortError') {
            return;
          }

          throw err;
        }
      });

    } catch (error) {
      console.error('Fetch error:', error);

      if (error.name !== 'AbortError') {
        setResponses(prev =>
          prev.map(item =>
            item.id === newResponse.id
              ? {
                ...item,
                response: accumulatedResponse || `Error: ${error.message || 'Failed to get response'}`,
                isStreaming: false,
                hasError: true
              }
              : item
          )
        );
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const updateResponse = (messageId, content) => {
    setResponses(prev =>
      prev.map(item =>
        item.id === messageId
          ? { ...item, response: content }
          : item
      )
    );
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current && isStreaming) {
      console.log('Stopping stream...');
      abortControllerRef.current.abort();
      setIsLoading(false);
      setIsStreaming(false);

      setResponses(prev =>
        prev.map(item =>
          item.isStreaming
            ? {
              ...item,
              response: item.response + '\n\n*[Response stopped by user]*',
              isStreaming: false
            }
            : item
        )
      );
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Input Form */}
      <div className="m-6 mb-8">
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
              className="w-full p-4 pr-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white resize-none"
              rows="4"
              disabled={isLoading}
            />

            <div className="absolute bottom-3 right-3 flex gap-2">
              {isStreaming && (
                <button
                  type="button"
                  onClick={handleStopStreaming}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  title="Stop streaming"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                  </svg>
                </button>
              )}

              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="p-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Responses */}
      <div className="flex-1 overflow-auto space-y-6">
        {responses.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h0.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Ask your first question to get started</p>
          </div>
        )}

        {responses.map((item) => (
          <div key={item.id} className="space-y-4 px-6 pb-8">
            {/* User Question */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-primary">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium dark:text-white mb-1">Your Question</div>
                  <div className="text-gray-700 dark:text-gray-300">{item.query}</div>
                </div>
              </div>
            </div>

            {/* AI Response */}
            <div className={`rounded-lg p-4 border ${item.hasError
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
              }`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.hasError ? 'bg-red-500' : 'bg-secondary'
                  }`}>
                  {item.hasError ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="font-medium dark:text-white">
                      {item.hasError ? 'Error Response' : 'AI Response'}
                    </div>
                    {item.isStreaming && (
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <span className="text-xs">Streaming...</span>
                      </div>
                    )}
                  </div>

                  {item.response ? (
                    <div className={`prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap break-all ${item.hasError ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      {/* <ReactMarkdown remarkPlugins={[remarkGfm]}> */}

                        <pre className='whitespace-pre-wrap break-all'>
                          {item.response}
                        </pre>
                      {/* </ReactMarkdown> */}

                      {item.isStreaming && (
                        <span className="inline-block w-2 h-5 bg-gray-400 dark:bg-gray-500 animate-pulse ml-1 align-text-bottom"></span>
                      )}
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

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

// Custom error classes for better error handling
class FatalError extends Error { }
class RetriableError extends Error { }

export default QueryUI;
