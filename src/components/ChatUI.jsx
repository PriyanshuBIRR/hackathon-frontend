import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import QueryUI from './QueryUI';

const ChatUI = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'You',
      content: 'Hey, can you explain how the model determines token usage and tracks interactions?',
      isUser: true,
      timestamp: new Date()
    },
    {
      id: 2,
      sender: 'BIRRGPT.io',
      content: 'Our model counts tokens in both input and output, including spaces and special characters. Each token corresponds roughly to one word, depending on the language and complexity of the sentence. For more detailed tracking of your interactions, we use timestamps and session IDs to ensure the most relevant responses.',
      isUser: false,
      timestamp: new Date(),
      tokenCount: 32
    }
  ]);

const [isConversation, setIsConversation] = useState(false);

const handleToggle = () => {
    setIsConversation(!isConversation);
  };


  const handleSendMessage = (content) => {
    const newMessage = {
      id: messages.length + 1,
      sender: 'You',
      content,
      isUser: true,
      timestamp: new Date()
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="flex h-full">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} handleToggle={handleToggle} isConversation={isConversation}/>
      {isConversation ? <main className="flex-1 flex flex-col">
        <ChatHeader onMenuClick={() => setSidebarOpen(true)} />
        <MessageList messages={messages} />
        <MessageInput onSendMessage={handleSendMessage} />
      </main>   :
      <main className="flex-1 flex flex-col">
        <QueryUI />
      </main>
      }
        
    </div>
  );
};

export default ChatUI;
