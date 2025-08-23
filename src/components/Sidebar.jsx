import ModeToggle from './Toggle';
const Sidebar = ({ isOpen, onClose, handleToggle, isConversation }) => {
  return (
    <>
      {/* Mobile backdrop */}
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
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold dark:text-white">BIRR GPT</h1>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <input 
            type="search" 
            placeholder="Search for chats..." 
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
            Chats
            <span className="ml-auto bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full text-xs">1</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            Library
            <span className="ml-auto bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full text-xs">2</span>
          </a>
        </nav>
        <div className='align-self-end mt-auto'>

            <ModeToggle onModeChange={handleToggle} leftOption='Query' rightOption='Conversation' isConversation={isConversation} />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
