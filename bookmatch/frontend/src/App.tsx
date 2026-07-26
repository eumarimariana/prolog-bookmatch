import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './Home';
import BookDetails from './BookDetails';
import Search from './Search';
import Library from './Library';
import { Sparkles, Library as LibraryIcon, Search as SearchIcon } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.4)', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 30px rgba(0,0,0,0.03)' }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary-purple), var(--primary-yellow))', padding: '0.5rem', borderRadius: '12px', display: 'flex' }}>
          <Sparkles color="white" size={24} />
        </div>
        <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '-0.03em' }}>BookMatch</span>
      </Link>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" className="nav-link" style={{ color: isActive('/') ? 'var(--primary-purple)' : '' }}>Descobrir</Link>
        <Link to="/search" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isActive('/search') ? 'var(--primary-purple)' : '' }}>
          <SearchIcon size={18} /> Buscar
        </Link>
        <Link to="/library" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isActive('/library') ? 'var(--primary-purple)' : '' }}>
          <LibraryIcon size={18} /> Estante
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/book/:title" element={<BookDetails />} />
        </Routes>
      </main>

      <footer style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-light)', marginTop: '4rem', borderTop: '1px solid rgba(0,0,0,0.05)', background: 'linear-gradient(to top, rgba(124, 58, 237, 0.03), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sparkles size={16} color="var(--primary-purple)" />
          <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>BookMatch AI</span>
        </div>
        <p style={{ margin: 0 }}>© 2026. Powered by SWI-Prolog & React.</p>
      </footer>
    </BrowserRouter>
  );
}

export default App;
