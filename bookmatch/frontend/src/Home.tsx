import { useState } from 'react';
import { Link } from 'react-router-dom';
import { recommendForUserProfile, recommendWithExplanation } from './api';
import { Sparkles, Bot, Loader2 } from 'lucide-react';

export default function Home() {
  const [genre, setGenre] = useState('');
  const [trope, setTrope] = useState('');
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'profile' | 'explain'>('profile');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!genre) return;
    setLoading(true);
    try {
      if (mode === 'profile') {
        const data = await recommendForUserProfile("usr_1", [genre], [trope]);
        setResults(data.recommendations.map((t: string) => ({ title: t })));
      } else {
        const data = await recommendWithExplanation(genre, trope || "nenhum");
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
    <div className="container animate-fade">
      <header style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
        <span className="badge">Motor Lógico Prolog</span>
        <h1>Encontre seu próximo favorito.</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Esqueça algoritmos genéricos. Nosso motor utiliza regras avançadas de inferência para encontrar exatamente o que você procura.
        </p>
      </header>

      <section className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '4rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <button 
            className={`btn ${mode === 'profile' ? 'btn-primary' : ''}`}
            style={{ background: mode === 'profile' ? '' : 'transparent', border: mode === 'profile' ? 'none' : '1px solid var(--primary-purple)', color: mode === 'profile' ? 'white' : 'var(--primary-purple)' }}
            onClick={() => setMode('profile')}
          >
            Filtragem por Perfil
          </button>
          <button 
            className={`btn ${mode === 'explain' ? 'btn-secondary' : ''}`}
            style={{ background: mode === 'explain' ? '' : 'transparent', border: mode === 'explain' ? 'none' : '1px solid var(--primary-yellow)', color: mode === 'explain' ? '#574606' : 'var(--primary-yellow)' }}
            onClick={() => setMode('explain')}
          >
            Explicar Escolha (XAI)
          </button>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid grid-cols-2">
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-purple)' }}>Gênero Favorito</label>
              <input 
                type="text" 
                placeholder="Ex: Romance, Fantasia, Distopia" 
                value={genre} 
                onChange={e => setGenre(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-purple)' }}>Trope / Tema (Opcional)</label>
              <input 
                type="text" 
                placeholder="Ex: Melancólico, Denso, Família" 
                value={trope} 
                onChange={e => setTrope(e.target.value)}
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'center', marginTop: '1rem' }} disabled={loading}>
            {loading ? <Loader2 className="lucide-spin" /> : <Bot />}
            Inferir no Prolog
          </button>
        </form>
      </section>

      {results.length > 0 && (
        <section className="animate-fade">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Resultados da Inteligência Lógica</h2>
          <div className="grid grid-cols-3">
            {results.map((r, i) => (
              <Link to={`/book/${encodeURIComponent(r.title)}`} key={i} className="book-card glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ background: 'var(--primary-purple)', height: '180px', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Sparkles size={40} opacity={0.5} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{r.title}</h3>
                {r.reason && (
                  <p style={{ fontSize: '0.9rem', color: '#574606', background: 'var(--primary-yellow)', padding: '0.75rem', borderRadius: '8px' }}>
                    <strong>Por que?</strong> {r.reason}
                  </p>
                )}
                {!r.reason && <p style={{ fontSize: '0.9rem' }}>Clique para ver recomendações por scoring inteligente.</p>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
