import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RoomListItem } from '../types';
import { API_URL } from '../config';
import './HomePage.css';


const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get<RoomListItem[]>(`${API_URL}/api/rooms`);
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/rooms`, { 
        name: roomName.trim() 
      });
      // Navigate with access code in URL
      navigate(`/room/${response.data.id}?code=${response.data.accessCode}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="home-page">
      {/* Animated Background Elements */}
      <div className="animated-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="home-container">
        {/* Hero Section */}
        <header className="hero-section">
          <div className="hero-content">
            <div className="logo-animation">
              <span className="logo-icon">🎲</span>
            </div>
            <p className="hero-subtitle">
              Transform your agile estimation process with real-time collaboration
            </p>
            
            {/* Quick Start */}
            <div className="quick-start">
              <div className="create-room-form">
                <input
                  type="text"
                  placeholder="Enter room name..."
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                  disabled={loading}
                  className="room-input"
                />
                <button 
                  onClick={handleCreateRoom} 
                  disabled={!roomName.trim() || loading}
                  className="create-button"
                >
                  {loading ? (
                    <span className="loading-spinner">⟳</span>
                  ) : (
                    <>
                      <span>Create Room</span>
                      <span className="button-icon">→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="scroll-indicator">
            <span className="scroll-text">Scroll to explore</span>
            <div className="scroll-arrow">↓</div>
          </div>
        </header>

        {/* Active Rooms Section */}
        <section className="rooms-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon">🚀</span>
              Active Sessions
            </h2>
            <button className="refresh-button" onClick={fetchRooms}>
              <span className="refresh-icon">↻</span>
              Refresh
            </button>
          </div>

          {rooms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>No Active Rooms</h3>
              <p>Be the first to create a planning session!</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {rooms.map((room, index) => (
                <div 
                  key={room.id} 
                  className="room-card-modern"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="room-card-header">
                    <div className="room-icon">
                      {room.userCount > 5 ? '🔥' : room.userCount > 0 ? '👥' : '🏠'}
                    </div>
                    <div className="room-stats">
                      <span className="user-count">{room.userCount}</span>
                      <span className="user-label">users</span>
                    </div>
                  </div>
                  <div className="room-card-body">
                    <h3 className="room-name">{room.name}</h3>
                  </div>
                  <div className="room-card-footer">
                    <button 
                      className="join-room-button"
                      onClick={() => handleJoinRoom(room.id)}
                    >
                      <span>Join Session</span>
                      <span className="join-arrow">→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;