"use client";

import { NavItem } from './nav-item';
import { 
  GamepadIcon, 
  BrainCircuitIcon, 
  GraduationCapIcon, 
  PlaySquareIcon, 
  NewspaperIcon, 
  TrophyIcon,
} from 'lucide-react';

const navItems = [
  { href: '/play', label: 'Play', icon: GamepadIcon },
  { href: '/puzzles', label: 'Puzzles', icon: BrainCircuitIcon },
  { href: '/learn', label: 'Learn', icon: GraduationCapIcon },
  { href: '/watch', label: 'Watch', icon: PlaySquareIcon },
  { href: '/news', label: 'News', icon: NewspaperIcon },
  { href: '/challenges', label: 'Challenges', icon: TrophyIcon },
];

export function Navigation() {
  return (
    <nav className="space-y-1 mt-8 flex-1">
      {navItems.map((item) => (
        <NavItem key={item.href} {...item} />
      ))}
    </nav>
  );
}