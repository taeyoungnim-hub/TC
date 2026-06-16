import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, User, Bot } from 'lucide-react';

function ChatPanel({ ai, enabled, messages, onSendMessage, onClear }) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim() && enabled) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-xl shadow-lg border-2 transition-all ${
      enabled ? 'border-gray-200' : 'border-gray-200 opacity-50'
    }`}>
      {/* Header */}
      <div className={`${ai.color} px-4 py-3 rounded-t-xl flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{ai.icon}</span>
          <div>
            <h3 className="font-bold text-white text-lg">{ai.name}</h3>
            <p className="text-xs text-white/80">{enabled ? '활성' : '비활성'}</p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          title="채팅 삭제"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Bot className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">대화를 시작하세요</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 message-enter ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className={`${ai.color} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-sm">{ai.icon}</span>
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : msg.isError
                    ? 'bg-red-50 text-red-900 border border-red-200'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={enabled ? `${ai.name}에게 메시지...` : '비활성화됨'}
            disabled={!enabled}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!enabled || !inputMessage.trim()}
            className={`p-2 ${ai.color} text-white rounded-lg hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;
