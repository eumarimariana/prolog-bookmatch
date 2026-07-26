import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Link } from 'react-router-dom';

export default function Catalog() {
  const [loading, setLoading] = useState(true);
  const [prologBooks, setPrologBooks] = useState<any[]>([]);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const { data: dbBooks, error: dbError } = await supabase.from('books').select('*').order('created_at', { ascending: false });
        if (dbBooks && !dbError) {
          const uniqueBooks = [];
          const seen = new Set();
          for (const b of dbBooks) {
            if (!seen.has(b.title)) {
              seen.add(b.title);
              uniqueBooks.push(b);
            }
          }
          setPrologBooks(uniqueBooks);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  return (
    <div className="animate-fade">
      <div style={{ paddingBottom: '20px' }}>
        <Link to="/" className="btn" style={{ padding: '0.5rem 1rem', background: '#F3EFE9', color: 'var(--text-dark)', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <ArrowLeft size={18} /> Voltar
        </Link>
      </div>

      <header style={{ paddingBottom: '30px', textAlign: 'center' }}>
        <h1 className="chewy-font" style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>Catálogo do Prolog</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Todos os livros que você "baixou" e importou para a Inteligência Artificial.
        </p>
      </header>

      <section style={{ maxWidth: '900px', margin: '0 auto', marginBottom: '60px' }}>
        {loading ? (
           <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
             <Loader2 size={32} className="lucide-spin" color="var(--accent-purple)" />
           </div>
        ) : prologBooks.length > 0 ? (
          <div className="books-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
            {prologBooks.map((b, i) => (
              <Link to={`/book/${encodeURIComponent(b.title)}`} key={i} className="book-card" style={{ position: 'relative', display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ position: 'relative' }}>
                  {b.cover_url ? (
                    <img src={b.cover_url} alt={b.title} style={{ width: '100%', borderRadius: '12px', aspectRatio: '2.5/4', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '2.5/4', background: '#D9D9D9', borderRadius: '12px' }} />
                  )}
                  <div style={{ position: 'absolute', top: 5, right: 5, background: '#57B894', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={14} />
                  </div>
                </div>
                <div className="book-title" style={{ marginTop: '10px', fontSize: '0.9rem' }}>{b.title}</div>
                <div className="book-author" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.author}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px', background: '#F9F8F6', borderRadius: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <BookOpen size={48} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
            <p style={{ margin: 0, fontSize: '1rem' }}>
              Nenhum livro importado ainda. Na tela inicial, clique na fitinha de qualquer livro para baixá-lo pro Prolog!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
