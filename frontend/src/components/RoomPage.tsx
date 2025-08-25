import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import VotingCard from './VotingCard';
import UserList from './UserList';
import EmojiPicker from './EmojiPicker';
import FloatingEmoji from './FloatingEmoji';
import ShareButton from './ShareButton';
import { Room } from '../types';
import { SOCKET_URL } from '../config';
import './RoomPage.css';

const CARD_VALUES = ['0.5', '1', '2', '3', '5', '8', '13', '?'];

const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [storyInput, setStoryInput] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{id: string, emoji: string, userName: string}>>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showHostTransferModal, setShowHostTransferModal] = useState(false);

  useEffect(() => {
    // Check for access code in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    if (codeFromUrl) {
      setAccessCode(codeFromUrl);
    }

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('room-joined', (roomState: Room) => {
      setRoom(roomState);
      setIsJoined(true);
      setStoryInput(roomState.currentStory);
    });

    newSocket.on('room-update', (roomState: Room) => {
      setRoom(roomState);
      setStoryInput(roomState.currentStory);
      if (roomState.revealed === false) {
        setSelectedCard(null);
      }
    });

    newSocket.on('error', (message: string) => {
      alert(message);
      navigate('/');
    });

    newSocket.on('emoji-received', (emojiData: {id: string, emoji: string, userName: string}) => {
      setFloatingEmojis(prev => [...prev, emojiData]);
      
      // Remove emoji after animation
      setTimeout(() => {
        setFloatingEmojis(prev => prev.filter(e => e.id !== emojiData.id));
      }, 4000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, navigate]);

  const handleJoinRoom = () => {
    if (userName.trim() && accessCode.trim() && socket) {
      socket.emit('join-room', { roomId, name: userName.trim(), accessCode: accessCode.trim() });
    }
  };

  const handleVote = (value: string) => {
    if (socket && !room?.revealed) {
      setSelectedCard(value);
      socket.emit('vote', { value });
    }
  };

  const handleClearVote = () => {
    if (socket) {
      setSelectedCard(null);
      socket.emit('clear-vote');
    }
  };

  const handleRevealVotes = () => {
    if (socket) {
      socket.emit('reveal-votes');
      // Trigger confetti animation only if successful
      if (room?.isHost) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  };

  const handleEmojiSelect = useCallback((emoji: string) => {
    if (socket && socket.connected) {
      socket.emit('send-emoji', { emoji });
    } else {
      console.warn('Socket not connected, cannot send emoji');
    }
  }, [socket]);

  const handleResetVotes = () => {
    if (socket) {
      socket.emit('reset-votes');
    }
  };

  const handleSetStory = () => {
    if (socket && storyInput.trim()) {
      socket.emit('set-story', { story: storyInput.trim() });
    }
  };

  const handleTransferHost = (newHostId: string) => {
    if (socket) {
      socket.emit('transfer-host', { newHostId });
      setShowHostTransferModal(false);
    }
  };

  const handleLeaveRoom = () => {
    if (room?.isHost && room.users.length > 1) {
      setShowHostTransferModal(true);
    } else {
      navigate('/');
    }
  };

  if (!isJoined) {
    return (
      <div className="join-container">
        <div className="join-card">
          <h2>Join Room</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && accessCode.trim() && handleJoinRoom()}
          />
          <input
            type="text"
            placeholder="Enter access code"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && userName.trim() && handleJoinRoom()}
            maxLength={6}
          />
          <button onClick={handleJoinRoom} disabled={!userName.trim() || !accessCode.trim()}>
            Join Room
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`room-page ${showConfetti ? 'confetti-active' : ''}`}>
      {/* Floating Emojis */}
      {floatingEmojis && floatingEmojis.length > 0 && floatingEmojis.map(emoji => (
        <FloatingEmoji
          key={emoji.id}
          id={emoji.id}
          emoji={emoji.emoji}
          userName={emoji.userName}
        />
      ))}
      
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'][Math.floor(Math.random() * 15)]
            }} />
          ))}
        </div>
      )}

      <div className="room-container">
        <div className="room-header">
          <div className="room-header-info">
            <h1 className="room-title">{room.name}</h1>
            {room.isHost && room.accessCode && (
              <div className="access-code-display">
                <span className="code-label">Access Code:</span>
                <span className="code-value">{room.accessCode}</span>
              </div>
            )}
          </div>
          <div className="header-actions">
            <ShareButton roomId={roomId || ''} roomName={room.name} accessCode={room.accessCode} />
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            {room.isHost && room.users.length > 1 && (
              <button className="transfer-host-button" onClick={() => setShowHostTransferModal(true)}>
                Transfer Host
              </button>
            )}
            <button className="leave-button" onClick={handleLeaveRoom}>
              <span className="leave-text">Leave</span>
              <svg className="leave-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="room-content">
          <div className="main-area">
            <div className="story-section">
              {room.isHost ? (
                <div className="story-input-group">
                  <input
                    type="text"
                    placeholder="Enter story/task description"
                    value={storyInput}
                    onChange={(e) => setStoryInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSetStory()}
                  />
                  <button onClick={handleSetStory}>Set Story</button>
                </div>
              ) : (
                <div className="host-only-message">
                  <span className="lock-icon">🔒</span>
                  <span>Only the host can set the story</span>
                </div>
              )}
              {room.currentStory && (
                <div className="current-story">
                  <strong>Current Story:</strong> {room.currentStory}
                </div>
              )}
            </div>
          <div className="voting-section">
            <h3>Select Your Estimate</h3>
            <div className="cards-container">
              {CARD_VALUES.map(value => (
                <VotingCard
                  key={value}
                  value={value}
                  selected={selectedCard === value}
                  onClick={() => handleVote(value)}
                  disabled={room.revealed}
                />
              ))}
            </div>
            {/* {selectedCard && (
              <div className="vote-selection">
                <div className="my-vote-display">
                  <span className="my-vote-label">Your Vote:</span>
                  <span className="my-vote-value">{selectedCard}</span>
                </div>
                <button className="clear-vote-button" onClick={handleClearVote}>
                  Clear Vote
                </button>
              </div>
            )} */}
          </div>

          <div className="controls">
            <button 
              className="reveal-button"
              onClick={handleRevealVotes}
              disabled={room.revealed || room.votes.length === 0 || !room.isHost}
              title={!room.isHost ? "Only the host can reveal votes" : ""}
            >
              {room.isHost ? "Reveal Votes" : "Reveal Votes (Host Only)"}
            </button>
            <button 
              className="reset-button"
              onClick={handleResetVotes}
              disabled={(!room.revealed && room.votes.length === 0) || !room.isHost}
              title={!room.isHost ? "Only the host can reset votes" : ""}
            >
              {room.isHost ? "Reset Votes" : "Reset Votes (Host Only)"}
            </button>
          </div>

          {room.revealed && room.stats && (
            <div className="stats-section">
              <h3>Statistics</h3>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-label">Average:</span>
                  <span className="stat-value">{room.stats.avg}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Min:</span>
                  <span className="stat-value">{room.stats.min}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Max:</span>
                  <span className="stat-value">{room.stats.max}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Votes:</span>
                  <span className="stat-value">{room.stats.count}</span>
                </div>
              </div>
              
              {room.stats.distribution && Object.keys(room.stats.distribution).length > 0 && (
                <div className="vote-distribution">
                  <h4>Vote Distribution</h4>
                  <div className="distribution-grid">
                    {Object.entries(room.stats.distribution)
                      .sort((a, b) => {
                        // Sort by value, treating '?' as last
                        if (a[0] === '?') return 1;
                        if (b[0] === '?') return -1;
                        const aNum = parseFloat(a[0]);
                        const bNum = parseFloat(b[0]);
                        if (isNaN(aNum)) return 1;
                        if (isNaN(bNum)) return -1;
                        return aNum - bNum;
                      })
                      .map(([value, count]) => (
                        <div key={value} className="distribution-item">
                          <span className="distribution-value">{value}</span>
                          <span className="distribution-count">{count} {count === 1 ? 'vote' : 'votes'}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
          </div>

          <div className="sidebar">
            <UserList 
              users={room.users}
              votes={room.votes}
              revealed={room.revealed}
            />
          </div>
        </div>
      </div>

      {/* Host Transfer Modal */}
      {showHostTransferModal && (
        <div className="modal-overlay" onClick={() => setShowHostTransferModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Transfer Host Role</h3>
            <p>Select a user to become the new host:</p>
            <div className="user-selection-list">
              {room.users
                .filter(user => user.id !== socket?.id)
                .map(user => (
                  <button
                    key={user.id}
                    className="user-select-button"
                    onClick={() => handleTransferHost(user.id)}
                  >
                    {user.name}
                  </button>
                ))}
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setShowHostTransferModal(false)}>
                Cancel
              </button>
              <button className="leave-anyway-button" onClick={() => navigate('/')}>
                Leave Without Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPage;