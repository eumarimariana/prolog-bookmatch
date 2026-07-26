import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recommendForUserProfile, recommendWithExplanation } from './api';
import { Sparkles, Bot, Loader2, BookOpen, BrainCircuit } from 'lucide-react';
import { supabase } from './lib/supabase';

const MOCK_USER_ID = '11111111-1111-1111-1111-111111111111';

export default function Home() {
  const [genre, setGenre] = useState('');
  const [trope, setTrope] = useState('');
  
  const [results, setResults] = useState<any[]>([]);
  const [defaultShelf, setDefaultShelf] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'profile' | 'explain'>('profile');
  const [hasSearched, setHasSearched] = useState(false);
  
  const [profileData, setProfileData] = useState<{ genres: string[], tropes: string[] } | null>(null);

  useEffect(() => {
    async function init() {
      // 1. Carrega estante padrão (últimos livros)
      const { data: books } = await supabase.from('books').select('*').order('created_at', { ascending: false }).limit(6);
      if (books) setDefaultShelf(books);

      // 2. Carrega perfil para prefill
      try {
        const { data, error } = await supabase.from('user_profiles').select('*').eq('id', MOCK_USER_ID).single();
        let loadedGenres: string[] = [];
        let loadedTropes: string[] = [];
        
        if (data && !error) {
          loadedGenres = data.liked_genres || [];
          loadedTropes = data.liked_tropes || [];
        } else {
          const local = localStorage.getItem('localProfile');
          if (local) {
            const p = JSON.parse(local);
            loadedGenres = p.genres || [];
            loadedTropes = p.tropes || [];
          }
        }
        
        if (loadedGenres.length > 0) {
          setProfileData({ genres: loadedGenres, tropes: loadedTropes });
          setGenre(loadedGenres.join(', '));
          setTrope(loadedTropes.join(', '));
        }
      } catch (e) {
        console.error("Erro ao carregar perfil", e);
      }
    }
    init();
  }, []);

  // Busca dados completos (capas, autores) no Supabase baseado nos títulos que o Prolog devolveu
  async function hydratePrologResults(titles: string[], xaiReasons?: any[]) {
    if (titles.length === 0) return [];
    
    const { data: books } = await supabase
      .from('books')
      .select('*')
      .in('title', titles);
      
    if (!books) return titles.map(t => ({ title: t }));

    return titles.map((t, index) => {
      const bookData = books.find((b: any) => b.title === t);
      return {
        title: t,
        cover_url: bookData?.cover_url,
        author: bookData?.author,
        reason: xaiReasons ? xaiReasons[index].reason : null
      };
    });
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!genre && mode === 'explain') return;
    setLoading(true);
    setHasSearched(true);
    try {
      if (mode === 'profile') {
        const reqG = genre ? genre.split(',').map(s=>s.trim()) : [];
        const reqT = trope ? trope.split(',').map(s=>s.trim()) : [];
        const data = await recommendForUserProfile(MOCK_USER_ID, reqG, reqT);
        
        const hydrated = await hydratePrologResults(data.recommendations);
        setResults(hydrated);
      } else {
        const data = await recommendWithExplanation(genre, trope || "fantasia");
        const titles = data.recommendations.map((r: any) => r.title);
        const hydrated = await hydratePrologResults(titles, data.recommendations);
        setResults(hydrated);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const displayBooks = hasSearched ? results : defaultShelf;

  return (
    <div className="animate-fade">
      <header className="container" style={{ textAlign: 'center', padding: '5rem 2rem 3rem' }}>
        <span className="badge" style={{ marginBottom: '1.5rem' }}>
          <BrainCircuit size={16} /> Motor Lógico Prolog + Supabase
        </span>
        <h1 style={{ maxWidth: '800px', margin: '0 auto 1.5rem' }}>
          Descubra o livro que vai <br/>
          dominar sua semana.
        </h1>
      </header>

      <section className="container" style={{ maxWidth: '800px', marginBottom: '4rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center', background: 'rgba(0,0,0,0.03)', padding: '0.5rem', borderRadius: '9999px', width: 'fit-content', margin: '0 auto 2rem' }}>
            <button 
              className="btn"
              style={{ background: mode === 'profile' ? 'white' : 'transparent', color: mode === 'profile' ? 'var(--primary-purple)' : 'var(--text-light)', boxShadow: mode === 'profile' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none', padding: '0.75rem 1.5rem' }}
              onClick={() => { setMode('profile'); setHasSearched(false); }}
            >
              <BookOpen size={18} /> Filtragem por Perfil
            </button>
            <button 
              className="btn"
              style={{ background: mode === 'explain' ? 'white' : 'transparent', color: mode === 'explain' ? 'var(--primary-purple)' : 'var(--text-light)', boxShadow: mode === 'explain' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none', padding: '0.75rem 1.5rem' }}
              onClick={() => { setMode('explain'); setHasSearched(false); }}
            >
              <Sparkles size={18} /> Explainable AI (XAI)
            </button>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
              <div className="input-group">
                <label>Gênero Favorito {mode === 'explain' ? '*' : ''}</label>
                <input 
                  type="text" 
                  placeholder="Ex: Romance, Fantasia, Distopia" 
                  value={genre} 
                  onChange={e => setGenre(e.target.value)}
                  required={mode === 'explain'}
                />
              </div>
              <div className="input-group">
                <label>Trope / Tema {mode === 'explain' ? '*' : '(Opcional)'}</label>
                <input 
                  type="text" 
                  placeholder="Ex: Melancólico, Found Family" 
                  value={trope} 
                  onChange={e => setTrope(e.target.value)}
                  required={mode === 'explain'}
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'center', marginTop: '1rem', padding: '1rem 3rem' }} disabled={loading}>
              {loading ? <Loader2 className="lucide-spin" size={24} /> : <Bot size={24} />}
              {loading ? 'Consultando Prolog...' : 'Inferir Recomendações'}
            </button>
          </form>
        </div>
      </section>

      <section className="container animate-fade" style={{ marginBottom: '6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2>{hasSearched ? 'Resultados da Inferência Lógica' : 'Estante em Destaque'}</h2>
          <p>{hasSearched ? `O Prolog selecionou estas obras baseadas nas suas regras de ${mode === 'profile' ? 'Filtragem por Perfil' : 'Explainable AI'}` : 'Últimos livros adicionados ao catálogo e injetados no Prolog.'}</p>
        </div>
        
        <div className="grid grid-cols-3">
          {displayBooks.length > 0 ? displayBooks.map((r, i) => (
            <Link to={`/book/${encodeURIComponent(r.title)}`} key={i} className="book-card glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: '1 0 auto' }}>
                {r.cover_url ? (
                  <img src={r.cover_url} alt={r.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} />
                ) : (
                  <div className="book-cover-placeholder">
                    <BookOpen size={48} opacity={0.3} />
                  </div>
                )}
                
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{r.title}</h3>
                {r.author && <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>por {r.author}</p>}
                
                {r.reason && (
                  <div className="xai-box" style={{ marginBottom: '1rem' }}>
                    <strong>Prolog:</strong> {r.reason}
                  </div>
                )}
              </div>
            </Link>
          )) : (
            <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
              <Bot size={48} color="var(--text-light)" style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
              <h3>Nenhum match perfeito encontrado.</h3>
              <p style={{ margin: 0 }}>O motor Prolog não encontrou um cruzamento exato para esses termos. Tente outros tropos.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
