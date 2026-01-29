'use client';

import { login } from './actions';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit"
      disabled={pending}
      className="w-full bg-zinc-100 text-black text-[11px] font-bold uppercase tracking-[0.15em] py-4 rounded-xl hover:bg-white transition-all shadow-lg shadow-white/5 active:scale-[0.98] disabled:opacity-50"
    >
      {pending ? 'Verifying...' : 'Continue'}
    </button>
  );
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="bg-[#0a0c10] border border-zinc-800/50 p-8 rounded-3xl shadow-2xl">
      <form action={login} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
            Email Address
          </label>
          <input 
            name="email" // MUST MATCH formData.get('email')
            type="email" 
            required
            placeholder="name@company.com"
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
            Password
          </label>
          <input 
            name="password" // MUST MATCH formData.get('password')
            type="password" 
            required
            placeholder="••••••••"
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all"
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}