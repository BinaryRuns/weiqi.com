export const BOARD_CONFIG = {
  size: 19,
  cellSize: 32,
  get boardSize() {
    return this.cellSize * (this.size - 1);
  }
} as const;