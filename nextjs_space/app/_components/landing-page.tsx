'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe2, Swords, MapPin, Trophy, ArrowRight, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function LandingPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        toast.error(res.error);
      } else {
        router.replace('/dashboard');
      }
    } catch (err: any) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? 'Signup failed');
        return;
      }
      // Auto login
      const loginRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (loginRes?.error) {
        toast.error('Account created. Please login.');
        setMode('login');
      } else {
        router.replace('/dashboard');
      }
    } catch (err: any) {
      toast.error('Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Globe2, title: 'Capitals Quiz', desc: 'Name the capital of any country in the world' },
    { icon: Swords, title: 'Mix Mode', desc: 'Mixed questions combining capitals and country knowledge' },
    { icon: MapPin, title: 'Map Guess', desc: 'Identify countries from their position on the map' },
    { icon: Trophy, title: 'Live Scores', desc: 'Compete head-to-head with real-time scoring' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-8xl">🌍</div>
        <div className="absolute top-40 right-20 text-6xl">🌎</div>
        <div className="absolute bottom-20 left-1/3 text-7xl">🌏</div>
        <div className="absolute top-1/2 right-10 text-5xl">🗺️</div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Globe2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight">
              Geo<span className="text-primary">Game</span>
            </h1>
          </div>
        </motion.header>

        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left - Hero */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-5xl md:text-6xl font-display font-bold tracking-tight mb-6 leading-tight">
              Challenge Your Friends to a
              <span className="text-primary block">Geography Duel</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-lg">
              Create a room, share the code, and battle head-to-head across three exciting game modes. The fastest and smartest player wins!
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{f.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
          >
            <div className="bg-card rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-lg)' }}>
              <div className="flex gap-2 mb-8">
                <Button
                  variant={mode === 'login' ? 'default' : 'ghost'}
                  className="flex-1"
                  onClick={() => setMode('login')}
                >
                  Sign In
                </Button>
                <Button
                  variant={mode === 'signup' ? 'default' : 'ghost'}
                  className="flex-1"
                  onClick={() => setMode('signup')}
                >
                  Sign Up
                </Button>
              </div>

              <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
                {mode === 'signup' && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Username"
                      value={username}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
