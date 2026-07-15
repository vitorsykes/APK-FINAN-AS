export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'receita' | 'despesa' | 'transferencia';
  description: string;
  category: string;
  senderOrRecipient: string;
  establishment: string;
  bank: string;
  isRecurring?: boolean;
  isPendingApproval?: boolean;
  originalNotificationText?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  balance: number;
  bankName: string;
  accountNumber?: string;
  icon: string;
  isWorkAccount?: boolean;
  employeeReservePercent?: number; // % to set aside for employees
  employeeReserveBalance?: number; // accumulated fund for employees
  personalTransferPercent?: number; // % to transfer to own account
  personalTransferTargetAccountId?: string; // target account ID
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  spent: number;
  color: string;
  lastDigits: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  icon: string;
  bgImage?: string;
}

export interface CategoryBudget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  icon: string;
  color: string;
}

export interface AutoRule {
  id: string;
  pattern: string; // e.g. "João", "Maria", "Mercado Livre", "iFood"
  category: string;
  type: 'receita' | 'despesa' | 'transferencia';
  label: string; // Humano readable label
}

export interface ParsedNotification {
  tipo: 'receita' | 'despesa' | 'transferencia';
  valor: number;
  pessoa: string;
  categoriaSugerida: string;
  descricao: string;
  banco: string;
  isWorkIncome?: boolean;
  isEmployeePayment?: boolean;
  isSelfTransfer?: boolean;
}

export interface SimulatedNotification {
  id: string;
  text: string;
  timestamp: string;
  isProcessed: boolean;
  isAILearningNeeded?: boolean;
  parsedResult?: ParsedNotification;
}
