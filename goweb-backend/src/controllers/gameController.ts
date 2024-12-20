import { Request, Response } from 'express';
import Game from '../models/Game';
import { io } from '../server';
import { Position, StoneColor } from '../types/game';

export const createGame = async (req: Request, res: Response) => {
  try {
    const { boardSize = 19 } = req.body;
    const emptyBoard: StoneColor[][] = Array(boardSize).fill(null)
      .map(() => Array(boardSize).fill(null));

    const game = new Game({
      boardState: emptyBoard,
      boardSize,
      currentPlayer: 'black',
      status: 'waiting'
    });

    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error creating game', error });
  }
};

export const makeMove = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { position, player }: { position: Position; player: StoneColor } = req.body;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.status !== 'active') {
      return res.status(400).json({ message: 'Game is not active' });
    }

    if (game.currentPlayer !== player) {
      return res.status(400).json({ message: 'Not your turn' });
    }

    const newBoard = game.boardState.map(row => [...row]);
    newBoard[position.y][position.x] = player;

    game.boardState = newBoard;
    game.currentPlayer = player === 'black' ? 'white' : 'black';
    game.moves.push({
      player,
      position,
      capturedStones: 0,
      timestamp: new Date()
    });

    await game.save();

    io.to(gameId).emit('moveMade', {
      gameId,
      position,
      player,
      boardState: game.boardState,
      currentPlayer: game.currentPlayer
    });

    res.status(200).json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error making move', error });
  }
};

export const getGame = async (req: Request, res: Response) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching game', error });
  }
};

export const listGames = async (_req: Request, res: Response) => {
  try {
    const games = await Game.find({ status: 'waiting' });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Error listing games', error });
  }
};