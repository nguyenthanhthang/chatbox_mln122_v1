import React from "react";
import MessageItem from "./MessageItem";
import { Message } from "../../context/ChatContext";

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <MessageItem key={message.id || index} message={message} />
      ))}
    </div>
  );
};

export default MessageList;
