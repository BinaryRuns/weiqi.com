import Image from "next/image";
import Link from "next/link"; 
export default function Home() {
  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-semibold mb-4">Welcome to the Go Game!</h1>
      <Image 
        src="/go-game-image.jpg" 
        alt="Go Game" 
        width={300} 
        height={200} 
        className="mb-6" 
      />
      <Link href="/board">
        <button className="px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
          Go to Board
        </button>
      </Link>
    </div>
  
    </div>
  );
}
