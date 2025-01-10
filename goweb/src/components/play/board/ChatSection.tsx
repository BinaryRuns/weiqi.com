"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { ChatMessage, MessageType } from "@/types/ChatMessage";

interface ChatSectionProps {
  messages: ChatMessage[];
  messageInput: string;
  setMessageInput: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => void;
}

const ChatSection: React.FC<ChatSectionProps> = ({
  messages,
  messageInput,
  setMessageInput,
  sendMessage,
}) => {
  console.log(messages);

  return (
    <div className="flex flex-col h-full bg-bigcard rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between bg-bigcard text-white px-4 py-2 rounded-t-lg">
        <h2 className="text-lg font-semibold">Game Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-gray-200">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400">
            No messages yet. Start chatting!
          </p>
        ) : (
          messages.map((msg, idx) => {
            let textColor = "text-gray-200";
            if (msg.type === MessageType.JOIN) textColor = "text-green-400";
            if (msg.type === MessageType.LEAVE) textColor = "text-red-400";

            return (
              <div key={idx} className={`text-sm ${textColor}`}>
                {msg.type === MessageType.CHAT ? (
                  <p>
                    <span className="font-bold">{msg.senderUsername}: </span>
                    {msg.content}
                  </p>
                ) : msg.type === MessageType.JOIN ? (
                  <p>User {msg.senderUsername} joined the room.</p>
                ) : (
                  <p>User {msg.senderUsername} left the room.</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="bg-bigcard px-4 py-2 rounded-b-lg">
        <div className="flex items-center">
          <Input
            type="text"
            className="flex-1"
            placeholder="Send a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <button
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
