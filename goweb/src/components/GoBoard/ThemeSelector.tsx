"use client"

import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { boardThemes } from "./themes"

interface BoardThemeSelectorProps {
  currentTheme: string
  onThemeChange: (theme: string) => void
}

export function BoardThemeSelector({ currentTheme, onThemeChange }: BoardThemeSelectorProps) {
  const currentColor = currentTheme
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {boardThemes[currentTheme]?.name || "Classic"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        {Object.entries(boardThemes).map(([key, theme]) => (
          <DropdownMenuItem key={key} className="flex items-center justify-between" onClick={() => onThemeChange(key)}>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-sm overflow-hidden">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <rect x="0" y="0" width="24" height="24" fill={theme.boardColor} />
                  <line x1="4" y1="12" x2="20" y2="12" stroke={theme.lineColor} strokeWidth="1" />
                  <line x1="12" y1="4" x2="12" y2="20" stroke={theme.lineColor} strokeWidth="1" />
                  <circle cx="12" cy="12" r="3" fill={theme.starPointColor} />
                  <circle cx="6" cy="6" r="2" fill={theme.blackStoneColor} />
                  <circle
                    cx="18"
                    cy="18"
                    r="2"
                    fill={theme.whiteStoneColor}
                    stroke={theme.whiteStoneStroke}
                    strokeWidth="0.5"
                  />
                </svg>
              </div>
              <span>{theme.name}</span>
            </div>
            {currentColor === key && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 