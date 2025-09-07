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
const roomCleanupTimers = new Map(); // Track cleanup timers for empty rooms
const ROOM_CLEANUP_DELAY = 60000; // 60 seconds grace period for reconnection

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
    this.originalHostName = null; // Track original host by name for reconnection
  }

  addUser(userId, userName) {
    // Check if user with same name already exists (potential reconnection)
    let existingUser = null;
    for (const [id, user] of this.users.entries()) {
      if (user.name === userName && id !== userId) {
        // Remove the old connection
        this.users.delete(id);
        // Preserve their vote if they had one
        if (this.votes.has(id)) {
          const vote = this.votes.get(id);
          this.votes.delete(id);
          this.votes.set(userId, vote);
        }
        existingUser = user;
        break;
      }
    }
    
    this.users.set(userId, { 
      id: userId, 
      name: userName, 
      isObserver: false, 
      status: existingUser ? existingUser.status : 'active' 
    });
    
    // Set first user as host and track their name
    if (!this.originalHostName) {
      // First user in room becomes the original host
      this.hostId = userId;
      this.originalHostName = userName;
      console.log(`Setting ${userName} as original host with ID ${userId}`);
    } else if (userName === this.originalHostName) {
      // If this is the original host reconnecting, restore host status
      this.hostId = userId;
      console.log(`Restoring host status for ${userName} with new ID ${userId}`);
    } else if (!this.hostId || this.users.size === 1) {
      // If there's no current host (room was empty), make this user the temporary host
      // unless they're the original host (handled above)
      if (this.users.size === 1) {
        this.hostId = userId;
        console.log(`Room was empty, setting ${userName} as temporary host with ID ${userId}`);
      }
    }
    console.log(`Current hostId: ${this.hostId}, originalHostName: ${this.originalHostName}`);
  }

  removeUser(userId) {
    const user = this.users.get(userId);
    this.users.delete(userId);
    this.votes.delete(userId);
    
    // If host leaves, only reassign if room won't be empty
    // Keep originalHostName so they can reclaim host status on reconnect
    if (this.hostId === userId) {
      if (this.users.size > 0) {
        // Temporarily assign first remaining user as host
        // Original host can reclaim when they reconnect
        this.hostId = this.users.keys().next().value;
        console.log(`Host left, temporarily assigning host to ${this.hostId}`);
      } else {
        // Room is empty, set hostId to null but keep originalHostName
        // The original host can reclaim it when they return
        console.log(`Host left and room is empty, clearing hostId but keeping originalHostName: ${this.originalHostName}`);
        this.hostId = null;
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

    const isViewerHost = viewerId === this.hostId;

    return {
      id: this.id,
      name: this.name,
      users: usersArray,
      votes: votesArray,
      revealed: this.revealed,
      currentStory: this.currentStory,
      stats: this.revealed ? this.calculateStats() : null,
      hostId: this.hostId,
      isHost: isViewerHost,
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
    console.log(`Join room attempt - Room: ${roomId}, User: ${name}, Code: ${accessCode}`);
    const room = rooms.get(roomId);
    if (!room) {
      console.log('Room not found:', roomId);
      socket.emit('error', 'Room not found');
      return;
    }

    // Validate access code
    if (room.accessCode && room.accessCode !== accessCode) {
      console.log('Invalid access code provided:', accessCode, 'Expected:', room.accessCode);
      socket.emit('error', 'Invalid access code');
      return;
    }

    currentRoom = room;
    userName = name;
    console.log(`User ${name} successfully joining room ${roomId}`);
    
    // Cancel any pending cleanup timer for this room
    if (roomCleanupTimers.has(roomId)) {
      clearTimeout(roomCleanupTimers.get(roomId));
      roomCleanupTimers.delete(roomId);
      console.log(`Cancelled cleanup timer for room ${roomId} - user rejoined`);
    }
    
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

  socket.on('update-name', ({ newName }) => {
    if (!currentRoom || !newName || newName.trim() === '') return;
    
    const user = currentRoom.users.get(socket.id);
    if (user) {
      const oldName = user.name;
      user.name = newName.trim();
      userName = newName.trim(); // Update the local userName variable
      
      // If this user is the original host, update the originalHostName
      if (currentRoom.originalHostName === oldName) {
        currentRoom.originalHostName = newName.trim();
      }
      
      console.log(`User ${oldName} changed name to ${user.name}`);
      
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
      const roomId = currentRoom.id;
      currentRoom.removeUser(socket.id);
      
      // Check if room should be deleted before sending updates
      if (currentRoom.users.size === 0) {
        // Schedule room for deletion after grace period
        console.log(`Room ${roomId} is now empty, scheduling cleanup in ${ROOM_CLEANUP_DELAY/1000} seconds`);
        
        // Clear any existing timer for this room
        if (roomCleanupTimers.has(roomId)) {
          clearTimeout(roomCleanupTimers.get(roomId));
        }
        
        // Set new cleanup timer
        const cleanupTimer = setTimeout(() => {
          // Double-check the room is still empty before deleting
          const room = rooms.get(roomId);
          if (room && room.users.size === 0) {
            rooms.delete(roomId);
            roomCleanupTimers.delete(roomId);
            console.log(`Room ${roomId} deleted after cleanup timeout`);
          }
        }, ROOM_CLEANUP_DELAY);
        
        roomCleanupTimers.set(roomId, cleanupTimer);
      } else {
        // Only send updates if room still has users
        // Notify about user leaving
        socket.to(roomId).emit('user-left', { 
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