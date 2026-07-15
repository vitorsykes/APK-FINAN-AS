import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Utensils, Gamepad2, Car, Home, Tv, AlertCircle, Plus, DollarSign, X } from 'lucide-react';
import { CategoryBudget } from '../types';

interface BudgetViewProps {
  budgets: CategoryBudget[];
  onUpdateLimit: (id: string, newLimit: number) => void;
  onAddBudget: (category: string, limit: number) => void;
}

export default function BudgetView({ budgets, onUpdateLimit, onAddBudget }: BudgetViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewCategoryLimit] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimitVal, setEditLimitVal] = useState('');

  // Total budget aggregated calculations
  const totalLimit = useMemo(() => budgets.reduce((acc, curr) => acc + curr.limit, 0), [budgets]);
  const totalSpent = useMemo(() => budgets.reduce((acc, curr) => acc + curr.spent, 0), [budgets]);
  const remainingBudget = useMemo(() => totalLimit - totalSpent, [totalLimit, totalSpent]);
  const progressPercent = useMemo(() => totalLimit > 0 ? Math.min(100, Math.round((totalSpent / totalLimit) * 100)) : 0, [totalLimit, totalSpent]);

  // Dash offsets for remaining spending percentage circle ring
  const strokeDashOffset = useMemo(() => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius; // ~282.7
    const remainingPercent = totalLimit > 0 ? Math.max(0, (totalLimit - totalSpent) / totalLimit) : 1;
    return circumference * (1 - remainingPercent);
  }, [totalLimit, totalSpent]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(newLimit);
    if (!newCategory.trim() || isNaN(limitNum) || limitNum <= 0) return;

    onAddBudget(newCategory.trim(), limitNum);
    setNewCategory('');
    setNewCategoryLimit('');
    setShowAddForm(false);
  };

  const handleSaveEdit = (id: string) => {
    const limitNum = parseFloat(editLimitVal);
    if (isNaN(limitNum) || limitNum <= 0) return;
    onUpdateLimit(id, limitNum);
    setEditingId(null);
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Orçamento</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Planejamento e controle de despesas por categorias</p>
      </div>

      {/* Monthly Remaining Progress Ring perfectly mirroring mockup */}
      <section className="flex flex-col items-center justify-center py-6 bg-white dark:bg-[#121824] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative">
        <h2 className="text-sm font-semibold text-gray-400 font-mono tracking-wider block uppercase mb-6 text-center">Limite Mensal Restante</h2>
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* SVG Progress Circle */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Ring */}
            <circle 
              className="text-gray-100 dark:text-gray-800" 
              cx="50" 
              cy="50" 
              r="45" 
              fill="transparent" 
              stroke="currentColor" 
              strokeWidth="5" 
            />
            {/* Progress Active Ring */}
            <circle 
              className="text-black dark:text-indigo-500 transition-all duration-500 ease-out" 
              cx="50" 
              cy="50" 
              r="45" 
              fill="transparent" 
              stroke="currentColor" 
              strokeWidth="5" 
              strokeDasharray="282.7"
              strokeDashoffset={strokeDashOffset}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Inner Display Numbers */}
          <div className="flex flex-col items-center justify-center text-center z-10">
            <span className="text-3xl font-black text-black dark:text-white">
              R$ {remainingBudget.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2">
              de R$ {totalLimit.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </section>

      {/* Header with custom budget adder */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Categorias</h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs bg-black dark:bg-indigo-600 hover:opacity-90 text-white font-bold h-9 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Configurar Limite</span>
        </button>
      </div>

      {/* Category Budgets List */}
      <div className="space-y-4">
        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white dark:bg-[#121824] border border-gray-100 dark:border-gray-800 p-5 rounded-xl overflow-hidden shadow-sm space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Criar Novo Orçamento de Categoria</h4>
                <button onClick={() => setShowAddForm(false)}>
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nome da Categoria</label>
                  <input 
                    type="text" 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 text-xs dark:bg-gray-900 dark:text-white"
                    placeholder="Ex: Assinaturas, Lazer, Restaurantes"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Limite Mensal (R$)</label>
                  <input 
                    type="number" 
                    value={newLimit}
                    onChange={(e) => setNewCategoryLimit(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 text-xs dark:bg-gray-900 dark:text-white"
                    placeholder="Ex: 500"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-black dark:bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Budgets Progress Cards */}
        {budgets.map(bud => {
          const isOverBudget = bud.spent > bud.limit;
          const pct = bud.limit > 0 ? Math.min(100, Math.round((bud.spent / bud.limit) * 100)) : 0;
          
          return (
            <div key={bud.id} className="bg-white dark:bg-[#121824] rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isOverBudget ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/20' : 'bg-gray-50 text-gray-500 dark:bg-gray-900'
                  }`}>
                    {bud.icon === 'utensils' && <Utensils className="w-5 h-5" />}
                    {bud.icon === 'gamepad-2' && <Gamepad2 className="w-5 h-5" />}
                    {bud.icon === 'car' && <Car className="w-5 h-5" />}
                    {bud.icon === 'home' && <Home className="w-5 h-5" />}
                    {bud.icon === 'tv' && <Tv className="w-5 h-5" />}
                    {!['utensils', 'gamepad-2', 'car', 'home', 'tv'].includes(bud.icon) && <DollarSign className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{bud.category}</h4>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5">{pct}% consumido</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-mono block">Gasto / Limite</span>
                  
                  {editingId === bud.id ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input 
                        type="number"
                        value={editLimitVal}
                        onChange={(e) => setEditLimitVal(e.target.value)}
                        className="w-16 h-7 px-1.5 text-xs text-right border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white rounded"
                      />
                      <button 
                        onClick={() => handleSaveEdit(bud.id)}
                        className="p-1 hover:bg-emerald-50 text-emerald-500 rounded text-xs font-bold"
                      >
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-end gap-1 mt-0.5">
                      <span className={`text-xs font-bold font-mono ${isOverBudget ? 'text-rose-500' : 'text-gray-900 dark:text-white'}`}>
                        R$ {bud.spent.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        / R$ {bud.limit.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </span>
                      <button 
                        onClick={() => {
                          setEditingId(bud.id);
                          setEditLimitVal(bud.limit.toString());
                        }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-600 hover:underline font-bold ml-1.5"
                      >
                        Ajustar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Line Bar exactly like mockup */}
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverBudget ? 'bg-rose-500' : 'bg-black dark:bg-[#6ffbbe]'
                  }`} 
                  style={{ width: `${pct}%` }}
                />
              </div>

              {isOverBudget && (
                <div className="flex items-center gap-1 text-[10px] text-rose-500 font-sans font-bold mt-2.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Alerta de Orçamento Extrapolado! Você ultrapassou o limite planejado em R$ {(bud.spent - bud.limit).toLocaleString('pt-BR')}.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
