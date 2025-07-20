'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Users, Eye, Play, ArrowLeft } from 'lucide-react';
import { fetchWithAuth } from '@/utils/api';
import { toast } from 'sonner';

interface Player {
  userId: string;
  color: string;
  userName: string;
}

interface Room {
  roomId: string;
  roomName: string;
  boardSize: number;
  timeControl: {
    name: string;
    initialTime: number;
    increment: number;
  };
  status: 'WAITING' | 'IN_GAME' | 'FINISHED';
  currentPlayers: number;
  maxPlayers: number;
  spectatorCount: number;
  allowSpectators: boolean;
  creatorId: string;
  description?: string;
  isPublic: boolean;
  ranked: boolean;
  createdAt: string;
  startedAt?: string;
  players: Player[];
  currentPlayerColor: string;
}

export default function RoomDetailPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  const loadRoom = async () => {
    try {
      const response = await fetchWithAuth(`/api/rooms/${roomId}`);
      if (response.ok) {
        const data = await response.json();
        setRoom(data);
      } else {
        toast.error('Room not found');
        router.push('/rooms');
      }
    } catch (error) {
      toast.error('Failed to load room');
      router.push('/rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (asPlayer: boolean) => {
    try {
      const endpoint = asPlayer ? `/api/rooms/${roomId}/join` : `/api/rooms/${roomId}/spectate`;
      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(asPlayer ? 'Joined as player!' : 'Joined as spectator!');
        router.push(`/game/${roomId}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to join room');
      }
    } catch (error) {
      toast.error('Failed to join room');
    }
  };

  const formatTimeControl = (timeControl: any) => {
    const minutes = Math.floor(timeControl.initialTime / 60);
    const increment = timeControl.increment;
    
    if (increment > 0) {
      return `${minutes}+${increment}`;
    }
    return `${minutes}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => router.push('/rooms')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rooms
        </Button>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => router.push('/rooms')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Rooms
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{room.roomName}</CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-4 text-sm">
                  <span>{room.boardSize}×{room.boardSize} board</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTimeControl(room.timeControl)}
                  </span>
                  <span>•</span>
                  <Badge variant={
                    room.status === 'WAITING' ? 'secondary' :
                    room.status === 'IN_GAME' ? 'default' : 'outline'
                  }>
                    {room.status}
                  </Badge>
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {room.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{room.description}</p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Players</h3>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{room.currentPlayers} / {room.maxPlayers}</span>
              </div>
              <div className="mt-2 space-y-1">
                {room.players.map((player) => (
                  <div key={player.userId} className="text-sm"
                  >
                    <span className={`font-medium ${
                      player.color === 'black' ? 'text-black' : 'text-white'
                    }`}>
                      {player.userName} ({player.color})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Spectators</h3>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{room.spectatorCount}</span>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Settings</h3>
              <div className="space-y-1 text-sm">
                <div>Public: {room.isPublic ? 'Yes' : 'No'}</div>
                <div>Spectators: {room.allowSpectators ? 'Allowed' : 'Disabled'}</div>
                <div>Ranked: {room.ranked ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {room.status === 'WAITING' && room.currentPlayers < room.maxPlayers && (
              <Button 
                size="lg"
                onClick={() => handleJoin(true)}
              >
                <Play className="h-4 w-4 mr-2" />
                Join as Player
              </Button>
            )}
            
            {room.status === 'IN_GAME' && room.allowSpectators && (
              <Button 
                size="lg"
                variant="outline"
                onClick={() => handleJoin(false)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Spectate Game
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground"
          >
            Created: {new Date(room.createdAt).toLocaleString()}
            {room.startedAt && (
              <span> • Started: {new Date(room.startedAt).toLocaleString()}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}