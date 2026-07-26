import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recommendByScore } from './api';
import { ArrowLeft, Target, BookOpen, Calculator, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from './lib/supabase';

const MOCK_USER_ID = '11111111-1111-1111-1111-111111111111';

export default function BookDetails() {
  const { title } = useParams();
  const [bookDetails, setBookDetails] = useState<any>(null);
  const [similar, setSimilar] = useState<{title: string, score: number, cover_url?: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!title) return;
      setLoading(true);
      try {
        // 1. Busca os detalhes do livro aberto no Supabase
        const decodedTitle = decodeURIComponent(title);
        const { data: dbBooks } = await supabase.from('books').select('*').eq('title', decodedTitle);
        if (dbBooks && dbBooks.length > 0) {
          setBookDetails(dbBooks[0]);
          
          // Check if already in user profile
          const { data: profile } = await supabase.from('user_profiles').select('read_books').eq('id', MOCK_USER_ID).single();
          if (profile && profile.read_books?.includes(dbBooks[0].id)) {
            setAdded(true);
          }
        } else {
          setBookDetails({ title: decodedTitle });
        }

        // 2. Busca Scoring no Prolog
        const data = await recommendByScore(decodedTitle);
        const sorted = data.recommendations.sort((a: any, b: any) => b.score - a.score);
        
        // 3. Hydrate with covers
        const titles = sorted.map((s: any) => s.title);
        if (titles.length > 0) {
          const { data: coversData } = await supabase.from('books').select('title, cover_url').in('title', titles);
          if (coversData) {
            sorted.forEach((s: any) => {
              const match = coversData.find((c: any) => c.title === s.title);
              if (match) s.cover_url = match.cover_url;
            });
          }
        }
        
        setSimilar(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [title]);

  async function handleAddToLibrary() {
    if (!bookDetails?.id) return;
    setLoadingAdd(true);
    try {
      const { data: profile } = await supabase.from('user_profiles').select('read_books').eq('id', MOCK_USER_ID).single();
      const currentRead = profile?.read_books || [];
      if (!currentRead.includes(bookDetails.id)) {
        currentRead.push(bookDetails.id);
        await supabase.from('user_profiles').update({ read_books: currentRead }).eq('id', MOCK_USER_ID);
      }
      setAdded(true);
    } catch (e) {
      console.error("Erro ao salvar", e);
    } finally {
      setLoadingAdd(false);
    }
  }

  return (
    <div className="animate-fade">
      <div className="container" style={{ paddingBottom: 0 }}>
        <Link to="/" className="btn" style={{ marginBottom: '3rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.8)', color: 'var(--text-dark)', border: '1px solid rgba(0,0,0,0.1)' }}>
          <ArrowLeft size={18} /> Voltar para Descoberta
        </Link>
      </div>

      <section className="container" style={{ marginBottom: '6rem' }}>
        <div className="glass-panel" style={{ display: 'flex', gap: '4rem', alignItems: 'center', padding: '4rem', background: 'white' }}>
          <div style={{ flex: '0 0 300px', background: bookDetails?.cover_url ? 'transparent' : 'linear-gradient(135deg, var(--primary-purple), var(--primary-yellow))', height: '450px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 20px 50px rgba(124, 58, 237, 0.2)', overflow: 'hidden' }}>
            {bookDetails?.cover_url ? (
              <img src={bookDetails.cover_url} alt={bookDetails.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <BookOpen size={80} opacity={0.5} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <span className="badge" style={{ marginBottom: '1rem' }}>Livro Selecionado</span>
            <h1 style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{bookDetails?.title || title}</h1>
            {bookDetails?.author && <h3 style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>por {bookDetails.author}</h3>}
            
            {bookDetails?.genres && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                {bookDetails.genres.map((g: string, i: number) => (
                  <span key={i} style={{ padding: '0.4rem 1rem', background: 'rgba(124,58,237,0.1)', color: 'var(--primary-purple)', borderRadius: '99px', fontWeight: 700, fontSize: '0.85rem' }}>{g}</span>
                ))}
              </div>
            )}
            
            <p style={{ fontSize: '1.2rem', maxWidth: '600px', marginBottom: '2rem' }}>
              Este é o seu livro de referência. O sistema buscará no catálogo completo do Supabase quais outras obras possuem a maior similaridade matemática com este título.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleAddToLibrary} className={`btn ${added ? 'btn-secondary' : 'btn-primary'}`} disabled={loadingAdd || added || !bookDetails?.id}>
                {loadingAdd ? <Loader2 className="lucide-spin" size={20} /> : (added ? <CheckCircle2 size={20} /> : <BookOpen size={20} />)}
                {added ? 'Na sua Estante' : 'Adicionar à Estante'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ marginBottom: '6rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Calculator size={32} color="var(--primary-purple)" />
          </div>
          <h2>Scoring Inteligente do Prolog</h2>
          <p style={{ maxWidth: '700px', margin: '0 auto' }}>
            Não usamos "pessoas também compraram". O motor calcula a similaridade exata: <br/>
            <strong>Gênero Idêntico = 10 pts | Tropos Idênticos = 5 pts cada.</strong>
          </p>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', color: 'var(--primary-purple)' }}>
            <Loader2 size={48} className="lucide-spin" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: 0 }}>Processando pesos no SWI-Prolog...</h3>
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {similar.length > 0 ? similar.map((s, i) => (
              <Link to={`/book/${encodeURIComponent(s.title)}`} key={i} className="book-card glass-panel" style={{ padding: '1.5rem', borderTop: `6px solid ${s.score >= 10 ? 'var(--primary-purple)' : 'var(--primary-yellow)'}` }}>
                {s.cover_url ? (
                  <img src={s.cover_url} alt={s.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} />
                ) : (
                  <div className="book-cover-placeholder">
                    <BookOpen size={32} opacity={0.3} />
                  </div>
                )}
                
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', flex: 1 }}>{s.title}</h3>
                
                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Match Score</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: s.score >= 10 ? 'var(--primary-purple)' : '#B45309' }}>
                    {s.score} pts
                  </span>
                </div>
              </Link>
            )) : (
              <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
                <h3>Nenhum match encontrado.</h3>
                <p style={{ margin: 0 }}>Este livro não compartilha Gênero ou Tropos com os outros do catálogo atual.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
