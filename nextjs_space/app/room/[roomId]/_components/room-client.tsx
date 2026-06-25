'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe2, Copy, Check, Users, Play, Clock, Trophy,
  ArrowLeft, Zap, Crown, MapPin, ChevronRight, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import MapDisplay from './map-display';

interface Player {
  id: string;
  username: string;
  avatarUrl?: string | null;
  score: number;
  hasAnswered: boolean;
}

interface RoomData {
  id: string;
  roomCode: string;
  mode: string;
  status: string;
  hostId: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  continent: string | null;
  answerTime: number;
  questionStartedAt: string | null;
  currentQuestion: {
    type: string;
    questionText: string;
    options: string[];
    countryCode?: string;
    lat?: number;
    lng?: number;
  } | null;
  answeredCount: number;
  players: Player[];
  match: {
    winnerId: string | null;
    player1Score: number;
    player2Score: number;
  } | null;
}

interface AnswerResult {
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswer?: string;
}

export default function RoomClient({ roomId }: { roomId: string }) {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [areaOrder, setAreaOrder] = useState<string[]>([]);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [lastQuestionIndex, setLastQuestionIndex] = useState(-1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const userId = (session?.user as any)?.id;
  const isHost = room?.hostId === userId;
  const modeLabel = room?.mode === 'CAPITALS'
    ? '🏙️ Capitals Quiz'
    : room?.mode === 'FLAGS'
      ? '🚩 Flag Quiz'
      : room?.mode === 'POPULATION'
        ? '👥 Guess the Population'
      : room?.mode === 'AREA_SORT'
        ? '📏 Sort by Area'
        : room?.mode === 'GDP_SORT'
          ? '💰 GDP per Capita Sort'
          : room?.mode === 'MIX'
            ? '⚔️ Mix Mode'
            : '🗺️ Map Guess';

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      if (!res.ok) return;
      const data = await res.json();
      setRoom(data);
    } catch (e: any) {
      console.error('Poll error:', e);
    }
  }, [roomId]);

  // Polling
  useEffect(() => {
    fetchRoom();
    pollRef.current = setInterval(fetchRoom, 1500);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchRoom]);

  // Reset state on new question
  useEffect(() => {
    const qi = room?.currentQuestionIndex ?? -1;
    if (qi !== lastQuestionIndex && room?.status === 'PLAYING') {
      setSelectedAnswer(null);
      setTypedAnswer('');
      setAreaOrder(((room.currentQuestion as any)?.options ?? []).map((item: any) => item.name));
      setAnswerResult(null);
      setLastQuestionIndex(qi);
      // Reset timer
      const started = room?.questionStartedAt;
      if (started) {
        const elapsed = (Date.now() - new Date(started).getTime()) / 1000;
        setTimeLeft(Math.max(0, (room.answerTime ?? 15) - Math.floor(elapsed)));
      } else {
        setTimeLeft(room.answerTime ?? 15);
      }
    }
  }, [room?.currentQuestionIndex, room?.status, room?.questionStartedAt, room?.answerTime, lastQuestionIndex]);

  // Timer countdown
  useEffect(() => {
    if (room?.status !== 'PLAYING' || selectedAnswer) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room?.status, room?.currentQuestionIndex, selectedAnswer]);

  const copyCode = () => {
    navigator?.clipboard?.writeText?.(room?.roomCode ?? '');
    setCopied(true);
    toast.success('Room code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const startGame = async () => {
    setStarting(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/start`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? 'Failed to start');
      }
    } catch (e: any) {
      toast.error('Failed to start game');
    } finally {
      setStarting(false);
    }
  };

  const submitAnswer = async (answer: string) => {
    if (answering || selectedAnswer) return;
    setSelectedAnswer(answer);
    setAnswering(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await fetch(`/api/rooms/${roomId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnswerResult(data);
        if (data?.isCorrect) {
          toast.success(`+${data?.pointsEarned ?? 0} points!`);
        }
      } else {
        toast.error(data?.error ?? 'Failed to submit answer');
      }
    } catch (e: any) {
      toast.error('Failed to submit answer');
    } finally {
      setAnswering(false);
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  // WAITING state - Lobby
  if (room.status === 'WAITING') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-primary" />
              <span className="font-display font-bold">Room Lobby</span>
            </div>
            <div />
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            {/* Room Code */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Share this code with your friend</p>
              <div
                onClick={copyCode}
                className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-card cursor-pointer hover:bg-muted/50 transition-colors animate-pulse-glow"
                style={{ boxShadow: 'var(--shadow-lg)' }}
              >
                <span className="text-4xl font-mono font-bold tracking-[0.3em] text-primary">
                  {room.roomCode}
                </span>
                {copied ? (
                  <Check className="w-6 h-6 text-green-500" />
                ) : (
                  <Copy className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Mode */}
            <Badge variant="secondary" className="text-sm px-4 py-1.5">
              {modeLabel}
            </Badge>

            <Card>
              <CardContent className="p-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Rounds</p>
                  <p className="font-mono font-bold">{room.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Continent</p>
                  <p className="font-medium text-sm">{room.continent ?? 'All'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Answer time</p>
                  <p className="font-mono font-bold">{room.answerTime ?? 15}s</p>
                </div>
              </CardContent>
            </Card>

            {/* Players */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Players ({room.players?.length ?? 0}/2)
                </h3>
                <div className="space-y-3">
                  {room.players?.map((p: Player) => (
                    <button key={p?.id} onClick={() => router.push(`/profile/${p.id}`)} className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 text-left transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        {p.avatarUrl ? <img src={p.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" /> : <span className="text-lg font-bold text-primary">{(p?.username ?? '?')?.[0]?.toUpperCase()}</span>}
                      </div>
                      <span className="font-medium">{p?.username}</span>
                      {p?.id === room.hostId && (
                        <Badge variant="default" className="ml-auto text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Host
                        </Badge>
                      )}
                    </button>
                  ))}
                  {(room.players?.length ?? 0) < 2 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-muted">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <span className="text-muted-foreground text-sm">Waiting for opponent...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Start Button */}
            {isHost && (room.players?.length ?? 0) >= 2 && (
              <Button size="lg" className="w-full text-lg" onClick={startGame} loading={starting}>
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            )}
            {isHost && (room.players?.length ?? 0) < 2 && (
              <p className="text-sm text-muted-foreground">Waiting for a second player to join...</p>
            )}
            {!isHost && (
              <p className="text-sm text-muted-foreground">Waiting for the host to start the game...</p>
            )}
          </motion.div>
        </main>
      </div>
    );
  }

  // FINISHED state - Results
  if (room.status === 'FINISHED') {
    const me = room.players?.find((p: Player) => p?.id === userId);
    const opponent = room.players?.find((p: Player) => p?.id !== userId);
    const isWinner = room.match?.winnerId === userId;
    const isDraw = !room.match?.winnerId;

    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
            <div />
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-display font-bold">Game Over</span>
            </div>
            <div />
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            {/* Result */}
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-6xl mb-4"
              >
                {isDraw ? '🤝' : isWinner ? '🏆' : '😔'}
              </motion.div>
              <h2 className="text-3xl font-display font-bold tracking-tight">
                {isDraw ? 'It\'s a Draw!' : isWinner ? 'You Won!' : 'You Lost'}
              </h2>
            </div>

            {/* Scores */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-primary">
                        {(me?.username ?? '?')?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <button className="font-medium text-sm hover:underline" onClick={() => me?.id && router.push(`/profile/${me.id}`)}>{me?.username ?? 'You'}</button>
                    <p className="text-3xl font-mono font-bold text-primary mt-1">{me?.score ?? 0}</p>
                  </div>
                  <div className="text-2xl font-bold text-muted-foreground">vs</div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-destructive">
                        {(opponent?.username ?? '?')?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <button className="font-medium text-sm hover:underline" onClick={() => opponent?.id && router.push(`/profile/${opponent.id}`)}>{opponent?.username ?? 'Opponent'}</button>
                    <p className="text-3xl font-mono font-bold text-destructive mt-1">{opponent?.score ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button size="lg" className="w-full" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  // PLAYING state - Game
  const currentQ = room.currentQuestion;
  const me = room.players?.find((p: Player) => p?.id === userId);
  const opponent = room.players?.find((p: Player) => p?.id !== userId);
  const hasAnswered = me?.hasAnswered ?? false;
  const questionNum = (room.currentQuestionIndex ?? 0) + 1;
  const progressPercent = ((room.currentQuestionIndex ?? 0) / (room.totalQuestions ?? 10)) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Game Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{(me?.username ?? '?')?.[0]?.toUpperCase()}</span>
              </div>
              <span className="font-mono font-bold text-primary">{me?.score ?? 0}</span>
            </div>
          </div>
          <Badge variant="outline" className="font-mono">
            Q{questionNum}/{room.totalQuestions ?? 10}
          </Badge>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-mono font-bold text-destructive">{opponent?.score ?? 0}</span>
              <div className="w-7 h-7 rounded-full bg-destructive/20 flex items-center justify-center">
                <span className="text-xs font-bold text-destructive">{(opponent?.username ?? '?')?.[0]?.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
        <Progress value={progressPercent} className="h-1" />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2"
        >
          <Clock className={`w-5 h-5 ${timeLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`} />
          <span className={`text-2xl font-mono font-bold ${timeLeft <= 5 ? 'text-destructive' : 'text-foreground'}`}>
            {timeLeft}s
          </span>
        </motion.div>

        {/* Map for MAP_GUESS mode */}
        {currentQ?.type === 'map_guess' && currentQ?.lat != null && currentQ?.lng != null && (
          <motion.div
            key={`map-${room.currentQuestionIndex}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl overflow-hidden"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <MapDisplay lat={currentQ.lat} lng={currentQ.lng} />
          </motion.div>
        )}

        {/* Question */}
        <motion.div
          key={`q-${room.currentQuestionIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl md:text-2xl font-display font-bold text-center tracking-tight">
                {currentQ?.questionText ?? 'Loading question...'}
              </h2>
            </CardContent>
          </Card>
        </motion.div>

        {currentQ?.type === 'flag' && currentQ.countryCode && (
          <div className="rounded-xl bg-muted/40 border p-8 flex justify-center">
            <img src={`https://flagcdn.com/w640/${currentQ.countryCode.toLowerCase()}.png`} alt="Flag to identify" className="max-h-48 rounded shadow-md" />
          </div>
        )}

        {/* Answer Options */}
        {(room.mode === 'CAPITALS' || room.mode === 'FLAGS' || room.mode === 'POPULATION') ? (
          <form onSubmit={(event) => { event.preventDefault(); if (typedAnswer.trim()) submitAnswer(typedAnswer); }} className="space-y-3">
            {room.mode === 'POPULATION' && currentQ?.countryCode && <img src={`https://flagcdn.com/w160/${currentQ.countryCode.toLowerCase()}.png`} alt="Country flag" className="h-16 mx-auto rounded shadow" />}
            <Input value={typedAnswer} onChange={(event) => setTypedAnswer(room.mode === 'POPULATION' ? event.target.value.replace(/\D/g, '') : event.target.value)} disabled={hasAnswered || !!selectedAnswer} placeholder={room.mode === 'POPULATION' ? 'Type population (digits only)' : room.mode === 'FLAGS' ? 'Type the country name' : 'Type the capital city'} inputMode={room.mode === 'POPULATION' ? 'numeric' : 'text'} className="h-12 text-center text-lg" autoComplete="off" />
            <Button type="submit" className="w-full" size="lg" disabled={hasAnswered || !!selectedAnswer || !typedAnswer.trim()}>{selectedAnswer ? 'Answer submitted' : 'Submit answer'}</Button>
          </form>
        ) : (
        (room.mode === 'AREA_SORT' || room.mode === 'GDP_SORT') ? (
          <div className="space-y-2"><p className="text-sm text-muted-foreground text-center">Drag countries from {room.mode === 'GDP_SORT' ? 'highest to lowest GDP per capita' : 'largest to smallest area'}, then validate.</p>{areaOrder.map((name, index) => <div key={name} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', String(index))} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const from = Number(event.dataTransfer.getData('text/plain')); setAreaOrder((items) => { const next = [...items]; const [moved] = next.splice(from, 1); next.splice(index, 0, moved); return next; }); }} className="p-3 rounded-lg bg-card border cursor-grab">{index + 1}. {name}</div>)}<Button className="w-full" disabled={hasAnswered || !!selectedAnswer} onClick={() => submitAnswer(JSON.stringify(areaOrder))}>Validate order</Button></div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQ?.options?.map((option: string, i: number) => {
            const isSelected = selectedAnswer === option;
            const showResult = answerResult != null;
            const isCorrect = showResult && option === answerResult?.correctAnswer;
            const isWrongSelected = showResult && isSelected && !answerResult?.isCorrect;

            let bgClass = 'bg-card hover:bg-muted/50';
            if (isCorrect) bgClass = 'bg-green-500/20 ring-2 ring-green-500';
            else if (isWrongSelected) bgClass = 'bg-red-500/20 ring-2 ring-red-500';
            else if (isSelected && !showResult) bgClass = 'bg-primary/20 ring-2 ring-primary';

            return (
              <motion.button
                key={`${option}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => !hasAnswered && !selectedAnswer && submitAnswer(option)}
                disabled={hasAnswered || !!selectedAnswer}
                className={`p-4 rounded-xl text-left font-medium transition-all ${bgClass} ${!hasAnswered && !selectedAnswer ? 'cursor-pointer' : 'cursor-default'}`}
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm md:text-base">{option}</span>
                  {isCorrect && <Check className="w-5 h-5 text-green-500 ml-auto" />}
                </div>
              </motion.button>
            );
          })}
        </div>
        )
        )}

        {/* Answer feedback */}
        <AnimatePresence>
          {answerResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-center p-3 rounded-xl ${
                answerResult.isCorrect ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {answerResult.isCorrect ? (
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">Correct! +{answerResult.pointsEarned} points</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-medium">{answerResult.pointsEarned > 0 ? `Not perfect — ${answerResult.pointsEarned} point${answerResult.pointsEarned === 1 ? '' : 's'} earned` : 'Wrong answer'}</p>
                  {answerResult.correctAnswer && (
                    <p className="text-sm">
                      <span className="font-semibold">Right answer: </span>
                      {answerResult.correctAnswer}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waiting for opponent */}
        {hasAnswered && !answerResult?.correctAnswer && (
          <div className="text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Waiting for opponent to answer...
          </div>
        )}

        {/* Player status */}
        <div className="flex justify-center gap-8 text-sm">
          {room.players?.map((p: Player) => (
            <div key={p?.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${p?.hasAnswered ? 'bg-green-500' : 'bg-muted animate-pulse'}`} />
              <button className="text-muted-foreground hover:underline" onClick={() => p?.id && router.push(`/profile/${p.id}`)}>{p?.username}</button>
              {p?.hasAnswered && <Check className="w-3 h-3 text-green-500" />}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
