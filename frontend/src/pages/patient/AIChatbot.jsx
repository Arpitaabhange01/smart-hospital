import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageSquare, Sparkles } from 'lucide-react';
import API from '../../utils/api';

const quickReplies = [
  'How do I book an appointment?',
  'Where can I find my reports?',
  'How do I view my prescriptions?',
  'What is the AI Symptom Checker?',
  'I need help with something else',
];

export default function AIChatbot() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I\'m your Smart Health Assistant. How can I help you today? 😊' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (msg) => {
    const message = msg || input;
    if (!message.trim() || loading) return;
    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setInput('');
    setLoading(true);
    try {
      const res = await API.post('/ai/chatbot', { message });
      setMessages((prev) => [...prev, { role: 'bot', text: res.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" /> AI Health Chatbot
        </h1>
        <p className="text-gray-500 mt-1">Ask me anything about appointments, reports, prescriptions, or general health queries.</p>
      </div>

      <div className="bg-white rounded-xl shadow-card flex flex-col h-[600px]">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
            <Bot className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Smart Health Assistant</p>
            <p className="text-xs text-gray-400">AI-powered · Always here to help</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                m.role === 'user' ? 'bg-primary-100' : 'bg-purple-100'
              }`}>
                {m.role === 'user' ? <User className="w-4 h-4 text-primary-600" /> : <Bot className="w-4 h-4 text-purple-600" />}
              </div>
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' ? 'bg-primary-700 text-white rounded-tr-sm' : 'bg-gray-50 text-gray-700 rounded-tl-sm'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center"><Bot className="w-4 h-4 text-purple-600" /></div>
              <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-400 mb-2 text-center">Quick suggestions</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickReplies.map((q) => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="px-3 py-1.5 text-xs bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors font-medium">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-gray-100">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm" />
            <button type="submit" disabled={loading || !input.trim()}
              className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
