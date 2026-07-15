import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Shield, Car, Plus, X, Award, Target, Calendar } from 'lucide-react';
import { FinancialGoal } from '../types';

interface GoalsViewProps {
  goals: FinancialGoal[];
  onAddGoal: (goal: Omit<FinancialGoal, 'id' | 'currentAmount'>) => void;
  onContributeGoal: (id: string, amount: number) => void;
}

export default function GoalsView({ goals, onAddGoal, onContributeGoal }: GoalsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDeadline, setNewDeadline] = useState('Dezembro 2026');
  const [newCategory, setNewCategory] = useState('Viagens');
  const [newIcon, setNewIcon] = useState('target');

  // Contribution state
  const [contributeId, setContributeId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmt = parseFloat(newTarget);
    if (!newName.trim() || isNaN(targetAmt) || targetAmt <= 0) return;

    onAddGoal({
      name: newName.trim(),
      targetAmount: targetAmt,
      deadline: newDeadline,
      category: newCategory,
      icon: newIcon
    });

    setNewName('');
    setNewTarget('');
    setShowAddForm(false);
  };

  const handleContribute = (id: string) => {
    const amt = parseFloat(contributeAmount);
    if (isNaN(amt) || amt <= 0) return;
    onContributeGoal(id, amt);
    setContributeId(null);
    setContributeAmount('');
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Metas</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">Acompanhe o progresso e realize seus objetivos financeiros</p>
      </div>

      {/* Summary Conquistas layout mirroring mockup */}
      <section className="bg-white dark:bg-[#121824] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-500" />
          <span>Suas Conquistas</span>
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
          Acompanhe o progresso de cada um de seus objetivos e veja quão perto você está de realizá-los. Faça depósitos frequentes para alimentar suas economias de forma inteligente!
        </p>
      </section>

      {/* Grid List with beautiful add goal card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Render each goal with premium bento glassmorphism layouts */}
        {goals.map(goal => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isFinished = pct >= 100;
          
          return (
            <article key={goal.id} className="bg-white dark:bg-[#121824] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-72 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-950/20 rounded-full blur-3xl pointer-events-none"></div>

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    {goal.bgImage ? (
                      <div className="w-14 h-14 rounded-lg overflow-hidden relative shadow-sm border border-gray-100 dark:border-gray-850 shrink-0">
                        <img src={goal.bgImage} alt={goal.name} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-600 dark:text-indigo-400 border border-gray-100 dark:border-gray-850 shrink-0">
                        {goal.icon === 'plane' && <Plane className="w-6 h-6" />}
                        {goal.icon === 'shield' && <Shield className="w-6 h-6" />}
                        {goal.icon === 'car' && <Car className="w-6 h-6" />}
                        {goal.icon !== 'plane' && goal.icon !== 'shield' && goal.icon !== 'car' && <Target className="w-6 h-6" />}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{goal.name}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{goal.deadline}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-2xl font-black text-black dark:text-indigo-400 font-mono leading-none">{pct}%</span>
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                        R$ {goal.currentAmount.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        de R$ {goal.targetAmount.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  {/* Progress Line Bar exactly like mockup */}
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isFinished ? 'bg-emerald-500' : 'bg-black dark:bg-[#6ffbbe]'
                      }`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Contribute Area inside card */}
              <div className="mt-4 border-t border-gray-50 dark:border-gray-900 pt-3">
                {contributeId === goal.id ? (
                  <div className="flex gap-2 items-center">
                    <input 
                      type="number"
                      value={contributeAmount}
                      onChange={(e) => setContributeAmount(e.target.value)}
                      placeholder="Valor"
                      className="flex-grow h-8 px-2 text-xs border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white rounded"
                    />
                    <button 
                      onClick={() => handleContribute(goal.id)}
                      className="h-8 px-3 bg-black dark:bg-indigo-600 text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      Salvar
                    </button>
                    <button 
                      onClick={() => setContributeId(null)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-400 text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    disabled={isFinished}
                    onClick={() => {
                      setContributeId(goal.id);
                    }}
                    className="w-full h-8 text-[11px] font-bold text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-indigo-400 border border-dashed border-gray-200 dark:border-gray-800 rounded flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isFinished ? '🎉 Concluído!' : 'Depositar Economias'}</span>
                  </button>
                )}
              </div>
            </article>
          );
        })}

        {/* Dynamic add goals section layout */}
        <article className="border border-dashed border-gray-300 dark:border-gray-800 hover:border-gray-400 bg-transparent rounded-2xl p-6 flex flex-col justify-center items-center gap-3 text-center h-72 cursor-pointer transition-all" onClick={() => setShowAddForm(true)}>
          <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-300">Nova Meta Financeira</h4>
            <p className="text-[10px] text-gray-400 mt-1 max-w-[180px] leading-relaxed mx-auto">Adicione um novo objetivo de vida para poupar de forma organizada.</p>
          </div>
        </article>
      </div>

      {/* Add New Goal Drawer / Modal Sheet popup */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 text-sans"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-[#121824] p-6 rounded-2xl border border-gray-150 dark:border-gray-800 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Criar Nova Meta Financeira</h3>
                <button onClick={() => setShowAddForm(false)}>
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Título do Objetivo</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs text-gray-800 dark:text-white"
                    placeholder="Ex: Reserva Casa, Casamento"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Valor Alvo (R$)</label>
                    <input 
                      type="number" 
                      value={newTarget}
                      onChange={(e) => setNewTarget(e.target.value)}
                      required
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs text-gray-800 dark:text-white"
                      placeholder="Ex: 15000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Prazo / Alvo</label>
                    <input 
                      type="text" 
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs text-gray-800 dark:text-white"
                      placeholder="Ex: Dezembro 2026"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Categoria</label>
                    <input 
                      type="text" 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs text-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Ícone</label>
                    <select
                      value={newIcon}
                      onChange={(e) => setNewIcon(e.target.value)}
                      className="w-full h-10 px-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs text-gray-800 dark:text-white"
                    >
                      <option value="target">🎯 Padrão Alvo</option>
                      <option value="plane">✈️ Viagem / Avião</option>
                      <option value="shield">🛡️ Proteção / Reserva</option>
                      <option value="car">🚗 Carro / Veículo</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-250 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-black hover:bg-gray-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Adicionar Meta
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
