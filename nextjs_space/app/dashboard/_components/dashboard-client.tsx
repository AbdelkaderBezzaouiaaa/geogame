'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Globe2, Plus, LogIn, Trophy, Swords, MapPin, Hash,
  LogOut, History, Crown, Minus, ChevronRight, Users, Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type GameMode = 'CAPITALS' | 'MIX' | 'MAP_GUESS';

interface MatchHistory {
  id: string;
  mode: string;
  player1: { id: string; username: string };
  player2: { id: string; username: string };
  player1Score: number;
  player2Score: number;
  winner: { id: string; username: string } | null;
  completedAt: string | null;
}

const gameModes: { mode: GameMode; icon: any; title: string; desc: string }[] = [
  { mode: 'CAPITALS', icon: Globe2, title: 'Capitals Quiz', desc: 'Name the capital of each country' },
  { mode: 'MIX', icon: Swords, title: 'Mix Mode', desc: 'Mixed capital & country questions' },
  { mode: 'MAP_GUESS', icon: MapPin, title: 'Map Guess', desc: 'Identify countries on the map' },
];

export default function DashboardClient() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [selectedMode, setSelectedMode] = useState<GameMode>('CAPITALS');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [history, setHistory] = useState<MatchHistory[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const userId = (session?.user as any)?.id;
  const username = session?.user?.name ?? 'Player';

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/matches/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data ?? []);
      }
    } catch (e: any) {
      console.error('Failed to fetch history:', e);
    }
  };

  const createRoom = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: selectedMode }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? 'Failed to create room');
        return;
      }
      router.push(`/room/${data?.id}`);
    } catch (e: any) {
      toast.error('Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = async () => {
    if (!joinCode?.trim()) {
      toast.error('Enter a room code');
      return;
    }
    setJoining(true);
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: joinCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? 'Failed to join room');
        return;
      }
      router.push(`/room/${data?.id}`);
    } catch (e: any) {
      toast.error('Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  const getWinStatus = (match: MatchHistory) => {
    if (!match?.winner) return 'draw';
    if (match.winner.id === userId) return 'won';
    return 'lost';
  };

  const stats = {
    total: history?.length ?? 0,
    wins: history?.filter((m: MatchHistory) => m?.winner?.id === userId)?.length ?? 0,
    draws: history?.filter((m: MatchHistory) => !m?.winner)?.length ?? 0,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Globe2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">
              Geo<span className="text-primary">Game</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">Welcome, <span className="text-foreground font-medium">{username}</span></span>
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 py-8 space-y-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-2">
            Ready to <span className="text-primary">compete</span>?
          </h1>
          <p className="text-muted-foreground">Create a room or join a friend&apos;s challenge</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { label: 'Matches', value: stats.total, icon: Swords },
            { label: 'Victories', value: stats.wins, icon: Trophy },
            { label: 'Win Rate', value: stats.total > 0 ? `${Math.round((stats.wins / stats.total) * 100)}%` : '—', icon: Crown },
          ].map((s, i) => (
            <Card key={s.label} variant="default">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Room */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Create Room
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Choose a game mode and share the room code with a friend</p>
                
                <div className="space-y-2">
                  {gameModes.map((gm) => (
                    <button
                      key={gm.mode}
                      onClick={() => setSelectedMode(gm.mode)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        selectedMode === gm.mode
                          ? 'bg-primary/10 ring-2 ring-primary'
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        selectedMode === gm.mode ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <gm.icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">{gm.title}</p>
                        <p className="text-xs text-muted-foreground">{gm.desc}</p>
                      </div>
                      {selectedMode === gm.mode && (
                        <ChevronRight className="w-4 h-4 text-primary ml-auto" />
                      )}
                    </button>
                  ))}
                </div>

                <Button className="w-full" size="lg" onClick={createRoom} loading={creating}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Join Room */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Join Room
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Enter the room code shared by your friend to join the challenge</p>
                
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter room code (e.g. ABC123)"
                    value={joinCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJoinCode(e.target.value.toUpperCase())}
                    className="pl-10 text-center font-mono text-lg tracking-widest uppercase"
                    maxLength={6}
                  />
                </div>

                <Button className="w-full" size="lg" variant="secondary" onClick={joinRoom} loading={joining}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Join Room
                </Button>

                {/* Match history preview */}
                {(history?.length ?? 0) > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                      <History className="w-4 h-4 text-muted-foreground" />
                      Recent Matches
                    </h3>
                    <div className="space-y-2">
                      {history.slice(0, 3).map((m: MatchHistory) => {
                        const status = getWinStatus(m);
                        return (
                          <div key={m?.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant={status === 'won' ? 'default' : status === 'lost' ? 'destructive' : 'secondary'} className="text-xs">
                                {status === 'won' ? 'W' : status === 'lost' ? 'L' : 'D'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                vs {m?.player1?.id === userId ? m?.player2?.username : m?.player1?.username}
                              </span>
                            </div>
                            <span className="font-mono text-xs">
                              {m?.player1?.id === userId ? m?.player1Score : m?.player2Score}
                              {' - '}
                              {m?.player1?.id === userId ? m?.player2Score : m?.player1Score}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="overflow-hidden border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card">
            <CardContent className="p-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                  <Flag className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold">Flag Trainer</h2>
                  <p className="text-sm text-muted-foreground">Practice country flags at your own pace. Correct answers move straight to the next flag.</p>
                </div>
              </div>
              <Button size="lg" onClick={() => router.push('/training/flags')}>
                Start Training
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
