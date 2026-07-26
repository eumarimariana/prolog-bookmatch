import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recommendByScore } from './api';
import { ArrowLeft, Target } from 'lucide-react';

export default function BookDetails() {
  const { title } = useParams();
  const [similar, setSimilar] = useState<{title: string, score: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScore() {
      if (!title) return;
      try {
        const data = await recommendByScore(decodeURIComponent(title));
        setSimilar(data.recommendations);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadScore();
  }, [title]);

  return (
    <div className="container animate-fade">
      <Link to="/" className="btn" style={{ marginBottom: '2rem', padding: '0.5rem 1rem', border: '1px solid var(--primary-purple)', color: 'var(--primary-purple)' }}>
        <ArrowLeft size={16} /> Voltar
      </Link>

      <section className="glass-panel" style={{ marginBottom: '4rem', display: 'flex', gap: '3rem', alignItems: 'center' }}>
        <div style={{ flex: 1, background: 'linear-gradient(135deg, var(--primary-purple), var(--primary-yellow))', height: '400px', borderRadius: '16px', opacity: 0.8 }} />
        <div style={{ flex: 2 }}>
          <h1 style={{ fontSize: '3rem' }}>{title}</h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '600px' }}>
            Detalhes simulados. Na vida real, você buscaria isso no Supabase. O poder do motor Prolog está nas recomendações logo abaixo!
          </p>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Target color="var(--primary-purple)" />
          <h2 style={{ margin: 0 }}>Scoring Inteligente</h2>
        </div>
        <p style={{ marginBottom: '2rem' }}>O Prolog calculou a similaridade matemática (Gênero = 10 pts, Tropos = 5 pts) e encontrou esses matches:</p>
        
        {loading ? (
          <p>Calculando scores no SWI-Prolog...</p>
        ) : (
          <div className="grid grid-cols-3">
            {similar.length > 0 ? similar.map((s, i) => (
              <Link to={`/book/${encodeURIComponent(s.title)}`} key={i} className="book-card glass-panel" style={{ padding: '1.5rem', borderTop: `4px solid ${s.score >= 10 ? 'var(--primary-purple)' : 'var(--primary-yellow)'}` }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                <span className="badge">
                  Score Lógico: {s.score} pts
                </span>
              </Link>
            )) : (
              <p>Nenhum livro similar encontrado com pontuação maior que 0.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
