
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

import { Badge } from '@/components/ui/badge'
import { CurrencyInput } from '@/components/ui/currency-input'
import { TransactionSummaryCards } from '@/components/transactions/TransactionSummaryCards'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { CategorySelector } from '@/components/transactions/CategorySelector'
import { useAuth } from '@/hooks/useAuth'
import { useCategories } from '@/hooks/useCategories'
import { useTransacoes } from '@/hooks/useTransacoes'
import { seedTransactions } from '@/integrations/firebase/seedData'
import { toast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'

import type { Transacao } from '@/integrations/firebase/types'

export default function Transacoes() {
  const { user } = useAuth()
  const { categories } = useCategories()
  const { 
    transacoes, 
    isLoading, 
    error, 
    fetchTransacoes, 
    createTransacao,
    updateTransacao,
    deleteTransacao,
    clearError 
  } = useTransacoes()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transacao | null>(null)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')

  const [formData, setFormData] = useState({
    quando: '',
    estabelecimento: '',
    valor: 0,
    detalhes: '',
    tipo: '',
    category_id: '',
  })

  // Transações filtradas
  const filteredTransacoes = useMemo(() => {
    return transacoes.filter(transacao => {
      // Filtro de busca
      const matchesSearch = !searchTerm || 
        (transacao.estabelecimento?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      
      // Filtro de tipo
      const matchesType = !typeFilter || transacao.tipo === typeFilter
      
      // Filtro de categoria
      const matchesCategory = !categoryFilter || transacao.category_id === categoryFilter
      
      // Filtro de data
      let matchesDate = true
      if (dateFilter && transacao.quando) {
        const transacaoDate = new Date(transacao.quando)
        const now = new Date()
        
        switch (dateFilter) {
          case 'today':
            matchesDate = transacaoDate.toDateString() === now.toDateString()
            break
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDate = transacaoDate >= weekAgo
            break
          case 'month':
            matchesDate = transacaoDate.getMonth() === now.getMonth() && 
                         transacaoDate.getFullYear() === now.getFullYear()
            break
          case 'year':
            matchesDate = transacaoDate.getFullYear() === now.getFullYear()
            break
        }
      }
      
      // Filtro de valor mínimo
      const matchesMinValue = !minValue || (transacao.valor || 0) >= parseFloat(minValue)
      
      // Filtro de valor máximo
      const matchesMaxValue = !maxValue || (transacao.valor || 0) <= parseFloat(maxValue)
      
      return matchesSearch && matchesType && matchesCategory && matchesDate && matchesMinValue && matchesMaxValue
    })
  }, [transacoes, searchTerm, typeFilter, categoryFilter, dateFilter, minValue, maxValue])

  // Cálculo dos totais
  const { receitas, despesas, saldo } = useMemo(() => {
    const receitas = filteredTransacoes
      .filter(t => t.tipo === 'receita')
      .reduce((acc, t) => acc + (t.valor || 0), 0)
    
    const despesas = filteredTransacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + (t.valor || 0), 0)
    
    return {
      receitas,
      despesas,
      saldo: receitas - despesas
    }
  }, [filteredTransacoes])

  // Buscar dados quando o usuário mudar
  useEffect(() => {
    if (user?.uid) {
      console.log('🔄 Transacoes: Buscando dados para usuário:', user.uid)
      fetchTransacoes()
    }
  }, [user?.uid]) // Removido fetchTransacoes das dependências

  // Função para limpar filtros
  const clearFilters = () => {
    setSearchTerm('')
    setTypeFilter('')
    setCategoryFilter('')
    setDateFilter('')
    setMinValue('')
    setMaxValue('')
  }

  // Debug: Log do estado atual
  useEffect(() => {
    console.log('📊 Transacoes: Estado atual:', {
      user: user?.uid,
      transacoes: transacoes.length,
      isLoading,
      error,
      filteredTransacoes: filteredTransacoes.length
    })
  }, [user?.uid, transacoes, isLoading, error, filteredTransacoes])

  const clearFilters = () => {
    setSearchTerm('')
    setTypeFilter('')
    setCategoryFilter('')
  }

  const handleSeedData = async () => {
    if (!user?.uid) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('🌱 Inserindo dados de exemplo...')
      await seedTransactions(user.uid)
      toast({
        title: "Dados inseridos com sucesso!",
        description: "Transações de exemplo foram adicionadas.",
      })
      fetchTransacoes()
    } catch (error: any) {
      console.error('❌ Erro ao inserir dados:', error)
      toast({
        title: "Erro ao inserir dados",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
      return
    }

    try {
      console.log('🗑️ Deletando transação:', id)
      const result = await deleteTransacao(id)
      
      if (result) {
        toast({
          title: "Transação excluída",
          description: "A transação foi removida com sucesso.",
        })
      }
    } catch (error: any) {
      console.error('❌ Erro ao deletar transação:', error)
      toast({
        title: "Erro ao excluir",
        description: error.message || "Erro ao excluir a transação",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Tem certeza que deseja excluir TODAS as transações? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      console.log('🗑️ Deletando todas as transações...')
      
      // Deletar uma por uma (Firebase não tem delete em lote nativo)
      const deletePromises = transacoes.map(transacao => deleteTransacao(transacao.id))
      await Promise.all(deletePromises)
      
      toast({
        title: "Todas as transações excluídas",
        description: `${transacoes.length} transações foram removidas com sucesso.`,
      })
    } catch (error: any) {
      console.error('❌ Erro ao deletar todas as transações:', error)
      toast({
        title: "Erro ao excluir",
        description: error.message || "Erro ao excluir as transações",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação: verificar se a categoria selecionada pertence ao usuário
    // Temporariamente desabilitada para teste
    // if (formData.category_id) {
    //   const categoryBelongsToUser = categories?.some(cat => cat.id === formData.category_id)
    //   if (!categoryBelongsToUser) {
    //     toast({
    //       title: "Erro de validação",
    //       description: "A categoria selecionada não é válida para este usuário.",
    //       variant: "destructive",
    //     })
    //     return
    //   }
    // }

    try {
      const result = await createTransacao({
        quando: formData.quando,
        estabelecimento: formData.estabelecimento,
        valor: formData.valor,
        detalhes: formData.detalhes,
        tipo: formData.tipo,
        category_id: formData.category_id,
      })

      if (result) {
        setDialogOpen(false)
        setEditingTransaction(null)
        setFormData({
          quando: '',
          estabelecimento: '',
          valor: 0,
          detalhes: '',
          tipo: '',
          category_id: '',
        })
      }
    } catch (error: any) {
      // O erro já é tratado pelo hook
    }
  }

  const handleEdit = (transacao: Transacao) => {
    setEditingTransaction(transacao)
    setFormData({
      quando: transacao.quando || '',
      estabelecimento: transacao.estabelecimento || '',
      valor: transacao.valor || 0,
      detalhes: transacao.detalhes || '',
      tipo: transacao.tipo || '',
      category_id: transacao.category_id || '',
    })
    setDialogOpen(true)
  }



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSeedData} 
            variant="outline" 
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            🌱 Inserir Dados de Exemplo
          </Button>
          {transacoes.length > 0 && (
            <Button 
              onClick={handleDeleteAll} 
              variant="destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover Todas
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
                </DialogTitle>
                <DialogDescription>
                  {editingTransaction 
                    ? 'Faça as alterações necessárias na transação.' 
                    : 'Adicione uma nova receita ou despesa.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor</Label>
                    <CurrencyInput
                      value={formData.valor}
                      onChange={(value) => setFormData({...formData, valor: value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estabelecimento">Estabelecimento</Label>
                  <Input
                    id="estabelecimento"
                    placeholder="Ex: Supermercado, Salário, etc."
                    value={formData.estabelecimento}
                    onChange={(e) => setFormData({...formData, estabelecimento: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <CategorySelector
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({...formData, category_id: value})}
                    placeholder="Selecione a categoria"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quando">Data</Label>
                  <Input
                    id="quando"
                    type="date"
                    value={formData.quando}
                    onChange={(e) => setFormData({...formData, quando: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="detalhes">Detalhes</Label>
                  <Textarea
                    id="detalhes"
                    placeholder="Informações adicionais..."
                    value={formData.detalhes}
                    onChange={(e) => setFormData({...formData, detalhes: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  {editingTransaction ? 'Atualizar' : 'Adicionar'} Transação
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <TransactionSummaryCards 
        receitas={receitas}
        despesas={despesas}
        saldo={saldo}
      />

      <div className="flex justify-between items-center">
        <TransactionFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          minValue={minValue}
          onMinValueChange={setMinValue}
          maxValue={maxValue}
          onMaxValueChange={setMaxValue}
          onClearFilters={clearFilters}
        />
        {transacoes.length > 0 && (
          <Button 
            onClick={handleDeleteAll} 
            variant="outline" 
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            🗑️ Deletar Todas
          </Button>
        )}
      </div>

      <div className="grid gap-4">
                    {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTransacoes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {transacoes.length === 0 ? 'Nenhuma transação encontrada' : 'Nenhuma transação encontrada com os filtros aplicados'}
              </p>
              <div className="flex gap-2 justify-center">
                {transacoes.length === 0 && (
                  <Button onClick={handleSeedData} className="bg-green-600 hover:bg-green-700">
                    🌱 Inserir Dados de Exemplo
                  </Button>
                )}
                <Button onClick={() => setDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                  Adicionar primeira transação
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTransacoes.map((transacao) => (
            <Card key={transacao.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {transacao.tipo === 'receita' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <h3 className="font-semibold">
                        {transacao.estabelecimento || 'Sem estabelecimento'}
                      </h3>
                      <Badge variant={transacao.tipo === 'receita' ? 'default' : 'destructive'}>
                        {transacao.tipo}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {transacao.category_id && (
                        <p>Categoria ID: {transacao.category_id}</p>
                      )}
                      {transacao.quando && (
                        <p>Data: {formatDate(transacao.quando)}</p>
                      )}
                      {transacao.detalhes && (
                        <p>Detalhes: {transacao.detalhes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-xl font-bold ${
                      transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transacao.tipo === 'receita' ? '+' : '-'}
                      {formatCurrency(Math.abs(transacao.valor || 0))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(transacao)}
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(transacao.id)}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
