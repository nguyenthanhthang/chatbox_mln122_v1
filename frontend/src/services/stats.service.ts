import { apiService } from "./api";

export interface RecordVisitRequest {
  path?: string;
  userId?: string;
  userAgent?: string;
  date?: string; // YYYY-MM-DD
}

export interface VisitSummaryItem {
  date: string;
  visits: number;
  uniqueVisitors?: number;
}

export interface VisitSummaryResponse {
  totalVisits: number;
  range: { from?: string; to?: string };
  breakdown: VisitSummaryItem[];
}

class StatsService {
  async recordVisit(
    data: RecordVisitRequest
  ): Promise<{ message: string } | any> {
    // Controller path is 'api/stats' while baseURL already ends with '/api'
    const response = await apiService.post("/stats/visit", data);
    return response.data;
  }

  async getSummary(from?: string, to?: string): Promise<VisitSummaryResponse> {
    const response = await apiService.get("/stats/summary", {
      params: { from, to },
    });
    return response.data;
  }
}

export const statsService = new StatsService();
