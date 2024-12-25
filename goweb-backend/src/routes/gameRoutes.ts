import { Router } from 'express';
import { createGame, makeMove, getGame, listGames } from '../controllers/gameController';

const router = Router();

router.post('/', createGame);
router.post('/:gameId/move', makeMove);
router.get('/:gameId', getGame);
router.get('/', listGames);

export default router;