'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Search,
  RefreshCw 
} from 'lucide-react';

interface LogStats {
  total_requests: number;
  total_errors: number;
  avg_latency: number;
}

interface ApiLog {
  id: string;
  path: string;
  method: string;
  status_code: number;
  duration_ms: number;
  created_at: string;
}

export default function AdminOverview() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [stats, setStats] = useState<LogStats>({ total_requests: 0, total_errors: 0, avg_latency: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    
    // 1. Get Recent Logs
    const { data: logData, error } = await supabase
      .from('api_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) console.error(error);
    
    if (logData) {
      setLogs(logData);
      
      // 2. Calculate Simple Stats (Client-side for demo)
      const total = logData.length;
      const errors = logData.filter(l => l.status_code >= 400).length;
      const totalLatency = logData.reduce((acc, curr) => acc + (curr.duration_ms || 0), 0);
      
      setStats({
        total_requests: total,
        total_errors: errors,
        avg_latency: total > 0 ? Math.round(totalLatency / total) : 0
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Optional: Real-time subscription
    const channel = supabase
      .channel('api_logs_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'api_logs' }, (payload) => {
        setLogs(prev => [payload.new as ApiLog, ...prev].slice(0, 50));
        setStats(prev => ({ ...prev, total_requests: prev.total_requests + 1 }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#0a0c10] min-h-screen text-zinc-200">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Overview</h1>
          <p className="text-zinc-500">Real-time API monitoring and usage statistics.</p>
        </div>
        <button 
          onClick={fetchData}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-white/10"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Requests (24h)" 
          value={stats.total_requests.toLocaleString()} 
          icon={<Activity className="text-blue-400" />} 
          trend="+12%"
        />
        <StatCard 
          label="Error Rate" 
          value={`${((stats.total_errors / stats.total_requests || 0) * 100).toFixed(1)}%`} 
          icon={<AlertTriangle className="text-red-400" />} 
          trend={stats.total_errors > 0 ? "High" : "Stable"}
          trendColor={stats.total_errors > 0 ? "text-red-400" : "text-green-400"}
        />
        <StatCard 
          label="Avg Latency" 
          value={`${stats.avg_latency}ms`} 
          icon={<Clock className="text-yellow-400" />} 
          trend="Good"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Recent Activity Log */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Live Traffic</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              <input 
                type="text" 
                placeholder="Search endpoints..." 
                className="bg-zinc-900 border border-zinc-800 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <div className="bg-[#111318] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 border-b border-white/5">
                <tr>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Endpoint</th>
                  <th className="px-6 py-3">Latency</th>
                  <th className="px-6 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No logs found</td>
                  </tr>
                ) : logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(log.status_code)}`}>
                        {log.status_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">{log.method}</td>
                    <td className="px-6 py-4 text-zinc-200">{log.path}</td>
                    <td className="px-6 py-4 text-zinc-500">{log.duration_ms}ms</td>
                    <td className="px-6 py-4 text-right text-zinc-600 text-xs">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Usage Breakdown */}
        <div className="space-y-6">
           <div className="bg-[#111318] border border-white/5 p-6 rounded-xl">
             <h3 className="text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2">
               <Database size={16} /> API Keys Active
             </h3>
             <div className="space-y-4">
               {/* Mock Data for visual structure */}
               <UsageBar label="Mobile App (iOS)" count={1240} percent={65} color="bg-blue-500" />
               <UsageBar label="Web Dashboard" count={430} percent={25} color="bg-purple-500" />
               <UsageBar label="CI/CD Pipeline" count={85} percent={10} color="bg-green-500" />
             </div>
           </div>

           <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
             <h4 className="text-blue-400 text-sm font-bold mb-1">System Status</h4>
             <p className="text-xs text-blue-300/80">All systems operational. Database load is normal.</p>
           </div>
        </div>

      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function StatCard({ label, value, icon, trend, trendColor = "text-green-400" }: any) {
  return (
    <div className="bg-[#111318] border border-white/5 p-6 rounded-xl flex items-start justify-between relative overflow-hidden group">
       <div className="z-10">
          <p className="text-zinc-500 text-sm font-medium mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
          <span className={`text-xs font-bold mt-2 inline-block ${trendColor}`}>
             {trend}
          </span>
       </div>
       <div className="p-3 bg-white/5 rounded-lg group-hover:scale-110 transition-transform">
          {icon}
       </div>
    </div>
  );
}

function UsageBar({ label, count, percent, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-zinc-300">{label}</span>
        <span className="text-zinc-500">{count} req</span>
      </div>
      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function getStatusColor(code: number) {
  if (code >= 500) return 'bg-red-500/10 text-red-500 border-red-500/20';
  if (code >= 400) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
  if (code >= 300) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  return 'bg-green-500/10 text-green-500 border-green-500/20';
}