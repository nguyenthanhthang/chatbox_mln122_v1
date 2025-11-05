import React from "react";
import { Message } from "../../context/ChatContext";
import ReactMarkdown from "react-markdown";

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const roleLabel = isUser ? "Bạn" : isAssistant ? "Triết gia AI" : "System";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-slide-in-message`}>
      <div className={`flex max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"} group`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? "ml-3" : "mr-3"}`}>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110 ${
              isUser
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                : "bg-gradient-to-br from-red-500 to-yellow-500 text-white"
            }`}
          >
            <span className="text-xl">{isUser ? "👤" : "🤖"}</span>
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          {/* Role label */}
          <div className={`flex items-center space-x-2 mb-2 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isUser
                ? "bg-blue-100 text-blue-700"
                : "bg-gradient-to-r from-red-100 to-yellow-100 text-red-700"
            }`}>
              {roleLabel}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div
            className={`relative px-6 py-4 rounded-3xl shadow-lg transition-all group-hover:shadow-xl ${
              isUser
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                : "bg-white/90 backdrop-blur-sm text-gray-800 border-2 border-gray-100"
            }`}
          >
            {/* Decorative corner */}
            <div className={`absolute ${isUser ? "right-0 top-0" : "left-0 top-0"} w-3 h-3 ${
              isUser ? "bg-blue-600" : "bg-gradient-to-br from-red-500 to-yellow-500"
            } rounded-full -translate-y-1 ${isUser ? "-translate-x-1" : "translate-x-1"}`}></div>

            {/* Images */}
            {message.images && message.images.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-3">
                {message.images.map((image: any, index: number) => {
                  const src = image.url
                    ? image.url
                    : image.base64
                    ? `data:${image.mimeType};base64,${image.base64}`
                    : "";
                  return (
                    <img
                      key={index}
                      src={src}
                      alt={`Image ${index + 1}`}
                      className="max-w-sm max-h-64 object-contain rounded-2xl border-2 border-white/50 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    />
                  );
                })}
              </div>
            )}

            {/* Text content */}
            {isAssistant ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    code: (props: any) => {
                      const { className, children, inline } = props || {};
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <div className="relative group/code my-4">
                          <div className="absolute right-2 top-2 z-10">
                            <button
                              onClick={() => navigator.clipboard.writeText(String(children))}
                              className="px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-red-500 to-yellow-500 text-white opacity-0 group-hover/code:opacity-100 transition-all hover:scale-105 shadow-lg"
                            >
                              Copy
                            </button>
                          </div>
                          <pre className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-2xl overflow-x-auto shadow-inner">
                            <code className={`${className} text-gray-100`} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      ) : (
                        <code className="bg-red-100 text-red-700 px-2 py-0.5 rounded-lg text-sm font-mono" {...props}>
                          {children}
                        </code>
                      );
                    },
                    p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-gray-800">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold mb-2 text-gray-700">{children}</h3>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-gradient-to-b from-red-500 to-yellow-500 pl-4 py-2 my-3 bg-gradient-to-r from-red-50 to-yellow-50 rounded-r-lg italic">
                        {children}
                      </blockquote>
                    ),
                    a: ({ children, href }) => (
                      <a href={href} className="text-red-600 hover:text-yellow-600 underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
            )}
          </div>

          {/* Message Info */}
          <div className={`text-xs text-gray-500 mt-2 flex items-center space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
            {message.tokens && (
              <span className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                <span>⚡</span>
                <span>{message.tokens} tokens</span>
              </span>
            )}
            {message.model && (
              <span className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                <span>🤖</span>
                <span>{message.model}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;