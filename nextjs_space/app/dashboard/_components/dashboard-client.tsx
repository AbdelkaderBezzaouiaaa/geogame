'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Globe2, Plus, LogIn, Trophy, Swords, MapPin, Hash,
  LogOut, History, Crown, Minus, ChevronRight, Users, Flag, UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type GameMode = 'CAPITALS' | 'FLAGS' | 'POPULATION' | 'AREA_SORT' | 'GDP_SORT' | 'GEODLE' | 'MIX' | 'MAP_GUESS';

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

const gameModes: { mode: GameMode; icon: any; title: string; desc: string; difficulty: string }[] = [
  { mode: 'CAPITALS', icon: Globe2, title: 'Capitals Quiz', desc: 'Name the capital of each country', difficulty: 'Medium' },
  { mode: 'FLAGS', icon: Flag, title: 'Flag Quiz', desc: 'Type the country shown by each flag', difficulty: 'Medium' },
  { mode: 'MAP_GUESS', icon: MapPin, title: 'Map Guess', desc: 'Identify countries on the map', difficulty: 'Hard' },
  { mode: 'POPULATION', icon: Users, title: 'Guess the Population', desc: 'Closest population guess wins each round', difficulty: 'Hard' },
  { mode: 'AREA_SORT', icon: MapPin, title: 'Sort by Area', desc: 'Order countries from largest to smallest', difficulty: 'Expert' },
  { mode: 'GDP_SORT', icon: Trophy, title: 'Sort by GDP per Capita', desc: 'Order countries from richest to poorest per person', difficulty: 'Expert' },
  { mode: 'GEODLE', icon: Globe2, title: 'Geodle', desc: 'Guess the country with clues after each attempt', difficulty: 'Expert' },
  { mode: 'MIX', icon: Swords, title: 'Mix Mode', desc: 'All modes mixed into one battle', difficulty: 'Extreme' },
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
  const [showRecentMatches, setShowRecentMatches] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [friends, setFriends] = useState<{ id: string; username: string; avatarUrl?: string | null }[]>([]);
  const [incoming, setIncoming] = useState<{ id: string; user: { id: string; username: string; avatarUrl?: string | null } }[]>([]);
  const [invitations, setInvitations] = useState<{ id: string; host: string; hostId: string; avatarUrl?: string | null }[]>([]);

  const userId = (session?.user as any)?.id;
  const username = session?.user?.name ?? 'Player';

  useEffect(() => {
    fetchHistory();
    fetchFriends();
    const interval = window.setInterval(fetchFriends, 5000);
    return () => window.clearInterval(interval);
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

  const fetchFriends = async () => { const res = await fetch('/api/friends'); if (res.ok) { const data = await res.json(); setFriends(data.friends ?? []); setIncoming(data.incoming ?? []); setInvitations(data.invitations ?? []); } };
  const addFriend = async () => { const res = await fetch('/api/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: friendName }) }); const data = await res.json(); if (!res.ok) toast.error(data.error ?? 'Could not send request'); else { toast.success('Friend request sent'); setFriendName(''); } };
  const acceptFriend = async (id: string) => { await fetch(`/api/friends/${id}`, { method: 'PATCH' }); fetchFriends(); };

  const createRoom = async (friendId?: string) => {
    setCreating(true);
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: selectedMode, friendId }),
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
    <div className="min-h-screen geo-shell">
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
            <button onClick={() => router.push(`/profile/${userId}`)} className="text-sm text-muted-foreground hidden sm:block hover:text-foreground">Welcome, <span className="text-foreground font-medium underline underline-offset-4">{username}</span></button>
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <aside className="hidden lg:block fixed left-4 top-24 w-72 z-40">
        <Card className="max-h-[calc(100vh-7rem)] overflow-y-auto">
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Friends & Direct Invites</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2"><Input placeholder="Friend username" value={friendName} onChange={(e) => setFriendName(e.target.value)} /><Button onClick={addFriend}><UserPlus className="w-4 h-4 mr-2" />Add</Button></div>
            {incoming.map((request) => <div key={request.id} className="flex justify-between items-center text-sm"><button className="flex items-center gap-2 hover:underline" onClick={() => router.push(`/profile/${request.user.id}`)}>{request.user.avatarUrl && <img src={request.user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />}{request.user.username} wants to be friends</button><Button size="sm" onClick={() => acceptFriend(request.id)}>Accept</Button></div>)}
            {friends.length > 0 && <div className="space-y-2 pt-2 border-t">{friends.map((friend) => <div key={friend.id} className="flex justify-between items-center"><button className="flex items-center gap-2 font-medium hover:underline" onClick={() => router.push(`/profile/${friend.id}`)}>{friend.avatarUrl && <img src={friend.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />}{friend.username}</button><Button size="sm" variant="secondary" onClick={() => createRoom(friend.id)}>Invite to play</Button></div>)}</div>}
            {invitations.map((invite) => <div key={invite.id} className="flex justify-between items-center text-sm bg-primary/10 p-2 rounded"><button className="hover:underline" onClick={() => router.push(`/profile/${invite.hostId}`)}>{invite.host} invited you to a game</button><Button size="sm" onClick={() => router.push(`/room/${invite.id}`)}>Join</Button></div>)}
          </CardContent>
        </Card>
        </aside>
      </header>

      <main className="relative z-10 max-w-[1200px] mx-auto px-4 py-8 space-y-8 lg:pl-80">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight mb-2 geo-title">
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
        <div className="grid xl:grid-cols-[1.25fr_0.75fr] gap-6 items-start">
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
                <p className="text-sm text-muted-foreground">Choose a mode now. Rounds, continent, difficulty and timer are changed inside the lobby while waiting for your friend.</p>
                
                <div className="grid sm:grid-cols-2 gap-2">
                  {gameModes.map((gm) => (
                    <button
                      key={gm.mode}
                      onClick={() => setSelectedMode(gm.mode)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        selectedMode === gm.mode
                          ? 'bg-primary/10 border-primary ring-2 ring-primary/40'
                          : 'bg-muted/30 border-border hover:bg-muted'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        selectedMode === gm.mode ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <gm.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{gm.title}</p>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{gm.difficulty}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{gm.desc}</p>
                      </div>
                      {selectedMode === gm.mode && (
                        <ChevronRight className="w-4 h-4 text-primary ml-auto" />
                      )}
                    </button>
                  ))}
                </div>

                <Button className="w-full" size="lg" onClick={() => createRoom()} loading={creating}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Join / Training */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Play Fast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border bg-muted/20 p-4 space-y-3">
                  <p className="text-sm font-medium">Training</p>
                  <div className="grid gap-2">
                    <Button variant="secondary" className="justify-between" onClick={() => router.push('/training/flags')}>
                      <span className="flex items-center gap-2"><Flag className="w-4 h-4" /> Flag Trainer</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" className="justify-between" onClick={() => router.push('/training/capitals')}>
                      <span className="flex items-center gap-2"><Globe2 className="w-4 h-4" /> Capital Trainer</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" className="justify-between" onClick={() => router.push('/training/geodle')}>
                      <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Geodle Trainer</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

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

                <Button variant="outline" className="w-full justify-between" onClick={() => setShowRecentMatches((value) => !value)}>
                  <span className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Recent Matches
                  </span>
                  <Badge variant="secondary">{history?.length ?? 0}</Badge>
                </Button>

                {/* Match history preview */}
                {showRecentMatches && (history?.length ?? 0) > 0 && (
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
                                vs <button className="hover:underline" onClick={() => router.push(`/profile/${m?.player1?.id === userId ? m?.player2?.id : m?.player1?.id}`)}>{m?.player1?.id === userId ? m?.player2?.username : m?.player1?.username}</button>
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
                {showRecentMatches && (history?.length ?? 0) === 0 && (
                  <div className="text-center text-sm text-muted-foreground rounded-lg border border-dashed p-4">
                    No recent matches yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </main>
    </div>
  );
}
