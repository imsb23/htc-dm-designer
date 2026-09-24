
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Trash2 } from 'lucide-react';
import { sendChatMessage } from '../services/geminiService';

interface AiAssistantProps {
  context: string;
}

const APP_KNOWLEDGE_BASE = `
SYSTEM IDENTITY: You are the HTC Copilot Assistant, an expert embedded within the "HTC Copilot" web application.
PLATFORM INTELLIGENCE: You have full awareness of the user's activities across all modules. If they created an architecture in Blueprint Studio, you can reference those entities when answering questions in the Solution Designer.

MODULES & NAVIGATION GUIDANCE:
1. **Dashboard**: Central visibility for all architectural requests and statistics.
2. **Design Hub / Solution Designer**: End-to-end HLD synthesis. Generates blueprints, requirements, and scoping logic.
3. **Project Describer**: Deep analysis of RFP/Spec documents.
4. **Estimator (Ad-hoc)**: Precision effort and cost calculator.
5. **Blueprint Studio**: Diagramming tool (Manual + AI Synthesis).
6. **Metadata Dictionary**: Technical data modeling and schema extraction hub.

INSTRUCTION:
- Use global platform context to provide smarter, joined-up advice.
- If a user asks "What did I decide for the AWS migration?", look for patterns from Blueprint Studio or Solution Designer history.
- Keep answers concise, technical, and architect-focused.
`;

const STORAGE_KEY = 'dataarch_ai_chat_history';

const AiAssistant: React.FC<AiAssistantProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [
        { role: 'model', text: 'Hi! I am the HTC Copilot Assistant. I have a global view of your architectural decisions across all modules. How can I help?' }
      ];
    } catch (e) {
      return [{ role: 'model', text: 'Hi! I am the HTC Copilot Assistant. I have a global view of your architectural decisions across all modules. How can I help?' }];
    }
  });

  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleClearHistory = () => {
    if(window.confirm('Clear chat history?')) {
        const defaultMsg = [{ role: 'model' as const, text: 'Chat history cleared. How can I help you?' }];
        setMessages(defaultMsg);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMsg));
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMsg = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    const fullContext = `${APP_KNOWLEDGE_BASE}\n\nCURRENT PAGE CONTEXT:\n${context}`;
    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const response = await sendChatMessage(history, input, fullContext);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 md:w-96 h-[500px] flex flex-col overflow-hidden animate-fade-in-up">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1 rounded-full"><Bot size={18} /></div>
              <div>
                <h3 className="font-bold text-sm">AI Architect</h3>
                <p className="text-[10px] text-indigo-100 flex items-center gap-1">
                   <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Context Sync Active
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleClearHistory} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors" title="Clear History">
                <Trash2 size={16} />
              </button>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                <Minimize2 size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs md:text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
               <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                     <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                     </div>
                  </div>
               </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2 text-sm outline-none transition-all"
              placeholder="Ask about your synced designs..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={!input.trim()} className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 flex items-center gap-2 group">
          <Bot size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold whitespace-nowrap">Global AI Advice</span>
        </button>
      )}
    </div>
  );
};

export default AiAssistant;
