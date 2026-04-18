'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BottomSheet } from '@/components/ui/bottom-sheet';

import { CategoriesSkeleton } from '@/components/ui/page-skeletons';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/lib/hooks/use-categories';
import { useBookStore } from '@/lib/store/book.store';
import { useBooks } from '@/lib/hooks/use-books';
import { Category } from '../../../generated/client';

export default function CategoriesPage() {
  const router = useRouter();
  const toast = useToast();
  const { activeBookId } = useBookStore();
  const { data: books } = useBooks();
  const activeBook = (books || []).find(b => b.id === activeBookId);
  const { data: categories, isLoading } = useCategories(activeBookId);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('bg-primary-500');

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sortedCategories = (categories || []).sort((a, b) => a.order - b.order);

  const handleOpenCreate = () => {
    setEditingCat(null);
    setName('');
    setIcon('Tag');
    setColor('bg-primary-500');
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCat(category);
    setName(category.name);
    setIcon(category.icon);
    setColor(category.color);
    setIsSheetOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingCat) {
        await updateCategory.mutateAsync({
          id: editingCat.id,
          data: {
            name,
            icon,
            color,
            order: editingCat.order,
          }
        });
        toast.success('Category updated');
      } else {
        await createCategory.mutateAsync({
          name,
          icon,
          color,
          bookId: activeBookId || undefined,
        });
        toast.success('Category created');
      }
      setIsSheetOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCategory.mutateAsync(deletingId);
      toast.success('Category deleted');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <CategoriesSkeleton />;
  }

  return (
    <div className="space-y-6 fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors lg:hidden"
          >
            <ChevronLeft className="w-6 h-6 text-surface-600 dark:text-surface-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Categories</h1>
            <p className="text-sm text-surface-500">
              {activeBook ? `Categories for "${activeBook.name}" + defaults.` : 'Organize your transaction tags.'}
            </p>
          </div>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 hidden sm:flex">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <CategoryList
        items={sortedCategories}
        onEdit={handleOpenEdit}
        onDelete={setDeletingId}
      />

      {/* Floating Action Button for Mobile */}
      <button
        onClick={handleOpenCreate}
        className="fixed bottom-28 right-4 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center sm:hidden z-40 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create / Edit Sheet */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={editingCat ? 'Edit Category' : 'New Category'}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-900 dark:text-surface-50">
              Category Name
            </label>
            <Input
              placeholder="e.g. Bank, Business, Groceries"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <Button className="w-full mt-4" size="lg" onClick={handleSave} isLoading={createCategory.isPending || updateCategory.isPending}>
            {editingCat ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </BottomSheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? Past transactions will retain the name but lose the category link."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}

function CategoryList({
  items,
  onEdit,
  onDelete
}: {
  items: Category[];
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
      {items.length === 0 ? (
        <div className="p-8 text-center text-surface-500">No categories found.</div>
      ) : (
        items.map((cat, idx) => (
          <div
            key={cat.id}
            className={`p-4 flex items-center justify-between hover:bg-surface-100/50 dark:hover:bg-surface-800/50 transition-colors ${
              idx !== items.length - 1 ? 'border-b border-surface-200 dark:border-surface-800' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${cat.color}`}>
                <span className="text-lg font-bold">
                  {cat.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="font-semibold text-surface-900 dark:text-surface-50 flex items-center gap-2">
                  {cat.name}
                  {cat.isSystem && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">Default</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(cat)}
                className="p-2 rounded-lg text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 hover:text-surface-900 dark:hover:text-surface-50 transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(cat.id)}
                className="p-2 rounded-lg text-surface-400 hover:bg-expense-100 dark:hover:bg-expense-900/30 hover:text-expense-600 dark:hover:text-expense-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
