import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, onAuthStateChanged, signOut, fetchUserData, saveUserData } from './firebase';
import { 
  Sparkles, Wallet, TrendingUp, Landmark, ShieldCheck, Sun, Moon, 
  Settings, Award, Target, MessageSquareCode, BellRing, LogOut, ChevronRight
} from 'lucide-react';

// Subcomponents
import Splash from './components/Splash';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Statistics from './components/Statistics';
import Evolution from './components/Evolution';
import BudgetView from './components/BudgetView';
import GoalsView from './components/GoalsView';
import RulesView from './components/RulesView';
import SettingsView from './components/SettingsView';
import NotificationSimulator from './components/NotificationSimulator';

// Initial Seed Data & Types
import { 
  initialTransactions, initialAccounts, initialCards, 
  initialGoals, initialBudgets, initialRules 
} from './initialData';
import { Transaction, BankAccount, CreditCard, FinancialGoal, CategoryBudget, AutoRule, ParsedNotification } from './types';

export default function App() {
  // Screens navigation
  const [screen, setScreen] = useState<'splash' | 'login' | 'app'>('splash');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'statistics' | 'evolution' | 'budget' | 'goals' | 'rules' | 'settings'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Core Data States
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [accounts, setAccounts] = useState<BankAccount[]>(initialAccounts);
  const [cards, setCards] = useState<CreditCard[]>(initialCards);
  const [goals, setGoals] = useState<FinancialGoal[]>(initialGoals);
  const [budgets, setBudgets] = useState<CategoryBudget[]>(initialBudgets);
  const [rules, setRules] = useState<AutoRule[]>(initialRules);

  // Firebase auth & data sync states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // App initialization & theme handler
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Monitor Authentication State & load cloud data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoadingData(true);
        try {
          const cloudData = await fetchUserData(user.uid);
          if (cloudData) {
            if (cloudData.transactions) setTransactions(cloudData.transactions);
            if (cloudData.accounts) setAccounts(cloudData.accounts);
            if (cloudData.cards) setCards(cloudData.cards);
            if (cloudData.goals) setGoals(cloudData.goals);
            if (cloudData.budgets) setBudgets(cloudData.budgets);
            if (cloudData.rules) setRules(cloudData.rules);
          } else {
            // New user, seed current states to Firestore
            await saveUserData(user.uid, {
              accounts: initialAccounts,
              transactions: initialTransactions,
              cards: initialCards,
              goals: initialGoals,
              budgets: initialBudgets,
              rules: initialRules
            });
          }
        } catch (err) {
          console.error('Erro ao inicializar dados com o Firebase:', err);
        } finally {
          setIsLoadingData(false);
          setScreen('app');
        }
      } else {
        setCurrentUser(null);
        if (screen === 'app') {
          setScreen('login');
        }
      }
    });

    return () => unsubscribe();
  }, [screen]);

  // Save changes to Firestore (Debounced to optimize DB writes)
  useEffect(() => {
    if (currentUser && !isLoadingData) {
      const timer = setTimeout(() => {
        saveUserData(currentUser.uid, {
          accounts,
          transactions,
          cards,
          goals,
          budgets,
          rules
        });
      }, 1000); // 1-second debounce

      return () => clearTimeout(timer);
    }
  }, [accounts, transactions, cards, goals, budgets, rules, currentUser, isLoadingData]);

  // Reset all information helper
  const handleResetAllData = async () => {
    // Reset to initial seed state
    setTransactions(initialTransactions);
    setAccounts(initialAccounts);
    setCards(initialCards);
    setGoals(initialGoals);
    setBudgets(initialBudgets);
    setRules(initialRules);

    // If user logged in, immediately update Firestore to overwrite old data
    if (currentUser) {
      await saveUserData(currentUser.uid, {
        accounts: initialAccounts,
        transactions: initialTransactions,
        cards: initialCards,
        goals: initialGoals,
        budgets: initialBudgets,
        rules: initialRules
      });
    }
  };

  // Handle addition of simulated captured notification
  const handleAddNotificationTransaction = (parsed: ParsedNotification, originalText: string) => {
    const txId = `tx-${Date.now()}`;
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

    const newTx: Transaction = {
      id: txId,
      amount: parsed.valor,
      type: parsed.tipo,
      description: parsed.descricao || `Captura automática ${parsed.banco}`,
      category: parsed.categoriaSugerida,
      senderOrRecipient: parsed.pessoa,
      establishment: parsed.pessoa,
      bank: parsed.banco,
      date: formattedDate,
      originalNotificationText: originalText
    };

    // Find if the target bank matches any account
    const targetAccount = accounts.find(acc => 
      acc.bankName.toLowerCase().includes(parsed.banco.toLowerCase()) || 
      parsed.banco.toLowerCase().includes(acc.bankName.toLowerCase())
    );

    const isWorkIncome = parsed.isWorkIncome || parsed.categoriaSugerida === 'Recebimento Trabalho';
    const isEmployeePayment = parsed.isEmployeePayment || parsed.categoriaSugerida === 'Funcionários';

    let autoTransferTx: Transaction | null = null;

    if (targetAccount) {
      if (parsed.tipo === 'receita') {
        if (targetAccount.isWorkAccount && isWorkIncome) {
          // Calculate employee reserve and personal share transfer
          const reservePct = targetAccount.employeeReservePercent || 0;
          const transferPct = targetAccount.personalTransferPercent || 0;
          const transferTargetId = targetAccount.personalTransferTargetAccountId;

          const reserveAmount = (parsed.valor * reservePct) / 100;
          const transferAmount = (parsed.valor * transferPct) / 100;

          // Update accounts
          setAccounts(prev => prev.map(acc => {
            if (acc.id === targetAccount.id) {
              const currentReserve = acc.employeeReserveBalance || 0;
              return {
                ...acc,
                balance: acc.balance + parsed.valor - (transferTargetId ? transferAmount : 0),
                employeeReserveBalance: currentReserve + reserveAmount
              };
            }
            if (transferTargetId && acc.id === transferTargetId) {
              return {
                ...acc,
                balance: acc.balance + transferAmount
              };
            }
            return acc;
          }));

          // Create auto transfer transaction if applicable
          if (transferTargetId && transferAmount > 0) {
            const targetAccObj = accounts.find(a => a.id === transferTargetId);
            const targetName = targetAccObj ? targetAccObj.name : 'Outra Conta';
            autoTransferTx = {
              id: `tx-auto-transfer-${Date.now()}`,
              amount: transferAmount,
              type: 'transferencia',
              description: `Divisão Inteligente: Transferência de Minha Parte (${targetAccount.bankName} ➔ ${targetAccObj?.bankName || targetName})`,
              category: 'Transferência interna',
              senderOrRecipient: 'Minhas Contas',
              establishment: 'Lumina Inteligência',
              bank: targetAccount.bankName,
              date: formattedDate
            };
          }
        } else {
          // Regular non-work receipt
          setAccounts(prev => prev.map(acc => {
            if (acc.id === targetAccount.id) {
              return { ...acc, balance: acc.balance + parsed.valor };
            }
            return acc;
          }));
        }
      } else if (parsed.tipo === 'despesa') {
        const isCard = parsed.banco.toLowerCase().includes('card') || parsed.banco.toLowerCase().includes('crédito');
        if (isCard) {
          setCards(prev => prev.map(c => {
            if (c.name.toLowerCase().includes(parsed.banco.toLowerCase()) || parsed.banco.toLowerCase().includes(c.name.toLowerCase())) {
              return { ...c, spent: c.spent + parsed.valor };
            }
            return c;
          }));
        } else {
          // Regular bank account despesa
          setAccounts(prev => prev.map(acc => {
            if (acc.id === targetAccount.id) {
              let updatedReserve = acc.employeeReserveBalance || 0;
              if (targetAccount.isWorkAccount && isEmployeePayment) {
                // Deduct from employee reserve
                updatedReserve = Math.max(0, updatedReserve - parsed.valor);
              }
              return {
                ...acc,
                balance: Math.max(0, acc.balance - parsed.valor),
                employeeReserveBalance: updatedReserve
              };
            }
            return acc;
          }));
        }
      } else if (parsed.tipo === 'transferencia') {
        // Handle internal transfer
        setAccounts(prev => prev.map(acc => {
          if (acc.id === targetAccount.id) {
            return { ...acc, balance: Math.max(0, acc.balance - parsed.valor) };
          }
          return acc;
        }));
      }
    } else {
      // Fallback if target account is not matched directly
      if (parsed.tipo === 'receita') {
        setAccounts(prev => prev.map(acc => {
          if (acc.bankName.toLowerCase().includes(parsed.banco.toLowerCase()) || parsed.banco.toLowerCase().includes(acc.bankName.toLowerCase())) {
            return { ...acc, balance: acc.balance + parsed.valor };
          }
          return acc;
        }));
      } else if (parsed.tipo === 'despesa') {
        setAccounts(prev => prev.map(acc => {
          if (acc.bankName.toLowerCase().includes(parsed.banco.toLowerCase()) || parsed.banco.toLowerCase().includes(acc.bankName.toLowerCase())) {
            return { ...acc, balance: Math.max(0, acc.balance - parsed.valor) };
          }
          return acc;
        }));
      }
    }

    // Add transactions
    if (autoTransferTx) {
      setTransactions(prev => [newTx, autoTransferTx, ...prev]);
    } else {
      setTransactions(prev => [newTx, ...prev]);
    }

    // Update budget spent
    setBudgets(prev => prev.map(b => {
      if (b.category.toLowerCase() === parsed.categoriaSugerida.toLowerCase()) {
        return { ...b, spent: b.spent + parsed.valor };
      }
      return b;
    }));
  };

  // Add a manual transaction
  const handleAddManualTransaction = (manualTx: Omit<Transaction, 'id' | 'date'>) => {
    const txId = `tx-${Date.now()}`;
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

    const newTx: Transaction = {
      ...manualTx,
      id: txId,
      date: formattedDate
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update balance
    if (manualTx.type === 'receita') {
      setAccounts(prev => prev.map(acc => {
        if (acc.bankName.toLowerCase() === manualTx.bank.toLowerCase()) {
          return { ...acc, balance: acc.balance + manualTx.amount };
        }
        return acc;
      }));
    } else if (manualTx.type === 'despesa') {
      setAccounts(prev => prev.map(acc => {
        if (acc.bankName.toLowerCase() === manualTx.bank.toLowerCase()) {
          return { ...acc, balance: Math.max(0, acc.balance - manualTx.amount) };
        }
        return acc;
      }));
    }

    // Update budget spent
    setBudgets(prev => prev.map(b => {
      if (b.category.toLowerCase() === manualTx.category.toLowerCase()) {
        return { ...b, spent: b.spent + manualTx.amount };
      }
      return b;
    }));
  };

  // Delete transaction and revert balance alterations
  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find(t => t.id === id);
    if (!target) return;

    // Filter transaction out
    setTransactions(prev => prev.filter(t => t.id !== id));

    // Revert account / card alterations
    if (target.type === 'receita') {
      setAccounts(prev => prev.map(acc => {
        if (acc.bankName.toLowerCase() === target.bank.toLowerCase()) {
          return { ...acc, balance: Math.max(0, acc.balance - target.amount) };
        }
        return acc;
      }));
    } else if (target.type === 'despesa') {
      setAccounts(prev => prev.map(acc => {
        if (acc.bankName.toLowerCase() === target.bank.toLowerCase()) {
          return { ...acc, balance: acc.balance + target.amount };
        }
        return acc;
      }));
    }

    // Revert category budget
    setBudgets(prev => prev.map(b => {
      if (b.category.toLowerCase() === target.category.toLowerCase()) {
        return { ...b, spent: Math.max(0, b.spent - target.amount) };
      }
      return b;
    }));
  };

  const handleUpdateLimit = (id: string, newLimit: number) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, limit: newLimit } : b));
  };

  const handleAddBudget = (category: string, limit: number) => {
    const newId = `budget-${Date.now()}`;
    const newB: CategoryBudget = {
      id: newId,
      category,
      limit,
      spent: 0,
      icon: 'dollar',
      color: 'bg-indigo-500'
    };
    setBudgets(prev => [...prev, newB]);
  };

  const handleAddGoal = (goal: Omit<FinancialGoal, 'id' | 'currentAmount'>) => {
    const newG: FinancialGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      currentAmount: 0
    };
    setGoals(prev => [...prev, newG]);
  };

  const handleContributeGoal = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g));
  };

  const handleAddRule = (rule: AutoRule) => {
    setRules(prev => [...prev, rule]);
  };

  const handleDeleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  // Switch Screens handler
  if (screen === 'splash') {
    return <Splash onFinished={() => setScreen('login')} />;
  }

  if (screen === 'login') {
    return (
      <Login 
        onSuccess={() => setScreen('app')} 
        onLocalLogin={() => {
          setCurrentUser({ email: 'convidado@lumina.com', uid: 'local-guest', isLocal: true });
          setScreen('app');
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] dark:bg-[#090d16] text-[#191c1e] dark:text-[#eff1f3] flex flex-col md:flex-row transition-colors duration-200">
      
      {/* 1. Desktop Sidebar (Left Panel) */}
      <aside className="hidden md:flex md:w-80 bg-white dark:bg-[#0e1422] border-r border-gray-100 dark:border-gray-850 flex-col justify-between p-6 shrink-0 relative z-20">
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black dark:bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-[#6ffbbe]" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-base text-gray-900 dark:text-white leading-none">Lumina Finance</h1>
              <span className="text-[10px] font-mono tracking-wider text-gray-400 mt-1 block">FINANCIAL CLARITY</span>
            </div>
          </div>

          {/* Navigation Menus matching mockup exactly */}
          <nav className="space-y-1.5">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full h-11 px-4 rounded-xl flex items-center justify-between text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-black text-white dark:bg-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4" />
                <span>Visão Geral</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button 
              onClick={() => setActiveTab('statistics')}
              className={`w-full h-11 px-4 rounded-xl flex items-center justify-between text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'statistics' ? 'bg-black text-white dark:bg-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4" />
                <span>Estatísticas</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button 
              onClick={() => setActiveTab('evolution')}
              className={`w-full h-11 px-4 rounded-xl flex items-center justify-between text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'evolution' ? 'bg-black text-white dark:bg-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Landmark className="w-4 h-4" />
                <span>Evolução</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button 
              onClick={() => setActiveTab('budget')}
              className={`w-full h-11 px-4 rounded-xl flex items-center justify-between text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'budget' ? 'bg-black text-white dark:bg-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4" />
                <span>Orçamento</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button 
              onClick={() => setActiveTab('goals')}
              className={`w-full h-11 px-4 rounded-xl flex items-center justify-between text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'goals' ? 'bg-black text-white dark:bg-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4" />
                <span>Metas</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button 
              onClick={() => setActiveTab('rules')}
              className={`w-full h-11 px-4 rounded-xl flex items-center justify-between text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'rules' ? 'bg-black text-white dark:bg-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquareCode className="w-4 h-4" />
                <span>Regras de Mapeamento</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full h-11 px-4 rounded-xl flex items-center justify-between text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-black text-white dark:bg-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span>Ajustes</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </nav>
        </div>

        {/* Sidebar Footer (Theme controls & Logout) */}
        <div className="space-y-4 pt-6 border-t border-gray-50 dark:border-gray-850">
          {/* Light / Dark Mode Toggle button */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full h-11 px-4 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? <Sun className="w-4 h-4 text-[#6ffbbe]" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span>{isDarkMode ? 'Tema Claro' : 'Tema Escuro'}</span>
            </div>
          </button>

          {/* Simulated Sign Out */}
          <button 
            onClick={async () => {
              await signOut(auth);
              setScreen('login');
            }}
            className="w-full h-11 px-4 rounded-xl flex items-center gap-3 text-xs font-semibold text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do App</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Page Content Container & Top Header (Right Panel) */}
      <main className="flex-grow flex flex-col min-h-screen relative overflow-x-hidden pb-24 md:pb-8">
        
        {/* Desktop top profile header */}
        <header className="hidden md:flex justify-between items-center h-20 px-8 lg:px-12 bg-white dark:bg-[#0e1422]/50 border-b border-gray-100 dark:border-gray-850">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-gray-400">ATIVO NO AMBIENTE</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold font-mono text-gray-700 dark:text-gray-300">
              {currentUser?.uid === 'local-guest' ? 'Convidado (Modo Local)' : (currentUser?.email || 'Roberto da Silva')}
            </span>
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHEkY8If3N-2_-GozMiq441gFwbdsjGVL7MLeCSrXhmt9iJ6_8ZlHczD2jlZFMRksMRguU18-olZgAKa-IBiBEpyBd3d-taLhV18KwLWKSUbLek5Fb1nkybioGdwP1dYZrTfog6ijfzdNlaKmgn-bdtVsEA7zT1P0GPmMgPK_q0skZpEV_JpKGzuk6CR6Be2a3Y-6DXLQGUBwwZs3FagdjTeRQXAftjeyJCADpW-buwwiT1e-xM3bZww" 
              alt="Avatar Profile" 
              className="w-10 h-10 rounded-full border border-gray-150 object-cover shadow-sm"
            />
          </div>
        </header>

        {/* Dynamic Panel renderer */}
        <div className="flex-grow p-6 md:p-8 lg:p-12 max-w-7xl w-full mx-auto space-y-12">
          
          {/* Main Active tab render */}
          <div className="relative">
            {activeTab === 'dashboard' && (
              <Dashboard 
                transactions={transactions} 
                accounts={accounts} 
                cards={cards} 
                onAddManualTransaction={handleAddManualTransaction}
                onEditTransaction={() => {}}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}

            {activeTab === 'statistics' && (
              <Statistics transactions={transactions} />
            )}

            {activeTab === 'evolution' && (
              <Evolution accounts={accounts} />
            )}

            {activeTab === 'budget' && (
              <BudgetView 
                budgets={budgets} 
                onUpdateLimit={handleUpdateLimit}
                onAddBudget={handleAddBudget}
              />
            )}

            {activeTab === 'goals' && (
              <GoalsView 
                goals={goals} 
                onAddGoal={handleAddGoal}
                onContributeGoal={handleContributeGoal}
              />
            )}

            {activeTab === 'rules' && (
              <RulesView 
                rules={rules} 
                onAddRule={handleAddRule}
                onDeleteRule={handleDeleteRule}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView 
                transactions={transactions} 
                accounts={accounts}
                onUpdateAccounts={setAccounts}
                onResetAllData={handleResetAllData}
              />
            )}
          </div>

          {/* Shared bottom section: Always show Notification Simulator to let users test instantly! */}
          <section className="border-t border-gray-100 dark:border-gray-850 pt-12">
            <div className="max-w-2xl mx-auto">
              <NotificationSimulator 
                onAddTransaction={handleAddNotificationTransaction}
                onAddRule={handleAddRule}
                rules={rules}
              />
            </div>
          </section>
        </div>
      </main>

      {/* 3. Mobile Bottom Navigation Bar (Hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-[#0e1422] border-t border-gray-100 dark:border-gray-850 h-16 flex items-center justify-around px-4 z-30 shadow-lg">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'dashboard' ? 'text-black dark:text-[#6ffbbe]' : 'text-gray-400'}`}
        >
          <Wallet className="w-5 h-5" />
          <span>Início</span>
        </button>

        <button 
          onClick={() => setActiveTab('statistics')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'statistics' ? 'text-black dark:text-[#6ffbbe]' : 'text-gray-400'}`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Gráficos</span>
        </button>

        <button 
          onClick={() => setActiveTab('budget')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'budget' ? 'text-black dark:text-[#6ffbbe]' : 'text-gray-400'}`}
        >
          <Target className="w-5 h-5" />
          <span>Limites</span>
        </button>

        <button 
          onClick={() => setActiveTab('goals')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'goals' ? 'text-black dark:text-[#6ffbbe]' : 'text-gray-400'}`}
        >
          <Award className="w-5 h-5" />
          <span>Metas</span>
        </button>

        <button 
          onClick={() => setActiveTab('rules')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'rules' ? 'text-black dark:text-[#6ffbbe]' : 'text-gray-400'}`}
        >
          <MessageSquareCode className="w-5 h-5" />
          <span>Regras</span>
        </button>

        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'settings' ? 'text-black dark:text-[#6ffbbe]' : 'text-gray-400'}`}
        >
          <Settings className="w-5 h-5" />
          <span>Ajustes</span>
        </button>
      </nav>
    </div>
  );
}
