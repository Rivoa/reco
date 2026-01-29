import LoginForm from './login-form';
import { Terminal } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Background Depth */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#0a0c10]/50 radial-mask" />
        <div className="absolute inset-0 opacity-[0.1]" 
             style={{ backgroundImage: `radial-gradient(circle, #27272a 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      </div>
      
      <div className="relative z-10 w-full max-w-[400px] space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 bg-zinc-100 rounded-2xl flex items-center justify-center shadow-2xl shadow-white/5">
            <Terminal className="h-6 w-6 text-black" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Sign in to Console</h1>
            <p className="text-sm text-zinc-500 mt-2">Access your workspace and management tools.</p>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}