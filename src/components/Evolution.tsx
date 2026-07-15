import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Landmark, TrendingUp, Building, ArrowUp, Minus } from 'lucide-react';
import { BankAccount } from '../types';

interface EvolutionProps {
  accounts: BankAccount[];
}

export default function Evolution({ accounts }: EvolutionProps) {
  // Aggregate wealth composition based on mock data
  const netWorth = useMemo(() => accounts.reduce((acc, curr) => acc + curr.balance, 0), [accounts]);
  
  // Contas Correntes (Wallet & Cash-like accounts)
  const cashTotal = useMemo(() => {
    return accounts
      .filter(a => a.id === 'acc-1' || a.id === 'acc-2' || a.id === 'acc-3')
      .reduce((acc, curr) => acc + curr.balance, 0);
  }, [accounts]);

  // Investimentos (Investment XP account)
  const investmentsTotal = useMemo(() => {
    return accounts
      .filter(a => a.id === 'acc-4')
      .reduce((acc, curr) => acc + curr.balance, 0);
  }, [accounts]);

  // Imóveis (Patrimonio Residencial account)
  const realEstateTotal = useMemo(() => {
    return accounts
      .filter(a => a.id === 'acc-5')
      .reduce((acc, curr) => acc + curr.balance, 0);
  }, [accounts]);

  // Historical data for 6-month growth matching line chart in mockup
  const evolutionData = [
    { name: 'Jan', Patrimonio: 190000 },
    { name: 'Fev', Patrimonio: 195000 },
    { name: 'Mar', Patrimonio: 205000 },
    { name: 'Abr', Patrimonio: 215000 },
    { name: 'Mai', Patrimonio: 230000 },
    { name: 'Jun', Patrimonio: 242500 }
  ];

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Evolução</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Acompanhamento e crescimento do patrimônio líquido</p>
      </div>

      {/* Patrimônio Total Aggregation Card */}
      <section className="bg-white dark:bg-[#121824] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider font-mono">Patrimônio Total</span>
        <div className="flex items-end justify-between mt-2 flex-wrap gap-4">
          <div className="text-3xl md:text-4xl font-black text-black dark:text-white tracking-tight">
            R$ {netWorth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full text-xs font-bold">
            <ArrowUp className="w-3.5 h-3.5" />
            <span>+12% este ano</span>
          </div>
        </div>
      </section>

      {/* Main Growth Area Chart exactly matching the mockup curve */}
      <section className="bg-white dark:bg-[#121824] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Crescimento (6 Meses)</h3>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPatrimonio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: '10px', fill: '#94A3B8' }} />
              <YAxis tickLine={false} axisLine={false} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Patrimônio']}
              />
              <Area 
                type="monotone" 
                dataKey="Patrimonio" 
                stroke="#000000" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorPatrimonio)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Composition list matching mockup precisely */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Composição</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Contas Correntes */}
          <div className="bg-white dark:bg-[#121824] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Contas Correntes</h4>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  R$ {cashTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="text-emerald-500">
              <ArrowUp className="w-4 h-4" />
            </div>
          </div>

          {/* Investimentos */}
          <div className="bg-white dark:bg-[#121824] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Investimentos</h4>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  R$ {investmentsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="text-emerald-500">
              <ArrowUp className="w-4 h-4" />
            </div>
          </div>

          {/* Imóveis */}
          <div className="bg-white dark:bg-[#121824] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Imóveis</h4>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  R$ {realEstateTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="text-gray-400">
              <Minus className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
