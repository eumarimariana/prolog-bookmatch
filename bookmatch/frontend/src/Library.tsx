import { useState } from 'react';
import { BookOpen, UserCircle, Save, CheckCircle2 } from 'lucide-react';

export default function Library() {
  const [name, setName] = useState('Mariana');
  const [genres, setGenres] = useState('Romance, Fantasia');
  const [tropes, setTropes] = useState('Melancólico, Found Family');
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // Em uma aplicação real, salvaríamos no Supabase ou LocalStorage
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="container animate-fade">
      <header style={{ textAlign: 'center', padding: '4rem 0 3rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Minha Estante</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto' }}>
          Gerencie seu perfil de leitor. Os dados que você colocar aqui alimentarão a IA do Prolog na página inicial ("Filtragem por Perfil").
        </p>
      </header>

      <section className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto 4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <UserCircle size={48} color="var(--primary-purple)" />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Perfil do Leitor</h2>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>ID: usr_1 (Mock Local)</p>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group">
            <label>Nome</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Gêneros Favoritos (separados por vírgula)</label>
            <input type="text" value={genres} onChange={e => setGenres(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Tropos / Humores Favoritos (separados por vírgula)</label>
            <input type="text" value={tropes} onChange={e => setTropes(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            {saved ? <CheckCircle2 size={20} /> : <Save size={20} />}
            {saved ? 'Perfil Salvo!' : 'Salvar Preferências'}
          </button>
        </form>
      </section>

      <section style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen color="var(--primary-purple)" /> Histórico (Mock)
        </h2>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
          Nenhum livro lido ainda. Futuramente você poderá marcar os livros importados como lidos, e eles serão injetados no Prolog (user_read/2) para refinar ainda mais as sugestões e evitar repetições!
        </div>
      </section>
    </div>
  );
}
