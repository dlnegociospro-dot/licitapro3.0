import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Chat } from '@google/genai';
import { ChatMessage } from '../types';

interface ChatWidgetProps {
  chatSession: Chat | null;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ chatSession }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou o assistente LICITAPRO. Faça perguntas sobre o arquivo carregado.', timestamp: new Date() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessage({ message: userMsg.text });
      const modelMsg: ChatMessage = {
        role: 'model',
        text: result.text || "Desculpe, não consegui processar a resposta.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Ocorreu um erro ao comunicar com a IA.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-cyber-cyan hover:bg-cyan-400 text-slate-900 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center justify-center transition-all duration-300 z-50 animate-bounce hover:animate-none"
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[500px] bg-slate-900/95 backdrop-blur-xl border border-cyber-cyan/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="text-cyber-cyan" size={20} />
          <h3 className="font-bold text-white font-mono">LICITAPRO AI</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
          <Minimize2 size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyber-cyan/20 text-cyan-50 border border-cyber-cyan/30 rounded-tr-none'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
              }`}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700">
               <div className="flex gap-1">
                 <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-bounce delay-150"></div>
                 <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-bounce delay-300"></div>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Pergunte sobre o arquivo..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-all"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-cyber-cyan text-slate-900 p-2.5 rounded-xl hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;