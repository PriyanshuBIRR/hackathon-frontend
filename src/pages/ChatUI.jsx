import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import QueryUI from '../components/QueryUI';
import { useConversationMessages, useCreateConversation, useStreamingConversation } from '../hooks/useConversation';

const ChatUI = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isConversation, setIsConversation] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);
  const [isNewConversation, setIsNewConversation] = useState(false);

  const shouldFetchMessages = selectedConversation && isNewConversation;

  const {
    messages: apiMessages,
    loading: messagesLoading
  } = useConversationMessages(shouldFetchMessages ? selectedConversation.id : null);

  const { streamMessage, 
    stopStreaming, 
    loading: streamingLoading, 
    isStreaming: hookIsStreaming  } = useStreamingConversation();

  const { createConversation } = useCreateConversation();

  useEffect(() => {
    if (selectedConversation && apiMessages && !messagesLoading) {
      // Load API messages into local state for new conversation
      const messages = apiMessages.map((message) => {
        return {
          ...message,
          sender: message.role === 'user' ? 'You' : 'BIRRGPT',
          isUser: message.role === 'user'
        }
      })
      setLocalMessages(messages);
      setIsNewConversation(false); // Mark as no longer new
    }

    if (!selectedConversation && isNewConversation) {
      setLocalMessages([]);
      setIsNewConversation(false);
    }
  }, [selectedConversation, apiMessages, messagesLoading, isNewConversation]);

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
    if (isDifferentConversation) {
      setLocalMessages([]);
    }
    if (!isConversation) {
      setIsConversation(true);
    }
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
    if (!selectedConversation) {
      try {
        const newConversation = await handleNewConversation(content);
        const userMessage = {
          id: Date.now(),
          sender: 'You',
          content: content,
          isUser: true,
          created_at: new Date()
        };
        setLocalMessages([userMessage]);

        const aiMessage = {
          id: Date.now() + 1,
          sender: 'BIRRGPT',
          content: '',
          isUser: false,
          created_at: new Date(),
          isStreaming: true
        };
        setLocalMessages(prev => [...prev, aiMessage]);

        await streamMessage(
          newConversation.id,
          content,
          (chunk, fullResponse) => {
            setLocalMessages(prev => 
              prev.map(msg => 
                msg.id === aiMessage.id 
                  ? { ...msg, content: fullResponse }
                  : msg
              )
            );
          },
          (finalResponse) => {
            setLocalMessages(prev => 
              prev.map(msg => 
                msg.id === aiMessage.id 
                  ? { ...msg, content: finalResponse, isStreaming: false }
                  : msg
              )
            );
          },

          (errorMessage) => {
            setLocalMessages(prev => 
              prev.map(msg => 
                msg.id === aiMessage.id 
                  ? { 
                      ...msg, 
                      content: `Error: ${errorMessage}`, 
                      isStreaming: false,
                      isError: true
                    }
                  : msg
              )
            );
          }
        );
        return;
      } catch (error) {
        console.error('Failed to create conversation:', error);
        return;
      }
    }

    const userMessage = {
      id: Date.now(),
      sender: 'You',
      isUser: true,
      content: content,
      created_at: new Date()
    };

    setLocalMessages(prev => [...prev, userMessage]);

    const aiMessage = {
      id: Date.now() + 1,
      sender: 'BIRRGPT',
      content: '',
      isUser: false,
      created_at: new Date(),
      isStreaming: true
    };
    setLocalMessages(prev => [...prev, aiMessage]);

    try {
      await streamMessage(
        selectedConversation.id,
        content,
        (chunk, fullResponse) => {
          setLocalMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessage.id 
                ? { ...msg, content: fullResponse }
                : msg
            )
          );
        },
        (finalResponse) => {
          setLocalMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessage.id 
                ? { ...msg, content: finalResponse, isStreaming: false }
                : msg
            )
          );
        },
        (errorMessage) => {
          setLocalMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessage.id 
                ? { 
                    ...msg, 
                    content: `Error: ${errorMessage}`, 
                    isStreaming: false,
                    isError: true
                  }
                : msg
            )
          );
        }
      );

    } catch (error) {
      console.error('Failed to send message:', error);

      setLocalMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      
      const errorMessage = {
        id: Date.now() + 2,
        sender: 'system',
        isUser: false,
        content: 'Failed to send message. Please try again.',
        created_at: new Date(),
        isError: true
      };

      setLocalMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleStopStreaming = () => {
    stopStreaming();
    
    setLocalMessages(prev =>
      prev.map(msg =>
        msg.isStreaming
          ? { 
              ...msg, 
              content: msg.content + '\n\n[Response stopped by user]', 
              isStreaming: false 
            }
          : msg
      )
    );
  };

  const handleClearConversation = () => {
    setSelectedConversation(null);
    setLocalMessages([]);
    setIsNewConversation(false);
  };

  const displayMessages = localMessages;
  const isLoadingMessages = messagesLoading && isNewConversation;

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Sidebar */}
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
            conversation={isConversation ? selectedConversation : {"title" : "Ask a Question"}}
            onClearConversation={handleClearConversation}
          />
      {isConversation ? 
        
          selectedConversation ? (
            <>
              <MessageList
                messages={displayMessages}
                loading={isLoadingMessages}
                conversationId={selectedConversation.id}
              />

              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={isLoadingMessages || streamingLoading}
                placeholder={
                  streamingLoading || hookIsStreaming
                    ? "AI is responding..."
                    : isLoadingMessages
                    ? "Loading messages..."
                    : "Type your message..."
                }
                isStreaming={hookIsStreaming}
                onStopStreaming={handleStopStreaming}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg mb-2">Select a conversation to start chatting</p>
                <p className="text-sm">Choose from your conversations in the sidebar, or create a new one</p>
              </div>
            </div>
          )
          : (
            <main className="flex-1 flex flex-col">
          <QueryUI />
        </main>
      )}
      </main>
    </div>
  );
};

export default ChatUI;
