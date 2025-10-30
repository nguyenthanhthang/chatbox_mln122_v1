import { Body, Controller, Get, Ip, Post, Query, Req } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('api/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Post('visit')
  async recordVisit(
    @Ip() ip: string,
    @Req() req: any,
    @Body()
    body: { path?: string; userId?: string; userAgent?: string; date?: string },
  ) {
    const userAgent = body?.userAgent || req.headers['user-agent'];
    const path = body?.path || req.path;
    const date = (body?.date ||
      new Date().toISOString().slice(0, 10)) as string;
    const userId = body?.userId;

    return this.statsService.recordVisit({ ip, userAgent, path, date, userId });
  }

  @Get('summary')
  async getSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.statsService.getSummary(from, to);
  }
}
