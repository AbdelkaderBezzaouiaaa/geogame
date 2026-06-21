'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Flag, SkipForward, XCircle } from 'lucide-react';
import { COUNTRIES, type Country } from '@/lib/countries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AnswerState = 'idle' | 'incorrect' | 'correct';

function chooseCountry(previousCode?: string): Country {
  const choices = previousCode ? COUNTRIES.filter((country) => country.code !== previousCode) : COUNTRIES;
  return choices[Math.floor(Math.random() * choices.length)];
}

function normalizeAnswer(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export default function FlagTrainer() {
  const router = useRouter();
  const [country, setCountry] = useState<Country>(() => chooseCountry());
  const [answer, setAnswer] = useState('');
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [country]);

  const nextFlag = () => {
    setCountry((current) => chooseCountry(current.code));
    setAnswer('');
    setAnswerState('idle');
  };

  const submitAnswer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!answer.trim() || answerState === 'correct') return;

    if (normalizeAnswer(answer) === normalizeAnswer(country.name)) {
      setAnswerState('correct');
      setCorrectCount((count) => count + 1);
      setStreak((count) => count + 1);
      window.setTimeout(nextFlag, 650);
      return;
    }

    setAnswerState('incorrect');
    setStreak(0);
  };

  const inputClassName = answerState === 'correct'
    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
    : answerState === 'incorrect'
      ? 'border-destructive ring-2 ring-destructive/20'
      : '';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <div className="flex items-center gap-2 font-display font-bold">
            <Flag className="w-5 h-5 text-primary" />
            Flag Trainer
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-2xl font-mono font-bold text-primary">{correctCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Correct</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-2xl font-mono font-bold">{streak}</p>
            <p className="text-xs text-muted-foreground mt-1">Current streak</p>
          </div>
        </div>

        <section className="rounded-2xl border bg-card p-6 md:p-10 shadow-lg text-center">
          <p className="text-sm font-medium text-primary mb-3">NAME THIS FLAG</p>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">Which country is this?</h1>
          <p className="text-muted-foreground mt-3">Type the country name. A correct answer automatically brings the next flag.</p>

          <div className="mt-8 min-h-48 md:min-h-64 flex items-center justify-center rounded-xl bg-muted/40 border border-border p-5">
            <img
              key={country.code}
              src={`https://flagcdn.com/w640/${country.code.toLowerCase()}.png`}
              alt="Flag to identify"
              className="max-h-44 md:max-h-56 w-auto max-w-full rounded shadow-md"
            />
          </div>

          <form onSubmit={submitAnswer} className="mt-7 space-y-3">
            <Input
              ref={inputRef}
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                if (answerState !== 'idle') setAnswerState('idle');
              }}
              placeholder="Type the country name"
              autoComplete="off"
              className={`h-12 text-center text-lg ${inputClassName}`}
              aria-label="Country name"
            />

            {answerState === 'correct' && (
              <p className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-500">
                <CheckCircle2 className="w-4 h-4" /> Correct! Next flag coming up…
              </p>
            )}
            {answerState === 'incorrect' && (
              <p className="flex items-center justify-center gap-2 text-sm font-medium text-destructive">
                <XCircle className="w-4 h-4" /> Not quite — try again.
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Button type="button" variant="outline" className="sm:w-40" onClick={nextFlag}>
                <SkipForward className="w-4 h-4 mr-2" /> Skip
              </Button>
              <Button type="submit" size="lg" className="flex-1" disabled={!answer.trim() || answerState === 'correct'}>
                Check Answer
              </Button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
