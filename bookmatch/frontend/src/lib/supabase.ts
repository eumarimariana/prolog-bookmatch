// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Agora pegamos os dados REAIS do banco!
export function formatBookForUI(dbBook: any) {
  return {
    ...dbBook,
    slug: dbBook.id, // Apenas ajustamos o nome do ID que a interface espera
    genre: dbBook.genres && dbBook.genres.length > 0 ? dbBook.genres[0] : 'Geral',
    mood: dbBook.tropes || [],
  };
}