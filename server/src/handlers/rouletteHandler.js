// server/src/handlers/rouletteHandler.js
const gameManager = require('../services/GameManager');
const { generateWinningNumber, calculateRoulettePayout } = require('../utils/gameLogic');
const { v4: uuidv4 } = require('uuid');

function handleRouletteEvents(socket, io) {
  
  socket.on('join-roulette', (roomCode) => {
    const player = gameManager.getPlayer(socket.id);
    if (!player) return;

    // Leave current room if any
    if (player.currentRoom) {
      socket.leave(player.currentRoom);
    }

    // Create or join room
    const room = gameManager.createOrJoinRouletteRoom(roomCode);
    room.addPlayer(player);
    socket.join(room.id);

    socket.emit('joined-roulette', {
      roomCode: room.id,
      gameState: room.gameState,
      players: room.getPlayers()
    });

    socket.to(room.id).emit('player-joined-room', player.toJSON());
  });

  socket.on('place-roulette-bet', (betData) => {
    const player = gameManager.getPlayer(socket.id);
    const room = gameManager.getRoom(player.currentRoom);
    
    if (!player || !room || room.gameState.phase !== 'BETTING') return;
    if (!player.canAfford(betData.amount)) return;

    player.updateChips(-betData.amount);
    
    const bet = {
      playerId: socket.id,
      ...betData,
      id: uuidv4()
    };

    room.addBet(socket.id, bet);

    io.to(player.currentRoom).emit('bet-placed', {
      playerId: socket.id,
      bet,
      playerChips: player.chips
    });
  });

  socket.on('spin-roulette', () => {
    const player = gameManager.getPlayer(socket.id);
    const room = gameManager.getRoom(player.currentRoom);
    
    if (!room || room.gameState.phase !== 'BETTING') return;

    room.setPhase('SPINNING');
    const winningNumber = generateWinningNumber();
    room.setWinningNumber(winningNumber);

    io.to(player.currentRoom).emit('roulette-spinning', {
      winningNumber
    });

    // Resolve bets after 5 seconds
    setTimeout(() => {
      const results = new Map();
      
      room.gameState.bets.forEach((playerBets, playerId) => {
        let totalWin = 0;
        playerBets.forEach(bet => {
          const payout = calculateRoulettePayout(bet, winningNumber);
          totalWin += payout;
        });
        
        if (totalWin > 0) {
          const roomPlayer = room.players.get(playerId);
          roomPlayer.chips += totalWin;
          results.set(playerId, { win: totalWin, newChips: roomPlayer.chips });
        }
      });

      room.setPhase('RESULTS');
      
      io.to(player.currentRoom).emit('roulette-results', {
        winningNumber,
        results: Object.fromEntries(results)
      });

      // Reset for next round
      setTimeout(() => {
        room.setPhase('BETTING');
        room.clearBets();
        room.setWinningNumber(null);
        
        io.to(player.currentRoom).emit('new-roulette-round');
      }, 5000);
    }, 5000);
  });
}

module.exports = handleRouletteEvents;
