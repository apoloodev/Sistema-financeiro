
import { useState, useEffect, createContext, useContext } from 'react'
import { onAuthChange, signIn as firebaseSignIn, signUp as firebaseSignUp, signInWithGoogle as firebaseSignInWithGoogle, signOutUser } from '@/integrations/firebase/services'
import type { FirebaseUser } from '@/integrations/firebase/types'

interface AuthContextType {
  user: FirebaseUser | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔐 AuthProvider: Iniciando listener de autenticação...')
    
    // Configurar listener de mudança de estado de autenticação
    const unsubscribe = onAuthChange((firebaseUser) => {
      console.log('🔐 AuthProvider: Estado de autenticação mudou:', firebaseUser ? 'Usuário logado' : 'Usuário não logado')
      
      if (firebaseUser) {
        console.log('🔐 AuthProvider: Dados do usuário:', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        })
        
        // Converter Firebase User para nosso tipo
        const user: FirebaseUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        }
        setUser(user)
      } else {
        console.log('🔐 AuthProvider: Nenhum usuário autenticado')
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await firebaseSignIn(email, password)
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await firebaseSignUp(email, password, fullName)
    return { error }
  }

  const signInWithGoogle = async () => {
    const { error } = await firebaseSignInWithGoogle()
    return { error }
  }

  const signOut = async () => {
    await signOutUser()
  }

  const resetPassword = async (email: string) => {
    // TODO: Implementar reset de senha com Firebase
    return { error: 'Funcionalidade em desenvolvimento' }
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
