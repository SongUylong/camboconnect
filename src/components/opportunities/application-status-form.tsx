"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCreateApplication } from '@/hooks/use-opportunities';

interface ApplicationStatusFormProps {
  opportunityId: string;
  onSuccess?: () => void;
}

export function ApplicationStatusForm({ opportunityId, onSuccess }: ApplicationStatusFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED'>('PENDING');

  const { mutate: createApplication, isPending } = useCreateApplication();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      await createApplication({
        opportunityId,
        status,
      });
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error('Failed to submit application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please log in to apply for this opportunity.</p>
        <Button
          onClick={() => router.push('/login')}
          className="mt-4"
        >
          Log In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Application Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'PENDING' | 'ACCEPTED' | 'REJECTED')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || isPending}
        className="w-full"
      >
        {isSubmitting || isPending ? 'Submitting...' : 'Submit Application'}
      </Button>
    </form>
  );
}