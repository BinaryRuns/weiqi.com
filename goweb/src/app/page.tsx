'use client'

import React from 'react'
import { Board } from '../components/GoBoard/Board'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BoardSize } from '@/components/GoBoard/types'
import { famousGame1 } from '@/lib/famousGame'

export default function Home() {
  const boardSize: BoardSize = 19

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Container to maintain consistent width */}
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Main section */}
        <div className="flex flex-col md:flex-row items-start justify-center gap-8 py-8">
          <div className="w-full max-w-xl">
            <Board size={boardSize} stones={famousGame1[famousGame1.length - 1]} />
          </div>
          
          <div className="w-full max-w-md space-y-6">
            <h2 className="text-3xl font-bold text-center mb-6">Play Go Online</h2>
            
            <Card className="bg-primary hover:bg-primary/90 transition-colors cursor-pointer" onClick={() => console.log('Play Online clicked')}>
              <CardHeader>
                <CardTitle className="text-primary-foreground">Play Online!</CardTitle>
                <CardDescription className="text-primary-foreground">Play with someone around your skill level</CardDescription> 
              </CardHeader>
            </Card>

            <Card className="hover:bg-bigcard transition-colors cursor-pointer" onClick={() => console.log('Play Bots clicked')}>
              <CardHeader>
                <CardTitle>Play Bots</CardTitle>
                <CardDescription>Play with custom bots</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Dark section for puzzles - contained within the same max width */}
        <div className="w-full bg-bigcard text-white rounded-lg my-8">
          <div className="px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-center gap-12">
              <div className="flex-1 space-y-6">
                <h2 className="text-4xl font-bold mb-8">Solve Go Puzzles</h2>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6"
                  onClick={() => console.log('Solve puzzles clicked')}
                >
                  Solve Puzzles
                </Button>
                <div className="mt-12">
                  <blockquote className="text-lg text-zinc-300 mb-4">
                    "Puzzles are the best way to improve your reading ability and tactical awareness in Go."
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <img 
                      src="/placeholder.svg?height=64&width=64" 
                      alt="Go Master" 
                      className="rounded-full w-16 h-16"
                    />
                    <div>
                      <div className="text-zinc-300">9p</div>
                      <div className="font-semibold">Lee Sedol</div>
                    </div>
                  </div>
                </div>
              </div>
              
    
              
                <div className="aspect-square w-full max-w-md mx-auto">
                  <Board 
                    size={9} 
                    stones={[]}
                  />
                </div>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

