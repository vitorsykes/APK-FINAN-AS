import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Plus, Trash2, X, AlertCircle } from 'lucide-react';
import { AutoRule } from '../types';

interface RulesViewProps {
  rules: AutoRule[];
  onAddRule: (rule: AutoRule) => void;
  onDeleteRule: (id: string) => void;
}

export default function RulesView({ rules, onAddRule, onDeleteRule }: RulesViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [pattern, setPattern] = useState('');
  const [category, setCategory] = useState('Alimentação');
  const [type, setType] = useState<'receita' | 'despesa' | 'transferencia'>('despesa');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pattern.trim()) return;

    const newRule: AutoRule = {
      id: `rule-${Date.now()}`,
      pattern: pattern.trim(),
      category,
      type,
      label: `"${pattern.trim()}" significa sempre a categoria "${category}"`
    };

    onAddRule(newRule);
    setPattern('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Regras de Classificação</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">Regras personalizadas de auto-categorização inteligente para captura de notificações</p>
      </div>

      {/* Concept card */}
      <section className="bg-white dark:bg-[#121824] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex gap-4 items-start">
        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Auto-categorização Personalizada</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
            Com as regras personalizadas, você ensina à nossa Inteligência Artificial como classificar as despesas recebidas via notificações. Se "João" sempre for o seu salário, ou "Uber" for transporte, adicione os mapeamentos abaixo. Ao capturar uma mensagem, a IA ajusta a categoria instantaneamente!
          </p>
        </div>
      </section>

      {/* Header rules with trigger */}
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Regras Ativas</h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs bg-black dark:bg-indigo-600 hover:opacity-90 text-white font-bold h-9 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Mapear Contato</span>
        </button>
      </div>

      {/* Rules list with collapsible creation panel */}
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
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Cadastrar Regra Inteligente</span>
                </h4>
                <button onClick={() => setShowAddForm(false)}>
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Palavra-Chave / Nome do Contato</label>
                  <input 
                    type="text" 
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 text-xs dark:bg-gray-900 dark:text-white focus:outline-none"
                    placeholder="Ex: Uber, Mercado Livre, iFood"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Categoria Automática</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-2 rounded-lg border border-gray-200 dark:border-gray-800 text-xs dark:bg-gray-900 dark:text-white focus:outline-none"
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
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tipo de Fluxo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full h-10 px-2 rounded-lg border border-gray-200 dark:border-gray-800 text-xs dark:bg-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="despesa">Despesa (Gasto)</option>
                    <option value="receita">Receita (Rendimento/Ganho)</option>
                    <option value="transferencia">Transferência Interna</option>
                  </select>
                </div>
                <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-gray-50 dark:border-gray-900">
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-black dark:bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Confirmar Mapeamento
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing Mapping Rules List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map(rule => (
            <div key={rule.id} className="bg-white dark:bg-[#121824] p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center shadow-sm">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-500 font-bold block mb-1">Regra Ativa</span>
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">Se contiver "{rule.pattern}"</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1">
                  <span className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-1.5 py-0.5 rounded text-[9px] uppercase font-semibold text-gray-500">{rule.category}</span>
                  <span>•</span>
                  <span className="capitalize">{rule.type}</span>
                </div>
              </div>

              <button 
                onClick={() => onDeleteRule(rule.id)}
                className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-300 hover:text-rose-500 rounded transition-colors"
                title="Deletar Regra"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
