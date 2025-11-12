import { createClient } from '@/lib/supabase/server';
import { EmailCategory, EmailFrequency, NotificationPreference } from '@/types/email';

/**
 * Email preferences management utility
 */
export class EmailPreferences {
  /**
   * Get user's notification preferences
   */
  static async getUserPreferences(userId: string): Promise<NotificationPreference[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user preferences:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Check if user can receive emails for a specific category
   */
  static async canSendEmail(
    userId: string, 
    category: EmailCategory
  ): Promise<{ canSend: boolean; frequency: EmailFrequency }> {
    const preferences = await this.getUserPreferences(userId);
    const categoryPref = preferences.find(p => p.category === category);

    if (!categoryPref) {
      return { canSend: true, frequency: 'immediate' };
    }

    return {
      canSend: categoryPref.enabled && categoryPref.frequency !== 'never',
      frequency: categoryPref.frequency
    };
  }

  /**
   * Update user's preference for a specific category
   */
  static async updatePreference(
    userId: string,
    category: EmailCategory,
    enabled: boolean,
    frequency: EmailFrequency = 'immediate'
  ): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        category,
        enabled,
        frequency,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,category'
      });

    if (error) {
      console.error('Error updating preference:', error);
      return false;
    }

    return true;
  }

  /**
   * Bulk update user preferences
   */
  static async updateMultiplePreferences(
    userId: string,
    preferences: Array<{
      category: EmailCategory;
      enabled: boolean;
      frequency: EmailFrequency;
    }>
  ): Promise<boolean> {
    const supabase = createClient();

    const updates = preferences.map(pref => ({
      user_id: userId,
      category: pref.category,
      enabled: pref.enabled,
      frequency: pref.frequency,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('notification_preferences')
      .upsert(updates, {
        onConflict: 'user_id,category'
      });

    if (error) {
      console.error('Error updating multiple preferences:', error);
      return false;
    }

    return true;
  }

  /**
   * Unsubscribe user from all marketing emails
   */
  static async unsubscribeFromMarketing(userId: string): Promise<boolean> {
    return this.updatePreference(userId, 'marketing', false, 'never');
  }

  /**
   * Unsubscribe user from all emails (except critical transactional)
   */
  static async unsubscribeFromAll(userId: string): Promise<boolean> {
    const marketingCategories: EmailCategory[] = [
      'announcements',
      'marketing'
    ];

    const updates = marketingCategories.map(category => ({
      category,
      enabled: false,
      frequency: 'never' as EmailFrequency
    }));

    return this.updateMultiplePreferences(userId, updates);
  }

  /**
   * Generate unsubscribe token for email links
   */
  static generateUnsubscribeToken(userId: string, category?: EmailCategory): string {
    const data = {
      userId,
      category,
      timestamp: Date.now()
    };
    
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  /**
   * Verify and decode unsubscribe token
   */
  static verifyUnsubscribeToken(token: string): {
    valid: boolean;
    userId?: string;
    category?: EmailCategory;
  } {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      if (decoded.timestamp < thirtyDaysAgo) {
        return { valid: false };
      }

      return {
        valid: true,
        userId: decoded.userId,
        category: decoded.category
      };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Get default preferences for new users
   */
  static getDefaultPreferences(): Array<{
    category: EmailCategory;
    enabled: boolean;
    frequency: EmailFrequency;
  }> {
    return [
      { category: 'course-updates', enabled: true, frequency: 'immediate' },
      { category: 'live-class-reminders', enabled: true, frequency: 'immediate' },
      { category: 'assignment-reminders', enabled: true, frequency: 'immediate' },
      { category: 'grade-notifications', enabled: true, frequency: 'immediate' },
      { category: 'payment-receipts', enabled: true, frequency: 'immediate' },
      { category: 'announcements', enabled: true, frequency: 'immediate' },
      { category: 'messages', enabled: true, frequency: 'immediate' },
      { category: 'marketing', enabled: true, frequency: 'weekly' }
    ];
  }

  /**
   * Initialize default preferences for a new user
   */
  static async initializeUserPreferences(userId: string): Promise<boolean> {
    const defaultPrefs = this.getDefaultPreferences();
    return this.updateMultiplePreferences(userId, defaultPrefs);
  }
}

export default EmailPreferences;
