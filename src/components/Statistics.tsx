import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Transaction } from '../types';

interface StatisticsProps {
  transactions: Transaction[];
}

export default function Statistics({ transactions }: StatisticsProps) {
  const [timeframe, setTimeframe] = useState<'mes' | 'trimestre' | 'ano'>('mes');

  // Compute stats for Category Pie
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'despesa');
    const totals: Record<string, number> = {};
    
    expenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });

    const totalSpent = Object.values(totals).reduce((a, b) => a + b, 0);

    return Object.entries(totals).map(([name, value]) => ({
      name,
      value,
      percentage: totalSpent > 0 ? Math.round((value / totalSpent) * 100) : 0
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Colors mapping matching the mockup donut style: red, blue, indigo, amber/yellow
  const COLORS = ['#F87171', '#60A5FA', '#818CF8', '#FBBF24', '#34D399', '#A78BFA'];

  // Bar chart data matching Jan, Fev, Mar mockups
  const barChartData = [
    { name: 'Jan', Receitas: 10000, Despesas: 5400 },
    { name: 'Fev', Receitas: 12500, Despesas: 6000 },
    { name: 'Mar', Receitas: 11000, Despesas: 8200 },
    { name: 'Abr', Receitas: 12000, Despesas: 4100 },
    { name: 'Mai', Receitas: 13000, Despesas: 7200 },
    { name: 'Jun', Receitas: 14500, Despesas: 5100 },
    { name: 'Jul', Receitas: 12750, Despesas: 5400 } // Active month
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Header Selector exactly mirroring mockup */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Estatísticas</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Análise de fluxo financeiro consolidada</p>
        </div>

        {/* Beautiful full pill switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-900 rounded-full p-1 w-full max-w-xs shrink-0">
          <button 
            onClick={() => setTimeframe('mes')}
            className={`flex-1 py-1.5 px-3 rounded-full font-sans text-xs font-semibold transition-all cursor-pointer ${
              timeframe === 'mes' ? 'bg-black text-white dark:bg-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Mês
          </button>
          <button 
            onClick={() => setTimeframe('trimestre')}
            className={`flex-1 py-1.5 px-3 rounded-full font-sans text-xs font-semibold transition-all cursor-pointer ${
              timeframe === 'trimestre' ? 'bg-black text-white dark:bg-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Trimestre
          </button>
          <button 
            onClick={() => setTimeframe('ano')}
            className={`flex-1 py-1.5 px-3 rounded-full font-sans text-xs font-semibold transition-all cursor-pointer ${
              timeframe === 'ano' ? 'bg-black text-white dark:bg-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Ano
          </button>
        </div>
      </div>

      {/* Main Graphs Content Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Pie Card: Gastos por Categoria */}
        <section className="bg-white dark:bg-[#121824] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Gastos por Categoria</h3>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            {/* Pie Container */}
            <div className="relative w-44 h-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.length > 0 ? categoryData : [{ name: 'Sem Gastos', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(categoryData.length > 0 ? categoryData : [{ name: 'Sem Gastos', value: 1 }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={categoryData.length > 0 ? COLORS[index % COLORS.length] : '#E2E8F0'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Text display exactly like donut chart */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Total Gasto</span>
                <span className="text-lg font-black text-gray-900 dark:text-white mt-1">
                  R$ {categoryData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* List labels */}
            <div className="w-full space-y-3">
              {categoryData.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Lance alguma despesa para ver o gráfico.</p>
              ) : (
                categoryData.slice(0, 5).map((entry, idx) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-gray-400">R$ {entry.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                      <span className="font-bold text-gray-800 dark:text-gray-100">{entry.percentage}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Bar Card: Receitas vs Despesas (Green/Red) */}
        <section className="bg-white dark:bg-[#121824] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Receitas vs Despesas</h3>
            <div className="flex gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
                <span className="text-gray-400">Receitas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]"></div>
                <span className="text-gray-400">Despesas</span>
              </div>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: '10px', fill: '#94A3B8' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px', fill: '#94A3B8' }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="Receitas" fill="#10B981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Despesas" fill="#F43F5E" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Additional Stats highlights: Person and Establishment analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gastos por Pessoa */}
        <div className="bg-white dark:bg-[#121824] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Maiores Fluxos por Pessoa</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <span className="font-semibold">João (Salário/PIX)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">R$ 12.250,00</span>
            </div>
            <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <span className="font-semibold">Maria (Aluguel/Moradia)</span>
              <span className="text-rose-500 font-mono font-bold">R$ 2.500,00</span>
            </div>
            <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <span className="font-semibold">Mercado Livre (Compras)</span>
              <span className="text-rose-500 font-mono font-bold">R$ 1.150,00</span>
            </div>
          </div>
        </div>

        {/* Gastos por Estabelecimento */}
        <div className="bg-white dark:bg-[#121824] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Maiores Estabelecimentos</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <span className="font-semibold">Netflix Brasil</span>
              <span className="font-mono font-bold text-gray-700 dark:text-gray-300">R$ 55,90</span>
            </div>
            <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <span className="font-semibold">Uber Rides</span>
              <span className="font-mono font-bold text-gray-700 dark:text-gray-300">R$ 45,00</span>
            </div>
            <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <span className="font-semibold">Spotify Premium</span>
              <span className="font-mono font-bold text-gray-700 dark:text-gray-300">R$ 24,90</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
