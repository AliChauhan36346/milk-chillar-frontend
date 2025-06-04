// components/dashboard/ChatBot.tsx
'use client';
import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg 
          flex items-center justify-center hover:bg-blue-700 transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-xl shadow-xl border">
          <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-xl">
            <h3 className="font-medium">MilkChillar Assistant</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-700 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-64 p-4 overflow-y-auto space-y-4">
            <div className="text-sm text-gray-600">
              How can I help you today?
            </div>
          </div>

          <div className="p-4 border-t">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </>
  );
}