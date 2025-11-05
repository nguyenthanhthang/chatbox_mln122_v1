import React from "react";
import MessageItem from "./MessageItem";
import { Message } from "../../context/ChatContext";

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="space-y-8 py-6">
      {messages.map((message, index) => (
        <MessageItem key={message.id || index} message={message} />
      ))}

      <style>{`
        @keyframes slide-in-message {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in-message {
          animation: slide-in-message 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MessageList;