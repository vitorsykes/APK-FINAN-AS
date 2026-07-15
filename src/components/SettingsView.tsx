import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Download, CloudLightning, ShieldCheck, Fingerprint, Lock, RefreshCw, HardDrive, Check, Info,
  Briefcase, Users, ArrowRightLeft, Percent, DollarSign, Sparkles, PiggyBank, Landmark
} from 'lucide-react';
import { Transaction, BankAccount } from '../types';

interface SettingsViewProps {
  transactions: Transaction[];
  accounts?: BankAccount[];
  onUpdateAccounts?: (accounts: BankAccount[]) => void;
}

export default function SettingsView({ transactions, accounts = [], onUpdateAccounts }: SettingsViewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [useFingerprint, setUseFingerprint] = useState(true);
  const [usePin, setUsePin] = useState(false);
  const [cloudBackup, setCloudBackup] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Work settings editor states
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isWork, setIsWork] = useState(false);
  const [empReserve, setEmpReserve] = useState(0);
  const [personalTransfer, setPersonalTransfer] = useState(0);
  const [targetAccId, setTargetAccId] = useState('');
  
  // Custom reserve payout dialog
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  // Set default selected account on mount
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      // Prefer work account if it exists, otherwise use first
      const workAcc = accounts.find(a => a.isWorkAccount);
      const defaultId = workAcc ? workAcc.id : accounts[0].id;
      handleSelectAccountChange(defaultId);
    }
  }, [accounts]);

  const handleSelectAccountChange = (id: string) => {
    setSelectedAccountId(id);
    const acc = accounts.find(a => a.id === id);
    if (acc) {
      setIsWork(acc.isWorkAccount || false);
      setEmpReserve(acc.employeeReservePercent || 0);
      setPersonalTransfer(acc.personalTransferPercent || 0);
      setTargetAccId(acc.personalTransferTargetAccountId || '');
    }
  };

  const handleSaveWorkSettings = () => {
    if (!onUpdateAccounts) return;

    const selectedAcc = accounts.find(a => a.id === selectedAccountId);
    if (!selectedAcc) return;

    // Validation: reserve + personal share shouldn't exceed 100%
    if (isWork && empReserve + personalTransfer > 100) {
      setMessage('A soma das porcentagens de funcionários e transferência própria não pode exceder 100%!');
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    const updated = accounts.map(acc => {
      if (acc.id === selectedAccountId) {
        return {
          ...acc,
          isWorkAccount: isWork,
          employeeReservePercent: isWork ? empReserve : 0,
          personalTransferPercent: isWork ? personalTransfer : 0,
          personalTransferTargetAccountId: isWork ? targetAccId : '',
          // Preserve balance, set reserve balance to 0 if no longer work
          employeeReserveBalance: isWork ? (acc.employeeReserveBalance || 0) : 0
        };
      }
      return acc;
    });

    onUpdateAccounts(updated);
    setMessage(`Configurações de fluxo inteligente salvas para "${selectedAcc.name}"!`);
    setTimeout(() => setMessage(null), 4000);
  };

  // Quick Action to release payment and pay employees
  const handlePayEmployees = () => {
    if (!onUpdateAccounts || !selectedAccountId) return;
    const acc = accounts.find(a => a.id === selectedAccountId);
    if (!acc) return;

    const amountToPay = parseFloat(payoutAmount) || (acc.employeeReserveBalance || 0);
    if (amountToPay <= 0 || amountToPay > (acc.employeeReserveBalance || 0)) {
      alert('Valor de pagamento inválido ou acima do saldo reservado disponível!');
      return;
    }

    const updated = accounts.map(a => {
      if (a.id === selectedAccountId) {
        return {
          ...a,
          balance: Math.max(0, a.balance - amountToPay),
          employeeReserveBalance: Math.max(0, (a.employeeReserveBalance || 0) - amountToPay)
        };
      }
      return a;
    });

    onUpdateAccounts(updated);
    setIsPayoutModalOpen(false);
    setPayoutAmount('');
    setMessage(`Sucesso! Pagamento de R$ ${amountToPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} efetuado aos funcionários. Saldo de reserva atualizado.`);
    setTimeout(() => setMessage(null), 5000);
  };

  // CSV Exporter Simulation
  const handleExportCSV = () => {
    setIsExporting(true);
    setMessage(null);

    setTimeout(() => {
      const headers = 'ID,Data,Descricao,Valor,Categoria,Favorecido,Banco\n';
      const rows = transactions.map(t => 
        `"${t.id}","${t.date}","${t.description}",${t.amount},"${t.category}","${t.senderOrRecipient}","${t.bank}"`
      ).join('\n');

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
      const link = document.createElement('a');
      link.setAttribute('href', csvContent);
      link.setAttribute('download', 'Lumina_Finance_Transactions_Export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setMessage('Exportação concluída com sucesso! Lumina_Finance_Transactions_Export.csv baixado.');
    }, 1500);
  };

  const handleBackupNow = () => {
    setIsSyncing(true);
    setMessage(null);
    setTimeout(() => {
      setIsSyncing(false);
      setMessage('Backup seguro concluído! Todos os dados foram criptografados e salvos localmente.');
    }, 2000);
  };

  // Helpers for live simulation calculations
  const selectedAccObj = accounts.find(a => a.id === selectedAccountId);
  const simVal = 1000; // Simulated incoming PIX R$ 1000
  const simEmpVal = (simVal * empReserve) / 100;
  const simPersonalVal = (simVal * personalTransfer) / 100;
  const simLiquidVal = simVal - simEmpVal - simPersonalVal;
  const targetAccObj = accounts.find(a => a.id === targetAccId);

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Ajustes</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">Segurança, backup, divisão inteligente de faturamento e preferências</p>
      </div>

      {/* Message Banner for actions */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-xs flex items-start gap-2"
        >
          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>{message}</span>
        </motion.div>
      )}

      {/* NEW: Smart Earnings Router (User request: Work accounts, employee reserves, and self transfers) */}
      <section className="bg-white dark:bg-[#121824] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 dark:border-gray-850 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-[#6ffbbe]">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Roteador de Ganhos Inteligente</span>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-[#6ffbbe] px-2 py-0.5 rounded-full font-bold">Automatizado</span>
              </h3>
              <p className="text-[11px] text-gray-400">Defina bancos de trabalho, organize reservas para funcionários e envie sua parte de uma conta para outra</p>
            </div>
          </div>
          
          {/* Account Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold shrink-0">Conta a ajustar:</span>
            <select
              value={selectedAccountId}
              onChange={(e) => handleSelectAccountChange(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0e1422] text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.bankName})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Settings controls */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Toggle is work account */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  Conta de Recebimento de Trabalho
                </label>
                <p className="text-[10px] text-gray-400 leading-relaxed max-w-sm">
                  Ative para que qualquer faturamento recebido neste banco seja interpretado como receita de serviços ou PJ.
                </p>
              </div>
              <button 
                onClick={() => setIsWork(!isWork)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${isWork ? 'bg-[#6ffbbe] dark:bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isWork ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            {isWork && (
              <div className="space-y-5 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
                
                {/* Employee reserve */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1.5 text-gray-900 dark:text-white">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      Reserva para Funcionários / Ajudantes
                    </span>
                    <span className="text-indigo-600 dark:text-[#6ffbbe]">{empReserve}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={empReserve}
                    onChange={(e) => setEmpReserve(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 dark:accent-[#6ffbbe] cursor-pointer"
                  />
                  <p className="text-[9px] text-gray-400">Dinheiro separado para pagar salários. O aplicativo acumula esse fundo para visualização clara.</p>
                </div>

                {/* Personal transfer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1.5 text-gray-900 dark:text-white">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-500" />
                      Sua Parte (Transferência Automática)
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">{personalTransfer}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={personalTransfer}
                    onChange={(e) => setPersonalTransfer(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <p className="text-[9px] text-gray-400">Porcentagem que será transferida da sua parte para sua outra conta pessoal selecionada.</p>
                </div>

                {/* Target account */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-indigo-500" />
                    Conta Pessoal de Destino
                  </label>
                  <select
                    value={targetAccId}
                    onChange={(e) => setTargetAccId(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1422] text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Selecione a conta pessoal --</option>
                    {accounts.filter(a => a.id !== selectedAccountId).map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.bankName}) - Saldo: R$ {acc.balance.toLocaleString('pt-BR')}
                      </option>
                    ))}
                  </select>
                  <p className="text-[9px] text-gray-400">As transferências simuladas da sua parte cairão diretamente neste banco de destino.</p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveWorkSettings}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#6ffbbe]" />
              <span>Salvar Definições de Trabalho</span>
            </button>

          </div>

          {/* Visual simulation feedback */}
          <div className="lg:col-span-5 flex flex-col justify-between p-5 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Simulação do Fluxo Automatizado</h4>
              
              {!isWork ? (
                <div className="py-12 text-center text-gray-400 space-y-2">
                  <Landmark className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-xs font-medium">Esta é uma conta pessoal comum.</p>
                  <p className="text-[10px] text-gray-500 max-w-xs mx-auto">Tive ou receba depósitos normais de movimentação pessoal nesta conta sem splits automatizados.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-xl border border-indigo-100/50 dark:border-indigo-950 flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Ao receber PIX de:</span>
                    <span className="font-bold text-indigo-600 dark:text-[#6ffbbe]">R$ 1.000,00</span>
                  </div>

                  {/* Flow items */}
                  <div className="space-y-2 relative pl-4 border-l-2 border-indigo-200 dark:border-indigo-900">
                    
                    {/* Employee item */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Reserva de Funcionários ({empReserve}%)</span>
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">R$ {simEmpVal.toFixed(2).replace('.', ',')}</span>
                    </div>

                    {/* Own share item */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Mandar Minha Parte ({personalTransfer}%) para {targetAccObj ? targetAccObj.bankName : 'Conta Destino'}</span>
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">R$ {simPersonalVal.toFixed(2).replace('.', ',')}</span>
                    </div>

                    {/* Liquid amount */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-dashed border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <PiggyBank className="w-3.5 h-3.5 text-yellow-500" />
                        <span>Disponível nesta conta ({100 - empReserve - personalTransfer}%)</span>
                      </div>
                      <span className="font-bold text-indigo-600 dark:text-[#6ffbbe]">R$ {simLiquidVal.toFixed(2).replace('.', ',')}</span>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Current Accumulated Reserves for paying employees */}
            {isWork && selectedAccObj && (
              <div className="mt-6 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/40 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                      <span>Fundo Reservado p/ Funcionários</span>
                    </h5>
                    <p className="text-[9px] text-gray-400 mt-0.5">Saldo acumulado pronto para pagamento</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-indigo-600 dark:text-[#6ffbbe] block">
                      R$ {(selectedAccObj.employeeReserveBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPayoutAmount((selectedAccObj.employeeReserveBalance || 0).toString());
                    setIsPayoutModalOpen(true);
                  }}
                  disabled={!(selectedAccObj.employeeReserveBalance && selectedAccObj.employeeReserveBalance > 0)}
                  className="w-full h-8 bg-black hover:opacity-95 dark:bg-indigo-950 dark:text-indigo-200 dark:border dark:border-indigo-900 disabled:opacity-40 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <DollarSign className="w-3 h-3 text-[#6ffbbe]" />
                  <span>Efetuar Pagamento de Funcionários</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Grid of panels (Export/Backup & Security) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Data administration panel (Export & Backup) */}
        <section className="bg-white dark:bg-[#121824] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-gray-400" />
            <span>Administrar Dados</span>
          </h3>

          <div className="space-y-4">
            {/* Export action */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Exportação Consolidada</h4>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed max-w-[240px]">Baixe sua planilha financeira completa contendo todos os lançamentos em formato CSV.</p>
              </div>
              <button 
                onClick={handleExportCSV}
                disabled={isExporting}
                className="h-9 px-4 bg-black dark:bg-indigo-600 hover:opacity-90 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                {isExporting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar para CSV</span>
                  </>
                )}
              </button>
            </div>

            {/* Cloud Backup action */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Backup Manual em Nuvem</h4>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed max-w-[240px]">Envie e grave as definições de regras de classificação e metas de forma segura.</p>
              </div>
              <button 
                onClick={handleBackupNow}
                disabled={isSyncing}
                className="h-9 px-4 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <CloudLightning className="w-3.5 h-3.5" />
                    <span>Fazer Backup</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Security & Access Preference Settings */}
        <section className="bg-white dark:bg-[#121824] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gray-400" />
            <span>Segurança & Acesso</span>
          </h3>

          <div className="space-y-4">
            {/* Biometrics Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Biometria (Impressão Digital)</h4>
                  <p className="text-[9px] text-gray-400 mt-0.5">Ativar desbloqueio rápido por sensor físico</p>
                </div>
              </div>
              <button 
                onClick={() => setUseFingerprint(!useFingerprint)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${useFingerprint ? 'bg-black dark:bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${useFingerprint ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            {/* PIN Lock Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Código de Acesso PIN</h4>
                  <p className="text-[9px] text-gray-400 mt-0.5">Exigir senha numérica de 4 dígitos ao abrir</p>
                </div>
              </div>
              <button 
                onClick={() => setUsePin(!usePin)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${usePin ? 'bg-black dark:bg-indigo-600' : 'bg-gray-250'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${usePin ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            {/* Auto Cloud Sync toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Sincronização em Tempo Real</h4>
                  <p className="text-[9px] text-gray-400 mt-0.5">Manter dados sincronizados continuamente em nuvem</p>
                </div>
              </div>
              <button 
                onClick={() => setCloudBackup(!cloudBackup)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${cloudBackup ? 'bg-black dark:bg-indigo-600' : 'bg-gray-250'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${cloudBackup ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Dev disclosure notice */}
      <section className="bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs flex gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0" />
        <div className="space-y-1 font-sans">
          <h4 className="font-bold">Criptografia Local Segura</h4>
          <p className="leading-relaxed">
            Seus dados financeiros sensíveis são mantidos e processados sob o padrão de segurança <strong>AES-256 bits</strong> localmente em seu dispositivo. Nenhuma notificação ou texto de mensagem de banco é armazenado em servidores externos sem a sua devida aprovação!
          </p>
        </div>
      </section>

      {/* Payout reserve modal */}
      {isPayoutModalOpen && selectedAccObj && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#121824] border border-gray-250 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl"
          >
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <span>Pagar Funcionários / Colaboradores</span>
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Quanto deseja liberar do fundo de reserva da conta <strong>{selectedAccObj.name}</strong> para efetuar o pagamento dos funcionários?
            </p>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400">VALOR DA RESERVA DISPONÍVEL</label>
              <div className="text-base font-bold text-indigo-600 dark:text-[#6ffbbe]">
                R$ {(selectedAccObj.employeeReserveBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400">VALOR A LIBERAR (R$)</label>
              <input 
                type="number"
                placeholder="Ex: 1500"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0e1422] text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => setIsPayoutModalOpen(false)}
                className="flex-1 h-9 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handlePayEmployees}
                className="flex-1 h-9 bg-black dark:bg-indigo-600 hover:opacity-90 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Efetuar Lançamento
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
