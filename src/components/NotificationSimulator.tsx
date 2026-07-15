import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, BellRing, Check, ShieldAlert, Cpu, HelpCircle, ArrowRightLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { simulatedNotificationTemplates } from '../initialData';
import { AutoRule, ParsedNotification } from '../types';

interface NotificationSimulatorProps {
  onAddTransaction: (parsed: ParsedNotification, originalText: string) => void;
  onAddRule: (rule: AutoRule) => void;
  rules: AutoRule[];
}

export default function NotificationSimulator({ onAddTransaction, onAddRule, rules }: NotificationSimulatorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customText, setCustomText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedNotification | null>(null);
  const [originalNotificationText, setOriginalNotificationText] = useState('');
  const [aiPowered, setAiPowered] = useState(false);

  // AI Learning State
  const [isLearningActive, setIsLearningActive] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [customType, setCustomType] = useState<'receita' | 'despesa' | 'transferencia'>('despesa');

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplate(id);
    const template = simulatedNotificationTemplates.find(t => t.id === id);
    if (template) {
      setCustomText(template.text);
    }
  };

  const handleSimulate = async () => {
    const textToParse = customText.trim();
    if (!textToParse) return;

    setIsLoading(true);
    setParsedResult(null);
    setIsLearningActive(false);
    setOriginalNotificationText(textToParse);

    try {
      // Send rules along to let backend match existing overrides
      const response = await fetch('/api/parse-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToParse, userRules: rules })
      });

      const result = await response.json();
      if (result.success && result.data) {
        setParsedResult(result.data);
        setAiPowered(result.aiPowered);

        // Check if the parsed recipient is already covered in the rules
        const nameLower = result.data.pessoa.toLowerCase();
        const ruleExists = rules.some(r => nameLower.includes(r.pattern.toLowerCase()) || r.pattern.toLowerCase().includes(nameLower));

        // If not in rules and Gemini categorizes under some generic or new name, trigger the AI Learning wizard
        if (!ruleExists && result.data.pessoa !== 'Desconhecido' && result.data.pessoa !== 'Minhas Contas') {
          setIsLearningActive(true);
          setCustomCategory(result.data.categoriaSugerida);
          setCustomType(result.data.tipo);
        }
      }
    } catch (error) {
      console.error("Error simulating notification parse:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmLaunch = (saveAsRule: boolean) => {
    if (!parsedResult) return;

    const finalParsed: ParsedNotification = {
      ...parsedResult,
      categoriaSugerida: isLearningActive ? customCategory : parsedResult.categoriaSugerida,
      tipo: isLearningActive ? customType : parsedResult.tipo
    };

    // If requested, add a new rule so the system maps this pattern automatically going forward
    if (saveAsRule && isLearningActive && finalParsed.pessoa) {
      const newRule: AutoRule = {
        id: `rule-${Date.now()}`,
        pattern: finalParsed.pessoa,
        category: finalParsed.categoriaSugerida,
        type: finalParsed.tipo,
        label: `${finalParsed.pessoa} sempre significa ${finalParsed.categoriaSugerida.toLowerCase()}`
      };
      onAddRule(newRule);
    }

    onAddTransaction(finalParsed, originalNotificationText);
    
    // Reset state
    setParsedResult(null);
    setIsLearningActive(false);
    setCustomText('');
    setSelectedTemplate('');
  };

  return (
    <div className="bg-white dark:bg-[#121824] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-md">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <BellRing className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Simulador de Notificações</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Receba transações automáticas via notificações bancárias</p>
        </div>
      </div>

      {/* Preset template selector */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Selecione um Modelo de Banco</label>
        <select 
          value={selectedTemplate}
          onChange={(e) => handleSelectTemplate(e.target.value)}
          className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
        >
          <option value="">-- Escrever mensagem personalizada --</option>
          {simulatedNotificationTemplates.map(template => (
            <option key={template.id} value={template.id}>
              [{template.bank}] {template.text.substring(0, 45)}...
            </option>
          ))}
        </select>
      </div>

      {/* Custom SMS / Notification text input */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Mensagem Recebida (Notificação)</label>
        <div className="relative">
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={2}
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
            placeholder="Ex: Você recebeu um PIX de João no valor de R$ 250,00"
          />
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSimulate}
        disabled={isLoading || !customText.trim()}
        className="w-full h-11 bg-black hover:bg-gray-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Simular Captura Automática</span>
          </>
        )}
      </motion.button>

      {/* Parsed Result Display & AI Self-Learning Section */}
      <AnimatePresence>
        {parsedResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Resultado da Leitura IA</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Cpu className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold uppercase">{aiPowered ? 'Gemini AI Pro' : 'Regras Inteligentes'}</span>
              </div>
            </div>

            {/* Quick Cards of results */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-semibold">Favorecido / Fornecedor</span>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{parsedResult.pessoa}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-semibold">Valor em Reais</span>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  R$ {parsedResult.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-semibold">Banco Emissor</span>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{parsedResult.banco}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-semibold">Tipo Lançamento</span>
                <span className="text-xs font-bold flex items-center gap-1 mt-0.5">
                  {parsedResult.tipo === 'receita' && <span className="text-emerald-500 flex items-center gap-0.5"><ArrowDownRight className="w-3 h-3" /> Receita</span>}
                  {parsedResult.tipo === 'despesa' && <span className="text-rose-500 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> Despesa</span>}
                  {parsedResult.tipo === 'transferencia' && <span className="text-blue-500 flex items-center gap-0.5"><ArrowRightLeft className="w-3 h-3" /> Transferência</span>}
                </span>
              </div>
            </div>

            {/* AI Learning Wizard Panel */}
            {isLearningActive ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-indigo-50/50 dark:bg-[#1a2235] p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-950/40 mb-4"
              >
                <div className="flex gap-2 mb-3">
                  <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed font-sans">
                    <strong>Aprender com o Uso:</strong> Encontramos o favorecido <strong className="text-indigo-600 dark:text-[#6ffbbe]">"{parsedResult.pessoa}"</strong> que ainda não possui regra de classificação. Como deseja classificar futuramente?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Categoria</label>
                    <input 
                      type="text" 
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full h-9 px-2 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-800 dark:text-white"
                      placeholder="Ex: Alimentação, Lazer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Tipo</label>
                    <select
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value as any)}
                      className="w-full h-9 px-1 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-800 dark:text-white"
                    >
                      <option value="despesa">Despesa</option>
                      <option value="receita">Receita</option>
                      <option value="transferencia">Transferência Interna</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-4 font-sans">
                <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>Esta movimentação coincide com uma regra automática já cadastrada!</span>
              </div>
            )}

            {/* Launch controls */}
            <div className="flex gap-3">
              {isLearningActive ? (
                <>
                  <button 
                    onClick={() => handleConfirmLaunch(false)}
                    className="flex-1 h-10 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                  >
                    Lançar Sem Criar Regra
                  </button>
                  <button 
                    onClick={() => handleConfirmLaunch(true)}
                    className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Lançar e Memorizar Regra</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => handleConfirmLaunch(false)}
                  className="w-full h-11 bg-black hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-semibold text-sm rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Lançamento</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
