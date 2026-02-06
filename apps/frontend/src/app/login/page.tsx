'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Scale, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      router.push(redirect);
    } catch {
      // Erro já está no store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center shadow-glow">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Jurix</span>
          </Link>
          <p className="text-slate-400">Entre com suas credenciais para acessar</p>
        </div>

        {/* Form Card */}
        <div className="card animate-slide-up">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-danger-500/10 border border-danger-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger-500">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-12"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'btn-primary w-full',
                isLoading && 'opacity-70 cursor-wait'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center mb-3">
              Credenciais de demonstração:
            </p>
            <div className="space-y-2 text-xs">
              <DemoCredential
                role="Admin"
                email="admin@jurix.com"
                password="Admin@123"
                onSelect={(e, p) => { setEmail(e); setPassword(p); }}
              />
              <DemoCredential
                role="Legal"
                email="legal@jurix.com"
                password="Legal@123"
                onSelect={(e, p) => { setEmail(e); setPassword(p); }}
              />
              <DemoCredential
                role="Viewer"
                email="viewer@jurix.com"
                password="Viewer@123"
                onSelect={(e, p) => { setEmail(e); setPassword(p); }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoCredential({
  role,
  email,
  password,
  onSelect,
}: {
  role: string;
  email: string;
  password: string;
  onSelect: (email: string, password: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(email, password)}
      className="w-full p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 
                 flex items-center justify-between text-left transition-colors"
    >
      <span className="text-slate-400">
        <span className="font-medium text-slate-300">{role}:</span> {email}
      </span>
      <span className="text-slate-500 font-mono">{password}</span>
    </button>
  );
}

