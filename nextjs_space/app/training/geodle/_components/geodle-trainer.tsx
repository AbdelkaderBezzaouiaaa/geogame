'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Globe2, RotateCcw, SkipForward, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GEODLE_FACTS, findGeodleFact, type GeodleFact } from '@/lib/geodle-facts';

type Status = 'correct' | 'wrong' | 'higher' | 'lower';
type Clue = {
  country: string;
  code: string;
  continent: { value: string; status: Status };
  population: { value: number; status: Status };
  landlocked: { value: string; status: Status };
  religion: { value: string; status: Status };
  temperature: { value: number; status: Status };
  government: { value: string; status: Status };
};

function chooseCountry(previous?: string) {
  const facts = Object.values(GEODLE_FACTS).filter((fact) => fact.name !== previous);
  return facts[Math.floor(Math.random() * facts.length)];
}

function status(value: string | boolean, target: string | boolean): Status {
  return value === target ? 'correct' : 'wrong';
}

function direction(value: number, target: number): Status {
  if (value === target) return 'correct';
  return target > value ? 'higher' : 'lower';
}

function buildClue(guess: GeodleFact, target: GeodleFact): Clue {
  return {
    country: guess.name,
    code: guess.code,
    continent: { value: guess.continent, status: status(guess.continent, target.continent) },
    population: { value: guess.population, status: direction(guess.population, target.population) },
    landlocked: { value: guess.landlocked ? 'Yes' : 'No', status: status(guess.landlocked, target.landlocked) },
    religion: { value: guess.religion, status: status(guess.religion, target.religion) },
    temperature: { value: guess.temperature, status: direction(guess.temperature, target.temperature) },
    government: { value: guess.government, status: status(guess.government, target.government) },
  };
}

export default function GeodleTrainer() {
  const router = useRouter();
  const [target, setTarget] = useState<GeodleFact>(() => chooseCountry());
  const [guess, setGuess] = useState('');
  const [clues, setClues] = useState<Clue[]>([]);
  const [message, setMessage] = useState('');
  const [finished, setFinished] = useState(false);
  const [wins, setWins] = useState(0);
  const [played, setPlayed] = useState(0);

  const attempt = clues.length + 1;
  const left = Math.max(0, 6 - clues.length);

  const countryNames = useMemo(() => Object.keys(GEODLE_FACTS).sort(), []);

  const reset = () => {
    setTarget((current) => chooseCountry(current.name));
    setGuess('');
    setClues([]);
    setMessage('');
    setFinished(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!guess.trim() || finished) return;

    const guessed = findGeodleFact(guess);
    if (!guessed) {
      setMessage('Country not found. Try another country name.');
      return;
    }

    const clue = buildClue(guessed, target);
    const solved = guessed.name === target.name;
    const outOfAttempts = clues.length + 1 >= 6;

    setClues((items) => [...items, clue]);
    setGuess('');
    setMessage('');

    if (solved || outOfAttempts) {
      setFinished(true);
      setPlayed((count) => count + 1);
      if (solved) setWins((count) => count + 1);
    }
  };

  const clueClass = (value: Status) => value === 'correct'
    ? 'bg-emerald-500 text-white'
    : value === 'higher'
      ? 'bg-sky-600 text-white'
      : value === 'lower'
        ? 'bg-blue-700 text-white'
        : 'bg-rose-600 text-white';
  const clueSymbol = (value: Status) => value === 'correct' ? '✓' : value === 'higher' ? '↑' : value === 'lower' ? '↓' : '×';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
          </Button>
          <div className="flex items-center gap-2 font-display font-bold">
            <Globe2 className="w-5 h-5 text-primary" /> Geodle Trainer
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <section className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-display font-bold">Geodle Training</h1>
          <p className="text-muted-foreground">Six attempts to find the hidden country. Each guess gives clues.</p>
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xl font-mono font-bold text-primary">{attempt > 6 ? 6 : attempt}/6</p>
              <p className="text-xs text-muted-foreground">Attempt</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xl font-mono font-bold">{wins}</p>
              <p className="text-xs text-muted-foreground">Solved</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xl font-mono font-bold">{played}</p>
              <p className="text-xs text-muted-foreground">Played</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card shadow-lg overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b">
            <span className="font-bold">Hidden country</span>
            <span className="text-sm text-muted-foreground">{left} guesses left</span>
          </div>

          <div className="p-4 overflow-x-auto">
            {clues.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Make your first guess to reveal clues.</p>
            ) : (
              <table className="w-full text-xs md:text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b">
                    <th className="text-left py-2">Country</th>
                    <th>Continent</th>
                    <th>Population</th>
                    <th>Landlocked</th>
                    <th>Religion</th>
                    <th>Temp.</th>
                    <th>Government</th>
                  </tr>
                </thead>
                <tbody>
                  {clues.map((clue, index) => (
                    <tr key={`${clue.country}-${index}`} className="border-b border-border/60">
                      <td className="py-3 font-medium">
                        <span className="mr-2">{index + 1}.</span>
                        <img src={`https://flagcdn.com/w40/${clue.code.toLowerCase()}.png`} alt="" className="inline-block w-7 rounded mr-2" />
                        {clue.country}
                      </td>
                      {[
                        clue.continent,
                        { value: clue.population.value.toLocaleString('en-US'), status: clue.population.status },
                        clue.landlocked,
                        clue.religion,
                        { value: `${clue.temperature.value}°C`, status: clue.temperature.status },
                        clue.government,
                      ].map((item: any, i) => (
                        <td key={i} className="text-center py-3">
                          <span className={`inline-flex min-w-7 h-7 px-2 rounded items-center justify-center font-bold ${clueClass(item.status)}`}>{clueSymbol(item.status)}</span>
                          <div className="mt-1 text-muted-foreground">{item.value}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {finished && (
          <div className={`rounded-xl p-4 text-center ${clues.at(-1)?.country === target.name ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
            {clues.at(-1)?.country === target.name ? (
              <p className="font-bold flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> Correct! The country was {target.name}.</p>
            ) : (
              <p className="font-bold flex items-center justify-center gap-2"><XCircle className="w-5 h-5" /> The correct answer was {target.name}.</p>
            )}
          </div>
        )}

        <form onSubmit={submit} className="rounded-2xl border bg-card p-3 flex gap-2">
          <Input
            list="geodle-countries"
            value={guess}
            onChange={(event) => {
              setGuess(event.target.value);
              if (message) setMessage('');
            }}
            disabled={finished}
            placeholder="Type a country..."
            className="h-12 text-lg"
            autoComplete="off"
          />
          <datalist id="geodle-countries">
            {countryNames.map((name) => <option key={name} value={name} />)}
          </datalist>
          <Button type="submit" size="lg" disabled={finished || !guess.trim()}>Validate</Button>
          <Button type="button" variant="outline" size="lg" onClick={reset}>
            {finished ? <RotateCcw className="w-4 h-4" /> : <SkipForward className="w-4 h-4" />}
          </Button>
        </form>

        {message && <p className="text-center text-sm text-destructive">{message}</p>}

        <div className="rounded-xl border bg-card p-3 flex flex-wrap items-center justify-center gap-4 text-sm">
          <span><span className="inline-flex w-7 h-7 rounded bg-emerald-500 text-white items-center justify-center font-bold mr-1">✓</span> Correct</span>
          <span><span className="inline-flex w-7 h-7 rounded bg-rose-600 text-white items-center justify-center font-bold mr-1">×</span> Incorrect</span>
          <span><span className="inline-flex w-7 h-7 rounded bg-sky-600 text-white items-center justify-center font-bold mr-1">↑</span> Answer is higher</span>
          <span><span className="inline-flex w-7 h-7 rounded bg-blue-700 text-white items-center justify-center font-bold mr-1">↓</span> Answer is lower</span>
        </div>
      </main>
    </div>
  );
}
