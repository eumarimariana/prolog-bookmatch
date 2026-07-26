import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Grid, Heart, Bookmark, Search as SearchIcon, Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Home from './Home';
import BookDetails from './BookDetails';
import Search from './Search';
import Library from './Library';
import Showcase from './Showcase';
import Catalog from './Catalog';
import { recommendAdvanced } from './api';
import logoUrl from './assets/logo.png';

function Sidebar() {
  const location = useLocation();
  const path = location.pathname;
  
  return (
    <div className="sidebar">
      <div style={{ marginBottom: '20px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#D9D9D9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logoUrl} alt="Logo" style={{width:'100%', height:'100%', objectFit: 'cover'}}/>
        </div>
      </div>
      
      <Link to="/" className={`nav-icon ${path === '/' ? 'active' : ''}`}>
        <Grid size={24} />
      </Link>
      <Link to="/search" className={`nav-icon ${path === '/search' ? 'active' : ''}`}>
        <SearchIcon size={24} />
      </Link>
      <Link to="/library" className={`nav-icon ${path === '/library' ? 'active' : ''}`}>
        <Heart size={24} />
      </Link>
      <Link to="/catalog" className="nav-link" style={{ marginTop: 'auto', marginBottom: '20px' }}>
        <div style={{ width: '40px', height: '120px', background: '#3D5E7B', borderRadius: '99px', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>
          <Bookmark size={16} style={{ marginBottom: '8px' }} /> prolog DB
        </div>
      </Link>
    </div>
  );
}

function AIChat() {
  const [messages, setMessages] = useState<{sender: 'bot'|'user', text: string, recommendations?: string[]}[]>([
    { sender: 'bot', text: 'Olá! Sou sua IA baseada em Prolog. Diga-me o que você quer ler e eu filtrarei o banco de dados para você!' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    const currentInput = input;
    setInput('');
    try {
      const data = await recommendAdvanced(currentInput);
      if (data.recommendations && data.recommendations.length > 0) {
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: `Encontrei algumas opções excelentes usando as regras lógicas do Prolog:`,
          recommendations: data.recommendations.slice(0, 3)
        }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Hmm, o motor Prolog não encontrou combinações exatas para esses termos.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Desculpe, meu motor lógico não está respondendo no momento.' }]);
    }
  }

  return (
    <div className="chat-sidebar">
      <div className="chat-header">
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Chat</h2>
        <Grid size={20} color="var(--text-muted)" />
      </div>
      
      <div style={{ background: 'white', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-dark)' }}>Privacy and Support</h3>
          <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--text-muted)' }}>Get Immediate Support</p>
        </div>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--panel-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          &gt;
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.sender}`}>
            {msg.text}
            {msg.recommendations && msg.recommendations.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {msg.recommendations.map((r, idx) => (
                  <Link key={idx} to={`/book/${encodeURIComponent(r)}`} style={{ background: '#F3EFE9', color: 'var(--accent-purple)', padding: '8px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #EBE5DF', display: 'block', width: '100%' }}>
                    📚 {r}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-area">
        <input 
          type="text" 
          placeholder="Write a message..." 
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" className="send-btn">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/showcase/:genre" element={<Showcase />} />
            <Route path="/book/:title" element={<BookDetails />} />
          </Routes>
        </main>
        
        <AIChat />
      </div>
    </BrowserRouter>
  );
}

export default App;
