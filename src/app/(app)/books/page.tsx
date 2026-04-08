'use client';

import { useState } from 'react';
import { Plus, MoreVertical, Edit2, Trash2, CheckCircle2, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BottomSheet } from '@/components/ui/bottom-sheet';

import { useBookStore } from '@/lib/store/book.store';
import { useBooks, useCreateBook, useUpdateBook, useDeleteBook } from '@/lib/hooks/use-books';
import { Book } from '../../../generated/client';

export default function BooksPage() {
  const toast = useToast();
  const { activeBookId, setActiveBook } = useBookStore();
  const { data: books, isLoading } = useBooks();
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingBook(null);
    setName('');
    setDescription('');
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (book: Book) => {
    setEditingBook(book);
    setName(book.name);
    setDescription(book.description || '');
    setIsSheetOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Book name is required');
      return;
    }

    try {
      if (editingBook) {
        await updateBook.mutateAsync({
          id: editingBook.id,
          data: {
            name,
            description,
          }
        });
        toast.success('Book updated');
      } else {
        await createBook.mutateAsync({
          name,
          description,
          isDefault: false,
          currency: 'BDT',
        });
        toast.success('Book created successfully');
      }
      setIsSheetOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save book');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteBook.mutateAsync(deletingId);
      toast.success('Book deleted');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete book');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><p className="text-surface-500">Loading books...</p></div>;
  }

  return (
    <div className="space-y-6 fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Cash Books</h1>
          <p className="text-sm text-surface-500">Manage your ledgers and daily accounts.</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 hidden sm:flex">
          <Plus className="w-4 h-4" />
          New Book
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(books || []).map((book) => {
          const isActive = book.id === activeBookId;
          return (
            <Card 
              key={book.id} 
              className={`relative overflow-hidden transition-all ${
                isActive 
                  ? 'border-primary-500 shadow-md shadow-primary-500/10' 
                  : 'hover:border-surface-300 dark:hover:border-surface-700'
              }`}
            >
              <div className="p-5 flex flex-col h-full gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isActive ? 'gradient-primary text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
                    }`}>
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-surface-900 dark:text-surface-50 flex items-center gap-2">
                        {book.name}
                        {book.isDefault && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Default</Badge>
                        )}
                      </h3>
                      <p className="text-xs text-surface-500 truncate max-w-[180px]">
                        {book.description || 'No description'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleOpenEdit(book)}
                      className="p-2 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!book.isDefault && (
                      <button 
                        onClick={() => setDeletingId(book.id)}
                        className="p-2 rounded-lg text-surface-400 hover:bg-expense-50 dark:hover:bg-expense-900/30 hover:text-expense-600 dark:hover:text-expense-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex items-end justify-between border-t border-surface-100 dark:border-surface-800 pt-4">
                  <div>
                    <p className="text-xs text-surface-500 mb-0.5">Current Balance</p>
                    <p className={`text-xl font-bold tabular-nums ${
                      book.balance < 0 ? 'text-expense-600 dark:text-expense-400' : 'text-surface-900 dark:text-surface-50'
                    }`}>
                      {book.balance < 0 ? '-' : ''}৳ {Math.abs(book.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  {isActive ? (
                    <div className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-medium text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Active
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveBook(book.id)}
                    >
                      Use Book
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Floating Action Button for Mobile */}
      <button 
        onClick={handleOpenCreate}
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center sm:hidden z-40 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create / Edit Sheet */}
      <BottomSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)}
        title={editingBook ? 'Edit Cash Book' : 'New Cash Book'}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-900 dark:text-surface-50">
              Book Name
            </label>
            <Input 
              placeholder="e.g. Personal Wallet" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-900 dark:text-surface-50">
              Description <span className="text-surface-500 font-normal">(Optional)</span>
            </label>
            <Input 
              placeholder="e.g. Everyday expenses" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button className="w-full mt-4" size="lg" onClick={handleSave} isLoading={createBook.isPending || updateBook.isPending}>
            {editingBook ? 'Save Changes' : 'Create Book'}
          </Button>
        </div>
      </BottomSheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Cash Book"
        description="Are you sure you want to delete this cash book? All transactions inside it will be permanently deleted."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteBook.isPending}
      />
    </div>
  );
}
