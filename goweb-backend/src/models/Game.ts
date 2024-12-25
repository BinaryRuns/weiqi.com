import mongoose, { Schema, Document } from 'mongoose';
import { Game, StoneColor } from '../types/game';

export interface IGame extends Game, Document {}

const gameSchema = new Schema({
  boardState: [[String]],
  currentPlayer: {
    type: String,
    enum: ['black', 'white', null],
    default: 'black'
  },
  players: {
    black: { type: Schema.Types.ObjectId, ref: 'User' },
    white: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  moves: [{
    player: String,
    position: {
      x: Number,
      y: Number
    },
    capturedStones: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['waiting', 'active', 'finished'],
    default: 'waiting'
  },
  result: {
    winner: { type: String, enum: ['black', 'white', null] },
    score: {
      black: Number,
      white: Number
    }
  },
  boardSize: {
    type: Number,
    default: 19
  },
  capturedStones: {
    black: { type: Number, default: 0 },
    white: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

export default mongoose.model<IGame>('Game', gameSchema);