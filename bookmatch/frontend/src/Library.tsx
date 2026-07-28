import { useState, useEffect } from 'react';
import { BookOpen, UserCircle, Save, CheckCircle2, Loader2, Sparkles, Heart } from 'lucide-react';
import { supabase } from './lib/supabase';
import { recommendForUserProfile, saveUserProfile, getUserProfile } from './api';
import { Link } from 'react-router-dom';

const MOCK_USER_ID = 'mari_profile_1';

export default function Library() {
  const [name, setName] = useState('');
  const [genres, setGenres] = useState('');
  const [tropes, setTropes] = useState('');
  const [readBooks, setReadBooks] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteBooksDetails, setFavoriteBooksDetails] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<{title: string, cover_url?: string}[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [prologBooks, setPrologBooks] = useState<any[]>([]);

  // Load profile from Supabase
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserProfile(MOCK_USER_ID);

        if (data) {
          setName(data.name || '');
          setGenres((data.liked_genres || []).join(', '));
          setTropes((data.liked_tropes || []).join(', '));
          setReadBooks(data.read_books || []);
          
          if (data.liked_genres || data.liked_tropes || data.read_books) {
             fetchRecommendations(data.liked_genres || [], data.liked_tropes || [], data.read_books || []);
          }
          
          if (data.read_books && data.read_books.length > 0) {
             const { data: favs } = await supabase.from('books').select('*').in('id', data.read_books);
             if (favs) setFavoriteBooksDetails(favs);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function fetchRecommendations(g: string[], t: string[], r: string[]) {
    setLoadingRecs(true);
    try {
       const data = await recommendForUserProfile(MOCK_USER_ID, g, t, r);
       const titles = data.recommendations || [];
       
       if (titles.length > 0) {
         // Fetch covers from Supabase
         const { data: dbBooks } = await supabase.from('books').select('title, cover_url').in('title', titles);
         
         const richRecs = titles.map((titleStr: string) => {
           const match = dbBooks?.find(b => b.title === titleStr);
           return { title: titleStr, cover_url: match?.cover_url };
         });
         setRecommendations(richRecs);
       } else {
         setRecommendations([]);
       }
    } catch (err) {
       console.error("Erro ao buscar recomendações IA:", err);
    } finally {
       setLoadingRecs(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const parsedGenres = genres.split(',').map(g => g.trim()).filter(Boolean);
    const parsedTropes = tropes.split(',').map(t => t.trim()).filter(Boolean);

    try {
      await saveUserProfile({
        id: MOCK_USER_ID,
        name: name || 'Leitor',
        liked_genres: parsedGenres,
        liked_tropes: parsedTropes
      });

    } catch (err) {
      console.error("Erro ao salvar:", err);
      localStorage.setItem('localProfile', JSON.stringify({ name, genres: parsedGenres, tropes: parsedTropes }));
    }

    try {
      setSaved(true);
      fetchRecommendations(parsedGenres, parsedTropes, readBooks);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade">
      <header style={{ paddingBottom: '30px', textAlign: 'center' }}>
        <h1 className="chewy-font" style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>Minha Estante</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Gerencie seu perfil de leitor. Suas escolhas aqui alimentam diretamente o motor de Inteligência Artificial do Prolog.
        </p>
      </header>

      <section style={{ maxWidth: '700px', margin: '0 auto 40px', padding: '30px', background: '#F9F8F6', borderRadius: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #EBE5DF' }}>
          <UserCircle size={64} color="var(--accent-purple)" />
          <div>
            <h2 className="chewy-font" style={{ margin: '0 0 5px 0', fontSize: '1.8rem', color: 'var(--text-dark)' }}>Perfil do Leitor</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sincronizado via Supabase</p>
          </div>
        </div>

        {loading && !name ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
            <Loader2 size={32} className="lucide-spin" color="var(--accent-purple)" />
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>Nome ou Apelido</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Como quer ser chamado?"
                required
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #EBE5DF', background: 'white', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>Gêneros Favoritos (separados por vírgula)</label>
              <input 
                type="text" 
                value={genres} 
                onChange={e => setGenres(e.target.value)} 
                placeholder="Ex: Fantasia, Romance, Mistério"
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #EBE5DF', background: 'white', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>Tropos / Elementos Favoritos (separados por vírgula)</label>
              <input 
                type="text" 
                value={tropes} 
                onChange={e => setTropes(e.target.value)} 
                placeholder="Ex: Enemies to Lovers, Found Family"
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #EBE5DF', background: 'white', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>

            <button type="submit" className="btn-gradient" style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }} disabled={loading}>
              {loading ? <Loader2 size={20} className="lucide-spin" /> : (saved ? <CheckCircle2 size={20} /> : <Save size={20} />)}
              {loading ? 'Salvando...' : (saved ? 'Perfil Salvo e Sincronizado!' : 'Salvar Preferências')}
            </button>
          </form>
        )}
      </section>

      <section style={{ maxWidth: '700px', margin: '0 auto 40px', padding: '30px', background: '#F9F8F6', borderRadius: '30px' }}>
        <h2 className="chewy-font" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '1.8rem' }}>
          <Heart size={24} color="var(--accent-red)" /> Livros Favoritados
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Você pode favoritar livros na página de detalhes de cada obra. O Prolog utiliza esses livros para encontrar recomendações parecidas para você!
        </p>

        {favoriteBooksDetails.length > 0 ? (
          <div className="books-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
            {favoriteBooksDetails.map((b, i) => (
              <Link to={`/book/${encodeURIComponent(b.title)}`} key={i} className="book-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div style={{ position: 'relative' }}>
                  {b.cover_url ? (
                    <img src={b.cover_url} alt={b.title} style={{ width: '100%', borderRadius: '12px', aspectRatio: '2.5/4', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '2.5/4', background: '#D9D9D9', borderRadius: '12px' }} />
                  )}
                  <div style={{ position: 'absolute', top: 5, right: 5, background: 'white', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={14} fill="var(--accent-red)" color="var(--accent-red)" />
                  </div>
                </div>
                <div className="book-title" style={{ marginTop: '10px', fontSize: '0.9rem' }}>{b.title}</div>
                <div className="book-author" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.author}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ padding: '30px', background: 'white', borderRadius: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum livro favoritado ainda. Pesquise e clique no ícone de coração!
          </div>
        )}
      </section>

      <section style={{ maxWidth: '700px', margin: '0 auto', marginBottom: '60px' }}>
        <h2 className="chewy-font" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '1.8rem' }}>
          <Sparkles size={24} color="var(--accent-purple)" /> Recomendados para Você (Prolog IA)
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
          Baseado nos seus <strong>Favoritos</strong>, Gêneros e Tropos, o motor lógico analisou todo o catálogo para sugerir as obras abaixo.
        </p>
        
        {loadingRecs ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '30px', background: '#F9F8F6', borderRadius: '30px' }}>
             <Loader2 size={32} className="lucide-spin" color="var(--accent-purple)" />
          </div>
        ) : recommendations.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {recommendations.map((rec, idx) => (
              <Link to={`/book/${encodeURIComponent(rec.title)}`} key={idx} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '20px', background: '#F9F8F6', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #EBE5DF', transition: 'transform 0.2s', cursor: 'pointer' }}>
                  {rec.cover_url ? (
                    <div style={{ width: '50px', height: '75px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      <img src={rec.cover_url} alt={rec.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: '50px', height: '75px', background: 'var(--accent-purple)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                      <BookOpen size={20} />
                    </div>
                  )}
                  <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-dark)' }}>{rec.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px', background: '#F9F8F6', borderRadius: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <BookOpen size={48} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
            <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6 }}>
              Favorite livros ou preencha seus gêneros e tropos favoritos acima e salve para ver a Inteligência Artificial em ação!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
