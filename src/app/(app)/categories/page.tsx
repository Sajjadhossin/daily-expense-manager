'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BottomSheet } from '@/components/ui/bottom-sheet';

import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/lib/hooks/use-categories';
import { Category } from '../../../generated/client';

type CategoryType = 'income' | 'expense';

export default function CategoriesPage() {
  const toast = useToast();
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  // For icons and colors we stick to a simplified selection for demo
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('bg-primary-500');

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredCategories = (categories || [])
    .filter((c) => c.type === activeTab)
    .sort((a, b) => a.order - b.order);

  const handleOpenCreate = () => {
    setEditingCat(null);
    setName('');
    setIcon('Tag');
    setColor(activeTab === 'income' ? 'bg-income-500' : 'bg-expense-500');
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
          type: activeTab,
          icon,
          color,
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
    return <div className="flex h-[50vh] items-center justify-center"><p className="text-surface-500">Loading categories...</p></div>;
  }

  return (
    <div className="space-y-6 fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Categories</h1>
          <p className="text-sm text-surface-500">Organize your transaction tags.</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 hidden sm:flex">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <Tabs defaultValue="expense" onValueChange={(v) => setActiveTab(v as CategoryType)}>
        <TabsList className="grid w-full max-w-sm grid-cols-2 mb-6">
          <TabsTrigger value="expense" className="gap-2">
            <ArrowDownRight className="w-4 h-4 text-expense-500" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="income" className="gap-2">
            <ArrowUpRight className="w-4 h-4 text-income-500" />
            Incomes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="mt-0 outline-none">
          <CategoryList 
            items={filteredCategories} 
            onEdit={handleOpenEdit} 
            onDelete={setDeletingId} 
          />
        </TabsContent>
        <TabsContent value="income" className="mt-0 outline-none">
          <CategoryList 
            items={filteredCategories} 
            onEdit={handleOpenEdit} 
            onDelete={setDeletingId} 
          />
        </TabsContent>
      </Tabs>

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
        title={editingCat ? `Edit ${activeTab === 'income' ? 'Income' : 'Expense'} Category` : `New ${activeTab === 'income' ? 'Income' : 'Expense'} Category`}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-900 dark:text-surface-50">
              Category Name
            </label>
            <Input 
              placeholder="e.g. Groceries" 
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
