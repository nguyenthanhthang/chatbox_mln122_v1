import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visit, VisitDocument } from '../database/schemas/visit.schema';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Visit.name) private readonly visitModel: Model<VisitDocument>,
  ) {}

  async recordVisit(params: {
    userId?: string;
    ip: string;
    userAgent?: string;
    path?: string;
    date: string; // YYYY-MM-DD
  }) {
    const visit = new this.visitModel(params);
    await visit.save();
    return { success: true };
  }

  async getSummary(from?: string, to?: string) {
    const match: Record<string, unknown> = {};
    if (from || to) {
      match.createdAt = {} as Record<string, unknown>;
      if (from)
        (match.createdAt as Record<string, unknown>).$gte = new Date(from);
      if (to) (match.createdAt as Record<string, unknown>).$lte = new Date(to);
    }

    const pipeline = [
      Object.keys(match).length ? { $match: match } : undefined,
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ].filter(Boolean) as any[];

    const byDay = await this.visitModel.aggregate(pipeline);
    const total = byDay.reduce(
      (acc: number, d: any) => acc + (d.count || 0),
      0,
    );
    return { total, byDay };
  }
}
