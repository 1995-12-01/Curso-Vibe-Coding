/**
 * @file Badge.jsx
 * @description Insignia de estado con borde contrastado y color distintivo de alto impacto visual.
 */

import React from 'react';
import { EXPENSE_STATUSES } from '../../domain/constants';
import { Clock, PlayCircle, PieChart, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_ICONS = {
  pending_acceptance: Clock,
  in_progress: PlayCircle,
  partially_paid: PieChart,
  paid: CheckCircle2,
  rejected: XCircle,
};

export default function Badge({ status, className = '' }) {
  const statusConfig = Object.values(EXPENSE_STATUSES).find(s => s.id === status) || EXPENSE_STATUSES.PENDING;
  const Icon = STATUS_ICONS[status] || Clock;

  return (
    <span className={`badge-status ${statusConfig.badgeClass} ${className}`}>
      <Icon size={13} strokeWidth={2.8} />
      <span>{statusConfig.label}</span>
    </span>
  );
}
