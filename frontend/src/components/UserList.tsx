import React from 'react';
import { User, Vote, UserStatus } from '../types';
import './UserList.css';

interface UserListProps {
  users: User[];
  votes: Vote[];
  revealed: boolean;
}

const UserList: React.FC<UserListProps> = ({ users, votes, revealed }) => {
  const getUserVote = (userId: string) => {
    const vote = votes.find(v => v.userId === userId);
    return vote;
  };

  const getStatusIcon = (status?: UserStatus) => {
    switch (status) {
      case 'active':
        return '✅';
      case 'coffee':
        return '☕';
      case 'watch':
        return '👀';
      case 'right-back':
        return '🚶';
      default:
        return '✅';
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
          const isOwnUser = vote?.isOwnVote || false;
          return (
            <div key={user.id} className={`user-item ${isOwnUser ? 'own-user' : ''} ${user.status !== 'active' ? 'status-' + user.status : ''}`}>
              <div className="user-info">
                <span className="user-status-icon" title={getStatusLabel(user.status)}>
                  {getStatusIcon(user.status)}
                </span>
                <span className="user-name">
                  {user.isHost && '👑 '}{isOwnUser && '👤 '}{user.name}{isOwnUser && ' (You)'}{user.isHost && ' (Host)'}
                </span>
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