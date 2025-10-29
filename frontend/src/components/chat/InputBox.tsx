import React, { useState, useRef, KeyboardEvent } from "react";

interface InputBoxProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const InputBox: React.FC<InputBoxProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message here...",
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!message.trim() || disabled) return;

    const messageToSend = message.trim();
    setMessage("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await onSendMessage(messageToSend);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  return (
     <div className="relative">
       <div className="flex items-end space-x-3 bg-white border border-blue-200 rounded-2xl p-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 shadow-lg">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleInput();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 resize-none border-none outline-none text-gray-800 placeholder-gray-500 max-h-48 min-h-[24px]"
          rows={1}
        />
         <button
           onClick={handleSubmit}
           disabled={!message.trim() || disabled}
           className="flex-shrink-0 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
         >
          {disabled ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Helper text */}
      <div className="text-xs text-gray-500 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};

export default InputBox;
