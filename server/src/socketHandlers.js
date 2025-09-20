// server/src/socketHandlers.js
const handleConnection = require('./handlers/connectionHandler');
const handleRouletteEvents = require('./handlers/rouletteHandler');
const handlePokerEvents = require('./handlers/pokerHandler');

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    // Connection events
    handleConnection(socket, io);
    
    // Game-specific events
    handleRouletteEvents(socket, io);
    handlePokerEvents(socket, io);
  });
}

module.exports = { setupSocketHandlers };