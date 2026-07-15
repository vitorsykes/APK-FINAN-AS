import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, TrendingDown, Landmark, Wallet, PiggyBank, CreditCard as CardIcon, 
  Search, Plus, Eye, EyeOff, Filter, Edit3, Trash2, X, AlertCircle, Sparkles, ChevronRight, Check, Calendar, Briefcase
} from 'lucide-react';
import { Transaction, BankAccount, CreditCard } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  cards: CreditCard[];
  onAddManualTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function Dashboard({ 
  transactions, 
  accounts, 
  cards, 
  onAddManualTransaction, 
  onEditTransaction,
  onDeleteTransaction 
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hideBalance, setHideBalance] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filters State
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Manual Add Form State
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<'receita' | 'despesa' | 'transferencia'>('despesa');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Alimentação');
  const [formRecipient, setFormRecipient] = useState('');
  const [formEstablishment, setFormEstablishment] = useState('');
  const [formBank, setFormBank] = useState('Itaú');

  // Computed summary stats
  const totalBalance = useMemo(() => accounts.reduce((acc, curr) => acc + curr.balance, 0), [accounts]);
  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'receita').reduce((acc, curr) => acc + curr.amount, 0), [transactions]);
  const totalExpenses = useMemo(() => transactions.filter(t => t.type === 'despesa').reduce((acc, curr) => acc + curr.amount, 0), [transactions]);
  const availableCash = useMemo(() => accounts.filter(a => a.id !== 'acc-5').reduce((acc, curr) => acc + curr.balance, 0), [accounts]); // excluding Real Estate
  const forecastBalance = useMemo(() => totalBalance + totalIncome - totalExpenses, [totalBalance, totalIncome, totalExpenses]);

  // Unique filters data lists
  const availableCategories = useMemo(() => Array.from(new Set(transactions.map(t => t.category))), [transactions]);
  const availableBanks = useMemo(() => Array.from(new Set(accounts.map(a => a.bankName))), [accounts]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.senderOrRecipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBank = selectedBank ? t.bank === selectedBank : true;
      const matchesCategory = selectedCategory ? t.category === selectedCategory : true;
      const matchesType = selectedType ? t.type === selectedType : true;

      return matchesSearch && matchesBank && matchesCategory && matchesType;
    });
  }, [transactions, searchQuery, selectedBank, selectedCategory, selectedType]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formAmount);
    if (!amount || isNaN(amount)) return;

    onAddManualTransaction({
      amount,
      type: formType,
      description: formDesc || `${formType === 'receita' ? 'Crédito' : 'Débito'} manual`,
      category: formCategory,
      senderOrRecipient: formRecipient || 'Lançamento Manual',
      establishment: formEstablishment || 'Manual',
      bank: formBank
    });

    // Reset Form
    setFormAmount('');
    setFormDesc('');
    setFormRecipient('');
    setFormEstablishment('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Mobile Header Style exactly mirroring the mockup */}
      <div className="md:hidden flex justify-between items-center mb-6">
        <div>
          <p className="text-xs text-gray-400 font-mono">Bom dia, Roberto</p>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Visão Geral</h2>
        </div>
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHEkY8If3N-2_-GozMiq441gFwbdsjGVL7MLeCSrXhmt9iJ6_8ZlHczD2jlZFMRksMRguU18-olZgAKa-IBiBEpyBd3d-taLhV18KwLWKSUbLek5Fb1nkybioGdwP1dYZrTfog6ijfzdNlaKmgn-bdtVsEA7zT1P0GPmMgPK_q0skZpEV_JpKGzuk6CR6Be2a3Y-6DXLQGUBwwZs3FagdjTeRQXAftjeyJCADpW-buwwiT1e-xM3bZww" 
          alt="Avatar" 
          className="w-12 h-12 rounded-full border border-gray-200 shadow-sm object-cover"
        />
      </div>

      {/* Main Card: Saldo Atual (Glassmorphism design) */}
      <section className="relative overflow-hidden p-8 rounded-2xl bg-white dark:bg-[#121824] border border-gray-100 dark:border-gray-800 shadow-md">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/5 rounded-full blur-2xl -ml-5 -mb-5 pointer-events-none"></div>

        <div className="relative z-10 flex justify-between items-start">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">Saldo Atual</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">R$</span>
              <h3 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tight">
                {hideBalance ? '••••••' : totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
          
          <button 
            onClick={() => setHideBalance(!hideBalance)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 transition-colors"
          >
            {hideBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>

        <div className="relative z-10 flex flex-wrap gap-x-8 gap-y-2 mt-6 border-t border-gray-100 dark:border-gray-800 pt-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+2.4% este mês</span>
          </div>
          <div className="text-gray-400">
            <span>Disponível: R$ {availableCash.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
          </div>
        </div>
      </section>

      {/* Bento Grid layout mirroring the mockup exactly */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dinheiro em Contas */}
        <div className="bg-white dark:bg-[#121824] border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Dinheiro em Contas</span>
            <Landmark className="w-4 h-4 text-gray-300" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-black dark:text-white font-sans">
            R$ {availableCash >= 1000 ? `${(availableCash / 1000).toFixed(1)}k` : availableCash}
          </p>
        </div>

        {/* Total Recebido */}
        <div className="bg-white dark:bg-[#121824] border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Total Recebido</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-sans">
            R$ {totalIncome >= 1000 ? `${(totalIncome / 1000).toFixed(1)}k` : totalIncome}
          </p>
        </div>

        {/* Total Gasto */}
        <div className="bg-white dark:bg-[#121824] border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Total Gasto</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-rose-500 font-sans">
            R$ {totalExpenses >= 1000 ? `${(totalExpenses / 1000).toFixed(1)}k` : totalExpenses}
          </p>
        </div>

        {/* Saldo Previsto */}
        <div className="bg-white dark:bg-[#121824] border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Saldo Previsto</span>
            <Calendar className="w-4 h-4 text-gray-300" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-sans">
            R$ {forecastBalance >= 1000 ? `${(forecastBalance / 1000).toFixed(1)}k` : forecastBalance}
          </p>
        </div>
      </section>

      {/* Main split sections: Accounts/Cards vs Search/Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Accounts & Credit Cards */}
        <div className="space-y-6 lg:col-span-1">
          {/* Bank Accounts */}
          <div className="bg-white dark:bg-[#121824] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Minhas Contas</h3>
            <div className="space-y-4">
              {accounts.map(acc => (
                <div key={acc.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100/50 dark:hover:bg-gray-900 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                      {acc.icon === 'wallet' && <Wallet className="w-5 h-5" />}
                      {acc.icon === 'piggy-bank' && <PiggyBank className="w-5 h-5" />}
                      {acc.icon === 'credit-card' && <CardIcon className="w-5 h-5" />}
                      {acc.icon === 'trending-up' && <TrendingUp className="w-5 h-5" />}
                      {acc.icon === 'home' && <Wallet className="w-5 h-5" />} {/* Imovel */}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-tight flex items-center gap-1.5">
                        <span>{acc.name}</span>
                        {acc.isWorkAccount && (
                          <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-[#6ffbbe] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-bold scale-90">
                            <Briefcase className="w-2.5 h-2.5" />
                            <span>PJ</span>
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] font-mono text-gray-400 mt-0.5 flex items-center gap-1.5">
                        <span>{acc.bankName}</span>
                        {acc.isWorkAccount && acc.employeeReserveBalance !== undefined && acc.employeeReserveBalance > 0 && (
                          <span className="text-[9px] text-indigo-500 font-bold dark:text-[#6ffbbe]/80">
                            • Reserva: R$ {acc.employeeReserveBalance.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    R$ {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Credit Cards list with standard design system tags */}
          <div className="bg-white dark:bg-[#121824] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Cartões de Crédito</h3>
            <div className="space-y-4">
              {cards.map(card => (
                <div key={card.id} className={`p-4 rounded-xl bg-gradient-to-r ${card.color} text-white shadow-sm flex flex-col justify-between h-28 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-md"></div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-white/70">{card.name}</span>
                    <CardIcon className="w-4 h-4 text-white/80" />
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <span className="text-[9px] text-white/50 block font-mono">Fatura Atual</span>
                      <span className="text-base font-black">R$ {card.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <span className="text-[10px] font-mono tracking-wider">•••• {card.lastDigits}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Columns: Activity, Search, Actions, Adding forms */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Controls Bar: Search, Filters button, Add Transaction Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca inteligente..."
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-white dark:bg-[#121824] border border-gray-100 dark:border-gray-800 text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
              />
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`h-11 px-4 border ${showFilters ? 'border-indigo-500 text-indigo-500 bg-indigo-500/5' : 'border-gray-100 dark:border-gray-800 text-gray-500'} hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2 text-sm cursor-pointer w-full sm:w-auto justify-center`}
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>

              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="h-11 px-4 bg-black hover:bg-gray-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer w-full sm:w-auto shrink-0 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Lançar Manual</span>
              </button>
            </div>
          </div>

          {/* Collapsible Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white dark:bg-[#121824] border border-gray-100 dark:border-gray-800 p-5 rounded-xl space-y-4 overflow-hidden shadow-sm"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Categoria</label>
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full h-10 px-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs text-gray-700 dark:text-white"
                    >
                      <option value="">Todas</option>
                      {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  {/* Bank Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Banco</label>
                    <select 
                      value={selectedBank} 
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full h-10 px-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs text-gray-700 dark:text-white"
                    >
                      <option value="">Todos</option>
                      {availableBanks.map(bk => <option key={bk} value={bk}>{bk}</option>)}
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Tipo</label>
                    <select 
                      value={selectedType} 
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full h-10 px-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs text-gray-700 dark:text-white"
                    >
                      <option value="">Todos</option>
                      <option value="receita">Receita</option>
                      <option value="despesa">Despesa</option>
                      <option value="transferencia">Transferência Interna</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => {
                      setSelectedBank('');
                      setSelectedCategory('');
                      setSelectedType('');
                    }}
                    className="text-xs text-indigo-500 hover:underline font-semibold"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsible Manual Lançamento / Addition Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white dark:bg-[#121824] border border-gray-100 dark:border-gray-800 p-6 rounded-xl overflow-hidden shadow-sm space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-900">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Lançamento Financeiro Manual</span>
                  </h3>
                  <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Amount */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Valor (R$)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm text-gray-800 dark:text-white focus:outline-none"
                        placeholder="Ex: 250.00"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Tipo da Transação</label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as any)}
                        className="w-full h-10 px-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm text-gray-800 dark:text-white focus:outline-none"
                      >
                        <option value="despesa">Despesa</option>
                        <option value="receita">Receita</option>
                        <option value="transferencia">Transferência Interna</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Descrição</label>
                      <input 
                        type="text" 
                        required
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm text-gray-800 dark:text-white focus:outline-none"
                        placeholder="Ex: Compra no Supermercado"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Categoria</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full h-10 px-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm text-gray-800 dark:text-white focus:outline-none"
                      >
                        <option value="Alimentação">Alimentação</option>
                        <option value="Transporte">Transporte</option>
                        <option value="Lazer">Lazer</option>
                        <option value="Moradia">Moradia</option>
                        <option value="Compras">Compras</option>
                        <option value="Salário">Salário</option>
                        <option value="Assinaturas">Assinaturas</option>
                        <option value="Investimentos">Investimentos</option>
                        <option value="Rendimentos">Rendimentos</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>

                    {/* Recipient / Pessoa */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Pessoa / Origem / Destino</label>
                      <input 
                        type="text" 
                        value={formRecipient}
                        onChange={(e) => setFormRecipient(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm text-gray-800 dark:text-white focus:outline-none"
                        placeholder="Ex: iFood, João, Uber"
                      />
                    </div>

                    {/* Establishment */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Estabelecimento / Local</label>
                      <input 
                        type="text" 
                        value={formEstablishment}
                        onChange={(e) => setFormEstablishment(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm text-gray-800 dark:text-white focus:outline-none"
                        placeholder="Ex: iFood Express, Nubank"
                      />
                    </div>

                    {/* Bank Account */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Conta Bancária Associada</label>
                      <select
                        value={formBank}
                        onChange={(e) => setFormBank(e.target.value)}
                        className="w-full h-10 px-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm text-gray-800 dark:text-white focus:outline-none"
                      >
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.bankName}>{acc.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2 bg-black hover:bg-gray-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Salvar Lançamento
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transactions / Activity List */}
          <div className="bg-white dark:bg-[#121824] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Últimas Movimentações</h3>
              <span className="text-xs text-gray-400 font-mono">{filteredTransactions.length} exibidas</span>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-semibold">Nenhuma movimentação encontrada</p>
                <p className="text-[10px]">Tente ajustar os filtros ou digitar uma busca diferente.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {filteredTransactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100/30 dark:hover:bg-gray-900 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        tx.type === 'receita' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                        tx.type === 'despesa' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' :
                        'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                      }`}>
                        {tx.type === 'receita' && <TrendingUp className="w-4 h-4" />}
                        {tx.type === 'despesa' && <TrendingDown className="w-4 h-4" />}
                        {tx.type === 'transferencia' && <ArrowRightLeft className="w-4 h-4" />}
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{tx.description}</h4>
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[10px] text-gray-400 font-sans items-center">
                          <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[9px] uppercase font-semibold tracking-wider text-gray-500 dark:text-gray-400">{tx.category}</span>
                          <span>•</span>
                          <span>{tx.senderOrRecipient}</span>
                          {tx.bank && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{tx.bank}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`text-xs font-bold font-mono block ${
                          tx.type === 'receita' ? 'text-emerald-600 dark:text-emerald-400' :
                          tx.type === 'despesa' ? 'text-rose-500' :
                          'text-blue-500'
                        }`}>
                          {tx.type === 'receita' ? '+' : tx.type === 'despesa' ? '-' : ''}
                          R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[9px] font-mono text-gray-400 block mt-0.5">{tx.date}</span>
                      </div>

                      {/* Delete Action button */}
                      <button 
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-300 hover:text-rose-500 rounded transition-colors"
                        title="Deletar Lançamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Helper icon definition for mapping
const ArrowRightLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);
