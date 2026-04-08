'use client';

import { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

import { useProfile, useUpdateProfile } from '@/lib/hooks/use-profile';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function ProfilePage() {
  const { data: user, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

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

  if (isLoading) return <div className="p-12 text-center text-surface-500">Loading profile...</div>;
  if (!user) return null;

  return (
    <div className="space-y-6 lg:space-y-8 fade-in max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-surface-50">
            Personal Profile
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Update your identity and account settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 flex flex-col items-center text-center">
             <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-white shadow-lg mb-4 text-3xl font-bold">
               {name ? name.charAt(0).toUpperCase() : 'U'}
             </div>
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
    </div>
  );
}
