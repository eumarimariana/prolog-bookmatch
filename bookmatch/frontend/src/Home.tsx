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
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'profile' | 'explain'>('profile');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Perfil original carregado do banco
  const [profileData, setProfileData] = useState<{ genres: string[], tropes: string[] } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', MOCK_USER_ID)
          .single();
        
        let loadedGenres: string[] = [];
        let loadedTropes: string[] = [];
        
        if (data && !error) {
          loadedGenres = data.liked_genres || [];
          loadedTropes = data.liked_tropes || [];
        } else {
          // Fallback
          const local = localStorage.getItem('localProfile');
          if (local) {
            const p = JSON.parse(local);
            loadedGenres = p.genres || [];
            loadedTropes = p.tropes || [];
          }
        }
        
        if (loadedGenres.length > 0) {
          setProfileData({ genres: loadedGenres, tropes: loadedTropes });
          setGenre(loadedGenres[0] || '');
          setTrope(loadedTropes[0] || '');
        }
      } catch (e) {
        console.error("Erro ao carregar perfil para prefill", e);
      }
    }
    loadProfile();
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!genre && mode === 'explain') return; // XAI precisa de genero, Perfil pode usar o que ja ta salvo
    setLoading(true);
    setHasSearched(true);
    try {
      if (mode === 'profile') {
        // Usa o perfil carregado se os inputs estiverem vazios, ou usa os inputs do usuario
        const requestGenres = genre ? [genre] : (profileData?.genres || []);
        const requestTropes = trope ? [trope] : (profileData?.tropes || []);
        
        const data = await recommendForUserProfile(MOCK_USER_ID, requestGenres, requestTropes);
        setResults(data.recommendations.map((t: string) => ({ title: t })));
      } else {
        const data = await recommendWithExplanation(genre, trope || "fantasia"); // Trope default fallback
        setResults(data.recommendations);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade">
      <header className="container" style={{ textAlign: 'center', padding: '6rem 2rem 4rem' }}>
        <span className="badge" style={{ marginBottom: '1.5rem' }}>
          <BrainCircuit size={16} /> Motor Lógico Prolog
        </span>
        <h1 style={{ maxWidth: '800px', margin: '0 auto 1.5rem' }}>
          Descubra o livro que vai <br/>
          dominar sua semana.
        </h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', color: 'var(--text-light)' }}>
          Esqueça algoritmos de redes sociais. Nossa Inteligência Artificial usa heurísticas reais (Filtragem de Conteúdo & XAI) para acertar em cheio no seu gosto.
        </p>
      </header>

      <section className="container" style={{ maxWidth: '800px', marginBottom: '5rem' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', justifyContent: 'center', background: 'rgba(0,0,0,0.03)', padding: '0.5rem', borderRadius: '9999px', width: 'fit-content', margin: '0 auto 3rem' }}>
            <button 
              className="btn"
              style={{ 
                background: mode === 'profile' ? 'white' : 'transparent', 
                color: mode === 'profile' ? 'var(--primary-purple)' : 'var(--text-light)',
                boxShadow: mode === 'profile' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                padding: '0.75rem 1.5rem'
              }}
              onClick={() => { setMode('profile'); setResults([]); setHasSearched(false); }}
            >
              <BookOpen size={18} /> Filtragem por Perfil
            </button>
            <button 
              className="btn"
              style={{ 
                background: mode === 'explain' ? 'white' : 'transparent', 
                color: mode === 'explain' ? 'var(--primary-purple)' : 'var(--text-light)',
                boxShadow: mode === 'explain' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                padding: '0.75rem 1.5rem'
              }}
              onClick={() => { setMode('explain'); setResults([]); setHasSearched(false); }}
            >
              <Sparkles size={18} /> Explainable AI (XAI)
            </button>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
              <div className="input-group">
                <label>Gênero Favorito {mode === 'explain' ? '*' : '(Sobrescrever Perfil)'}</label>
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
                  placeholder="Ex: Melancólico, Denso, Found Family" 
                  value={trope} 
                  onChange={e => setTrope(e.target.value)}
                  required={mode === 'explain'}
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'center', marginTop: '1rem', padding: '1.25rem 3rem', fontSize: '1.15rem' }} disabled={loading}>
              {loading ? <Loader2 className="lucide-spin" size={24} /> : <Bot size={24} />}
              {loading ? 'Consultando Prolog...' : 'Inferir Recomendações'}
            </button>
          </form>
        </div>
      </section>

      {hasSearched && (
        <section className="container animate-fade" style={{ marginBottom: '6rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Resultados da Inferência Lógica</h2>
            <p>Os títulos abaixo foram pinçados pelas nossas regras de {mode === 'profile' ? 'Filtragem por Perfil' : 'Explainable AI'}</p>
          </div>
          
          <div className="grid grid-cols-3">
            {results.length > 0 ? results.map((r, i) => (
              <Link to={`/book/${encodeURIComponent(r.title)}`} key={i} className="book-card glass-panel" style={{ padding: '1.5rem' }}>
                <div className="book-cover-placeholder">
                  <BookOpen size={48} opacity={0.3} />
                </div>
                
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', flex: 1 }}>{r.title}</h3>
                
                {mode === 'explain' && r.reason && (
                  <div className="xai-box">
                    <strong>Prolog explica:</strong> {r.reason}
                  </div>
                )}
                
                {mode === 'profile' && (
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-purple)', fontSize: '0.9rem', fontWeight: 700 }}>
                    Ver scoring de similaridade &rarr;
                  </div>
                )}
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
      )}
    </div>
  );
}
