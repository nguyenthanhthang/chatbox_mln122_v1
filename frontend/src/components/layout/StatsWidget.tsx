import React, { useEffect, useMemo, useState } from "react";
import { statsService } from "../../services/stats.service";
import { apiService } from "../../services/api";

const StatsWidget: React.FC = () => {
  const [registered, setRegistered] = useState<number | null>(null);
  const [todayVisits, setTodayVisits] = useState<number | null>(null);
  const [week, setWeek] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // total registered users (lightweight count via /users)
        const users = await apiService.get("/users");
        setRegistered(Array.isArray(users.data) ? users.data.length : null);

        // visits last 7 days
        const today = new Date();
        const from = new Date(today);
        from.setDate(today.getDate() - 6);
        const iso = (d: Date) => d.toISOString().slice(0, 10);
        const res = await statsService.getSummary(iso(from), iso(today));
        const byDay = ((res as any)?.byDay || []) as Array<{
          _id: string;
          count: number;
        }>;
        const map = new Map(byDay.map((d) => [d._id, d.count]));
        const pts: { date: string; count: number }[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(from);
          d.setDate(from.getDate() + i);
          const k = iso(d);
          pts.push({ date: k, count: map.get(k) || 0 });
        }
        setWeek(pts);
        setTodayVisits(pts[6]?.count ?? 0);
      } catch (e) {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => clearInterval(id);
  }, []);

  const maxVal = useMemo(
    () => Math.max(1, ...week.map((p) => p.count)),
    [week]
  );

  return (
    <div className="m-3 p-3 rounded-xl border border-token bg-card shadow-sm text-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">MLN122</div>
        <div className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent)]/20">
          stats
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="p-2 rounded-lg bg-[var(--bg)] border border-token">
          <div className="text-[var(--text-muted)] text-xs">Active today</div>
          <div className="text-base font-semibold">
            {loading ? "--" : todayVisits ?? "--"}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg)] border border-token">
          <div className="text-[var(--text-muted)] text-xs">
            Registered users
          </div>
          <div className="text-base font-semibold">
            {loading ? "--" : registered ?? "--"}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <div className="flex items-end gap-1 h-10">
          {week.map((p, i) => (
            <div
              key={i}
              title={`${p.date}: ${p.count}`}
              className="flex-1 bg-[var(--primary)]/70 rounded-sm"
              style={{ height: `${(p.count / maxVal) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
          <span>−6d</span>
          <span>today</span>
        </div>
      </div>
    </div>
  );
};

export default StatsWidget;
