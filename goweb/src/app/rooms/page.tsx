'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Users, Eye, Play, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/api';

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

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('waiting');
  const router = useRouter();

  useEffect(() => {
    loadRooms();
  }, [activeTab]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (activeTab) {
        case 'waiting':
          endpoint = '/api/rooms/waiting';
          break;
        case 'spectate':
          endpoint = '/api/rooms/spectate';
          break;
        case 'all':
          endpoint = '/api/rooms/active';
          break;
      }

      const response = await fetchWithAuth(endpoint);
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string, asPlayer: boolean) => {
    try {
      const endpoint = asPlayer ? `/api/rooms/${roomId}/join` : `/api/rooms/${roomId}/spectate`;
      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
      });

      if (response.ok) {
        router.push(`/game/${roomId}`);
      } else {
        console.error('Failed to join room');
      }
    } catch (error) {
      console.error('Error joining room:', error);
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

  const RoomCard = ({ room }: { room: Room }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{room.roomName}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>{room.boardSize}×{room.boardSize}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimeControl(room.timeControl)}
              </span>
              {!room.isPublic && <Lock className="h-3 w-3" />}
            </CardDescription>
          </div>
          <Badge variant={
            room.status === 'WAITING' ? 'secondary' :
            room.status === 'IN_GAME' ? 'default' : 'outline'
          }>
            {room.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {room.description && (
            <p className="text-sm text-muted-foreground">{room.description}</p>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {room.currentPlayers}/{room.maxPlayers}
              </span>
              {room.allowSpectators && (
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {room.spectatorCount}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              {room.status === 'WAITING' && room.currentPlayers < room.maxPlayers && (
                <Button 
                  size="sm" 
                  onClick={() => handleJoinRoom(room.roomId, true)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Join Game
                </Button>
              )}
              
              {room.status === 'IN_GAME' && room.allowSpectators && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleJoinRoom(room.roomId, false)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Spectate
                </Button>
              )}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Created: {new Date(room.createdAt).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px] mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Game Rooms</h1>
        <p className="text-muted-foreground">
          Browse and join active game rooms or create your own
        </p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="waiting">Waiting Rooms</TabsTrigger>
            <TabsTrigger value="spectate">Spectate Games</TabsTrigger>
            <TabsTrigger value="all">All Rooms</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="waiting">
              {loading ? (
                <LoadingSkeleton />
              ) : rooms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No waiting rooms available</p>
                </div>
              ) : (
                rooms.map((room) => <RoomCard key={room.roomId} room={room} />)
              )}
            </TabsContent>
            
            <TabsContent value="spectate">
              {loading ? (
                <LoadingSkeleton />
              ) : rooms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No games available for spectating</p>
                </div>
              ) : (
                rooms.map((room) => <RoomCard key={room.roomId} room={room} />)
              )}
            </TabsContent>
            
            <TabsContent value="all">
              {loading ? (
                <LoadingSkeleton />
              ) : rooms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No rooms available</p>
                </div>
              ) : (
                rooms.map((room) => <RoomCard key={room.roomId} room={room} />)
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="fixed bottom-8 right-8">
        <Button 
          size="lg" 
          onClick={() => router.push('/rooms/create')}
        >
          Create Room
        </Button>
      </div>
    </div>
  );
}