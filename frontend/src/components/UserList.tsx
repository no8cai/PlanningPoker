import React from 'react';
import { User, Vote } from '../types';
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

  return (
    <div className="user-list">
      <h3>Participants</h3>
      <div className="users">
        {users.map(user => {
          const vote = getUserVote(user.id);
          const isOwnUser = vote?.isOwnVote || false;
          return (
            <div key={user.id} className={`user-item ${isOwnUser ? 'own-user' : ''}`}>
              <div className="user-info">
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
                      '✓'
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