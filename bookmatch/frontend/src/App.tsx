import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Inicializa o cliente do Supabase no frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Book {
  id: string
  title: string
  author: string
  cover_url: string
  genres: string[]
  tropes: string[]
}

export default function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [selectedGenre, setSelectedGenre] = useState<string>('fantasia')
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // 1. Procura todos os livros diretamente do Supabase ao carregar o ecrã
  useEffect(() => {
    async function loadBooks() {
      const { data, error } = await supabase
        .from('books')
        .select('*')
      
      if (error) {
        console.error('Erro ao carregar livros do Supabase:', error)
      } else if (data) {
        setBooks(data)
      }
    }
    loadBooks()
  }, [])

  // 2. Pergunta ao Python (FastAPI + Prolog) quais os livros recomendados
  const handleGetRecommendations = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/recommend/genre', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genre: selectedGenre }),
      })

      if (!response.ok) throw new Error('Erro na resposta do servidor')
      
      const data = await response.json()
      setRecommendations(data.recommendations)
    } catch (err) {
      console.error('Erro ao obter recomendações:', err)
      alert('Certifica-te de que a API em Python está a correr na porta 8000!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-indigo-400 tracking-tight">BookMatch</h1>
          <p className="text-gray-400 mt-2">Sistema de Recomendação Inteligente com Prolog, Python e Supabase</p>
        </header>

        {/* Secção do Catálogo Geral */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 border-b border-gray-800 pb-2">O Nosso Catálogo</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book.id} className="bg-gray-800 rounded-lg p-4 shadow-lg flex flex-col justify-between">
                <img 
                  src={book.cover_url} 
                  alt={book.title} 
                  className="w-full h-64 object-cover rounded shadow mb-4"
                />
                <div>
                  <h3 className="font-bold text-lg leading-tight">{book.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Secção de Recomendação do Prolog */}
        <section className="bg-gray-850 border border-gray-800 rounded-xl p-6 bg-opacity-50">
          <h2 className="text-2xl font-bold mb-4">Pedir Recomendação Lógica</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <select 
              value={selectedGenre} 
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="fantasia">Fantasia</option>
              <option value="distopia">Distopia</option>
              <option value="romance">Romance</option>
            </select>

            <button 
              onClick={handleGetRecommendations}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'A processar lógica...' : 'Obter Recomendações do Prolog'}
            </button>
          </div>

          {recommendations.length > 0 ? (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-emerald-400">O Prolog recomenda:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {books
                  .filter((b) => recommendations.includes(b.title))
                  .map((book) => (
                    <div key={book.id} className="bg-emerald-950 bg-opacity-30 border border-emerald-500 rounded-lg p-4 shadow-lg flex flex-col justify-between">
                      <img 
                        src={book.cover_url} 
                        alt={book.title} 
                        className="w-full h-64 object-cover rounded shadow mb-4"
                      />
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{book.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{book.author}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Escolha um género acima para testar a inteligência do Prolog.</p>
          )}
        </section>
      </div>
    </div>
  )
}