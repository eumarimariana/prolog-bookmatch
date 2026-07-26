import { useState } from 'react';
import { searchOpenLibrary, importBookToProlog } from './api';
import { Search as SearchIcon, Loader2, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingState, setImportingState] = useState<Record<string, 'importing' | 'done' | 'error'>>({});

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const data = await searchOpenLibrary(query);
      setResults(data.books || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleImport(book: any) {
    const bookKey = book.open_library_key;
    setImportingState(prev => ({ ...prev, [bookKey]: 'importing' }));
    
    try {
      await importBookToProlog({
        title: book.title,
        author: book.author,
        cover_url: book.cover_url,
        genres: book.genres || ["Ficção"]
      });
      setImportingState(prev => ({ ...prev, [bookKey]: 'done' }));
    } catch (err) {
      console.error(err);
      setImportingState(prev => ({ ...prev, [bookKey]: 'error' }));
    }
  }

  return (
    <div className="container animate-fade">
      <header style={{ textAlign: 'center', padding: '4rem 0 3rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Pesquisar Catálogo</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto' }}>
          Busque livros no mundo inteiro através da Open Library e importe-os diretamente para o motor lógico Prolog (e para o Supabase) com um clique.
        </p>
      </header>

      <section style={{ maxWidth: '700px', margin: '0 auto 4rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Nome do livro ou autor..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, padding: '1.25rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem' }} disabled={loading}>
            {loading ? <Loader2 className="lucide-spin" size={24} /> : <SearchIcon size={24} />}
          </button>
        </form>
      </section>

      {results.length > 0 && (
        <section className="grid grid-cols-2">
          {results.map((b, i) => (
            <div key={i} className="glass-panel" style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', alignItems: 'center' }}>
              <div style={{ flex: '0 0 100px', height: '150px', background: 'var(--bg-color)', borderRadius: '12px', overflow: 'hidden' }}>
                {b.cover_url ? (
                  <img src={b.cover_url} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', background: '#E2E8F0' }}>Sem capa</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.25rem 0' }}>{b.title}</h3>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>por {b.author}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {(b.genres || []).slice(0, 2).map((g: string, idx: number) => (
                    <span key={idx} style={{ fontSize: '0.75rem', background: 'rgba(124,58,237,0.1)', color: 'var(--primary-purple)', padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 600 }}>
                      {g}
                    </span>
                  ))}
                </div>
                
                {importingState[b.open_library_key] === 'done' ? (
                  <button className="btn" style={{ background: '#10B981', color: 'white', padding: '0.5rem 1rem', fontSize: '0.9rem' }} disabled>
                    <CheckCircle2 size={16} /> Injetado no Prolog
                  </button>
                ) : (
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    onClick={() => handleImport(b)}
                    disabled={importingState[b.open_library_key] === 'importing'}
                  >
                    {importingState[b.open_library_key] === 'importing' ? <Loader2 size={16} className="lucide-spin" /> : <PlusCircle size={16} />}
                    {importingState[b.open_library_key] === 'importing' ? 'Importando...' : 'Adicionar ao Prolog'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
