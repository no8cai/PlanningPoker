import React from 'react';
import { UserStatus } from '../types';
import './StatusSelector.css';

interface StatusSelectorProps {
  currentStatus: UserStatus;
  onStatusChange: (status: UserStatus) => void;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({ currentStatus, onStatusChange }) => {
  const statuses: { value: UserStatus; label: string; icon: string }[] = [
    { value: 'active', label: 'Active', icon: '🟢' },
    { value: 'coffee', label: 'Coffee Break', icon: '☕' },
    { value: 'watch', label: 'Just Watching', icon: '👀' },
    { value: 'right-back', label: 'Be Right Back', icon: '🚶' },
  ];

  return (
    <div className="status-selector">
      <div className="status-options">
        {statuses.map((status) => (
          <button
            key={status.value}
            className={`status-button ${currentStatus === status.value ? 'active' : ''}`}
            onClick={() => onStatusChange(status.value)}
            title={status.label}
          >
            <span className="status-icon">{status.icon}</span>
            <span className="status-text">{status.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusSelector;