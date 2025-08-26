// Updated: 2025-01-27 - Force redeploy with hierarchical categories system
// This comment forces Vercel to rebuild the application
// Hierarchical categories system is now active

import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/hooks/useTheme'
import { AuthProvider } from '@/hooks/useAuth'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppLayout } from '@/components/layout/AppLayout'
import Auth from '@/pages/Auth'
import Dashboard from '@/pages/Dashboard'
import Transacoes from '@/pages/Transacoes'
import Perfil from '@/pages/Perfil'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="transacoes" element={<Transacoes />} />
                <Route path="perfil" element={<Perfil />} />
              </Route>
            </Routes>
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App