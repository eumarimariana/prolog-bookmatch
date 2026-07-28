import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Grid, Heart, Bookmark, Search as SearchIcon, Send, Book } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Home from './Home';
import BookDetails from './BookDetails';
import Search from './Search';
import Library from './Library';
import Showcase from './Showcase';
import Catalog from './Catalog';
import { recommendAdvanced } from './api';
import { supabase } from './lib/supabase';
import logoUrl from './assets/logo.png';
import botAvatarUrl from './assets/bot_avatar.png';

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

    </div>
  );
}

function AIChat() {
  const ALL_PROMPTS = [
    "Quero um romance clichê",
    "Fantasia épica com magia",
    "Mistério tenso e suspense",
    "Ficção científica no espaço",
    "Uma história triste para chorar",
    "Livros curtinhos para ler rápido",
    "Enemies to lovers",
    "Aventura com found family",
    "Terror psicológico assustador",
    "Distopia futurista",
    "Um livro que se passa na escola",
    "Mitologia grega ou deuses"
  ];

  const [messages, setMessages] = useState<{sender: 'bot'|'user', text: string, recommendations?: {title: string, cover_url?: string}[]}[]>([
    { sender: 'bot', text: 'Olá! Sou sua IA baseada em Prolog. Diga-me o que você quer ler e eu filtrarei o banco de dados para você!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activePrompts, setActivePrompts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pick 3 random prompts initially
  useEffect(() => {
    shufflePrompts();
  }, []);

  const shufflePrompts = () => {
    const shuffled = [...ALL_PROMPTS].sort(() => 0.5 - Math.random());
    setActivePrompts(shuffled.slice(0, 3));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSend(e?: React.FormEvent, customInput?: string) {
    if (e) e.preventDefault();
    const query = customInput || input;
    if (!query.trim()) return;
    
    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    if (!customInput) setInput('');
    setIsTyping(true);

    try {
      const data = await recommendAdvanced(query);
      if (data.recommendations && data.recommendations.length > 0) {
        const top3 = data.recommendations.slice(0, 3);
        
        // Fetch covers from Supabase
        const { data: dbBooks } = await supabase.from('books').select('title, cover_url').in('title', top3);
        
        const richRecs = top3.map((t: string) => {
          const match = dbBooks?.find(b => b.title === t);
          return { title: t, cover_url: match?.cover_url };
        });

        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: `Encontrei algumas opções excelentes usando as regras lógicas do Prolog:`,
          recommendations: richRecs
        }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Hmm, o motor Prolog não encontrou combinações exatas para esses termos.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Desculpe, meu motor lógico não está respondendo no momento.' }]);
    } finally {
      setIsTyping(false);
      shufflePrompts();
    }
  }

  return (
    <div className="chat-sidebar">
      <div className="chat-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={botAvatarUrl} alt="Bot Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Chat</h2>
      </div>
      

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className={`chat-bubble ${msg.sender}`}>
              {msg.text}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  {msg.recommendations.map((r, idx) => (
                    <Link key={idx} to={`/book/${encodeURIComponent(r.title)}`} style={{ background: '#F3EFE9', color: 'var(--text-dark)', padding: '8px', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #EBE5DF', width: '100%', transition: 'all 0.2s' }}>
                      {r.cover_url ? (
                        <img src={r.cover_url} alt={r.title} style={{ width: '40px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '60px', background: '#D9D9D9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Book size={16} color="var(--text-muted)" /></div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.2 }}>{r.title}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Match Prolog IA</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {!isTyping && (
          <div className="quick-prompts">
            {activePrompts.map((qp, qidx) => (
              <button key={qidx} className="quick-prompt-btn" onClick={() => handleSend(undefined, qp)}>
                {qp}
              </button>
            ))}
          </div>
        )}
        {isTyping && (
          <div className="chat-bubble bot">
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
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
