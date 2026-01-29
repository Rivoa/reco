"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Mon", users: 2400 },
  { name: "Tue", users: 1398 },
  { name: "Wed", users: 9800 },
  { name: "Thu", users: 3908 },
  { name: "Fri", users: 4800 },
  { name: "Sat", users: 3800 },
  { name: "Sun", users: 4300 },
];

export default function Chart() {
  return (
    <div className="h-80 w-full" style={{ minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2f81f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2f81f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#8b949e"
            fontSize={12}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            stroke="#8b949e"
            fontSize={12}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#161b22",
              borderColor: "#30363d",
              borderRadius: "8px",
              color: "#f0f2f5",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
            }}
            itemStyle={{ color: "#2f81f7" }}
            cursor={{ stroke: '#2f81f7', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#2f81f7"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorUsers)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
