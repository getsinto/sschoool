import { emailQueue } from './queue';
import { SendEmailOptions, EmailTemplateType } from '@/types/email';

export class EmailScheduler {
  /**
   * Send welcome email immediately
   */
  static async sendWelcomeEmail(
    email: string,
    firstName: string,
    role: string
  ): Promise<string> {
    return emailQueue.addToQueue({
      to: email,
      subject: 'Welcome to Our Learning Platform!',
      template: 'welcome',
      data: {
        firstName,
        role,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@yourdomain.com',
      },
      priority: 'high',
    }, 10);
  }

  /**
   * Send email verification
   */
  static async sendEmailVerification(
    email: string,
    firstName: string,
    verificationToken: string
  ): Promise<string> {
    return emailQueue.addToQueue({
      to: email,
      subject: 'Verify Your Email Address',
      template: 'email-verification',
      data: {
        firstName,
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`,
        expiresIn: '24 hours',
      },
      priority: 'high',
    }, 10);
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(
    email: string,
    firstName: string,
    resetToken: string
  ): Promise<string> {
    return emailQueue.addToQueue({
      to: email,
      subject: 'Reset Your Password',
      template: 'password-reset',
      data: {
        firstName,
        resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`,
        expiresIn: '1 hour',
      },
      priority: 'high',
    }, 10);
  }

  /**
   * Send course enrollment confirmation
   */
  static async sendEnrollmentConfirmation(
    email: string,
    studentName: string,
    courseData: {
      title: string;
      instructor: string;
      thumbnail?: string;
      startDate?: string;
    }
  ): Promise<string> {
    return emailQueue.addToQueue({
      to: email,
      subject: `You're Enrolled in ${courseData.title}!`,
      template: 'enrollment-confirmation',
      data: {
        studentName,
        courseTitle: courseData.title,
        instructorName: courseData.instructor,
        courseThumbnail: courseData.thumbnail,
        startDate: courseData.startDate,
        courseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/student/courses`,
      },
      priority: 'high',
    }, 9);
  }

  /**
   * Send payment receipt
   */
  static async sendPaymentReceipt(
    email: string,
    customerName: string,
    paymentData: {
      amount: number;
      currency: string;
      transactionId: string;
      courseName: string;
      invoiceUrl?: string;
    }
  ): Promise<string> {
    return emailQueue.addToQueue({
      to: email,
      subject: 'Payment Receipt - Thank You!',
      template: 'payment-receipt',
      data: {
        customerName,
        amount: paymentData.amount,
        currency: paymentData.currency,
        transactionId: paymentData.transactionId,
        courseName: paymentData.courseName,
        invoiceUrl: paymentData.invoiceUrl,
        date: new Date().toLocaleDateString(),
      },
      priority: 'high',
    }, 9);
  }

  /**
   * Schedule live class reminder (24 hours before)
   */
  static async scheduleLiveClassReminder(
    email: string,
    studentName: string,
    classData: {
      title: string;
      courseName: string;
      startTime: Date;
      duration: number;
      meetingUrl: string;
      meetingPassword?: string;
    },
    hoursBeforeClass: number = 24
  ): Promise<string> {
    const scheduledAt = new Date(classData.startTime);
    scheduledAt.setHours(scheduledAt.getHours() - hoursBeforeClass);

    const options: SendEmailOptions = {
      to: email,
      subject: `Reminder: ${classData.title} starts in ${hoursBeforeClass} hours`,
      template: 'live-class-reminder',
      data: {
        studentName,
        classTitle: classData.title,
        courseName: classData.courseName,
        startTime: classData.startTime.toLocaleString(),
        duration: classData.duration,
        meetingUrl: classData.meetingUrl,
        meetingPassword: classData.meetingPassword,
        calendarUrl: this.generateCalendarUrl(classData),
      },
      scheduledAt,
      priority: 'high',
    };

    return emailQueue.scheduleEmail(options, scheduledAt);
  }

  /**
   * Schedule assignment due reminder
   */
  static async scheduleAssignmentReminder(
    email: string,
    studentName: string,
    assignmentData: {
      title: string;
      courseName: string;
      dueDate: Date;
      submissionUrl: string;
    },
    daysBeforeDue: number = 1
  ): Promise<string> {
    const scheduledAt = new Date(assignmentData.dueDate);
    scheduledAt.setDate(scheduledAt.getDate() - daysBeforeDue);

    const isUrgent = daysBeforeDue === 1;

    const options: SendEmailOptions = {
      to: email,
      subject: isUrgent 
        ? `⚠️ Urgent: ${assignmentData.title} due tomorrow!`
        : `Reminder: ${assignmentData.title} due in ${daysBeforeDue} days`,
      template: 'assignment-due-reminder',
      data: {
        studentName,
        assignmentTitle: assignmentData.title,
        courseName: assignmentData.courseName,
        dueDate: assignmentData.dueDate.toLocaleString(),
        submissionUrl: assignmentData.submissionUrl,
        isUrgent,
        timeRemaining: this.calculateTimeRemaining(assignmentData.dueDate),
      },
      scheduledAt,
      priority: isUrgent ? 'high' : 'normal',
    };

    return emailQueue.scheduleEmail(options, scheduledAt);
  }

  /**
   * Send quiz available notification
   */
  static async sendQuizAvailable(
    email: string,
    studentName: string,
    quizData: {
      title: string;
      courseName: string;
      availableUntil?: Date;
      quizUrl: string;
    }
  ): Promise<string> {
    return emailQueue.addToQueue({
      to: email,
      subject: `New Quiz Available: ${quizData.title}`,
      template: 'quiz-available',
      data: {
        studentName,
        quizTitle: quizData.title,
        courseName: quizData.courseName,
        availableUntil: quizData.availableUntil?.toLocaleString(),
        quizUrl: quizData.quizUrl,
      },
      priority: 'normal',
    }, 6);
  }

  /**
   * Send grade posted notification
   */
  static async sendGradePosted(
    email: string,
    studentName: string,
    gradeData: {
      assessmentName: string;
      courseName: string;
      grade: number;
      percentage: number;
      passed: boolean;
      feedback?: string;
      viewUrl: string;
    }
  ): Promise<string> {
    return emailQueue.addToQueue({
      to: email,
      subject: `Grade Posted: ${gradeData.assessmentName}`,
      template: 'grade-posted',
      data: {
        studentName,
        assessmentName: gradeData.assessmentName,
        courseName: gradeData.courseName,
        grade: gradeData.grade,
        percentage: gradeData.percentage,
        passed: gradeData.passed,
        feedback: gradeData.feedback,
        viewUrl: gradeData.viewUrl,
      },
      priority: 'normal',
    }, 7);
  }

  /**
   * Send certificate earned notification
   */
  static async sendCertificateEarned(
    email: string,
    studentName: string,
    certificateData: {
      courseName: string;
      completionDate: Date;
      certificateUrl: string;
      certificatePreview?: string;
    }
  ): Promise<string> {
    return emailQueue.addToQueue({
      to: email,
      subject: `🎉 Congratulations! You've earned a certificate`,
      template: 'certificate-earned',
      data: {
        studentName,
        courseName: certificateData.courseName,
        completionDate: certificateData.completionDate.toLocaleDateString(),
        certificateUrl: certificateData.certificateUrl,
        certificatePreview: certificateData.certificatePreview,
        linkedInShareUrl: this.generateLinkedInShareUrl(certificateData.courseName),
      },
      priority: 'normal',
    }, 8);
  }

  /**
   * Send announcement email
   */
  static async sendAnnouncement(
    email: string,
    recipientName: string,
    announcementData: {
      title: string;
      content: string;
      author: string;
      link?: string;
    }
  ): Promise<string> {
    return emailQueue.addToQueue({
      to: email,
      subject: announcementData.title,
      template: 'announcement',
      data: {
        recipientName,
        title: announcementData.title,
        content: announcementData.content,
        author: announcementData.author,
        link: announcementData.link,
        date: new Date().toLocaleDateString(),
      },
      priority: 'normal',
    }, 5);
  }

  /**
   * Send teacher message notification
   */
  static async sendTeacherMessage(
    email: string,
    studentName: string,
    messageData: {
      teacherName: string;
      subject: string;
      preview: string;
      messageUrl: string;
    }
  ): Promise<string> {
    return emailQueue.addToQueue({
      to: email,
      subject: `New message from ${messageData.teacherName}`,
      template: 'teacher-message',
      data: {
        studentName,
        teacherName: messageData.teacherName,
        messageSubject: messageData.subject,
        messagePreview: messageData.preview,
        messageUrl: messageData.messageUrl,
      },
      priority: 'normal',
    }, 6);
  }

  /**
   * Schedule parent weekly report (every Sunday)
   */
  static async scheduleParentWeeklyReport(
    email: string,
    parentName: string,
    reportData: {
      childName: string;
      weekStart: Date;
      weekEnd: Date;
      coursesProgress: any[];
      grades: any[];
      attendance: any;
      upcomingSchedule: any[];
      teacherComments?: string[];
      reportUrl: string;
    }
  ): Promise<string> {
    // Schedule for next Sunday at 6 PM
    const scheduledAt = this.getNextSunday();
    scheduledAt.setHours(18, 0, 0, 0);

    const options: SendEmailOptions = {
      to: email,
      subject: `Weekly Progress Report for ${reportData.childName}`,
      template: 'parent-weekly-report',
      data: {
        parentName,
        childName: reportData.childName,
        weekStart: reportData.weekStart.toLocaleDateString(),
        weekEnd: reportData.weekEnd.toLocaleDateString(),
        coursesProgress: reportData.coursesProgress,
        grades: reportData.grades,
        attendance: reportData.attendance,
        upcomingSchedule: reportData.upcomingSchedule,
        teacherComments: reportData.teacherComments,
        reportUrl: reportData.reportUrl,
      },
      scheduledAt,
      priority: 'normal',
    };

    return emailQueue.scheduleEmail(options, scheduledAt);
  }

  /**
   * Helper: Generate calendar URL for class
   */
  private static generateCalendarUrl(classData: any): string {
    // Generate Google Calendar add event URL
    const startTime = new Date(classData.startTime);
    const endTime = new Date(startTime.getTime() + classData.duration * 60000);
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: classData.title,
      dates: `${this.formatDateForCalendar(startTime)}/${this.formatDateForCalendar(endTime)}`,
      details: `Join class: ${classData.meetingUrl}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /**
   * Helper: Format date for calendar
   */
  private static formatDateForCalendar(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  /**
   * Helper: Calculate time remaining
   */
  private static calculateTimeRemaining(dueDate: Date): string {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  /**
   * Helper: Get next Sunday
   */
  private static getNextSunday(): Date {
    const today = new Date();
    const daysUntilSunday = 7 - today.getDay();
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    return nextSunday;
  }

  /**
   * Helper: Generate LinkedIn share URL
   */
  private static generateLinkedInShareUrl(courseName: string): string {
    const text = `I just completed ${courseName}!`;
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL || '')}&title=${encodeURIComponent(text)}`;
  }
}

export default EmailScheduler;
