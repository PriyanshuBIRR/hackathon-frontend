const ModeToggle = ({ onModeChange, leftOption, rightOption, isConversation }) => {
  

  return (
    <div 
      className="relative flex select-none items-center w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600"
    >
      <div 
        className={`absolute top-1 bottom-1 w-1/2 bg-primary rounded-full shadow-md transition-transform duration-300 ease-out ${
          isConversation ? 'translate-x-[122px]' : 'translate-x-1'
        }`}
      />
      
      {/* Labels */}
      <div className="relative flex w-full z-10">
        <span className={`flex-1 text-sm font-medium text-center py-2 transition-colors duration-200 ${
          !isConversation ? 'text-white' : 'text-gray-600 dark:text-gray-400'
        }`} onClick={() => onModeChange(leftOption)}>
          {leftOption}
        </span>
        <span className={`flex-1 text-sm font-medium text-center py-2 transition-colors duration-200 ${
          isConversation ? 'text-white' : 'text-gray-600 dark:text-gray-400'
        }`} onClick={() => onModeChange(rightOption)}>
          {rightOption}
        </span>
      </div>
    </div>
  );
};

export default ModeToggle;
