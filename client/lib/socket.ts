// client/lib/socket.ts
import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;
  private readonly serverUrl = 'http://localhost:3001';
  
  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      
      this.socket.on('connect', () => {
        console.log('✅ Connected to server');
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server:', reason);
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('🔴 Connection error:', error);
      });
    }
    
    return this.socket;
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Disconnected from server');
    }
  }
  
  getSocket(): Socket | null {
    return this.socket;
  }
  
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketManager = new SocketManager();
