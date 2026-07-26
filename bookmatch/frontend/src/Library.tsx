import { useState, useEffect } from 'react';
import { BookOpen, UserCircle, Save, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { supabase } from './lib/supabase';
import { recommendForUserProfile } from './api';

const MOCK_USER_ID = '11111111-1111-1111-1111-111111111111';

export default function Library() {
  const [name, setName] = useState('');
  const [genres, setGenres] = useState('');
  const [tropes, setTropes] = useState('');
  const [readBooks, setReadBooks] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Load profile from Supabase
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', MOCK_USER_ID)
          .single();

        if (data && !error) {
          setName(data.name || '');
          setGenres((data.liked_genres || []).join(', '));
          setTropes((data.liked_tropes || []).join(', '));
          setReadBooks(data.read_books || []);
          
          if (data.liked_genres || data.liked_tropes || data.read_books) {
             fetchRecommendations(data.liked_genres || [], data.liked_tropes || [], data.read_books || []);
          }
        } else if (error && error.code !== 'PGRST116') {
          console.error("Erro ao carregar perfil:", error);
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
       setRecommendations(data.recommendations || []);
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
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: MOCK_USER_ID,
          name: name || 'Leitor',
          liked_genres: parsedGenres,
          liked_tropes: parsedTropes
        });

      if (error) {
        console.error("Erro do Supabase ao salvar:", error);
        localStorage.setItem('localProfile', JSON.stringify({ name, genres: parsedGenres, tropes: parsedTropes }));
      }

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

      <section style={{ maxWidth: '700px', margin: '0 auto', marginBottom: '60px' }}>
        <h2 className="chewy-font" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '1.8rem' }}>
          <Sparkles color="var(--accent-purple)" /> Recomendados para Você (Prolog IA)
        </h2>
        
        {loadingRecs ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '30px', background: '#F9F8F6', borderRadius: '30px' }}>
             <Loader2 size={32} className="lucide-spin" color="var(--accent-purple)" />
          </div>
        ) : recommendations.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {recommendations.map((title, idx) => (
              <div key={idx} style={{ padding: '20px', background: '#F9F8F6', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--accent-purple)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>📚</div>
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-dark)' }}>{title}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px', background: '#F9F8F6', borderRadius: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <BookOpen size={48} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
            <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6 }}>
              Preencha seus gêneros e tropos favoritos acima e salve para ver a Inteligência Artificial em ação!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
