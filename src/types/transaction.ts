export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  bookId: string;       // Associates transaction with a specific cash book
  categoryId: string;   // Associates transaction with a category
  type: TransactionType;
  amount: number;
  date: string;         // ISO Date string
  time?: string;        // Optional time string (e.g. "14:30")
  note?: string;    
  createdAt: string;
  updatedAt: string;
}
