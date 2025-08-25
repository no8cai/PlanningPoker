const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();

class Room {
  constructor(id, name, accessCode) {
    this.id = id;
    this.name = name;
    this.accessCode = accessCode;
    this.users = new Map();
    this.votes = new Map();
    this.revealed = false;
    this.currentStory = '';
    this.emojis = [];
    this.hostId = null;
  }

  addUser(userId, userName) {
    this.users.set(userId, { id: userId, name: userName, isObserver: false, status: 'active' });
    this.votes.delete(userId);
    
    // Set first user as host
    if (!this.hostId) {
      this.hostId = userId;
    }
  }

  removeUser(userId) {
    this.users.delete(userId);
    this.votes.delete(userId);
    
    // If host leaves, assign new host
    if (this.hostId === userId) {
      this.hostId = null;
      if (this.users.size > 0) {
        // Assign first remaining user as new host
        this.hostId = this.users.keys().next().value;
      }
    }
  }

  vote(userId, value) {
    if (!this.revealed && this.users.has(userId)) {
      this.votes.set(userId, value);
    }
  }

  clearVote(userId) {
    this.votes.delete(userId);
  }

  revealVotes() {
    this.revealed = true;
  }

  resetVotes() {
    this.votes.clear();
    this.revealed = false;
  }

  setStory(story) {
    this.currentStory = story;
    this.resetVotes();
  }

  addEmoji(emoji, userId, userName) {
    const emojiData = {
      id: uuidv4(),
      emoji,
      userId,
      userName,
      timestamp: Date.now()
    };
    this.emojis.push(emojiData);
    
    // Keep only last 50 emojis to prevent memory issues
    if (this.emojis.length > 50) {
      this.emojis = this.emojis.slice(-50);
    }
    
    return emojiData;
  }

  getState(viewerId = null) {
    const usersArray = Array.from(this.users.values()).map(user => ({
      ...user,
      isHost: user.id === this.hostId
    }));
    const votesArray = Array.from(this.votes.entries()).map(([userId, value]) => ({
      userId,
      // Show actual value if: votes are revealed OR this is the viewer's own vote
      value: this.revealed || userId === viewerId ? value : '?',
      hasVoted: true,
      isOwnVote: userId === viewerId
    }));

    return {
      id: this.id,
      name: this.name,
      users: usersArray,
      votes: votesArray,
      revealed: this.revealed,
      currentStory: this.currentStory,
      stats: this.revealed ? this.calculateStats() : null,
      hostId: this.hostId,
      isHost: viewerId === this.hostId,
      accessCode: this.accessCode
    };
  }

  calculateStats() {
    const values = Array.from(this.votes.values())
      .filter(v => !isNaN(v))
      .map(v => parseFloat(v));
    
    if (values.length === 0) return null;

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Calculate vote distribution
    const distribution = {};
    Array.from(this.votes.values()).forEach(vote => {
      if (distribution[vote]) {
        distribution[vote]++;
      } else {
        distribution[vote] = 1;
      }
    });

    return { 
      avg: avg.toFixed(1), 
      min, 
      max, 
      count: values.length,
      distribution 
    };
  }
}

app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    userCount: room.users.size
  }));
  res.json(roomList);
});

app.post('/api/rooms', (req, res) => {
  const { name } = req.body;
  const roomId = uuidv4();
  // Generate a 6-digit access code
  const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
  const room = new Room(roomId, name, accessCode);
  rooms.set(roomId, room);
  res.json({ id: roomId, name, accessCode });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  let currentRoom = null;
  let userName = null;

  socket.on('join-room', ({ roomId, name, accessCode }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    // Validate access code
    if (room.accessCode && room.accessCode !== accessCode) {
      socket.emit('error', 'Invalid access code');
      return;
    }

    currentRoom = room;
    userName = name;
    
    socket.join(roomId);
    room.addUser(socket.id, name);

    socket.emit('room-joined', room.getState(socket.id));
    socket.to(roomId).emit('user-joined', { userId: socket.id, name });
    
    // Send personalized room state to each client
    for (const [clientId, client] of io.sockets.sockets) {
      if (room.users.has(clientId)) {
        client.emit('room-update', room.getState(clientId));
      }
    }
  });

  socket.on('vote', ({ value }) => {
    if (!currentRoom) return;
    
    currentRoom.vote(socket.id, value);
    // Send personalized room state to each client
    for (const [clientId, client] of io.sockets.sockets) {
      if (currentRoom.users.has(clientId)) {
        client.emit('room-update', currentRoom.getState(clientId));
      }
    }
  });

  socket.on('clear-vote', () => {
    if (!currentRoom) return;
    
    currentRoom.clearVote(socket.id);
    // Send personalized room state to each client
    for (const [clientId, client] of io.sockets.sockets) {
      if (currentRoom.users.has(clientId)) {
        client.emit('room-update', currentRoom.getState(clientId));
      }
    }
  });

  socket.on('reveal-votes', () => {
    if (!currentRoom) return;
    
    // Only host can reveal votes
    if (socket.id !== currentRoom.hostId) {
      socket.emit('error', 'Only the host can reveal votes');
      return;
    }
    
    currentRoom.revealVotes();
    // Send personalized room state to each client
    for (const [clientId, client] of io.sockets.sockets) {
      if (currentRoom.users.has(clientId)) {
        client.emit('room-update', currentRoom.getState(clientId));
      }
    }
  });

  socket.on('reset-votes', () => {
    if (!currentRoom) return;
    
    // Only host can reset votes
    if (socket.id !== currentRoom.hostId) {
      socket.emit('error', 'Only the host can reset votes');
      return;
    }
    
    currentRoom.resetVotes();
    // Send personalized room state to each client
    for (const [clientId, client] of io.sockets.sockets) {
      if (currentRoom.users.has(clientId)) {
        client.emit('room-update', currentRoom.getState(clientId));
      }
    }
  });

  socket.on('set-story', ({ story }) => {
    if (!currentRoom) return;
    
    // Only host can set story
    if (socket.id !== currentRoom.hostId) {
      socket.emit('error', 'Only the host can set the story');
      return;
    }
    
    currentRoom.setStory(story);
    // Send personalized room state to each client
    for (const [clientId, client] of io.sockets.sockets) {
      if (currentRoom.users.has(clientId)) {
        client.emit('room-update', currentRoom.getState(clientId));
      }
    }
  });

  socket.on('send-emoji', ({ emoji }) => {
    if (!currentRoom || !userName) return;
    
    const emojiData = currentRoom.addEmoji(emoji, socket.id, userName);
    io.to(currentRoom.id).emit('emoji-received', emojiData);
  });

  socket.on('update-status', ({ status }) => {
    if (!currentRoom) return;
    
    const user = currentRoom.users.get(socket.id);
    if (user) {
      user.status = status;
      
      // Send personalized room state to each client
      for (const [clientId, client] of io.sockets.sockets) {
        if (currentRoom.users.has(clientId)) {
          client.emit('room-update', currentRoom.getState(clientId));
        }
      }
    }
  });

  socket.on('transfer-host', ({ newHostId }) => {
    if (!currentRoom) return;
    
    // Only current host can transfer host role
    if (socket.id !== currentRoom.hostId) {
      socket.emit('error', 'Only the host can transfer host role');
      return;
    }
    
    // Check if new host exists in room
    if (!currentRoom.users.has(newHostId)) {
      socket.emit('error', 'User not found in room');
      return;
    }
    
    currentRoom.hostId = newHostId;
    
    // Send personalized room state to each client
    for (const [clientId, client] of io.sockets.sockets) {
      if (currentRoom.users.has(clientId)) {
        client.emit('room-update', currentRoom.getState(clientId));
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (currentRoom) {
      const wasHost = currentRoom.hostId === socket.id;
      currentRoom.removeUser(socket.id);
      
      // Notify about user leaving
      socket.to(currentRoom.id).emit('user-left', { 
        userId: socket.id, 
        name: userName,
        wasHost: wasHost,
        newHostId: currentRoom.hostId
      });
      
      // Send personalized room state to remaining clients
      for (const [clientId, client] of io.sockets.sockets) {
        if (currentRoom.users.has(clientId)) {
          client.emit('room-update', currentRoom.getState(clientId));
        }
      }
      
      // Close room if no users remain
      if (currentRoom.users.size === 0) {
        rooms.delete(currentRoom.id);
        console.log(`Room ${currentRoom.id} closed - no users remaining`);
      }
    }
  });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});