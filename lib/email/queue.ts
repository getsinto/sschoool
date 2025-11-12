import { EmailQueueJob, SendEmailOptions, EmailStatus } from '@/types/email';
import { EmailService } from './resend';

// In-memory queue (in production, use Redis or a proper job queue like Bull)
class EmailQueue {
  private queue: EmailQueueJob[] = [];
  private processing = false;
  private maxRetries = 3;

  /**
   * Add email to queue
   */
  async addToQueue(options: SendEmailOptions, priority: number = 5): Promise<string> {
    const job: EmailQueueJob = {
      id: this.generateId(),
      type: 'single',
      payload: options,
      priority,
      attempts: 0,
      maxAttempts: this.maxRetries,
      status: 'pending',
      createdAt: new Date(),
    };

    this.queue.push(job);
    this.sortQueue();

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }

    return job.id;
  }

  /**
   * Add bulk email to queue
   */
  async addBulkToQueue(
    recipients: string[],
    subject: string,
    template: string,
    data: Record<string, any>,
    priority: number = 3
  ): Promise<string> {
    const job: EmailQueueJob = {
      id: this.generateId(),
      type: 'bulk',
      payload: {
        recipients,
        subject,
        template: template as any,
        data,
      },
      priority,
      attempts: 0,
      maxAttempts: this.maxRetries,
      status: 'pending',
      createdAt: new Date(),
    };

    this.queue.push(job);
    this.sortQueue();

    if (!this.processing) {
      this.processQueue();
    }

    return job.id;
  }

  /**
   * Schedule email for later delivery
   */
  async scheduleEmail(options: SendEmailOptions, scheduledAt: Date): Promise<string> {
    const job: EmailQueueJob = {
      id: this.generateId(),
      type: 'scheduled',
      payload: { ...options, scheduledAt },
      priority: 5,
      attempts: 0,
      maxAttempts: this.maxRetries,
      status: 'pending',
      createdAt: new Date(),
    };

    this.queue.push(job);
    this.sortQueue();

    return job.id;
  }

  /**
   * Process queue (FIFO with priority)
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue[0];

      // Check if scheduled job is ready
      if (job.type === 'scheduled') {
        const scheduledAt = (job.payload as SendEmailOptions).scheduledAt;
        if (scheduledAt && new Date() < scheduledAt) {
          // Not ready yet, move to next job
          this.queue.shift();
          this.queue.push(job);
          continue;
        }
      }

      // Remove from queue
      this.queue.shift();

      // Process job
      await this.processJob(job);

      // Add small delay between jobs
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processing = false;
  }

  /**
   * Process individual job
   */
  private async processJob(job: EmailQueueJob): Promise<void> {
    job.status = 'processing';
    job.attempts++;

    try {
      if (job.type === 'bulk') {
        const payload = job.payload as any;
        const result = await EmailService.sendBulkEmails(
          payload.recipients,
          payload.subject,
          payload.template,
          payload.data
        );

        if (result.success) {
          job.status = 'sent';
          job.processedAt = new Date();
        } else {
          throw new Error(`Bulk email failed: ${result.errors.join(', ')}`);
        }
      } else {
        const payload = job.payload as SendEmailOptions;
        const result = await EmailService.sendEmail(payload);

        if (result.success) {
          job.status = 'sent';
          job.processedAt = new Date();
        } else {
          throw new Error(result.error || 'Email send failed');
        }
      }
    } catch (error) {
      job.error = error instanceof Error ? error.message : 'Unknown error';

      // Retry with exponential backoff
      if (job.attempts < job.maxAttempts) {
        job.status = 'pending';
        const delay = Math.pow(2, job.attempts) * 1000; // 2s, 4s, 8s
        
        setTimeout(() => {
          this.queue.push(job);
          this.sortQueue();
          if (!this.processing) {
            this.processQueue();
          }
        }, delay);
      } else {
        job.status = 'failed';
        console.error(`Email job ${job.id} failed after ${job.attempts} attempts:`, job.error);
      }
    }
  }

  /**
   * Sort queue by priority (higher priority first)
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    pending: number;
    processing: number;
    total: number;
  } {
    return {
      pending: this.queue.filter(j => j.status === 'pending').length,
      processing: this.queue.filter(j => j.status === 'processing').length,
      total: this.queue.length,
    };
  }

  /**
   * Get job by ID
   */
  getJob(id: string): EmailQueueJob | undefined {
    return this.queue.find(j => j.id === id);
  }

  /**
   * Clear failed jobs
   */
  clearFailedJobs(): number {
    const failedCount = this.queue.filter(j => j.status === 'failed').length;
    this.queue = this.queue.filter(j => j.status !== 'failed');
    return failedCount;
  }
}

// Export singleton instance
export const emailQueue = new EmailQueue();

export default emailQueue;
