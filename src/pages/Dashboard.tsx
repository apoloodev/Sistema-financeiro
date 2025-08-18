
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getTransacoes, getLembretes } from '@/integrations/firebase/services'
import { seedAllData } from '@/integrations/firebase/seedData'
import { toast } from '@/hooks/use-toast'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import type { Transacao, Lembrete } from '@/integrations/firebase/types'

export default function Dashboard() {
  console.log('📊 Dashboard: Componente sendo renderizado')
  
  const { user } = useAuth()
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [lembretes, setLembretes] = useState<Lembrete[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados dos filtros - Configurar para 2024 para mostrar os dados inseridos
  const [filterMonth, setFilterMonth] = useState('0') // Janeiro (0-11, então 0 = janeiro)
  const [filterYear, setFilterYear] = useState('2024')

  // Função para buscar dados
  const fetchData = async () => {
    try {
      console.log('📊 Dashboard: Iniciando fetchData...')
      setLoading(true)
      
      if (!user?.uid) {
        throw new Error('Usuário não autenticado')
      }

      console.log('📊 Dashboard: Buscando transações para usuário:', user.uid)
      // Buscar transações
      const { data: transacoesData, error: transacoesError } = await getTransacoes(user.uid)

      if (transacoesError) {
        console.error('📊 Dashboard: Erro ao buscar transações:', transacoesError)
        throw new Error(transacoesError)
      }

      console.log('📊 Dashboard: Buscando lembretes para usuário:', user.uid)
      // Buscar lembretes
      const { data: lembretesData, error: lembretesError } = await getLembretes(user.uid)

      if (lembretesError) {
        console.error('📊 Dashboard: Erro ao buscar lembretes:', lembretesError)
        throw new Error(lembretesError)
      }

      console.log('📊 Dashboard: Transações carregadas:', transacoesData)
      console.log('📊 Dashboard: Lembretes carregados:', lembretesData)
      setTransacoes(transacoesData || [])
      setLembretes(lembretesData || [])
      
    } catch (error: any) {
      console.error('📊 Dashboard: Erro detalhado:', error)
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      console.log('📊 Dashboard: fetchData finalizado, loading:', false)
      setLoading(false)
    }
  }

  // Função para inserir dados de exemplo
  const handleSeedData = async () => {
    try {
      console.log('📊 Dashboard: Inserindo dados de exemplo...')
      setLoading(true)
      
      if (!user?.uid) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        })
        return
      }

      await seedAllData(user.uid)
      
      toast({
        title: "Sucesso",
        description: "Dados de exemplo inseridos com sucesso!",
      })
      
      // Recarregar dados
      fetchData()
      
    } catch (error: any) {
      console.error('📊 Dashboard: Erro ao inserir dados:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao inserir dados de exemplo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Buscar dados quando o usuário mudar
  useEffect(() => {
    console.log('📊 Dashboard: useEffect triggered, user:', user)
    if (user) {
      console.log('📊 Dashboard: Usuário autenticado, buscando dados...')
      fetchData()
    } else {
      console.log('📊 Dashboard: Usuário não autenticado')
    }
  }, [user]) // fetchData não precisa estar nas dependências

  // Debug: Log do estado atual
  useEffect(() => {
    console.log('📊 Dashboard: Estado atual:', {
      user: user?.uid,
      loading,
      transacoesCount: transacoes.length,
      lembretesCount: lembretes.length,
      filterMonth,
      filterYear
    })
  }, [user, loading, transacoes, lembretes, filterMonth, filterYear])

  // Filtrar transações por mês e ano
  const filteredTransacoes = useMemo(() => {
    return transacoes.filter(transacao => {
      if (!transacao.quando) return false
      
      const transacaoDate = new Date(transacao.quando)
      const transacaoMonth = transacaoDate.getMonth()
      const transacaoYear = transacaoDate.getFullYear()
      
      return transacaoMonth === parseInt(filterMonth) && 
             transacaoYear === parseInt(filterYear)
    })
  }, [transacoes, filterMonth, filterYear])

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalReceitas = filteredTransacoes
      .filter(t => t.tipo === 'receita')
      .reduce((acc, t) => acc + (t.valor || 0), 0)
    
    const totalDespesas = filteredTransacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + (t.valor || 0), 0)
    
    const saldo = totalReceitas - totalDespesas
    
    return {
      totalReceitas,
      totalDespesas,
      saldo,
      transacoesCount: filteredTransacoes.length,
      lembretesCount: lembretes.length
    }
  }, [filteredTransacoes, lembretes])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mensagem informativa sobre Firebase */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Firebase Conectado
              </h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>
                  Aplicação conectada ao Firebase. {transacoes.length === 0 && 'Clique no botão abaixo para inserir dados de exemplo.'}
                </p>
              </div>
            </div>
          </div>
          {transacoes.length === 0 && (
            <button
              onClick={handleSeedData}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Inserindo...' : 'Inserir Dados de Exemplo'}
            </button>
          )}
        </div>
      </div>

      <DashboardFilters 
        filterMonth={filterMonth}
        filterYear={filterYear}
        setFilterMonth={setFilterMonth}
        setFilterYear={setFilterYear}
        transactionCount={filteredTransacoes.length}
      />
      
      <DashboardStats stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardCharts transacoes={filteredTransacoes} />
        </div>
        <div>
          <DashboardSidebar lembretes={lembretes} />
        </div>
      </div>
    </div>
  )
}
