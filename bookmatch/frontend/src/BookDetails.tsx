import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recommendByScore } from './api';
import { ArrowLeft, Target, BookOpen, Calculator, Loader2 } from 'lucide-react';

export default function BookDetails() {
  const { title } = useParams();
  const [similar, setSimilar] = useState<{title: string, score: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScore() {
      if (!title) return;
      try {
        const data = await recommendByScore(decodeURIComponent(title));
        // Ordenamos localmente por segurança, mas o Prolog já deveria retornar ordenado
        const sorted = data.recommendations.sort((a: any, b: any) => b.score - a.score);
        setSimilar(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadScore();
  }, [title]);

  return (
    <div className="animate-fade">
      <div className="container" style={{ paddingBottom: 0 }}>
        <Link to="/" className="btn" style={{ marginBottom: '3rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.8)', color: 'var(--text-dark)', border: '1px solid rgba(0,0,0,0.1)' }}>
          <ArrowLeft size={18} /> Voltar para Descoberta
        </Link>
      </div>

      <section className="container" style={{ marginBottom: '6rem' }}>
        <div className="glass-panel" style={{ display: 'flex', gap: '4rem', alignItems: 'center', padding: '4rem', background: 'white' }}>
          <div style={{ flex: '0 0 300px', background: 'linear-gradient(135deg, var(--primary-purple), var(--primary-yellow))', height: '450px', borderRadius: '24px', opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 20px 50px rgba(124, 58, 237, 0.2)' }}>
            <BookOpen size={80} opacity={0.5} />
          </div>
          <div style={{ flex: 1 }}>
            <span className="badge" style={{ marginBottom: '1rem' }}>Livro Selecionado</span>
            <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>{title}</h1>
            <p style={{ fontSize: '1.3rem', maxWidth: '600px', marginBottom: '2rem' }}>
              Este é o seu livro de referência. O sistema buscará no catálogo completo do Supabase quais outras obras possuem a maior similaridade matemática com este título.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" disabled>Adicionar à Estante</button>
              <button className="btn btn-secondary" disabled>Marcar como Lido</button>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ marginBottom: '6rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Calculator size={32} color="var(--primary-purple)" />
          </div>
          <h2>Scoring Inteligente do Prolog</h2>
          <p style={{ maxWidth: '700px', margin: '0 auto' }}>
            Não usamos "pessoas também compraram". O motor calcula a similaridade exata: <br/>
            <strong>Gênero Idêntico = 10 pts | Tropos Idênticos = 5 pts cada.</strong>
          </p>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', color: 'var(--primary-purple)' }}>
            <Loader2 size={48} className="lucide-spin" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: 0 }}>Processando pesos no SWI-Prolog...</h3>
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {similar.length > 0 ? similar.map((s, i) => (
              <Link to={`/book/${encodeURIComponent(s.title)}`} key={i} className="book-card glass-panel" style={{ padding: '2rem', borderTop: `6px solid ${s.score >= 10 ? 'var(--primary-purple)' : 'var(--primary-yellow)'}` }}>
                <Target size={32} color={s.score >= 10 ? 'var(--primary-purple)' : 'var(--primary-yellow)'} style={{ marginBottom: '1.5rem' }} />
                
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', flex: 1 }}>{s.title}</h3>
                
                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Match Score</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: s.score >= 10 ? 'var(--primary-purple)' : '#B45309' }}>
                    {s.score} pts
                  </span>
                </div>
              </Link>
            )) : (
              <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
                <h3>Nenhum match encontrado.</h3>
                <p style={{ margin: 0 }}>Este livro não compartilha Gênero ou Tropos com os outros do catálogo atual.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
