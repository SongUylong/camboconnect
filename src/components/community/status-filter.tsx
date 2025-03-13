import React from 'react';
import { OpportunityStatus } from '@/types';

interface StatusFilterProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export function StatusFilter({ selectedStatus, onStatusChange }: StatusFilterProps) {
  const statuses: { value: OpportunityStatus; label: string }[] = [
    { value: OpportunityStatus.ACTIVE, label: 'Active' },
    { value: OpportunityStatus.OPENING_SOON, label: 'Opening Soon' },
    { value: OpportunityStatus.CLOSING_SOON, label: 'Closing Soon' },
    { value: OpportunityStatus.CLOSED, label: 'Closed' },
  ];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Status
      </label>
      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Statuses</option>
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
} 