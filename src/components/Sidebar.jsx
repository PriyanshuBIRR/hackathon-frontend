import React, { useState } from 'react';
import ModeToggle from './Toggle';
import AddConversationModal from './AddConversationModal';
import { useConversations, useCreateConversation } from '../hooks/useConversation';

const Sidebar = ({ isOpen, onClose, handleToggle, isConversation, onSelectConversation, selectedConversationId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { conversations, loading, error, refetch } = useConversations(searchTerm);
  const { createConversation, loading: creating } = useCreateConversation();

  const handleCreateChat = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleCreateConversation = async (title) => {
    try {
      const newConversation = await createConversation(title);
      refetch();
      onSelectConversation && onSelectConversation(newConversation);
      return newConversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error; 
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleConversationClick = (conversation) => {
    onSelectConversation && onSelectConversation(conversation);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        w-72 bg-gray-50 dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700
        ${isOpen ? 'fixed inset-y-0 left-0 z-50 md:relative' : 'hidden md:flex flex-col'}
      `}>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold dark:text-white">BIRR GPT</h1>
        </div>

        <button
          onClick={handleCreateChat}
          disabled={creating}
          className="flex items-center gap-3 w-full px-3 py-2 mb-4 text-gray-700 dark:text-gray-200 
                     border border-gray-200 dark:border-gray-600 rounded-lg 
                     hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors 
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
          </svg>
          {creating ? 'Creating...' : 'New Chat'}
        </button>

        <div className="relative mb-6">
          <input 
            type="search" 
            placeholder="Search for chats..." 
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
              Chats
            </div>
            <span className="bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full text-xs">
              {conversations.length}
            </span>
          </div>

          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              Loading chats...
            </div>
          )}

          {error && (
            <div className="px-3 py-2 text-sm text-red-500">
              Error loading chats
            </div>
          )}

          {!loading && !error && conversations.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No chats found' : 'No chats yet. Create your first chat!'}
            </div>
          )}

          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => handleConversationClick(conversation)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors group relative ${
                selectedConversationId === conversation.id
                  ? 'bg-primary text-white bg-opacity-50'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {conversation.title}
                  </div>
                  <div className={`text-xs mt-1 ${
                    selectedConversationId === conversation.id
                      ? 'text-white/70'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {new Date(conversation.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Selection indicator */}
              {selectedConversationId === conversation.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <ModeToggle 
            onModeChange={handleToggle} 
            leftOption="Query" 
            rightOption="Conversation" 
            isConversation={isConversation} 
          />
        </div>
      </aside>

      {/* Add Conversation Modal */}
      <AddConversationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onCreate={handleCreateConversation}
      />
    </>
  );
};

export default Sidebar;
