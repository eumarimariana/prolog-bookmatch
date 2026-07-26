import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import BookDetails from './BookDetails';
import { Sparkles, Library } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(124,58,237,0.1)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles color="var(--primary-purple)" size={24} />
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>BookMatch</span>
        </Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-light)', fontWeight: 600 }}>Descobrir</Link>
        </div>
      </nav>
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book/:title" element={<BookDetails />} />
        </Routes>
      </main>

      <footer style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-light)', marginTop: '4rem', borderTop: '1px solid rgba(124,58,237,0.1)' }}>
        <p>BookMatch © 2026. Feito com Prolog + React.</p>
      </footer>
    </BrowserRouter>
  );
}

export default App;
