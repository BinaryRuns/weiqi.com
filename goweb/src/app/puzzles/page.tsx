"use client";

import { useState } from "react";
import { PuzzleCard } from "@/components/puzzles/puzzle-card";
import { PuzzleFilters } from "@/components/puzzles/puzzle-filters";
import { Puzzle, PuzzleCategory, PuzzleDifficulty } from "@/lib/types/puzzle";


// TODO: This is just demo. Replace with actual Puzzles
const mockPuzzles: Puzzle[] = [
  {
    id: "1",
    title: "Corner Life & Death",
    description: "Find the vital point to save your stones",
    difficulty: "beginner",
    category: "life-and-death",
    boardSize: 9,
    initialPosition: [],
    solution: [],
    createdAt: new Date().toISOString(),
    likes: 42,
  },
  
];

export default function PuzzlesPage() {
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all',
    sortBy: 'newest',
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Puzzles</h1>
        <p className="text-muted-foreground">
          Improve your skills with our collection of Go problems
        </p>
      </div>

      <PuzzleFilters
        difficulty={filters.difficulty as PuzzleDifficulty | 'all'}
        category={filters.category as PuzzleCategory | 'all'}
        sortBy={filters.sortBy as 'newest' | 'popular'}
        onFilterChange={handleFilterChange}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockPuzzles.map((puzzle) => (
          <PuzzleCard
            key={puzzle.id}
            puzzle={puzzle}
            onClick={() => console.log('Open puzzle:', puzzle.id)}
          />
        ))}
      </div>
    </div>
  );
}