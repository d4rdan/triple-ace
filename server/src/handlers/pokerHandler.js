// server/src/handlers/pokerHandler.js
const gameManager = require('../services/GameManager');

function handlePokerEvents(socket, io) {
  
  socket.on('join-poker', (roomCode) => {
    const player = gameManager.getPlayer(socket.id);
    if (!player) return;

    // Leave current room if any
    if (player.currentRoom) {
      socket.leave(player.currentRoom);
    }

    // Create or join room
    const room = gameManager.createOrJoinPokerRoom(roomCode);
    room.addPlayer(player);
    socket.join(room.id);

    // Add poker-specific player properties
    const roomPlayer = room.players.get(socket.id);
    roomPlayer.holeCards = [];
    roomPlayer.currentBet = 0;
    roomPlayer.folded = false;
    roomPlayer.position = room.players.size - 1;

    io.to(room.id).emit('joined-poker', {
      roomCode: room.id,
      gameState: room.gameState,
      players: room.getPlayers()
    });
  });

  socket.on('start-poker', () => {
    const player = gameManager.getPlayer(socket.id);
    const room = gameManager.getRoom(player.currentRoom);
    
    if (!room || room.players.size < 2) return;

    room.initializeGame();
    room.dealHoleCards();
    room.gameState.phase = 'BETTING';

    io.to(player.currentRoom).emit('poker-dealt', {
      gameState: room.gameState,
      players: room.getPlayers()
    });
  });

  socket.on('poker-action', (action) => {
    const player = gameManager.getPlayer(socket.id);
    const room = gameManager.getRoom(player.currentRoom);
    const roomPlayer = room.players.get(socket.id);
    
    if (!room || room.gameState.phase !== 'BETTING') return;

    switch (action.type) {
      case 'fold':
        roomPlayer.folded = true;
        break;
      case 'call':
        const callAmount = room.gameState.currentBet - roomPlayer.currentBet;
        roomPlayer.chips -= callAmount;
        roomPlayer.currentBet = room.gameState.currentBet;
        room.addToPot(callAmount);
        break;
      case 'raise':
        const raiseAmount = action.amount - roomPlayer.currentBet;
        roomPlayer.chips -= raiseAmount;
        roomPlayer.currentBet = action.amount;
        room.setCurrentBet(action.amount);
        room.addToPot(raiseAmount);
        break;
    }

    io.to(player.currentRoom).emit('poker-action-made', {
      playerId: socket.id,
      action,
      gameState: room.gameState,
      players: room.getPlayers()
    });
  });
}

module.exports = handlePokerEvents;