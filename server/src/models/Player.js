class Player {
    constructor(id, username) {
      this.id = id;
      this.username = username;
      this.chips = 1000; // Starting chips
      this.currentRoom = null;
    }
  
    updateChips(amount) {
      this.chips = Math.max(0, this.chips + amount);
      return this.chips;
    }
  
    canAfford(amount) {
      return this.chips >= amount;
    }
  
    toJSON() {
      return {
        id: this.id,
        username: this.username,
        chips: this.chips,
        currentRoom: this.currentRoom
      };
    }
  }
  
  module.exports = Player;