import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { searchOpenLibrary, importBookToProlog } from './api';
import { supabase } from './lib/supabase';
import { ChevronLeft, BookmarkPlus, BookmarkCheck, Loader2 } from 'lucide-react';

const MOCK_USER_ID = 'mari_profile_1';

export default function Showcase() {
  const { genre } = useParams();
  const [books, setBooks] = useState<any[]>([]);
  const [addingState, setAddingState] = useState<Record<string, 'importing' | 'done' | 'error'>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const titleMap: Record<string, string> = {
    all: 'Todo o Catálogo',
    romance: 'Romances',
    fantasia: 'Fantasia & Magia',
    ficção: 'Ficção Científica',
    mistério: 'Mistério & Suspense',
    terror: 'Terror & Horror',
    jovem: 'Jovem Adulto',
    infantil: 'Livros Infantis',
    clássico: 'Clássicos da Literatura',
    bestsellers: 'Bestsellers do Ano'
  };

  const searchTermMap: Record<string, string> = {
    all: 'bestseller',
    romance: 'romance',
    fantasia: 'fantasy',
    ficção: 'science fiction',
    mistério: 'mystery',
    terror: 'horror',
    jovem: 'young adult',
    infantil: 'children',
    clássico: 'classic',
    bestsellers: 'popular'
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const queryTerm = genre ? (searchTermMap[genre] || genre) : 'popular';
      
      try {
        const data = await searchOpenLibrary(queryTerm, 1);
        const fetchedBooks = data.books || [];
        await checkExisting(fetchedBooks);
        setBooks(fetchedBooks);
        setPage(1);
      } catch (err) {
        console.error("Erro ao carregar dados da vitrine:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [genre]);

  async function checkExisting(fetchedBooks: any[]) {
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
        setAddingState(prev => ({ ...prev, ...newImportState }));
      }
    }
  }

  async function loadMore() {
    setLoadingMore(true);
    const nextPage = page + 1;
    const queryTerm = genre ? (searchTermMap[genre] || genre) : 'popular';
    try {
      const data = await searchOpenLibrary(queryTerm, nextPage);
      const fetchedBooks = data.books || [];
      await checkExisting(fetchedBooks);
      setBooks(prev => [...prev, ...fetchedBooks]);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleImportToSystem(e: React.MouseEvent, book: any) {
    e.preventDefault(); // Impede o Link de navegar
    const bookKey = book.open_library_key;
    if (addingState[bookKey] === 'done') return;
    
    setAddingState(prev => ({ ...prev, [bookKey]: 'importing' }));
    
    try {
      await importBookToProlog({
        title: book.title,
        author: book.author,
        cover_url: book.cover_url,
        genres: book.genres || [genre || "Ficção"]
      });
      setAddingState(prev => ({ ...prev, [bookKey]: 'done' }));
    } catch (err) {
      console.error(err);
      setAddingState(prev => ({ ...prev, [bookKey]: 'error' }));
    }
  }

  const displayTitle = genre ? (titleMap[genre] || genre) : 'Catálogo';

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '30px' }}>
        <Link to="/" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F3EFE9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)' }}>
          <ChevronLeft size={20} />
        </Link>
        <h1 className="chewy-font" style={{ fontSize: '2.5rem', margin: 0 }}>{displayTitle}</h1>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <Loader2 size={48} className="lucide-spin" color="var(--accent-purple)" style={{ margin: '0 auto 20px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Buscando milhares de livros na Open Library...</p>
        </div>
      ) : (
        <div className="books-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '30px' }}>
          {books.map((b, i) => {
            const isDone = addingState[b.open_library_key] === 'done';
            const isImporting = addingState[b.open_library_key] === 'importing';
            
            return (
              <Link to={`/book/${encodeURIComponent(b.title)}`} key={i} className="book-card" style={{ position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  {b.cover_url ? (
                    <img src={b.cover_url} alt={b.title} style={{ aspectRatio: '2.5/4', width: '100%' }} />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '2.5/4', background: '#D9D9D9', borderRadius: '12px', marginBottom: '12px' }} />
                  )}
                  
                  <button 
                    onClick={(e) => handleImportToSystem(e, b)}
                    title={isDone ? "Já adicionado ao Supabase/Prolog" : "Importar livro para o Prolog"}
                    style={{ 
                      position: 'absolute', bottom: '-10px', right: '15px', 
                      width: '32px', height: '42px', 
                      background: isDone ? '#57B894' : '#E8B65A', 
                      color: 'white', border: 'none', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', cursor: isDone ? 'default' : 'pointer',
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)',
                      zIndex: 10, paddingBottom: '8px'
                    }}
                  >
                    {isImporting ? <div style={{width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}} /> : (isDone ? <BookmarkCheck size={18} /> : <BookmarkPlus size={18} />)}
                  </button>
                </div>
                
                <div className="book-title" style={{ marginTop: '10px', fontSize: '1.1rem' }}>{b.title}</div>
                <div className="book-author" style={{ fontSize: '0.9rem' }}>{b.author}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{b.genres?.slice(0,1).join('') || 'Fiction'}</div>
              </Link>
            );
          })}
          {books.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '40px', background: '#F9F8F6', borderRadius: '24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Nenhum livro encontrado nessa categoria.</p>
            </div>
          )}
        </div>
      )}
      
      {!loading && books.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <button 
            onClick={loadMore} 
            disabled={loadingMore}
            className="btn-gradient" 
            style={{ minWidth: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            {loadingMore ? <Loader2 className="lucide-spin" size={20} /> : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>
  );
}
