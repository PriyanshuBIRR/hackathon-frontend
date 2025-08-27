import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import QueryUI from '../components/QueryUI';
import { useConversationMessages, useCreateConversation } from '../hooks/useConversation';
import api from '../services/api';

const ChatUI = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isConversation, setIsConversation] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);
  const [isNewConversation, setIsNewConversation] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const shouldFetchMessages = selectedConversation && isNewConversation;

  const { messages: apiMessages, loading: messagesLoading } =
    useConversationMessages(shouldFetchMessages ? selectedConversation.id : null);

  const { createConversation } = useCreateConversation();

  // Load messages from API into local state
  useEffect(() => {
    if (selectedConversation && apiMessages && !messagesLoading) {
      const messages = apiMessages.map((message) => ({
        ...message,
        sender: message.role === 'user' ? 'You' : 'Fynexion',
        isUser: message.role === 'user',
      }));
      setLocalMessages(messages);
      setIsNewConversation(false);
    }

    if (!selectedConversation && isNewConversation) {
      setLocalMessages([]);
      setIsNewConversation(false);
    }
  }, [selectedConversation, apiMessages, messagesLoading, isNewConversation]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const handleToggle = (mode) => {
    const isConversationMode = mode === 'Conversation';
    setIsConversation(isConversationMode);

    if (!isConversationMode) {
      setSelectedConversation(null);
      setLocalMessages([]);
      setIsNewConversation(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    const isDifferentConversation = selectedConversation?.id !== conversation.id;
    setSelectedConversation(conversation);
    setIsNewConversation(isDifferentConversation);
    if (isDifferentConversation) setLocalMessages([]);
    if (!isConversation) setIsConversation(true);
  };

  const handleNewConversation = async (firstQuery) => {
    try {
      const newConversation = await createConversation(firstQuery);
      setSelectedConversation(newConversation);
      setIsConversation(true);
      setIsNewConversation(false);
      setLocalMessages([]);
      return newConversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  };

  const handleSendMessage = async (content) => {
    let conversation = selectedConversation;
    if (!conversation) {
      conversation = await handleNewConversation(content);
    }

    const userMessage = {
      id: Date.now(),
      sender: 'You',
      isUser: true,
      content,
      created_at: new Date(),
    };
    setLocalMessages((prev) => [...prev, userMessage]);

    const aiMessage = {
      id: Date.now() + 1,
      sender: 'Fynexion',
      content: '',
      isUser: false,
      created_at: new Date(),
      isStreaming: true,
    };
    setLocalMessages((prev) => [...prev, aiMessage]);

    abortControllerRef.current = new AbortController();
    let accumulatedResponse = '';
    setIsStreaming(true);
    setIsLoading(true);

    try {
      await fetchEventSource(`${api.defaults.baseURL}/conversations/${conversation.id}/messages/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({ query: content }),
        signal: abortControllerRef.current.signal,

        onmessage(event) {
          if (['[DONE]', '[COMPLETE]', 'done'].includes(event.data)) {
            setLocalMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessage.id ? { ...msg, isStreaming: false } : msg
              )
            );
            setIsStreaming(false);
            return;
          }

          let chunk = event.data || '\n';
          accumulatedResponse += chunk;

          setLocalMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessage.id ? { ...msg, content: accumulatedResponse } : msg
            )
          );
        },

        onclose() {
          setIsStreaming(false);
          setLocalMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessage.id ? { ...msg, isStreaming: false } : msg
            )
          );
        },

        onerror(err) {
          console.error('Stream error:', err);
          if (err.name === 'AbortError') return;
          setLocalMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessage.id
                ? {
                    ...msg,
                    content:
                      accumulatedResponse ||
                      `Error: ${err.message || 'Streaming failed'}`,
                    isStreaming: false,
                    isError: true,
                  }
                : msg
            )
          );
          setIsStreaming(false);
          throw err;
        },
      });
    } catch (error) {
      console.error('Send error:', error);
      setLocalMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessage.id
            ? {
                ...msg,
                content: `Error: ${error.message || 'Failed to send message'}`,
                isStreaming: false,
                isError: true,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current && isStreaming) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setIsLoading(false);

      setLocalMessages((prev) =>
        prev.map((msg) =>
          msg.isStreaming
            ? {
                ...msg,
                content: msg.content + '\n\n[Response stopped by user]',
                isStreaming: false,
              }
            : msg
        )
      );
    }
  };

  const handleClearConversation = () => {
    setSelectedConversation(null);
    setLocalMessages([]);
    setIsNewConversation(false);
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        handleToggle={handleToggle}
        isConversation={isConversation}
        onSelectConversation={handleSelectConversation}
        selectedConversationId={selectedConversation?.id}
      />
      <main className="flex-1 flex flex-col">
        <ChatHeader
          onMenuClick={() => setSidebarOpen(true)}
          conversation={isConversation ? selectedConversation : { title: 'Ask a Question' }}
          onClearConversation={handleClearConversation}
        />

        {isConversation ? (
          selectedConversation ? (
            <>
              <MessageList
                messages={localMessages}
                loading={messagesLoading && isNewConversation}
                conversationId={selectedConversation.id}
              />
              <div ref={messagesEndRef} />

              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={isLoading || isStreaming}
                placeholder={
                  isStreaming
                    ? 'AI is responding...'
                    : isLoading
                    ? 'Loading messages...'
                    : 'Type your message...'
                }
                isStreaming={isStreaming}
                onStopStreaming={handleStopStreaming}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-lg mb-2">Select a conversation to start chatting</p>
                <p className="text-sm">
                  Choose from your conversations in the sidebar, or create a new one
                </p>
              </div>
            </div>
          )
        ) : (
          <main className="flex-1 flex flex-col overflow-hidden">
            <QueryUI />
          </main>
        )}
      </main>
    </div>
  );
};

export default ChatUI;
