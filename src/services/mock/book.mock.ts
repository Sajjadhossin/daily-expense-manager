import { Book, Category, CategoryType } from '@/types/book';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const DEFAULT_CATEGORIES: Category[] = [
  // Income
  { id: 'cat_inc_1', name: 'Salary', type: 'income', icon: 'Briefcase', color: 'bg-emerald-500', isSystem: true, order: 1 },
  { id: 'cat_inc_2', name: 'Business', type: 'income', icon: 'TrendingUp', color: 'bg-blue-500', isSystem: true, order: 2 },
  { id: 'cat_inc_3', name: 'Loan', type: 'income', icon: 'Landmark', color: 'bg-indigo-500', isSystem: true, order: 3 },
  { id: 'cat_inc_4', name: 'Gifts', type: 'income', icon: 'Gift', color: 'bg-pink-500', isSystem: true, order: 4 },
  { id: 'cat_inc_5', name: 'Other', type: 'income', icon: 'PlusCircle', color: 'bg-gray-500', isSystem: true, order: 99 },
  // Expense
  { id: 'cat_exp_1', name: 'Food', type: 'expense', icon: 'Utensils', color: 'bg-orange-500', isSystem: true, order: 1 },
  { id: 'cat_exp_2', name: 'Transport', type: 'expense', icon: 'Car', color: 'bg-yellow-500', isSystem: true, order: 2 },
  { id: 'cat_exp_3', name: 'Rent', type: 'expense', icon: 'Home', color: 'bg-purple-500', isSystem: true, order: 3 },
  { id: 'cat_exp_4', name: 'Bills', type: 'expense', icon: 'FileText', color: 'bg-cyan-500', isSystem: true, order: 4 },
  { id: 'cat_exp_5', name: 'Shopping', type: 'expense', icon: 'ShoppingCart', color: 'bg-rose-500', isSystem: true, order: 5 },
  { id: 'cat_exp_6', name: 'Health', type: 'expense', icon: 'HeartPulse', color: 'bg-red-500', isSystem: true, order: 6 },
  { id: 'cat_exp_7', name: 'Other', type: 'expense', icon: 'MinusCircle', color: 'bg-gray-500', isSystem: true, order: 99 },
];

export const INITIAL_BOOK: Book = {
  id: 'book_default_1',
  name: 'Personal Wallet',
  description: 'My primary daily expenses',
  isDefault: true,
  balance: 0,
  currency: 'BDT',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// In-memory mock database
let books: Book[] = [INITIAL_BOOK];
let categories: Category[] = [...DEFAULT_CATEGORIES];

export const mockBookService = {
  // --- Books ---
  getBooks: async (): Promise<Book[]> => {
    await delay(300);
    return [...books];
  },

  createBook: async (data: Omit<Book, 'id' | 'balance' | 'createdAt' | 'updatedAt' | 'isDefault'>): Promise<Book> => {
    await delay(500);
    const newBook: Book = {
      ...data,
      id: `book_${Date.now()}`,
      balance: 0,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    books.push(newBook);
    return newBook;
  },

  updateBook: async (id: string, data: Partial<Omit<Book, 'id' | 'balance' | 'createdAt'>>): Promise<Book> => {
    await delay(500);
    const index = books.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Book not found');
    
    books[index] = {
      ...books[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return books[index];
  },

  deleteBook: async (id: string): Promise<void> => {
    await delay(500);
    const book = books.find(b => b.id === id);
    if (!book) throw new Error('Book not found');
    if (book.isDefault) throw new Error('Cannot delete the default book');
    
    books = books.filter(b => b.id !== id);
  },

  // --- Categories ---
  getCategories: async (type?: CategoryType): Promise<Category[]> => {
    await delay(300);
    let result = [...categories];
    if (type) {
      result = result.filter(c => c.type === type);
    }
    return result.sort((a, b) => a.order - b.order);
  },

  createCategory: async (data: Omit<Category, 'id' | 'isSystem'>): Promise<Category> => {
    await delay(500);
    const newCategory: Category = {
      ...data,
      id: `cat_custom_${Date.now()}`,
      isSystem: false,
    };
    categories.push(newCategory);
    return newCategory;
  },

  updateCategory: async (id: string, data: Partial<Omit<Category, 'id' | 'isSystem' | 'type'>>): Promise<Category> => {
    await delay(500);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');
    if (categories[index].isSystem) throw new Error('Cannot modify system categories completely');
    
    categories[index] = {
      ...categories[index],
      ...data,
    };
    return categories[index];
  },

  deleteCategory: async (id: string): Promise<void> => {
    await delay(500);
    const category = categories.find(c => c.id === id);
    if (!category) throw new Error('Category not found');
    if (category.isSystem) throw new Error('Cannot delete system categories');
    
    categories = categories.filter(c => c.id !== id);
  },
};
