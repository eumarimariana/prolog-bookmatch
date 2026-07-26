import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Search, Bookmark, ChevronLeft, ChevronRight, Eye, BookmarkPlus, BookmarkCheck, Library, Smartphone, Sparkles, Crown, Headphones, Rocket, Heart, Flame, Ghost, ShieldAlert, Puzzle, Landmark, Telescope, Loader2 } from 'lucide-react';
import { searchOpenLibrary, importBookToProlog } from './api';

const MOCK_USER_ID = '11111111-1111-1111-1111-111111111111';

export default function Home() {
  const [defaultShelf, setDefaultShelf] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [readBooks, setReadBooks] = useState<string[]>([]);
  const [addingState, setAddingState] = useState<Record<string, 'importing' | 'done' | 'error'>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPage, setLoadingPage] = useState(false);
  const navigate = useNavigate();

  async function fetchPage(page: number) {
    if (page < 1) return;
    setLoadingPage(true);
    try {
      const data = await searchOpenLibrary('popular', page);
      const fetchedBooks = data.books || [];
      
      if (fetchedBooks.length > 0) {
        const titles = fetchedBooks.map((b: any) => b.title);
        const { data: existingBooks } = await supabase.from('books').select('title, id').in('title', titles);
        
        if (existingBooks && existingBooks.length > 0) {
          const existingTitles = existingBooks.map((b: any) => b.title);
          const newImportState: Record<string, 'importing' | 'done' | 'error'> = {};
          fetchedBooks.forEach((b: any) => {
            if (existingTitles.includes(b.title)) {
              newImportState[b.open_library_key] = 'done';
            }
          });
          setAddingState(newImportState);
        } else {
          setAddingState({});
        }
      }
      
      setDefaultShelf(fetchedBooks);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPage(false);
    }
  }

  useEffect(() => {
    fetchPage(1);
  }, []);

  async function handleImportToSystem(e: React.MouseEvent, book: any) {
    e.preventDefault(); 
    const bookKey = book.open_library_key;
    if (addingState[bookKey] === 'done') return;
    
    setAddingState(prev => ({ ...prev, [bookKey]: 'importing' }));
    try {
      await importBookToProlog({
        title: book.title,
        author: book.author,
        cover_url: book.cover_url,
        genres: book.genres || ["Ficção"]
      });
      setAddingState(prev => ({ ...prev, [bookKey]: 'done' }));
    } catch (err) {
      console.error(err);
      setAddingState(prev => ({ ...prev, [bookKey]: 'error' }));
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/search');
    }
  }

  const categories = [
    { name: 'All', icon: <Library size={24} />, color: '#57B894', genre: 'all' },
    { name: 'eBooks', icon: <Smartphone size={24} />, color: '#6A9BC3', genre: 'ebooks' },
    { name: 'New', icon: <Sparkles size={24} />, color: '#DE6B6B', genre: 'new' },
    { name: 'Bestsellers', icon: <Crown size={24} />, color: '#E8B65A', genre: 'bestsellers' },
    { name: 'Audiobooks', icon: <Headphones size={24} />, color: '#57B894', genre: 'audiobooks' },
    { name: 'Fiction', icon: <Rocket size={24} />, color: '#9D6ED2', genre: 'ficção' },
    { name: 'Romance', icon: <Heart size={24} />, color: '#F08D6C', genre: 'romance' },
    { name: 'Fantasy', icon: <Flame size={24} />, color: '#588EB9', genre: 'fantasia' },
    { name: 'Manga', icon: <Ghost size={24} />, color: '#8679B9', genre: 'manga' },
    { name: 'Crime', icon: <ShieldAlert size={24} />, color: '#3E3B39', genre: 'mistério' },
  ];

  return (
    <div className="animate-fade">
      <div className="top-bar">
        <form className="search-input-wrapper" onSubmit={handleSearchSubmit}>
          <Search size={20} color="var(--text-muted)" style={{ marginRight: '10px' }} />
          <input 
            type="text" 
            placeholder="Search for books in Open Library..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-gradient">search</button>
        </form>
        <Link to="/catalog" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1EBE3', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', textDecoration: 'none' }}>
          <Bookmark size={20} color="var(--text-muted)" />
          <div style={{ position: 'absolute', top: 5, right: 5, width: 10, height: 10, background: 'var(--accent-red)', borderRadius: '50%' }}></div>
        </Link>
      </div>

      <div className="categories-row">
        {categories.map((c, i) => (
          <div key={i} className="category-item" onClick={() => navigate(`/showcase/${c.genre}`)}>
            <div className="cat-icon-box" style={{ borderColor: c.color, color: c.color }}>
              {c.icon}
            </div>
            <span>{c.name}</span>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h2 className="chewy-font" style={{ fontSize: '1.8rem', margin: 0 }}>Popular</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => navigate('/showcase/all')}>View All</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div onClick={() => !loadingPage && fetchPage(currentPage - 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #EBE5DF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (currentPage > 1 && !loadingPage) ? 'pointer' : 'not-allowed', opacity: (currentPage > 1 && !loadingPage) ? 1 : 0.5 }}><ChevronLeft size={16} /></div>
            
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-purple)', minWidth: '20px', textAlign: 'center' }}>
              {currentPage}
            </span>
            
            <div onClick={() => !loadingPage && fetchPage(currentPage + 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #EBE5DF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loadingPage ? 'not-allowed' : 'pointer', opacity: loadingPage ? 0.5 : 1 }}><ChevronRight size={16} /></div>
          </div>
        </div>
      </div>

      {loadingPage ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', gridColumn: '1 / -1' }}>
          <Loader2 size={40} className="lucide-spin" color="var(--accent-purple)" />
        </div>
      ) : (
        <div className="books-grid">
          {defaultShelf.map((b, i) => {
          const isDone = addingState[b.open_library_key] === 'done';
          const isImporting = addingState[b.open_library_key] === 'importing';
          
          return (
            <Link to={`/book/${encodeURIComponent(b.title)}`} key={i} className="book-card" style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                {b.cover_url ? (
                  <img src={b.cover_url} alt={b.title} />
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
              
              <div className="book-title" style={{ marginTop: '10px' }}>{b.title}</div>
              <div className="book-author">{b.author}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{b.genres?.[0] || 'Fiction'}</div>
            </Link>
          );
        })}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', background: '#F1EBE3', padding: '20px', borderRadius: '24px' }}>
        <div style={{ flex: '0 0 160px', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '2px' }}>
             <div style={{ height: '24px', background: '#DE6B6B', borderRadius: '4px' }}></div>
             <div style={{ height: '28px', background: '#7162A5', borderRadius: '4px' }}></div>
             <div style={{ height: '20px', background: '#57B894', borderRadius: '4px' }}></div>
             <div style={{ height: '32px', background: '#6A9BC3', borderRadius: '4px' }}></div>
             <div style={{ height: '24px', background: '#8679B9', borderRadius: '4px' }}></div>
          </div>
        </div>
        
        <div style={{ flex: 1, padding: '10px 0' }}>
          <h3 className="chewy-font" style={{ fontSize: '1.6rem', marginBottom: '10px' }}>2026 year 50 most popular Bestsellers</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '300px' }}>
            List of the most interesting books of the year based on our global API catalog.
          </p>
          <button onClick={() => navigate('/showcase/bestsellers')} style={{ background: '#E76666', color: 'white', border: 'none', padding: '8px 24px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <Eye size={16} /> view all
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/showcase/infantil" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: 'white', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
              <div style={{ width: '40px', height: '40px', background: '#DE6B6B', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Puzzle size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', margin: 0 }}>Top 50 books for kids</h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Picture books, book series.</p>
              </div>
            </div>
          </Link>
          <Link to="/showcase/clássico" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: 'white', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
              <div style={{ width: '40px', height: '40px', background: '#E8B65A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Landmark size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', margin: 0 }}>Top 50 Classic books</h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Discover the most influential books.</p>
              </div>
            </div>
          </Link>
          <Link to="/showcase/ficção" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: 'white', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
              <div style={{ width: '40px', height: '40px', background: '#8679B9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Telescope size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', margin: 0 }}>Top 50 Sci-Fi books</h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Discover the best sci-fi books.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
