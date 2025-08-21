
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/hooks/useTheme';
import { Check, CreditCard, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createOrUpdateSubscription } from '@/integrations/firebase/subscriptionService';
import { toast } from '@/hooks/use-toast';
import { UserDataForm } from '@/components/payment/UserDataForm';
import { UserDataPreview } from '@/components/payment/UserDataPreview';
import { FinancialQuestionnaire } from '@/components/onboarding/FinancialQuestionnaire';
import { PlanSelection } from '@/components/onboarding/PlanSelection';
import { saveFinancialProfile, parseCurrencyString, createPersonalizedCategories } from '@/integrations/firebase/userProfileService';

export default function Plano() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { user, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [userDataToPreview, setUserDataToPreview] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  const handleSubscribe = async () => {
    if (!user) {
      // Se não está logado, mostrar formulário de dados
      setShowUserForm(true);
      return;
    }
    
    // Se está logado, ir direto para o questionário
    setShowQuestionnaire(true);
  };

  const handleUserDataSubmit = async (userData: { name: string; email: string; phone: string; password: string }) => {
    try {
      setIsLoading(true);
      
      // Mostrar prévia dos dados
      setUserDataToPreview(userData);
      setShowDataPreview(true);
      setShowUserForm(false);
      
    } catch (error: any) {
      console.error('Erro ao processar dados:', error);
      toast({
        title: "Erro ao processar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmData = async () => {
    try {
      setIsLoading(true);
      
      if (!userDataToPreview) return;
      
      // Armazenar dados para uso posterior
      const paymentData = {
        ...userDataToPreview,
        timestamp: Date.now()
      };
      
      localStorage.setItem('alfredo_payment_data', JSON.stringify(paymentData));
      console.log('Dados do usuário armazenados:', paymentData);
      
      // Criar conta no Firebase com os dados reais
      const { error: signUpError } = await signUp(userDataToPreview.email, userDataToPreview.password, userDataToPreview.name);
      
      if (signUpError) {
        console.error('Erro ao criar conta:', signUpError);
        toast({
          title: "Erro ao criar conta",
          description: signUpError.message,
          variant: "destructive",
        });
        return;
      } else {
        console.log('✅ Conta criada com sucesso');
        toast({
          title: "Conta criada com sucesso!",
          description: "Agora vamos personalizar sua experiência",
        });
      }
      
      // Ir para o questionário após criar conta
      setShowDataPreview(false);
      setShowQuestionnaire(true);
      
    } catch (error: any) {
      console.error('Erro ao confirmar dados:', error);
      toast({
        title: "Erro ao confirmar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionnaireComplete = async (data: any) => {
    try {
      setIsLoading(true);
      
      setFinancialData(data);
      
      // Se o usuário está logado, salvar perfil financeiro
      if (user?.uid) {
        const financialProfile = {
          salary: parseCurrencyString(data.salary),
          housingExpense: parseCurrencyString(data.housingExpense),
          transportationExpense: parseCurrencyString(data.transportationExpense),
          foodExpense: parseCurrencyString(data.foodExpense),
          healthExpense: parseCurrencyString(data.healthExpense),
          educationExpense: parseCurrencyString(data.educationExpense),
          entertainmentExpense: parseCurrencyString(data.entertainmentExpense),
          savingsGoal: parseCurrencyString(data.savingsGoal),
          financialGoal: data.financialGoal,
          experienceLevel: data.experienceLevel
        };
        
        const { error } = await saveFinancialProfile(user.uid, financialProfile);
        
        if (error) {
          console.error('Erro ao salvar perfil financeiro:', error);
        } else {
          console.log('✅ Perfil financeiro salvo');
          
          // Criar categorias personalizadas
          await createPersonalizedCategories(user.uid);
        }
      }
      
      // Ir para seleção de plano
      setShowQuestionnaire(false);
      setShowPlanSelection(true);
      
    } catch (error: any) {
      console.error('Erro ao processar questionário:', error);
      toast({
        title: "Erro ao processar questionário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelection = async (plan: any) => {
    try {
      setIsLoading(true);
      
      setSelectedPlan(plan);
      
      // Se o usuário está logado, processar pagamento
      if (user?.uid) {
        await processPayment();
      } else {
        // Se não está logado, ir para pagamento
        await processPayment();
      }
      
      setShowPlanSelection(false);
      
    } catch (error: any) {
      console.error('Erro ao selecionar plano:', error);
      toast({
        title: "Erro ao selecionar plano",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processPayment = async () => {
    try {
      setIsLoading(true);
      console.log('Iniciando processo de pagamento - Alfredo');
      
      // Criar assinatura no Firebase se o usuário estiver logado
      if (user?.uid) {
        const { data: subscription, error: subscriptionError } = await createOrUpdateSubscription(user.uid, {
          status: 'pending',
          amount: 0.01
        });
        
        if (subscriptionError) {
          console.error('Erro ao criar assinatura:', subscriptionError);
        } else {
          console.log('Assinatura criada:', subscription);
        }
      }
      
      // Abrir link de pagamento do Asaas
      const asaasUrl = 'https://sandbox.asaas.com/c/g5su9rr5jw5b2f4h';
      
      // Abrir em nova aba
      window.open(asaasUrl, '_blank');
      
      // Mostrar mensagem de sucesso
      toast({
        title: "Pagamento iniciado!",
        description: "Complete o pagamento no Asaas para ativar sua assinatura.",
      });
      
      // Redirecionar para página de sucesso após um tempo
      setTimeout(() => {
        window.location.href = '/payment-success';
      }, 3000);
      
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBackToLogin = () => {
    navigate('/auth');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };
  
  const benefits = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Registre gastos automaticamente',
      description: 'Via WhatsApp, foto ou áudio'
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Controle total das finanças',
      description: 'Dashboard completo e relatórios'
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: 'Lembretes inteligentes',
      description: 'Nunca mais esqueça de pagar contas'
    }
  ];

  // Array de fotos de usuários para simular perfis
  const userProfiles = [
    'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1501286353178-1ec881214838?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1441057206919-63d19fac2369?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=100&h=100&fit=crop&crop=face'
  ];

  // Se mostrar questionário financeiro
  if (showQuestionnaire) {
    return (
      <FinancialQuestionnaire
        onComplete={handleQuestionnaireComplete}
        onBack={() => {
          setShowQuestionnaire(false);
          if (user) {
            // Se está logado, voltar para página de planos
          } else {
            // Se não está logado, voltar para prévia dos dados
            setShowDataPreview(true);
          }
        }}
        isLoading={isLoading}
      />
    );
  }

  // Se mostrar seleção de plano
  if (showPlanSelection) {
    return (
      <PlanSelection
        onSelectPlan={handlePlanSelection}
        onBack={() => {
          setShowPlanSelection(false);
          setShowQuestionnaire(true);
        }}
        isLoading={isLoading}
      />
    );
  }

  // Se mostrar prévia dos dados
  if (showDataPreview && userDataToPreview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="space-y-4">
          <UserDataPreview userData={userDataToPreview} />
          
          <div className="flex gap-3">
            <Button 
              onClick={handleConfirmData}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Processando...' : 'Confirmar e Continuar'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                setShowDataPreview(false);
                setShowUserForm(true);
              }}
              disabled={isLoading}
              className="flex-1"
            >
              Editar Dados
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Se mostrar formulário de dados do usuário
  if (showUserForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <UserDataForm
          onSubmit={handleUserDataSubmit}
          onCancel={() => setShowUserForm(false)}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background p-4 sm:p-6">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-3xl">
        <img 
          src="/lovable-uploads/e73af031-b391-404d-a839-c9cbe548576b.png" 
          alt="Finance Management" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-primary/20" />
        <div className="absolute bottom-8 left-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Agora ficou fácil!</h2>
          </div>
          <p className="text-base sm:text-lg opacity-90 mb-6">
            Gerencie suas finanças de forma simples e inteligente
          </p>
          
          {/* Seção de usuários */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <p className="text-sm font-medium mb-3">
              Mais de 500 usuários já usam nossa plataforma
            </p>
            
            {/* Fotos dos usuários */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {userProfiles.map((profile, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-white/20"
                  >
                    <img 
                      src={profile} 
                      alt={`Usuário ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback para caso a imagem não carregue
                        const target = e.target as HTMLImageElement;
                        target.style.backgroundColor = '#6366f1';
                        target.style.display = 'flex';
                        target.style.alignItems = 'center';
                        target.style.justifyContent = 'center';
                        target.innerHTML = `<span style="color: white; font-size: 10px; font-weight: bold;">${String.fromCharCode(65 + index)}</span>`;
                      }}
                    />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-white/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">+500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Plan Info */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        {/* Header with Logo and Theme Toggle */}
        <div className="absolute top-4 left-4 right-4 flex justify-end items-center">
          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md lg:max-w-lg mt-4 sm:mt-8 lg:mt-16 space-y-4">
          <div>
            <img 
              src="/lovable-uploads/d58baa4c-1273-42fb-83d0-950387ad313b.png" 
              alt="ALFREDO" 
              className="h-8 sm:h-10 w-auto" 
            />
          </div>
          
          <div className="w-full mx-auto">
            <div className="text-start py-4 sm:py-6 lg:py-8">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 dark:text-slate-300">
                ALFREDO - Assistente Financeiro
              </h1>
              
              {/* Preço */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">R$ 0,01</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Valor promocional para testes
                </p>
              </div>
              
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
                Seu assistente financeiro inteligente para organizar suas finanças!
              </p>

              {/* Benefits List */}
              <div className="space-y-4 mb-6 sm:mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="bg-primary rounded-full p-1.5 mt-0.5 flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{benefit.title}</p>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Garantia */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800 dark:text-green-200">7 dias de garantia</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Se não gostar, devolvemos seu dinheiro em até 7 dias
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-4">
                <Button 
                  onClick={handleSubscribe} 
                  disabled={isLoading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-base sm:text-lg font-semibold"
                >
                  {isLoading ? 'Processando...' : 'Começar Agora - Gratuito'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={user ? handleGoToDashboard : handleBackToLogin} 
                  className="w-full h-12 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base sm:text-lg"
                >
                  {user ? 'Ir para o Dashboard' : 'Voltar ao login'}
                </Button>
              </div>

              {/* Informações adicionais */}
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Pagamento seguro via Asaas • Cancelamento a qualquer momento
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
