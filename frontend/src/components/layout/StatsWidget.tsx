import React, { useEffect, useState } from "react";
import { statsService } from "../../services/stats.service";
import { apiService } from "../../services/api";

const StatsWidget: React.FC = () => {
  const [registered, setRegistered] = useState<number | null>(null);
  const [todayVisits, setTodayVisits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // total registered users (lightweight count via /users)
        const users = await apiService.get("/users");
        setRegistered(Array.isArray(users.data) ? users.data.length : null);

        // today's visits
        const today = new Date().toISOString().slice(0, 10);
        const summary = await statsService.getSummary(today, today);
        // backend returns { total, byDay } in our implementation
        const totalToday = (summary as any)?.byDay?.[0]?.count ?? null;
        setTodayVisits(totalToday);
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

  return (
    <div className="m-3 p-3 rounded-xl border border-token bg-card shadow-sm text-sm">
      <div className="font-semibold mb-2">MLN122 Class</div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[var(--text-muted)]">Active today</span>
        <span className="font-medium">
          {loading ? "--" : todayVisits ?? "--"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[var(--text-muted)]">Registered users</span>
        <span className="font-medium">
          {loading ? "--" : registered ?? "--"}
        </span>
      </div>
    </div>
  );
};

export default StatsWidget;
