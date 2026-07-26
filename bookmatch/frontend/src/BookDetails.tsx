import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recommendByScore } from './api';
import { ArrowLeft, Target, BookOpen, Calculator, Loader2, CheckCircle2, Heart } from 'lucide-react';
import { supabase } from './lib/supabase';

const MOCK_USER_ID = '11111111-1111-1111-1111-111111111111';

export default function BookDetails() {
  const { title } = useParams();
  const [bookDetails, setBookDetails] = useState<any>(null);
  const [similar, setSimilar] = useState<{ title: string, score: number, cover_url?: string }[]>([]);
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
      <div style={{ paddingBottom: '20px' }}>
        <Link to="/" className="btn" style={{ padding: '0.5rem 1rem', background: '#F3EFE9', color: 'var(--text-dark)', borderRadius: '12px' }}>
          <ArrowLeft size={18} style={{marginRight: 5}} /> Voltar para Descoberta
        </Link>
      </div>

      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', padding: '30px', background: '#F9F8F6', borderRadius: '30px' }}>
          <div style={{ flex: '0 0 250px', background: bookDetails?.cover_url ? 'transparent' : 'linear-gradient(135deg, var(--accent-purple), var(--accent-red))', height: '380px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', overflow: 'hidden' }}>
            {bookDetails?.cover_url ? (
              <img src={bookDetails.cover_url} alt={bookDetails.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <BookOpen size={80} opacity={0.5} />
            )}
          </div>
          <div style={{ flex: 1, paddingTop: '20px' }}>
            <span style={{ fontSize: '0.8rem', background: 'white', padding: '4px 10px', borderRadius: '99px', color: 'var(--text-muted)' }}>Livro Selecionado</span>
            <h1 className="chewy-font" style={{ fontSize: '3.5rem', marginBottom: '0.5rem', marginTop: '10px' }}>{bookDetails?.title || title}</h1>
            {bookDetails?.author && <h3 style={{ color: 'var(--accent-red)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>por {bookDetails.author}</h3>}
            
            {bookDetails?.genres && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {bookDetails.genres.map((g: string, i: number) => (
                  <span key={i} style={{ padding: '4px 12px', background: 'white', color: 'var(--accent-purple)', borderRadius: '99px', fontWeight: 600, fontSize: '0.85rem' }}>{g}</span>
                ))}
              </div>
            )}
            
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '500px', marginBottom: '30px', lineHeight: 1.5 }}>
              Este é o seu livro de referência. O motor Prolog buscará no catálogo completo do Supabase quais outras obras possuem a maior similaridade matemática.
            </p>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={handleAddToLibrary} className="btn-gradient" style={{ opacity: added ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 10, background: added ? '#F9F8F6' : 'var(--accent-red)', color: added ? 'var(--text-dark)' : 'white' }} disabled={loadingAdd || added || !bookDetails?.id}>
                {loadingAdd ? <Loader2 className="lucide-spin" size={18} /> : (added ? <Heart size={18} fill="var(--accent-red)" color="var(--accent-red)" /> : <Heart size={18} />)}
                {added ? 'Favoritado' : 'Favoritar Livro'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div style={{ background: '#F3EFE9', padding: '12px', borderRadius: '16px' }}>
            <Calculator size={24} color="var(--accent-purple)" />
          </div>
          <div>
            <h2 className="chewy-font" style={{ fontSize: '1.8rem', margin: 0 }}>Scoring do Prolog</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Gênero = 10 pts | Tropos = 5 pts cada.</p>
          </div>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', color: 'var(--accent-purple)' }}>
            <Loader2 size={40} className="lucide-spin" style={{ marginBottom: '10px' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Processando pesos no SWI-Prolog...</p>
          </div>
        ) : (
          <div className="books-grid">
            {similar.length > 0 ? similar.map((s, i) => (
              <Link to={`/book/${encodeURIComponent(s.title)}`} key={i} className="book-card">
                <div style={{ position: 'relative' }}>
                  {s.cover_url ? (
                    <img src={s.cover_url} alt={s.title} />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '2.5/4', background: '#D9D9D9', borderRadius: '12px', marginBottom: '12px' }} />
                  )}
                  {/* Score badge */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--accent-purple)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '99px' }}>
                    {s.score} pts
                  </div>
                </div>
                
                <div className="book-title">{s.title}</div>
                <div className="book-author" style={{ color: 'var(--text-muted)' }}>Match Prolog</div>
              </Link>
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: '#F9F8F6', borderRadius: '24px' }}>
                <h3>Nenhum match encontrado.</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Este livro não compartilha Gênero ou Tropos com os outros do catálogo.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
