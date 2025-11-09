// components/transactions/index.ts
export { TransactionTypeToggle } from './TransactionTypeToggle';
export type { TransactionType } from './TransactionTypeToggle';

export { TransactionFormHeader } from './TransactionFormHeader';
export { TransactionHeaderSection } from './TransactionHeaderSection';
export { TransactionLineItem } from './TransactionLineItem';
export { TransactionLinesTable } from './TransactionLinesTable';

export { useTransactionForm } from '../../hooks/useTransactionForm';
export type { 
  TransactionLine, 
  TransactionFormData, 
  TransactionMode 
} from '../../hooks/useTransactionForm';