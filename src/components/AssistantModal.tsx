/**
 * Intelligent OIML R-76 Technical Assistant
 * Ministry of Consumer Affairs, Food & Public Distribution | Legal Metrology
 */

import React, { useState } from 'react';
import { HelpCircle, X, Send, BookOpen, CheckCircle, Search } from 'lucide-react';
import { api } from '../services/api';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citation?: string;
  timestamp: string;
}

export const AssistantModal: React.FC<AssistantModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: 'Welcome to the Smart Legal Metrology Technical Assistant. I can clarify OIML Recommendation R-76-1:2006 test procedures, Maximum Permissible Error (MPE) calculations, eccentricity load placement, repeatability spread thresholds, and Legal Metrology Act 2009 model approval requirements.',
      citation: 'OIML R-76-1:2006 & Legal Metrology Rules 2011',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const response = await api.queryAssistant(q);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        citation: response.citation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: 'Error accessing regulatory knowledge base. Please check connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    'MPE for Class III at 1500e',
    'Eccentricity test corner loading requirements',
    'Repeatability maximum spread criteria',
    'Discrimination test with 1.4d',
    'Legal Metrology Act 2009 Model Approval',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-2xl flex flex-col h-[580px] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#162F4D] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#234B70]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-[#2F699C] flex items-center justify-center text-white">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">OIML R-76 Technical Assistant</div>
              <div className="text-[11px] text-gray-300">
                Grounded in Legal Metrology Act 2009 & OIML Recommendations
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-[#F6F7F7] border-b border-gray-200 flex items-center space-x-2 overflow-x-auto text-[11px]">
          <span className="text-[#6F7478] font-medium whitespace-nowrap">Suggested:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="bg-white border border-gray-300 hover:border-[#2F699C] hover:text-[#2F699C] text-[#234B70] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FFFFFF]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#2F699C] text-white rounded-br-none'
                    : 'bg-[#E9F4FD] text-[#162F4D] border border-blue-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                {m.citation && (
                  <div className="mt-2 pt-2 border-t border-blue-200/60 flex items-center space-x-1 text-[10px] text-[#234B70] font-medium">
                    <BookOpen className="w-3 h-3 text-[#1683C5]" />
                    <span>Reference: {m.citation}</span>
                  </div>
                )}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    m.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#E9F4FD] text-[#162F4D] rounded-lg p-3 text-xs border border-blue-200">
                <span className="animate-pulse">Consulting OIML R-76 clauses...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 bg-[#F6F7F7] border-t border-gray-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about MPE tables, eccentricity, repeatability, or validation rules..."
              className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-xs text-[#162F4D] focus:outline-hidden focus:border-[#2F699C] focus:ring-1 focus:ring-[#2F699C]"
            />
            <button
              type="submit"
              className="bg-[#2F699C] hover:bg-[#162F4D] text-white px-4 py-2 rounded-md text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="text-[10px] text-[#6F7478] mt-1 text-center">
            Replies are strictly grounded in OIML R-76 & Legal Metrology statutory provisions.
          </div>
        </div>
      </div>
    </div>
  );
};
