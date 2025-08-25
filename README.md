# Planning Poker Application

A real-time collaborative estimation tool for agile teams built with React and Node.js.

## Features

- Create and join planning poker rooms
- Real-time voting using WebSockets
- Vote with Fibonacci sequence cards (0.5, 1, 2, 3, 5, 8, 13, ?)
- Reveal votes simultaneously
- View voting statistics (average, min, max)
- Set story/task descriptions for context
- Responsive design

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Real-time Communication**: Socket.io
- **Routing**: React Router

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Install backend dependencies:
```bash
cd planning-poker/backend
npm install
```

2. Install frontend dependencies:
```bash
cd planning-poker/frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd planning-poker/backend
npm start
```
The server will run on http://localhost:3001

2. In a new terminal, start the frontend:
```bash
cd planning-poker/frontend
npm start
```
The application will open at http://localhost:3000

## How to Use

1. **Create a Room**: Enter a room name on the home page and click "Create Room"
2. **Join a Room**: Enter your name when prompted to join the room
3. **Set Story**: Enter a story/task description for context
4. **Vote**: Click on a card to cast your vote
5. **Reveal**: Click "Reveal Votes" to show all votes
6. **Reset**: Click "Reset Votes" to start a new round

## Project Structure

```
planning-poker/
├── backend/
│   ├── server.js        # Express server with Socket.io
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/   # React components
    │   ├── types.ts      # TypeScript interfaces
    │   └── App.tsx       # Main app component
    └── package.json
```

just for test