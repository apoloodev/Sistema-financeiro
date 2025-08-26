import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
  full_name?: string
  avatar_url?: string
  subscription_status?: string
  subscription_plan?: string
}

export interface Categoria {
  id: string;
  userid: string;
  nome: string;
  tags: string;
  parent_id?: string; // ID da categoria pai (para subcategorias)
  is_main_category?: boolean; // Se é categoria principal
  icon?: string; // Ícone da categoria
  color?: string; // Cor da categoria
  created_at: string;
  updated_at: string;
  subcategorias?: Categoria[]; // Para categorias com subcategorias
}

export interface Transacao {
  id: number;
  created_at: string;
  quando: string;
  estabelecimento: string;
  valor: number;
  detalhes: string;
  tipo: string;
  userid: string;
  category_id: string;
  categoria: string;
  categorias?: { // Updated to include joined category data with new fields
    id: string;
    nome: string;
    parent_id?: string;
    is_main_category?: boolean;
    icon?: string;
    color?: string;
  };
}

export interface Profile {
  id: string;
  userid: string;
  full_name?: string;
  avatar_url?: string;
  subscription_status?: string;
  subscription_plan?: string;
  created_at: string;
  updated_at: string;
}
