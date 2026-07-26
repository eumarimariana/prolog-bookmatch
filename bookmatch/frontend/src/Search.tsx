import { useState } from 'react';
import { searchOpenLibrary, importBookToProlog, recommendAdvanced, API_URL } from './api';
import { Search as SearchIcon, Loader2, PlusCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingState, setImportingState] = useState<Record<string, 'importing' | 'done' | 'error'>>({});
  const [filterMode, setFilterMode] = useState<'openlibrary' | 'prolog'>('openlibrary');
  const [genreFilter, setGenreFilter] = useState('');
  const [tropeFilter, setTropeFilter] = useState('');
  const [prologResults, setPrologResults] = useState<string[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query && !genreFilter && !tropeFilter) return;
    setLoading(true);
    try {
      if (filterMode === 'openlibrary') {
        const data = await searchOpenLibrary(query);
        const fetchedBooks = data.books || [];

        // Checa no Supabase quais livros já estão no catálogo
        if (fetchedBooks.length > 0) {
          const titles = fetchedBooks.map((b: any) => b.title);
          const { data: existingBooks } = await supabase.from('books').select('title').in('title', titles);

          if (existingBooks && existingBooks.length > 0) {
            const existingTitles = existingBooks.map((b: any) => b.title);
            const newImportState: Record<string, 'importing' | 'done' | 'error'> = {};

            fetchedBooks.forEach((b: any) => {
              if (existingTitles.includes(b.title)) {
                newImportState[b.open_library_key] = 'done';
              }
            });

            setImportingState(newImportState);
          } else {
            setImportingState({});
          }
        }
        setResults(fetchedBooks);
        setPrologResults([]);
      } else {
        // Prolog Filter Mode
        const res = await fetch(`${API_URL}/recommend/advanced`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt: query,
            genre: genreFilter, 
            themes: tropeFilter ? [tropeFilter] : [] 
          })
        });
        if (res.ok) {
          const data = await res.json();
          setPrologResults(data.recommendations || []);
        }
        setResults([]);
      }
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
    <div className="animate-fade">
      <header style={{ paddingBottom: '30px' }}>
        <h1 className="chewy-font" style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>Recomendações & Pesquisa</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Descubra novos livros de duas formas: pesquisando diretamente via API Global (Open Library) ou obtendo recomendações do nosso banco de dados aplicando as regras lógicas do motor Prolog.
        </p>
      </header>

      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button 
            onClick={() => setFilterMode('openlibrary')}
            style={{ padding: '8px 16px', borderRadius: '99px', border: 'none', background: filterMode === 'openlibrary' ? 'var(--accent-purple)' : '#F9F8F6', color: filterMode === 'openlibrary' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}
          >
            Pesquisa via API (Global)
          </button>
          <button 
            onClick={() => setFilterMode('prolog')}
            style={{ padding: '8px 16px', borderRadius: '99px', border: 'none', background: filterMode === 'prolog' ? 'var(--accent-purple)' : '#F9F8F6', color: filterMode === 'prolog' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}
          >
            Recomendações Banco de Dados (Regras Prolog)
          </button>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '600px' }}>
          <div className="search-input-wrapper" style={{ background: '#F9F8F6', padding: '10px 10px 10px 20px', borderRadius: '99px' }}>
            <SearchIcon size={24} color="var(--text-muted)" style={{ marginRight: '10px' }} />
            <input 
              type="text" 
              placeholder={filterMode === 'openlibrary' ? "Nome do livro ou autor..." : "Pesquisa livre (opcional)..."} 
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {filterMode === 'openlibrary' && (
              <button type="submit" className="btn-gradient" disabled={loading}>
                {loading ? <Loader2 className="lucide-spin" size={20} /> : 'Search'}
              </button>
            )}
          </div>
          
          {filterMode === 'prolog' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Gênero (ex: Fantasia, Romance)" 
                value={genreFilter}
                onChange={e => setGenreFilter(e.target.value)}
                style={{ flex: 1, padding: '12px 20px', borderRadius: '99px', border: '1px solid #EBE5DF', outline: 'none' }}
              />
              <input 
                type="text" 
                placeholder="Trope (ex: Enemies to Lovers)" 
                value={tropeFilter}
                onChange={e => setTropeFilter(e.target.value)}
                style={{ flex: 1, padding: '12px 20px', borderRadius: '99px', border: '1px solid #EBE5DF', outline: 'none' }}
              />
              <button type="submit" className="btn-gradient" disabled={loading}>
                {loading ? <Loader2 className="lucide-spin" size={20} /> : 'Filtrar'}
              </button>
            </div>
          )}
        </form>
      </section>

      {prologResults.length > 0 && (
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {prologResults.map((title, i) => (
            <div key={i} style={{ padding: '20px', background: '#F9F8F6', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--accent-purple)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>📚</div>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-dark)' }}>{title}</h3>
            </div>
          ))}
        </section>
      )}

      {results.length > 0 && (
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {results.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: '20px', padding: '20px', background: '#F9F8F6', borderRadius: '24px', alignItems: 'center' }}>
              <div style={{ flex: '0 0 100px', height: '150px', background: '#EBE5DF', borderRadius: '12px', overflow: 'hidden' }}>
                {b.cover_url ? (
                  <img src={b.cover_url} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '10px' }}>Sem capa</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', margin: '0 0 5px 0' }}>{b.title}</h3>
                <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: 'var(--accent-red)', fontWeight: 600 }}>por {b.author}</p>
                
                {importingState[b.open_library_key] === 'done' ? (
                  <button style={{ background: '#57B894', color: 'white', padding: '8px 16px', borderRadius: '99px', fontSize: '0.85rem', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }} disabled>
                    <CheckCircle2 size={16} /> Injetado no Prolog
                  </button>
                ) : (
                  <button 
                    style={{ background: 'white', border: '1px solid #EBE5DF', color: 'var(--text-dark)', padding: '8px 16px', borderRadius: '99px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => handleImport(b)}
                    disabled={importingState[b.open_library_key] === 'importing'}
                  >
                    {importingState[b.open_library_key] === 'importing' ? <Loader2 size={16} className="lucide-spin" /> : <PlusCircle size={16} color="var(--accent-purple)" />}
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
