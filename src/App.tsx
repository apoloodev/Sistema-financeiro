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
import PaymentSuccess from '@/pages/PaymentSuccess'
import AIDemo from '@/pages/AIDemo'
import NotFound from '@/pages/NotFound'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { SubscriptionRequired } from '@/components/auth/SubscriptionRequired'

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
              <Route index element={
                <ProtectedRoute>
                  <SubscriptionRequired>
                    <Dashboard />
                  </SubscriptionRequired>
                </ProtectedRoute>
              } />
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <SubscriptionRequired>
                    <Dashboard />
                  </SubscriptionRequired>
                </ProtectedRoute>
              } />
              <Route path="transacoes" element={
                <ProtectedRoute>
                  <SubscriptionRequired>
                    <Transacoes />
                  </SubscriptionRequired>
                </ProtectedRoute>
              } />
              <Route path="categorias" element={
                <ProtectedRoute>
                  <SubscriptionRequired>
                    <Categorias />
                  </SubscriptionRequired>
                </ProtectedRoute>
              } />
              <Route path="relatorios" element={
                <ProtectedRoute>
                  <SubscriptionRequired>
                    <Relatorios />
                  </SubscriptionRequired>
                </ProtectedRoute>
              } />
              <Route path="lembretes" element={
                <ProtectedRoute>
                  <SubscriptionRequired>
                    <Lembretes />
                  </SubscriptionRequired>
                </ProtectedRoute>
              } />
              <Route path="perfil" element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="/plano" element={<Plano />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/ai-demo" element={<AIDemo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
