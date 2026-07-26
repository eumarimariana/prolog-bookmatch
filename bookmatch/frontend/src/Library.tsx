import { useState, useEffect } from 'react';
import { BookOpen, UserCircle, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

const MOCK_USER_ID = '11111111-1111-1111-1111-111111111111';

export default function Library() {
  const [name, setName] = useState('');
  const [genres, setGenres] = useState('');
  const [tropes, setTropes] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

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
        // Fallback local se RLS bloquear (já que RLS de user_profiles não foi configurado na SQL anterior)
        localStorage.setItem('localProfile', JSON.stringify({ name, genres: parsedGenres, tropes: parsedTropes }));
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade">
      <header className="container" style={{ textAlign: 'center', padding: '4rem 2rem 3rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Minha Estante</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto' }}>
          Gerencie seu perfil de leitor. Suas escolhas aqui alimentam diretamente o motor de Inteligência Artificial do Prolog.
        </p>
      </header>

      <section className="container glass-panel" style={{ maxWidth: '700px', margin: '0 auto 4rem', padding: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <UserCircle size={64} color="var(--primary-purple)" />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-dark)' }}>Perfil do Leitor</h2>
            <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-light)' }}>Sincronizado via Supabase</p>
          </div>
        </div>

        {loading && !name ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader2 size={32} className="lucide-spin" color="var(--primary-purple)" />
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-group">
              <label>Nome ou Apelido</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Como quer ser chamado?"
                required
              />
            </div>
            <div className="input-group">
              <label>Gêneros Favoritos (separados por vírgula)</label>
              <input 
                type="text" 
                value={genres} 
                onChange={e => setGenres(e.target.value)} 
                placeholder="Ex: Fantasia, Romance, Mistério"
              />
            </div>
            <div className="input-group">
              <label>Tropos / Elementos Favoritos (separados por vírgula)</label>
              <input 
                type="text" 
                value={tropes} 
                onChange={e => setTropes(e.target.value)} 
                placeholder="Ex: Enemies to Lovers, Found Family"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '2rem' }} disabled={loading}>
              {loading ? <Loader2 size={20} className="lucide-spin" /> : (saved ? <CheckCircle2 size={20} /> : <Save size={20} />)}
              {loading ? 'Salvando...' : (saved ? 'Perfil Salvo e Sincronizado!' : 'Salvar Preferências')}
            </button>
          </form>
        )}
      </section>

      <section className="container" style={{ maxWidth: '700px', margin: '0 auto', marginBottom: '6rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <BookOpen color="var(--primary-purple)" /> Meu Histórico
        </h2>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
          <BookOpen size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
          <p style={{ margin: 0, fontSize: '1.1rem' }}>
            Nenhum livro lido ainda. Futuramente, seus livros lidos alimentarão a regra <strong>user_read/2</strong> do Prolog para que a IA nunca sugira algo que você já leu!
          </p>
        </div>
      </section>
    </div>
  );
}
