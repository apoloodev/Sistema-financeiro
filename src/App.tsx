import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/hooks/useTheme'
import { AppLayout } from '@/components/layout/AppLayout'
import Auth from '@/pages/Auth'
import Dashboard from '@/pages/Dashboard'
import Transacoes from '@/pages/Transacoes'
import Categorias from '@/pages/Categorias'
import Relatorios from '@/pages/Relatorios'
import Lembretes from '@/pages/Lembretes'
import Perfil from '@/pages/Perfil'
import Plano from '@/pages/Plano'
import NotFound from '@/pages/NotFound'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Teste de importação do Firebase
import '@/integrations/firebase/config'

console.log('🚀 App.tsx: Aplicação iniciando...')

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="transacoes" element={<ProtectedRoute><Transacoes /></ProtectedRoute>} />
              <Route path="categorias" element={<ProtectedRoute><Categorias /></ProtectedRoute>} />
              <Route path="relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
              <Route path="lembretes" element={<ProtectedRoute><Lembretes /></ProtectedRoute>} />
              <Route path="perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
            </Route>
            <Route path="/plano" element={<Plano />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
