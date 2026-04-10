'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, Mail, ShieldCheck, CheckCircle2, AlertTriangle, Trash2, ChevronLeft } from 'lucide-react';

import { useProfile, useUpdateProfile, useDeleteAccount } from '@/lib/hooks/use-profile';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ProfileSkeleton } from '@/components/ui/page-skeletons';

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Initialize form with store values once they are hydrated
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      await updateProfile.mutateAsync({ name, email });
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  if (isLoading) return <ProfileSkeleton />;
  if (!user) return null;

  return (
    <div className="space-y-6 lg:space-y-8 fade-in max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors lg:hidden"
          >
            <ChevronLeft className="w-6 h-6 text-surface-600 dark:text-surface-400" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-surface-50">
              Personal Profile
            </h1>
            <p className="text-sm text-surface-500 mt-1">
              Update your identity and account settings.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 flex flex-col items-center text-center">
             {user.image || user.avatarUrl ? (
               <Image
                 src={user.image || user.avatarUrl!}
                 alt={name || 'User'}
                 width={96}
                 height={96}
                 className="w-24 h-24 rounded-full object-cover shadow-lg mb-4 ring-2 ring-primary-200 dark:ring-primary-800"
               />
             ) : (
               <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-white shadow-lg mb-4 text-3xl font-bold">
                 {name ? name.charAt(0).toUpperCase() : 'U'}
               </div>
             )}
             <h3 className="font-semibold text-lg text-surface-900 dark:text-surface-50">
               {name || 'User'}
             </h3>
             <p className="text-sm text-surface-500 mb-4 truncate w-full px-2">
               {email || 'No email provided'}
             </p>
             
             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-medium border border-primary-100 dark:border-primary-800/50">
               <CheckCircle2 className="w-3.5 h-3.5" />
               Account Active
             </div>
          </Card>
        </div>

        {/* Form Main Area */}
        <div className="md:col-span-2">
          <Card className="p-6 md:p-8">
            <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-6 flex items-center gap-2 text-lg">
               <User className="w-5 h-5 text-primary-500" />
               Basic Information
            </h3>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-900 dark:text-surface-50">
                  Full Name
                </label>
                <Input 
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={updateProfile.isPending}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-900 dark:text-surface-50">
                  Email Address
                </label>
                <Input 
                  type="email"
                  placeholder="name@example.com"
                  icon={<Mail className="w-4 h-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={true} // Email should usually be immutable via NextAuth unless specifically managed
                />
                <p className="text-xs text-surface-500">
                  Used for login and receiving exported reports.
                </p>
              </div>

              <div className="pt-4 border-t border-surface-200 dark:border-surface-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-surface-500">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   Your data is securely stored.
                </div>
                <Button type="submit" isLoading={updateProfile.isPending} disabled={updateProfile.isPending}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Danger Zone */}
      <Card className="border-expense-200 dark:border-expense-900/50 overflow-hidden">
        <div className="px-6 py-4 bg-expense-50 dark:bg-expense-950/20 border-b border-expense-200 dark:border-expense-900/50">
          <h3 className="font-semibold text-expense-700 dark:text-expense-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </h3>
        </div>
        <div className="p-6">
          {!showDeleteConfirm ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-50 text-sm">
                  Delete Account
                </p>
                <p className="text-xs text-surface-500 mt-0.5">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-expense-50 dark:bg-expense-950/20 border border-expense-200 dark:border-expense-900/50">
                <p className="text-sm font-medium text-expense-700 dark:text-expense-400 mb-1">
                  This will permanently delete:
                </p>
                <ul className="text-xs text-expense-600 dark:text-expense-500 space-y-1">
                  <li>- Your profile and account</li>
                  <li>- All cash books</li>
                  <li>- All transactions</li>
                  <li>- All categories</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-900 dark:text-surface-50">
                  Type <span className="font-bold text-expense-600">DELETE</span> to confirm
                </label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  disabled={deleteAccount.isPending}
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteConfirmText !== 'DELETE' || deleteAccount.isPending}
                  isLoading={deleteAccount.isPending}
                  onClick={async () => {
                    try {
                      await deleteAccount.mutateAsync();
                    } catch {
                      toast.error('Failed to delete account. Please try again.');
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Permanently Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  disabled={deleteAccount.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
