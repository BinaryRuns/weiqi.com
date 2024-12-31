import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PuzzleCategory, PuzzleDifficulty } from "@/lib/types/puzzle";

interface PuzzleFiltersProps {
  difficulty: PuzzleDifficulty | 'all';
  category: PuzzleCategory | 'all';
  sortBy: 'newest' | 'popular';
  onFilterChange: (key: string, value: string) => void;
}

export function PuzzleFilters({
  difficulty,
  category,
  sortBy,
  onFilterChange,
}: PuzzleFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Select
        value={difficulty}
        onValueChange={(value) => onFilterChange('difficulty', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Difficulties</SelectItem>
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={category}
        onValueChange={(value) => onFilterChange('category', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="life-and-death">Life & Death</SelectItem>
          <SelectItem value="tesuji">Tesuji</SelectItem>
          <SelectItem value="endgame">Endgame</SelectItem>
          <SelectItem value="opening">Opening</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sortBy}
        onValueChange={(value) => onFilterChange('sortBy', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}