// /server/src/index.ts - Fixed Colyseus method signatures
import { Server, Room, Client } from 'colyseus';
import { Schema, type } from '@colyseus/schema';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';

// Simple state for testing
class TestState extends Schema {
  @type('string') message = 'Poker Server Ready!';
  @type('number') playerCount = 0;
}

// Simple room for testing
class TestRoom extends Room<TestState> {
  maxClients = 4;

  onCreate(options: any) {
    this.setState(new TestState());
    console.log('[TestRoom] Room created');

    // Register message handlers
    this.onMessage('test', (client, message) => {
      console.log(`[TestRoom] Test message from ${client.sessionId}:`, message);
      this.broadcast('testResponse', { from: client.sessionId, data: message });
    });

    this.onMessage('action', (client, message) => {
      console.log(`[TestRoom] Action from ${client.sessionId}:`, message);
      this.broadcast('actionResponse', {
        playerId: client.sessionId,
        action: message.type,
        data: message.data
      });
    });

    // Catch-all message handler
    this.onMessage('*', (client, type, message) => {
      console.log(`[TestRoom] Unknown message from ${client.sessionId}: ${type}`, message);
      this.send(client, 'error', { message: `Unknown message type: ${type}` });
    });
  }

  onJoin(client: Client, options: any) {
    this.state.playerCount++;
    console.log(`[TestRoom] Player joined: ${client.sessionId}`);
    this.broadcast('playerJoined', {
      playerId: client.sessionId,
      playerName: options.playerName || 'Anonymous'
    });
  }

  onLeave(client: Client, consented: boolean) {
    this.state.playerCount--;
    console.log(`[TestRoom] Player left: ${client.sessionId}`);
  }
}

// Create Express app
const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Create HTTP server
const httpServer = createServer(app);

// Create Colyseus server
const gameServer = new Server({
  server: httpServer
});

// Register the room
gameServer.define('poker_room', TestRoom);

// Add routes to Express app
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    rooms: 'poker_room available',
    version: '1.0.0'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Poker Server Running',
    websocket: `ws://localhost:${PORT}`,
    room: 'poker_room',
    health: `http://localhost:${PORT}/health`
  });
});

// Start the server
const PORT = 2567;
gameServer.listen(PORT);

console.log('🎮 Poker Server Started!');
console.log(`🔗 WebSocket: ws://localhost:${PORT}`);
console.log(`🩺 Health: http://localhost:${PORT}/health`);
console.log(`📋 Test: Open http://localhost:${PORT} in browser`);

// Shutdown handler
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down...');
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});