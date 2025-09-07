import React, { useState } from 'react';
import { User, Vote, UserStatus } from '../types';
import './UserList.css';

interface UserListProps {
  users: User[];
  votes: Vote[];
  revealed: boolean;
  currentUserId?: string;
  onNameChange?: (newName: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, votes, revealed, currentUserId, onNameChange }) => {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const getUserVote = (userId: string) => {
    const vote = votes.find(v => v.userId === userId);
    return vote;
  };

  const getStatusIcon = (status?: UserStatus) => {
    switch (status) {
      case 'active':
        return '🟢';
      case 'coffee':
        return '☕';
      case 'watch':
        return '👀';
      case 'right-back':
        return '🚶';
      default:
        return '🟢';
    }
  };

  const getStatusLabel = (status?: UserStatus) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'coffee':
        return 'Coffee Break';
      case 'watch':
        return 'Just Watching';
      case 'right-back':
        return 'Be Right Back';
      default:
        return 'Active';
    }
  };

  const handleStartEdit = (userName: string) => {
    setEditingName(true);
    setTempName(userName);
  };

  const handleSaveName = () => {
    if (tempName.trim() && tempName.trim() !== '' && onNameChange) {
      onNameChange(tempName.trim());
    }
    setEditingName(false);
    setTempName('');
  };

  const handleCancelEdit = () => {
    setEditingName(false);
    setTempName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const votedCount = votes.length;
  const totalUsers = users.filter(u => !u.isObserver).length;

  return (
    <div className="user-list">
      <div className="participants-header">
        <h3>Participants</h3>
        {totalUsers > 0 && (
          <span className="vote-count">({votedCount} of {totalUsers} voted)</span>
        )}
      </div>
      <div className="users">
        {users.map(user => {
          const vote = getUserVote(user.id);
          const isOwnUser = user.id === currentUserId || vote?.isOwnVote || false;
          return (
            <div key={user.id} className={`user-item ${isOwnUser ? 'own-user' : ''} ${user.status !== 'active' ? 'status-' + user.status : ''}`}>
              <div className="user-info">
                <span className="user-status-icon" title={getStatusLabel(user.status)}>
                  {getStatusIcon(user.status)}
                </span>
                {isOwnUser && editingName ? (
                  <input
                    type="text"
                    className="user-name-input"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={handleSaveName}
                    autoFocus
                    maxLength={20}
                  />
                ) : (
                  <span 
                    className={`user-name ${isOwnUser ? 'editable' : ''}`}
                    onClick={isOwnUser ? () => handleStartEdit(user.name) : undefined}
                    title={isOwnUser ? 'Click to edit your name' : undefined}
                  >
                    {user.isHost && '👑 '}{isOwnUser && '👤 '}{user.name}{isOwnUser && ' (You)'}{user.isHost && ' (Host)'}
                  </span>
                )}
                {user.isObserver && <span className="observer-badge">Observer</span>}
              </div>
              <div className="vote-status">
                {vote ? (
                  <span className={`vote-value ${vote.isOwnVote ? 'own-vote' : revealed ? 'revealed' : 'hidden'}`}>
                    {vote.isOwnVote ? (
                      <>
                        <span className="own-vote-label">You:</span> {vote.value}
                      </>
                    ) : revealed ? (
                      vote.value
                    ) : (
                      <span className="vote-checkmark">✓</span>
                    )}
                  </span>
                ) : (
                  <span className="no-vote">-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserList;