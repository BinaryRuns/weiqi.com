"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { boardThemes, type BoardTheme } from "./themes"

interface GoBoardProps {
  size?: 9 | 13 | 19
  preview?: boolean
  interactive?: boolean
  initialStones?: Array<{ x: number; y: number; color: "black" | "white" }>
  theme?: string
  onPlaceStone?: (x: number, y: number) => void
  className?: string
  inGame?: boolean
  showCoordinates?: boolean
  currentPlayerColor?: "black" | "white"
}

export function GoBoard({
  size = 19,
  preview = false,
  interactive = false,
  initialStones = [],
  theme = "classic",
  onPlaceStone,
  className = "",
  inGame = false,
  showCoordinates = true,
  currentPlayerColor,
}: GoBoardProps) {
  const [stones, setStones] = useState<Array<{ x: number; y: number; color: "black" | "white" }>>(initialStones)
  const [currentColor, setCurrentColor] = useState<"black" | "white">("black")
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null)
  
  // Add a ref to track if we're waiting for a response
  const waitingForResponse = useRef(false);

  // Get the current theme
  const currentTheme = boardThemes[theme] || boardThemes.classic

  // Update stones when initialStones changes
  useEffect(() => {
    setStones(initialStones);
    // Reset waiting state when stones are updated from server
    waitingForResponse.current = false;
  }, [initialStones])

  // SVG viewBox dimensions
  const viewBoxSize = 1000
  const padding = viewBoxSize * 0.06 // 6% padding
  const effectiveSize = viewBoxSize - padding * 2
  const cellSize = effectiveSize / (size - 1)

  // Handle board click to place a stone
  const handleBoardClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive) return;
    
    // If we're waiting for a response from the server, don't allow another move
    if (inGame && waitingForResponse.current) return;

    // Get click coordinates relative to the SVG
    const svg = e.currentTarget;
    const svgRect = svg.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;

    const viewBoxX = (x / svgRect.width) * viewBoxSize;
    const viewBoxY = (y / svgRect.height) * viewBoxSize;

    const gridX = Math.round((viewBoxX - padding) / cellSize);
    const gridY = Math.round((viewBoxY - padding) / cellSize);

    if (gridX < 0 || gridX >= size || gridY < 0 || gridY >= size) return;

    const stoneExists = stones.some((stone) => stone.x === gridX && stone.y === gridY);
    if (stoneExists) return;

    // In game mode, just notify parent component about the move
    if (inGame) {
      if (onPlaceStone) {
        // Set waiting flag and send move
        waitingForResponse.current = true;
        onPlaceStone(gridX, gridY);
      }
      return;
    }

    // Only for preview/standalone mode: place stone locally
    if (!inGame && onPlaceStone) {
      onPlaceStone(gridX, gridY);
    }

    // Only add local stones in preview / standalone mode
    if (!inGame) {
      const newStone = { x: gridX, y: gridY, color: currentColor };
      setStones([...stones, newStone]);
      setCurrentColor(currentColor === "black" ? "white" : "black");
    }
  };

  // Handle mouse move to show hover effect
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive || (inGame && waitingForResponse.current)) {
      setHoverPosition(null)
      return
    }

    // Get mouse coordinates relative to the SVG
    const svg = e.currentTarget
    const svgRect = svg.getBoundingClientRect()
    const x = e.clientX - svgRect.left
    const y = e.clientY - svgRect.top

    // Convert to viewBox coordinates
    const viewBoxX = (x / svgRect.width) * viewBoxSize
    const viewBoxY = (y / svgRect.height) * viewBoxSize

    // Calculate the nearest intersection
    const gridX = Math.round((viewBoxX - padding) / cellSize)
    const gridY = Math.round((viewBoxY - padding) / cellSize)

    // Validate the coordinates are within the board
    if (gridX < 0 || gridX >= size || gridY < 0 || gridY >= size) {
      setHoverPosition(null)
      return
    }

    // Check if there's already a stone at this position
    const stoneExists = stones.some((stone) => stone.x === gridX && stone.y === gridY)
    if (stoneExists) {
      setHoverPosition(null)
      return
    }

    setHoverPosition({ x: gridX, y: gridY })
  }

  const handleMouseLeave = () => {
    setHoverPosition(null)
  }

  // Get star point positions based on board size
  const getStarPoints = () => {
    if (size === 19) {
      return [
        [3, 3], [3, 9], [3, 15],
        [9, 3], [9, 9], [9, 15],
        [15, 3], [15, 9], [15, 15],
      ]
    } else if (size === 13) {
      return [
        [3, 3], [3, 6], [3, 9],
        [6, 3], [6, 6], [6, 9],
        [9, 3], [9, 6], [9, 9],
      ]
    } else if (size === 9) {
      return [
        [2, 2], [2, 4], [2, 6],
        [4, 2], [4, 4], [4, 6],
        [6, 2], [6, 4], [6, 6],
      ]
    }
    return []
  }

  // Generate coordinates
  const coordinates = []
  if (showCoordinates) {
    // Letters for horizontal coordinates (skip 'I' to avoid confusion)
    const letters = "ABCDEFGHJKLMNOPQRST".slice(0, size).split("")

    // Numbers for vertical coordinates
    for (let i = 0; i < size; i++) {
      // Horizontal coordinates (letters at the bottom)
      coordinates.push(
        <text
          key={`coord-h-bottom-${i}`}
          x={padding + i * cellSize}
          y={viewBoxSize - padding * 0.3}
          textAnchor="middle"
          fontSize={viewBoxSize * 0.02}
          fill={currentTheme.coordinateColor}
        >
          {letters[i]}
        </text>,
      )

      // Horizontal coordinates (letters at the top)
      coordinates.push(
        <text
          key={`coord-h-top-${i}`}
          x={padding + i * cellSize}
          y={padding * 0.3}
          textAnchor="middle"
          fontSize={viewBoxSize * 0.02}
          fill={currentTheme.coordinateColor}
        >
          {letters[i]}
        </text>,
      )

      // Vertical coordinates (numbers on the left)
      coordinates.push(
        <text
          key={`coord-v-left-${i}`}
          x={padding * 0.3}
          y={padding + i * cellSize}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={viewBoxSize * 0.02}
          fill={currentTheme.coordinateColor}
        >
          {size - i}
        </text>,
      )

      // Vertical coordinates (numbers on the right)
      coordinates.push(
        <text
          key={`coord-v-right-${i}`}
          x={viewBoxSize - padding * 0.3}
          y={padding + i * cellSize}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={viewBoxSize * 0.02}
          fill={currentTheme.coordinateColor}
        >
          {size - i}
        </text>,
      )
    }
  }

  // Generate unique IDs for the gradients
  const blackStoneGradientId = `black-stone-gradient-${theme}`
  const whiteStoneGradientId = `white-stone-gradient-${theme}`

  // Get star points
  const starPoints = getStarPoints()

  // Determine hover color based on props or local state
  const hoverColor = inGame && currentPlayerColor ? currentPlayerColor : currentColor;
  
  // Determine if board should show hover effects
  const showHover = !waitingForResponse.current && interactive;

  return (
    <div className={`relative aspect-square ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        preserveAspectRatio="xMidYMid meet"
        className={`rounded-md shadow-lg ${interactive && inGame && !waitingForResponse.current ? "cursor-crosshair" : ""}`}
        onClick={handleBoardClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Black stone gradient */}
          {currentTheme.blackStoneGradient && (
            <radialGradient id={blackStoneGradientId} cx="40%" cy="40%" r="60%" fx="30%" fy="30%">
              <stop offset="0%" stopColor={currentTheme.blackStoneGradient[0]} />
              <stop offset="70%" stopColor={currentTheme.blackStoneGradient[1]} />
              <stop offset="100%" stopColor={currentTheme.blackStoneGradient[2]} />
            </radialGradient>
          )}

          {/* White stone gradient */}
          {currentTheme.whiteStoneGradient && (
            <radialGradient id={whiteStoneGradientId} cx="40%" cy="40%" r="60%" fx="30%" fy="30%">
              <stop offset="0%" stopColor={currentTheme.whiteStoneGradient[0]} />
              <stop offset="70%" stopColor={currentTheme.whiteStoneGradient[1]} />
              <stop offset="100%" stopColor={currentTheme.whiteStoneGradient[2]} />
            </radialGradient>
          )}

          {/* Stone shadow filter */}
          <filter id="stone-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="1" dy="1" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Board background */}
        <rect
          x="0"
          y="0"
          width={viewBoxSize}
          height={viewBoxSize}
          fill={currentTheme.boardColor}
          rx={viewBoxSize * 0.01}
          ry={viewBoxSize * 0.01}
        />

        {/* Grid lines */}
        {Array.from({ length: size }).map((_, i) => (
          <g key={`grid-${i}`}>
            {/* Horizontal lines */}
            <line
              x1={padding}
              y1={padding + i * cellSize}
              x2={viewBoxSize - padding}
              y2={padding + i * cellSize}
              stroke={currentTheme.lineColor}
              strokeWidth={viewBoxSize * 0.002}
            />

            {/* Vertical lines */}
            <line
              x1={padding + i * cellSize}
              y1={padding}
              x2={padding + i * cellSize}
              y2={viewBoxSize - padding}
              stroke={currentTheme.lineColor}
              strokeWidth={viewBoxSize * 0.002}
            />
          </g>
        ))}

        {/* Star points (hoshi) */}
        {starPoints.map(([x, y], index) => (
          <circle
            key={`star-${index}`}
            cx={padding + x * cellSize}
            cy={padding + y * cellSize}
            r={viewBoxSize * 0.006}
            fill={currentTheme.starPointColor}
          />
        ))}

        {/* Stones with enhanced 3D appearance */}
        {stones.map((stone, index) => (
          <g key={`stone-${index}`} filter="url(#stone-shadow)">
            {/* Base stone */}
            <circle
              cx={padding + stone.x * cellSize}
              cy={padding + stone.y * cellSize}
              r={cellSize * 0.45}
              fill={
                stone.color === "black"
                  ? currentTheme.blackStoneGradient
                    ? `url(#${blackStoneGradientId})`
                    : currentTheme.blackStoneColor
                  : currentTheme.whiteStoneGradient
                    ? `url(#${whiteStoneGradientId})`
                    : currentTheme.whiteStoneColor
              }
              stroke={stone.color === "black" ? currentTheme.blackStoneStroke : currentTheme.whiteStoneStroke}
              strokeWidth={viewBoxSize * 0.001}
            />

            {/* Highlight for 3D effect */}
            <circle
              cx={padding + stone.x * cellSize - cellSize * 0.15}
              cy={padding + stone.y * cellSize - cellSize * 0.15}
              r={cellSize * 0.2}
              fill="white"
              opacity={stone.color === "black" ? "0.2" : "0.5"}
            />
          </g>
        ))}

        {/* Hover indicator - only show if not waiting for response */}
        {showHover && hoverPosition && (
          <circle
            cx={padding + hoverPosition.x * cellSize}
            cy={padding + hoverPosition.y * cellSize}
            r={cellSize * 0.45}
            fill={hoverColor === "black" ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.5)"}
            stroke={hoverColor === "white" ? "#ccc" : "none"}
            strokeWidth={viewBoxSize * 0.001}
          />
        )}

        {/* Coordinates */}
        {coordinates}
      </svg>
    </div>
  )
}