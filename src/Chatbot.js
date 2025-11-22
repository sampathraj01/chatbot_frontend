import React, { useState, useEffect, useRef } from 'react';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history + queue from localStorage on start
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    const savedQueue = localStorage.getItem('offlineQueue');
    if (savedMessages) setMessages(JSON.parse(savedMessages));
    if (savedQueue) setMessageQueue(JSON.parse(savedQueue));
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // Auto-sync when back online
  const [messageQueue, setMessageQueue] = useState([]);

  useEffect(() => {
    localStorage.setItem('offlineQueue', JSON.stringify(messageQueue));
  }, [messageQueue]);

  useEffect(() => {
    if (navigator.onLine && messageQueue.length > 0) {
      sendNextInQueue();
    }
  }, [navigator.onLine, messageQueue.length]);

  const sendNextInQueue = async () => {
    const next = messageQueue[0];
    setLoading(true);
    try {
      const res = await fetch(process.env.REACT_APP_LOCAL_API_URL + "invoiceothers/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: next.text })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { text: data.reply, sender: "bot" }]);
        setMessageQueue(prev => prev.slice(1));
      }
    } catch (err) {
      console.log("Still offline, waiting...");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { text: input, sender: "user", timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const res = await fetch(process.env.REACT_APP_LOCAL_API_URL + process.env.REACT_APP_CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { text: data.reply, sender: "bot" }]);
      } else throw new Error();
    } catch (err) {
      setMessages(prev => [...prev, {
        text: "Offline — your message is saved and will send when you're back online",
        sender: "bot",
        offline: true
      }]);
      setMessageQueue(prev => [...prev, userMsg]);
    }
  };

  return (
    <div className="chat-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#1a1a2e', color: 'white' }}>
      <div className="messages" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {messages.length === 0 && <div>Welcome! Start chatting.</div>}
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.sender === 'user' ? 'right' : 'left', margin: '10px 0' }}>
            <div style={{
              display: 'inline-block',
              background: m.sender === 'user' ? '#6366f1' : m.offline ? '#ef4444' : '#333',
              color: 'white',
              padding: '12px 18px',
              borderRadius: '18px',
              maxWidth: '80%'
            }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ padding: '20px', background: '#16213e', display: 'flex', gap: '10px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '15px', borderRadius: '25px', border: 'none', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '15px 25px', borderRadius: '25px', background: '#6366f1', color: 'white', border: 'none' }}>
          Send
        </button>
      </form>
    </div>
  );
}