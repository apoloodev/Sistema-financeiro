
import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getTransacoes } from '@/integrations/firebase/services'
import type { Transacao } from '@/integrations/firebase/types'

export interface ReportTransaction {
  id: number
  created_at: string
  quando: string | null
  estabelecimento: string | null
  valor: number | null
  detalhes: string | null
  tipo: string | null
  category_id: string
  categorias?: {
    id: string
    nome: string
  }
}

export interface ReportFilters {
  startDate: string
  endDate: string
  type: string
  categoryId: string
  period: 'day' | 'month' | 'year' | 'custom'
}

export function useReports() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transacao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: '',
    endDate: '',
    type: '',
    categoryId: '',
    period: 'month'
  })

  // Buscar transações do Firebase
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.uid) {
        setIsLoading(false)
        return
      }

      try {
        console.log('📊 useReports: Buscando transações para usuário:', user.uid)
        setIsLoading(true)
        
        const { data, error } = await getTransacoes(user.uid)
        
        if (error) {
          console.error('📊 useReports: Erro ao buscar transações:', error)
          return
        }

        console.log('📊 useReports: Transações carregadas:', data)
        setTransactions(data || [])
      } catch (error) {
        console.error('📊 useReports: Erro ao buscar transações:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [user?.uid])

  // Calculate summary data
  const summaryData = useMemo(() => {
    console.log('📊 useReports: Calculando resumo com', transactions.length, 'transações')
    
    const receitas = transactions
      .filter(t => t.tipo === 'receita')
      .reduce((acc, t) => acc + (t.valor || 0), 0)
    
    const despesas = transactions
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + (t.valor || 0), 0)
    
    const saldo = receitas - despesas

    console.log('📊 useReports: Resumo calculado - Receitas:', receitas, 'Despesas:', despesas, 'Saldo:', saldo)

    // Group by category
    const byCategory = transactions.reduce((acc, transaction) => {
      const categoryName = transaction.category_id || 'Sem categoria'
      const valor = transaction.valor || 0
      
      if (!acc[categoryName]) {
        acc[categoryName] = { receitas: 0, despesas: 0, total: 0 }
      }
      
      if (transaction.tipo === 'receita') {
        acc[categoryName].receitas += valor
      } else {
        acc[categoryName].despesas += valor
      }
      
      acc[categoryName].total = acc[categoryName].receitas - acc[categoryName].despesas
      
      return acc
    }, {} as Record<string, { receitas: number; despesas: number; total: number }>)

    // Group by type for chart data
    const chartData = [
      { name: 'Receitas', value: receitas, color: '#22c55e' },
      { name: 'Despesas', value: despesas, color: '#ef4444' }
    ]

    return {
      receitas,
      despesas,
      saldo,
      byCategory,
      chartData,
      totalTransactions: transactions.length
    }
  }, [transactions])

  return {
    transactions,
    isLoading,
    filters,
    setFilters,
    summaryData
  }
}
