import { createClient } from '@supabase/supabase-js'

// Logs imediatos para debug
console.log('🚨 DEBUG: Iniciando configuração Supabase...')
console.log('🚨 DEBUG: import.meta.env:', import.meta.env)
console.log('🚨 DEBUG: VITE_SUPABASE_URL existe?', !!import.meta.env.VITE_SUPABASE_URL)
console.log('🚨 DEBUG: VITE_SUPABASE_ANON_KEY existe?', !!import.meta.env.VITE_SUPABASE_ANON_KEY)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug: verificar se as variáveis estão sendo carregadas
console.log('🔧 Supabase Config (Updated):', {
  url: supabaseUrl ? '✅ Configurada' : '❌ Não configurada',
  key: supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada',
  keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'N/A',
  timestamp: new Date().toISOString()
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl)
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Presente' : 'Ausente')
  
  // Forçar erro visível
  throw new Error('🚨 CRÍTICO: Variáveis de ambiente do Supabase não configuradas! Verifique Vercel.')
}

// Verificar se as chaves parecem válidas
if (!supabaseUrl.includes('supabase.co')) {
  console.error('❌ VITE_SUPABASE_URL parece inválida:', supabaseUrl)
}

if (!supabaseAnonKey.startsWith('eyJ')) {
  console.error('❌ VITE_SUPABASE_ANON_KEY parece inválida:', supabaseAnonKey.substring(0, 50))
}

console.log('✅ Criando cliente Supabase...')
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
console.log('✅ Cliente Supabase criado com sucesso!')

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
