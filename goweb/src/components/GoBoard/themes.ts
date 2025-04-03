// Define board themes with enhanced realistic textures
export type BoardTheme = {
  name: string
  boardColor: string
  lineColor: string
  starPointColor: string
  blackStoneColor: string
  blackStoneGradient?: string[]
  blackStoneStroke: string
  whiteStoneColor: string
  whiteStoneGradient?: string[]
  whiteStoneStroke: string
  coordinateColor: string
}

export const boardThemes: Record<string, BoardTheme> = {
  classic: {
    name: "Classic",
    boardColor: "#E8C064",
    lineColor: "rgba(0, 0, 0, 0.7)",
    starPointColor: "rgba(0, 0, 0, 0.7)",
    blackStoneColor: "#000",
    blackStoneGradient: ["#333", "#111", "#000"],
    blackStoneStroke: "none",
    whiteStoneColor: "#fff",
    whiteStoneGradient: ["#fff", "#f5f5f5", "#eee"],
    whiteStoneStroke: "#ddd",
    coordinateColor: "#7D5A1A",
  },
  dark: {
    name: "Dark",
    boardColor: "#2C3E50",
    lineColor: "rgba(255, 255, 255, 0.7)",
    starPointColor: "rgba(255, 255, 255, 0.7)",
    blackStoneColor: "#000",
    blackStoneGradient: ["#333", "#111", "#000"],
    blackStoneStroke: "none",
    whiteStoneColor: "#fff",
    whiteStoneGradient: ["#fff", "#f5f5f5", "#eee"],
    whiteStoneStroke: "#ddd",
    coordinateColor: "#ECF0F1",
  },
  green: {
    name: "Green",
    boardColor: "#2E8B57",
    lineColor: "rgba(0, 0, 0, 0.7)",
    starPointColor: "rgba(0, 0, 0, 0.7)",
    blackStoneColor: "#000",
    blackStoneGradient: ["#333", "#111", "#000"],
    blackStoneStroke: "none",
    whiteStoneColor: "#fff",
    whiteStoneGradient: ["#fff", "#f5f5f5", "#eee"],
    whiteStoneStroke: "#ccc",
    coordinateColor: "#E0E0E0",
  },
  blue: {
    name: "Blue",
    boardColor: "#4682B4",
    lineColor: "rgba(255, 255, 255, 0.7)",
    starPointColor: "rgba(255, 255, 255, 0.7)",
    blackStoneColor: "#000",
    blackStoneGradient: ["#333", "#111", "#000"],
    blackStoneStroke: "none",
    whiteStoneColor: "#fff",
    whiteStoneGradient: ["#fff", "#f5f5f5", "#eee"],
    whiteStoneStroke: "#ccc",
    coordinateColor: "#fff",
  },
  minimal: {
    name: "Minimal",
    boardColor: "#F5F5F5",
    lineColor: "rgba(0, 0, 0, 0.6)",
    starPointColor: "rgba(0, 0, 0, 0.6)",
    blackStoneColor: "#222",
    blackStoneGradient: ["#333", "#111", "#000"],
    blackStoneStroke: "none",
    whiteStoneColor: "#fff",
    whiteStoneGradient: ["#fff", "#f5f5f5", "#eee"],
    whiteStoneStroke: "#ddd",
    coordinateColor: "#666",
  },
} 