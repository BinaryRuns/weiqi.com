'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Users, Eye } from 'lucide-react';
import { fetchWithAuth } from '@/utils/api';
import { toast } from 'sonner';

interface CreateRoomRequest {
  roomName: string;
  boardSize: 'NINE' | 'THIRTEEN' | 'NINETEEN';
  timeControl: 'BLITZ' | 'STANDARD' | 'CLASSICAL' | 'TEST';
  description?: string;
  password?: string;
  isPublic: boolean;
  allowSpectators: boolean;
  ranked: boolean;
}

export default function CreateRoomPage() {
  const [formData, setFormData] = useState<CreateRoomRequest>({
    roomName: '',
    boardSize: 'NINETEEN',
    timeControl: 'STANDARD',
    description: '',
    password: '',
    isPublic: true,
    allowSpectators: true,
    ranked: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.roomName.trim()) {
      toast.error('Room name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const room = await response.json();
        toast.success('Room created successfully!');
        router.push(`/rooms/${room.roomId}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create room');
      }
    } catch (error) {
      toast.error('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateRoomRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const boardSizes = [
    { value: 'NINE', label: '9×9 (Beginner)', description: 'Quick games, perfect for beginners' },
    { value: 'THIRTEEN', label: '13×13 (Intermediate)', description: 'Balanced games, good practice' },
    { value: 'NINETEEN', label: '19×19 (Full Board)', description: 'Standard Go, full strategy' },
  ];

  const timeControls = [
    { value: 'BLITZ', label: 'Blitz', description: '3+2 (3 minutes + 2 second increment)' },
    { value: 'STANDARD', label: 'Standard', description: '10+5 (10 minutes + 5 second increment)' },
    { value: 'CLASSICAL', label: 'Classical', description: '30+10 (30 minutes + 10 second increment)' },
    { value: 'TEST', label: 'Test', description: '60+5 (1 hour + 5 second increment)' },
  ];

  return (
    <div className="container mx-auto py-8 max-w-2xl">
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
          <CardTitle>Create Custom Game Room</CardTitle>
          <CardDescription>
            Create a custom game room with your preferred settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="roomName">Room Name *</Label>
              <Input
                id="roomName"
                placeholder="Enter room name"
                value={formData.roomName}
                onChange={(e) => handleInputChange('roomName', e.target.value)}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Optional room description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                maxLength={200}
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Board Size</Label>
                <Select 
                  value={formData.boardSize} 
                  onValueChange={(value) => handleInputChange('boardSize', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {boardSizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        <div className="flex flex-col">
                          <span>{size.label}</span>
                          <span className="text-xs text-muted-foreground">{size.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time Control</Label>
                <Select 
                  value={formData.timeControl} 
                  onValueChange={(value) => handleInputChange('timeControl', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeControls.map((control) => (
                      <SelectItem key={control.value} value={control.value}>
                        <div className="flex flex-col">
                          <span>{control.label}</span>
                          <span className="text-xs text-muted-foreground">{control.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublic" className="cursor-pointer">
                  <div className="flex flex-col">
                    <span>Public Room</span>
                    <span className="text-sm text-muted-foreground">Visible to everyone</span>
                  </div>
                </Label>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="allowSpectators" className="cursor-pointer">
                  <div className="flex flex-col">
                    <span>Allow Spectators</span>
                    <span className="text-sm text-muted-foreground">Others can watch the game</span>
                  </div>
                </Label>
                <Switch
                  id="allowSpectators"
                  checked={formData.allowSpectators}
                  onCheckedChange={(checked) => handleInputChange('allowSpectators', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="ranked" className="cursor-pointer">
                  <div className="flex flex-col">
                    <span>Ranked Game</span>
                    <span className="text-sm text-muted-foreground">Affects your rating</span>
                  </div>
                </Label>
                <Switch
                  id="ranked"
                  checked={formData.ranked}
                  onCheckedChange={(checked) => handleInputChange('ranked', checked)}
                />
              </div>

              {!formData.isPublic && (
                <div className="space-y-2">
                  <Label htmlFor="password">Room Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Leave empty for no password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    maxLength={20}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading || !formData.roomName.trim()}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/rooms')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}