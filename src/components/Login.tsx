import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Sparkles, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../firebase';

interface LoginProps {
  onSuccess: (email: string) => void;
  onLocalLogin?: () => void;
}

export default function Login({ onSuccess, onLocalLogin }: LoginProps) {
  const [email, setEmail] = useState('demo@lumina.com');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('Roberto da Silva');
  
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPass, setIsFocusedPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUpMode) {
        if (password.length < 6) {
          throw new Error('A senha deve conter pelo menos 6 caracteres.');
        }
        await createUserWithEmailAndPassword(auth, email, password);
        onSuccess(email);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onSuccess(email);
      }
    } catch (err: any) {
      console.error('Erro de autenticação:', err);
      let errMsg = 'Ocorreu um erro ao processar sua solicitação.';
      
      if (err.code === 'auth/operation-not-allowed' || (err.message && err.message.includes('operation-not-allowed'))) {
        errMsg = 'PROVIDER_DISABLED';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'E-mail ou senha incorretos. Por favor, verifique suas credenciais.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'Este endereço de e-mail já está sendo utilizado por outra conta.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Por favor, informe um endereço de e-mail válido.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'A senha escolhida é muito fraca. Escolha uma senha de pelo menos 6 caracteres.';
      } else if (err.message) {
        errMsg = err.message;
      }
      
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    if (onLocalLogin) {
      onLocalLogin();
    } else {
      // Quick login fallback
      setEmail('demo@lumina.com');
      setPassword('123456');
      setIsSignUpMode(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#f7f9fb] dark:bg-[#090d16] flex items-center justify-center p-6 text-[#191c1e] dark:text-[#eff1f3]">
      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white dark:bg-[#121824] rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
        
        {/* Left Side: Brand Panel (Hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 relative bg-[#eceef0] dark:bg-[#1a2232] flex-col justify-between p-12 overflow-hidden">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30 dark:opacity-20 mix-blend-multiply dark:mix-blend-overlay"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80')" }}
          />
          
          <div className="relative z-10 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-black dark:text-[#6ffbbe]" />
            <h1 className="font-sans font-bold text-xl tracking-tight text-black dark:text-white">Lumina Finance</h1>
          </div>

          <div className="relative z-10 max-w-sm mt-16">
            <h2 className="text-3xl font-bold mb-6 text-black dark:text-white leading-tight">
              Sua jornada de clareza financeira, agora na nuvem.
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-sans leading-relaxed">
              Uma plataforma inteligente projetada para organizar seu orçamento, reservar fundos e controlar seus faturamentos em tempo real.
            </p>
          </div>
          
          <div className="relative z-10">
            <span className="text-xs font-mono text-gray-400">LUMINA CLOUD REVOLUTION v2.0</span>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white dark:bg-[#121824]">
          <div className="md:hidden flex justify-center items-center gap-2 mb-8">
            <Sparkles className="w-6 h-6 text-black dark:text-[#6ffbbe]" />
            <h1 className="font-bold text-2xl tracking-tight text-black dark:text-white">Lumina Finance</h1>
          </div>

          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isSignUpMode ? 'Criar Conta' : 'Acessar Conta'}
              </h2>
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs text-gray-400">
                  {isSignUpMode ? 'Registre-se e sincronize em tempo real' : 'Entre para carregar suas finanças integradas'}
                </p>
                <div className="w-24 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-black dark:bg-[#6ffbbe] rounded-full transition-all duration-350 ${isSignUpMode ? 'w-full' : 'w-1/2'}`}></div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 p-4 rounded-xl border border-red-100 dark:border-red-900/50 text-xs flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    {error === 'PROVIDER_DISABLED' ? (
                      <>
                        <strong>Provedor de E-mail/Senha não ativo no Firebase!</strong>
                        <p className="mt-1 text-gray-500 dark:text-gray-400 leading-relaxed">
                          Para resolver, ative o método de login <strong>"E-mail/Senha"</strong> no painel do seu Firebase Console em <em>Authentication &gt; Sign-in method</em>.
                        </p>
                      </>
                    ) : (
                      error
                    )}
                  </span>
                </div>
                {error === 'PROVIDER_DISABLED' && onLocalLogin && (
                  <button
                    type="button"
                    onClick={onLocalLogin}
                    className="w-full h-9 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Entrar no Modo Local (Offline)
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name field (only shown in signup mode) */}
              {isSignUpMode && (
                <div className="relative border-b border-gray-200 dark:border-gray-800 py-2">
                  <span className="absolute left-0 bottom-3 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </span>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-8 bg-transparent border-none text-sm focus:outline-none focus:ring-0 text-gray-900 dark:text-white py-1" 
                    placeholder="Nome completo"
                    required={isSignUpMode}
                  />
                </div>
              )}

              {/* Email Field with customized floating/styled border */}
              <div className="relative border-b border-gray-200 dark:border-gray-800 py-2">
                <span className="absolute left-0 bottom-3 text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocusedEmail(true)}
                  onBlur={() => setIsFocusedEmail(false)}
                  className="w-full pl-8 bg-transparent border-none text-sm focus:outline-none focus:ring-0 text-gray-900 dark:text-white py-1" 
                  placeholder="E-mail"
                  required
                />
              </div>

              {/* Password Field with customized floating/styled border */}
              <div className="relative border-b border-gray-200 dark:border-gray-800 py-2">
                <span className="absolute left-0 bottom-3 text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocusedPass(true)}
                  onBlur={() => setIsFocusedPass(false)}
                  className="w-full pl-8 bg-transparent border-none text-sm focus:outline-none focus:ring-0 text-gray-900 dark:text-white py-1" 
                  placeholder="Senha (mínimo 6 dígitos)"
                  required
                />
              </div>

              {/* Primary Entrar / Continuar Button */}
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-black hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold text-sm rounded-full shadow-lg flex items-center justify-center gap-2 transition-colors cursor-pointer mt-8 disabled:opacity-55"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUpMode ? 'Registrar no Lumina' : 'Entrar no Lumina Finance'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="relative flex py-6 items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              <span className="flex-shrink mx-4 text-xs font-mono text-gray-400 tracking-widest uppercase">ou continue com</span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
            </div>

            {/* Quick Demo Access Shortcuts */}
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={handleGuestLogin} 
                className="flex-1 h-11 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-full transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer"
              >
                <span>Usar Conta Demo</span>
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-12">
              {isSignUpMode ? (
                <>
                  Já tem uma conta?{' '}
                  <span 
                    onClick={() => { setIsSignUpMode(false); setError(null); }}
                    className="font-semibold text-black dark:text-white hover:underline cursor-pointer"
                  >
                    Acessar
                  </span>
                </>
              ) : (
                <>
                  Não tem uma conta?{' '}
                  <span 
                    onClick={() => { setIsSignUpMode(true); setError(null); }}
                    className="font-semibold text-black dark:text-white hover:underline cursor-pointer"
                  >
                    Criar Conta
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
