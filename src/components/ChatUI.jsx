import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import QueryUI from './QueryUI';
import { useConversationMessages, useSendMessage, useCreateConversation } from '../hooks/useConversation';

const ChatUI = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isConversation, setIsConversation] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);
  const [isNewConversation, setIsNewConversation] = useState(false);

  // API hooks - only call when it's a new conversation being opened
  const shouldFetchMessages = selectedConversation && isNewConversation;
  
  const { 
    messages: apiMessages, 
    loading: messagesLoading
  } = useConversationMessages(shouldFetchMessages ? selectedConversation.id : null);
  
  const { sendMessage, loading: sendingMessage } = useSendMessage();
  const { createConversation } = useCreateConversation();

  // Effect to handle messages when a new conversation is opened
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
  }, [selectedConversation, isNewConversation, apiMessages, messagesLoading]);

  // Effect to reset local messages when conversation changes
  useEffect(() => {
    if (!selectedConversation) {
      setLocalMessages([]);
      setIsNewConversation(false);
    }
  }, [selectedConversation]);

  // Handle mode toggle between Query and Conversation
  const handleToggle = (mode) => {
    const isConversationMode = mode === 'Conversation';
    setIsConversation(isConversationMode);
    
    // Clear selected conversation when switching to Query mode
    if (!isConversationMode) {
      setSelectedConversation(null);
      setLocalMessages([]);
      setIsNewConversation(false);
    }
  };

  // Handle conversation selection from sidebar
  const handleSelectConversation = (conversation) => {
    // If selecting a different conversation, mark as new to fetch messages
    const isDifferentConversation = selectedConversation?.id !== conversation.id;
    
    setSelectedConversation(conversation);
    setIsNewConversation(isDifferentConversation);
    
    // If it's a different conversation, clear local messages
    if (isDifferentConversation) {
      setLocalMessages([]);
    }
    
    // Auto-switch to conversation mode if not already
    if (!isConversation) {
      setIsConversation(true);
    }
  };

  // Handle creating new conversation
  const handleNewConversation = async (firstQuery) => {
    try {
      const newConversation = await createConversation(firstQuery);
      setSelectedConversation(newConversation);
      setIsConversation(true);
      setIsNewConversation(false); // New conversations start empty
      setLocalMessages([]); // Start with empty messages for new conversation
      return newConversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  };

  // Handle sending message in conversation
  const handleSendMessage = async (content) => {
    if (!selectedConversation) {
      // Create new conversation if none selected
      try {
        const newConversation = await handleNewConversation(content);
        
        // Add the first message to local state immediately
        const userMessage = {
          id: Date.now(),
          sender: 'You',
          content: content,
          isUser: true,
          created_at: new Date()
        };
        setLocalMessages([userMessage]);
        const response = await sendMessage(newConversation.id, content);
        const aiMessage = {
          id: Date.now() + 1,
          sender: 'BIRRGPT',
          content: response.assistant_response,
          isUser: false,
          created_at: new Date()
        };
        
        setLocalMessages(prev => [...prev, aiMessage]);
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

    try {
      // Send message to API
      const response = await sendMessage(selectedConversation.id, content);
      
      // Add AI response to local messages
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'BIRRGPT',
        content: response.assistant_response,
        isUser: false,
        created_at: new Date()
      };
      
      setLocalMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Remove the optimistically added user message on error
      setLocalMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      
      // Optionally show error message
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

  // Handle clearing selected conversation
  const handleClearConversation = () => {
    setSelectedConversation(null);
    setLocalMessages([]);
    setIsNewConversation(false);
  };

  // Determine which messages to display
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

      {/* Main Content */}
      {isConversation ? (
        <main className="flex-1 flex flex-col">
          {/* Chat Header with Conversation Info */}
          <ChatHeader 
            onMenuClick={() => setSidebarOpen(true)}
            conversation={selectedConversation}
            onClearConversation={handleClearConversation}
          />
          
          {selectedConversation ? (
            <>
              {/* Messages List */}
              <MessageList 
                messages={displayMessages}
                loading={isLoadingMessages}
                conversationId={selectedConversation.id}
              />
              
              {/* Message Input */}
              <MessageInput 
                onSendMessage={handleSendMessage}
                disabled={sendingMessage || isLoadingMessages}
                placeholder={
                  sendingMessage 
                    ? "Sending message..." 
                    : isLoadingMessages
                    ? "Loading messages..."
                    : "Type your message..."
                }
              />
            </>
          ) : (
            /* No Conversation Selected */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <p className="text-lg mb-2">Select a conversation to start chatting</p>
                <p className="text-sm">Choose from your conversations in the sidebar, or create a new one</p>
              </div>
            </div>
          )}
        </main>
      ) : (
        /* Query Mode */
        <main className="flex-1 flex flex-col">
          <QueryUI />
        </main>
      )}
    </div>
  );
};

export default ChatUI;
