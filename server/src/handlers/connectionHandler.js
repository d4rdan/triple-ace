// server/src/handlers/connectionHandler.js
const Player = require('../models/Player');
const gameManager = require('../services/GameManager');

function handleConnection(socket, io) {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-server', (username) => {
    const player = new Player(socket.id, username);
    gameManager.addPlayer(player);
    
    socket.emit('player-joined', {
      playerId: socket.id,
      username,
      chips: player.chips
    });
  });

  socket.on('disconnect', () => {
    const player = gameManager.getPlayer(socket.id);
    if (player && player.currentRoom) {
      socket.to(player.currentRoom).emit('player-left', socket.id);
    }
    
    gameManager.removePlayer(socket.id);
    console.log(`User disconnected: ${socket.id}`);
  });
}

module.exports = handleConnection;
