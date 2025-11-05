import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

interface CloudinaryUsage {
  storage: number; // bytes
  bandwidth: number; // bytes
  transformations: number;
  requests: number;
}

@Injectable()
export class CloudinaryMonitorService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryMonitorService.name);
  private readonly FREE_TIER_LIMITS = {
    storage: 25 * 1024 * 1024 * 1024, // 25GB
    bandwidth: 25 * 1024 * 1024 * 1024, // 25GB/month
    transformations: 1000, // 1000 credits/month
  };

  private readonly WARNING_THRESHOLD = 0.8; // 80% of limit
  private readonly CRITICAL_THRESHOLD = 0.95; // 95% of limit

  async onModuleInit() {
    // Check usage on startup
    await this.checkUsage();
    
    // Schedule periodic checks (every hour)
    setInterval(() => {
      this.checkUsage().catch((err) => {
        this.logger.error('Error checking Cloudinary usage:', err);
      });
    }, 3600000); // 1 hour
  }

  /**
   * Check Cloudinary usage and log warnings if approaching limits
   */
  async checkUsage(): Promise<void> {
    try {
      // Note: Cloudinary Admin API requires paid plan for detailed usage stats
      // For free tier, we can only estimate based on uploads
      // This is a basic implementation - you may need to upgrade to get real-time stats

      const usage = await this.getEstimatedUsage();

      // Check storage
      const storagePercent = usage.storage / this.FREE_TIER_LIMITS.storage;
      if (storagePercent >= this.CRITICAL_THRESHOLD) {
        this.logger.error(
          `🚨 CRITICAL: Cloudinary storage usage at ${(storagePercent * 100).toFixed(2)}% (${this.formatBytes(usage.storage)} / ${this.formatBytes(this.FREE_TIER_LIMITS.storage)})`,
        );
      } else if (storagePercent >= this.WARNING_THRESHOLD) {
        this.logger.warn(
          `⚠️ WARNING: Cloudinary storage usage at ${(storagePercent * 100).toFixed(2)}% (${this.formatBytes(usage.storage)} / ${this.formatBytes(this.FREE_TIER_LIMITS.storage)})`,
        );
      }

      // Check bandwidth (monthly - would need to track manually)
      const bandwidthPercent = usage.bandwidth / this.FREE_TIER_LIMITS.bandwidth;
      if (bandwidthPercent >= this.CRITICAL_THRESHOLD) {
        this.logger.error(
          `🚨 CRITICAL: Cloudinary bandwidth usage at ${(bandwidthPercent * 100).toFixed(2)}% (${this.formatBytes(usage.bandwidth)} / ${this.formatBytes(this.FREE_TIER_LIMITS.bandwidth)})`,
        );
      } else if (bandwidthPercent >= this.WARNING_THRESHOLD) {
        this.logger.warn(
          `⚠️ WARNING: Cloudinary bandwidth usage at ${(bandwidthPercent * 100).toFixed(2)}% (${this.formatBytes(usage.bandwidth)} / ${this.formatBytes(this.FREE_TIER_LIMITS.bandwidth)})`,
        );
      }

      // Check transformations
      const transformationsPercent = usage.transformations / this.FREE_TIER_LIMITS.transformations;
      if (transformationsPercent >= this.CRITICAL_THRESHOLD) {
        this.logger.error(
          `🚨 CRITICAL: Cloudinary transformations at ${(transformationsPercent * 100).toFixed(2)}% (${usage.transformations} / ${this.FREE_TIER_LIMITS.transformations})`,
        );
      } else if (transformationsPercent >= this.WARNING_THRESHOLD) {
        this.logger.warn(
          `⚠️ WARNING: Cloudinary transformations at ${(transformationsPercent * 100).toFixed(2)}% (${usage.transformations} / ${this.FREE_TIER_LIMITS.transformations})`,
        );
      }

      // Log current usage (info level)
      if (storagePercent < this.WARNING_THRESHOLD) {
        this.logger.log(
          `Cloudinary usage: Storage ${(storagePercent * 100).toFixed(1)}%, Transformations ${(transformationsPercent * 100).toFixed(1)}%`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to check Cloudinary usage:', error);
    }
  }

  /**
   * Get estimated usage (for free tier - Admin API requires paid plan)
   * In production, you should track this in your database
   */
  private async getEstimatedUsage(): Promise<CloudinaryUsage> {
    // Note: Cloudinary Admin API requires paid plan
    // For free tier, you need to track usage manually in your database
    // This is a placeholder - implement based on your upload tracking

    // TODO: Implement actual usage tracking from your database
    // Example: Query your database for total uploads, sizes, etc.

    return {
      storage: 0, // Track in database
      bandwidth: 0, // Track in database
      transformations: 0, // Track in database
      requests: 0, // Track in database
    };
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Log upload event (call this after each upload)
   */
  async logUpload(fileSize: number, transformed: boolean = true): Promise<void> {
    // In production, store this in database for tracking
    this.logger.debug(`Upload logged: ${this.formatBytes(fileSize)}, transformed: ${transformed}`);
    
    // Check usage after each upload
    await this.checkUsage();
  }

  /**
   * Get current usage status
   */
  async getUsageStatus(): Promise<{
    storage: { used: number; limit: number; percent: number };
    bandwidth: { used: number; limit: number; percent: number };
    transformations: { used: number; limit: number; percent: number };
  }> {
    const usage = await this.getEstimatedUsage();
    return {
      storage: {
        used: usage.storage,
        limit: this.FREE_TIER_LIMITS.storage,
        percent: (usage.storage / this.FREE_TIER_LIMITS.storage) * 100,
      },
      bandwidth: {
        used: usage.bandwidth,
        limit: this.FREE_TIER_LIMITS.bandwidth,
        percent: (usage.bandwidth / this.FREE_TIER_LIMITS.bandwidth) * 100,
      },
      transformations: {
        used: usage.transformations,
        limit: this.FREE_TIER_LIMITS.transformations,
        percent: (usage.transformations / this.FREE_TIER_LIMITS.transformations) * 100,
      },
    };
  }
}

