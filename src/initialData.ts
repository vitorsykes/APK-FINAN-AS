import { BankAccount, CreditCard, FinancialGoal, CategoryBudget, AutoRule, Transaction } from './types';

export const initialAccounts: BankAccount[] = [
  { id: 'acc-1', name: 'Conta Corrente Itaú', balance: 35000, bankName: 'Itaú', accountNumber: 'Ag. 0123 C/C 45678-9', icon: 'wallet' },
  { id: 'acc-2', name: 'Poupança Caixa', balance: 10000, bankName: 'Caixa', accountNumber: 'Ag. 4567 Poupança 12345-6', icon: 'piggy-bank' },
  { 
    id: 'acc-3', 
    name: 'Nubank (Trabalho/PJ)', 
    balance: 7500, 
    bankName: 'Nubank', 
    accountNumber: 'Conta de Recebimentos de Trabalho', 
    icon: 'credit-card',
    isWorkAccount: true,
    employeeReservePercent: 35, // 35% allocated for employees
    employeeReserveBalance: 2625, // running total
    personalTransferPercent: 40, // 40% is "my share" transfer
    personalTransferTargetAccountId: 'acc-2' // transfers "my share" to Poupança Caixa
  },
  { id: 'acc-4', name: 'Investimentos XP', balance: 115500, bankName: 'XP Investimentos', accountNumber: 'C/C 98765-4', icon: 'trending-up' },
  { id: 'acc-5', name: 'Imóvel Residencial', balance: 82000, bankName: 'Físico', accountNumber: 'Patrimônio Imobiliário', icon: 'home' }
];

export const initialCards: CreditCard[] = [
  { id: 'card-1', name: 'Itaú Personalité Visa Infinite', limit: 50000, spent: 4250, color: 'from-orange-500 to-amber-700', lastDigits: '4321' },
  { id: 'card-2', name: 'Nubank Ultravioleta', limit: 15000, spent: 1150, color: 'from-purple-800 to-indigo-900', lastDigits: '8765' }
];

export const initialGoals: FinancialGoal[] = [
  { 
    id: 'goal-1', 
    name: 'Viagem Japão', 
    targetAmount: 22000, 
    currentAmount: 15000, 
    deadline: 'Dezembro 2026', 
    category: 'Viagens', 
    icon: 'plane',
    bgImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80' // Beautiful Tokyo/Mt Fuji Unsplash image
  },
  { 
    id: 'goal-2', 
    name: 'Reserva de Emergência', 
    targetAmount: 50000, 
    currentAmount: 45000, 
    deadline: 'Meta Contínua', 
    category: 'Segurança', 
    icon: 'shield'
  },
  { 
    id: 'goal-3', 
    name: 'Carro Novo', 
    targetAmount: 80000, 
    currentAmount: 24000, 
    deadline: 'Março 2025', 
    category: 'Transporte', 
    icon: 'car'
  }
];

export const initialBudgets: CategoryBudget[] = [
  { id: 'bud-1', category: 'Alimentação', limit: 1200, spent: 800, icon: 'utensils', color: 'bg-emerald-500' },
  { id: 'bud-2', category: 'Lazer', limit: 500, spent: 650, icon: 'gamepad-2', color: 'bg-rose-500' }, // Over budget!
  { id: 'bud-3', category: 'Transporte', limit: 400, spent: 380, icon: 'car', color: 'bg-amber-500' },
  { id: 'bud-4', category: 'Moradia', limit: 2500, spent: 2500, icon: 'home', color: 'bg-indigo-500' },
  { id: 'bud-5', category: 'Assinaturas', limit: 300, spent: 150, icon: 'tv', color: 'bg-purple-500' }
];

// Custom classification mapping rules
export const initialRules: AutoRule[] = [
  { id: 'rule-1', pattern: 'João', category: 'Recebimento', type: 'receita', label: 'João sempre significa salário' },
  { id: 'rule-2', pattern: 'Maria', category: 'Moradia', type: 'despesa', label: 'Maria sempre significa aluguel' },
  { id: 'rule-3', pattern: 'Mercado Livre', category: 'Compras', type: 'despesa', label: 'Mercado Livre sempre significa compras' },
  { id: 'rule-4', pattern: 'Uber', category: 'Transporte', type: 'despesa', label: 'Uber sempre significa transporte' },
  { id: 'rule-5', pattern: 'iFood', category: 'Alimentação', type: 'despesa', label: 'iFood sempre significa alimentação' },
  { id: 'rule-6', pattern: 'Netflix', category: 'Assinaturas', type: 'despesa', label: 'Netflix sempre significa assinatura' },
  { id: 'rule-7', pattern: 'Amazon', category: 'Compras', type: 'despesa', label: 'Amazon sempre significa compras' },
  { id: 'rule-8', pattern: 'Google Play', category: 'Aplicativos', type: 'despesa', label: 'Google Play significa aplicativos' },
  { id: 'rule-9', pattern: 'Spotify', category: 'Lazer', type: 'despesa', label: 'Spotify significa entretenimento' }
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    date: '2026-07-15',
    amount: 250,
    type: 'receita',
    description: 'PIX recebido de João',
    category: 'Salário',
    senderOrRecipient: 'João',
    establishment: 'Banco Inter',
    bank: 'Inter'
  },
  {
    id: 'tx-2',
    date: '2026-07-14',
    amount: 350,
    type: 'despesa',
    description: 'PIX enviado para Mercado Livre',
    category: 'Compras',
    senderOrRecipient: 'Mercado Livre',
    establishment: 'Mercado Livre',
    bank: 'Itaú'
  },
  {
    id: 'tx-3',
    date: '2026-07-13',
    amount: 1000,
    type: 'transferencia',
    description: 'Transferência entre Conta Corrente e Poupança',
    category: 'Transferência interna',
    senderOrRecipient: 'Poupança Caixa',
    establishment: 'Caixa Poupança',
    bank: 'Itaú'
  },
  {
    id: 'tx-4',
    date: '2026-07-10',
    amount: 12000,
    type: 'receita',
    description: 'Crédito de Salário',
    category: 'Salário',
    senderOrRecipient: 'Tech Corp S.A.',
    establishment: 'Tech Corp',
    bank: 'Itaú',
    isRecurring: true
  },
  {
    id: 'tx-5',
    date: '2026-07-08',
    amount: 2500,
    type: 'despesa',
    description: 'Pagamento de Aluguel',
    category: 'Moradia',
    senderOrRecipient: 'Maria',
    establishment: 'Maria Imóveis',
    bank: 'Itaú',
    isRecurring: true
  },
  {
    id: 'tx-6',
    date: '2026-07-07',
    amount: 120,
    type: 'despesa',
    description: 'Compra no cartão Nubank',
    category: 'Lazer',
    senderOrRecipient: 'iFood',
    establishment: 'iFood Restaurante',
    bank: 'Nubank'
  },
  {
    id: 'tx-7',
    date: '2026-07-06',
    amount: 45,
    type: 'despesa',
    description: 'Corrida de Aplicativo',
    category: 'Transporte',
    senderOrRecipient: 'Uber',
    establishment: 'Uber Trips',
    bank: 'Nubank'
  },
  {
    id: 'tx-8',
    date: '2026-07-05',
    amount: 55.90,
    type: 'despesa',
    description: 'Mensalidade do Serviço de Streaming',
    category: 'Assinaturas',
    senderOrRecipient: 'Netflix',
    establishment: 'Netflix Entretenimento',
    bank: 'Nubank',
    isRecurring: true
  },
  {
    id: 'tx-9',
    date: '2026-07-04',
    amount: 24.90,
    type: 'despesa',
    description: 'Assinatura Mensal Música',
    category: 'Lazer',
    senderOrRecipient: 'Spotify',
    establishment: 'Spotify Brasil',
    bank: 'Nubank',
    isRecurring: true
  },
  {
    id: 'tx-10',
    date: '2026-07-02',
    amount: 180.50,
    type: 'despesa',
    description: 'Compra de Mantimentos',
    category: 'Alimentação',
    senderOrRecipient: 'Supermercado Carrefour',
    establishment: 'Carrefour Centro',
    bank: 'Itaú'
  },
  {
    id: 'tx-11',
    date: '2026-07-01',
    amount: 500,
    type: 'receita',
    description: 'Recebimento de Rendimentos da Carteira',
    category: 'Investimentos',
    senderOrRecipient: 'Tesouro Direto',
    establishment: 'Tesouro Selic',
    bank: 'XP Investimentos'
  }
];

// Presets for the Notification Simulator
export const simulatedNotificationTemplates = [
  { id: 'nt-work-1', text: 'Você recebeu um PIX de TechCorp Serviços no valor de R$ 10.000,00 na sua conta Nubank', bank: 'Nubank' },
  { id: 'nt-work-2', text: 'PIX recebido do cliente Carlos Mota de R$ 5.000,00 no Nubank', bank: 'Nubank' },
  { id: 'nt-work-emp', text: 'PIX enviado com sucesso para funcionário Mateus Souza no valor de R$ 1.800,00 do Nubank', bank: 'Nubank' },
  { id: 'nt-1', text: 'Você recebeu um PIX de João no valor de R$ 250,00', bank: 'Inter' },
  { id: 'nt-2', text: 'Compra aprovada no seu cartão Nubank: R$ 35,90 no iFood', bank: 'Nubank' },
  { id: 'nt-3', text: 'PIX enviado para Mercado Livre no valor de R$ 350,00', bank: 'Itaú' },
  { id: 'nt-4', text: 'Transferência de R$ 1.000,00 recebida de Conta Corrente para Poupança', bank: 'Itaú' },
  { id: 'nt-5', text: 'Sua assinatura Netflix de R$ 55,90 foi debitada com sucesso', bank: 'Nubank' },
  { id: 'nt-6', text: 'PIX enviado com sucesso para Maria no valor de R$ 2.500,00 para pagamento de aluguel', bank: 'Inter' },
  { id: 'nt-7', text: 'Boleto de R$ 320,00 para Enel Distribuição pago em débito automático', bank: 'Itaú' },
  { id: 'nt-8', text: 'Você recebeu um cashback de R$ 12,50 na sua conta Nubank', bank: 'Nubank' },
  { id: 'nt-9', text: 'Compra de R$ 120,00 aprovada no estabelecimento Amazon Prime', bank: 'Nubank' }
];
