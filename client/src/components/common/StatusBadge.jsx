import React from 'react';
import { getStatusBadgeClass } from '../../utils/helpers';

export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize tracking-wide ${getStatusBadgeClass(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {status}
    </span>
  );
};
