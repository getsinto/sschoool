import { createClient } from '@/lib/supabase/server'

interface TicketNotificationData {
  ticketId: string
  ticketNumber: string
  userId: string
  userEmail: string
  subject: string
  type: 'created' | 'updated' | 'replied' | 'resolved' | 'closed' | 'assigned'
  message?: string
  assignedTo?: string
}

export async function sendTicketNotification(data: TicketNotificationData) {
  try {
    const supabase = createClient()

    // Get user preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', data.userId)
      .single()

    // Check if user wants email notifications for support tickets
    if (!preferences || !preferences.email_support) {
      console.log('User has disabled support email notifications')
      return
    }

    // Prepare email content based on notification type
    let subject = ''
    let body = ''

    switch (data.type) {
      case 'created':
        subject = `Support Ticket Created: #${data.ticketNumber}`
        body = `
          <h2>Your support ticket has been created</h2>
          <p>Thank you for contacting us. We have received your support request.</p>
          <p><strong>Ticket Number:</strong> #${data.ticketNumber}</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p>Our support team will review your ticket and respond within 24 hours.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/support/${data.ticketId}">View Ticket</a></p>
        `
        break

      case 'replied':
        subject = `New Reply on Ticket #${data.ticketNumber}`
        body = `
          <h2>You have a new reply on your support ticket</h2>
          <p><strong>Ticket:</strong> #${data.ticketNumber} - ${data.subject}</p>
          ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/support/${data.ticketId}">View and Reply</a></p>
        `
        break

      case 'resolved':
        subject = `Ticket Resolved: #${data.ticketNumber}`
        body = `
          <h2>Your support ticket has been resolved</h2>
          <p><strong>Ticket:</strong> #${data.ticketNumber} - ${data.subject}</p>
          <p>Our team has marked your ticket as resolved. If you need further assistance, you can reopen the ticket.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/support/${data.ticketId}">View Ticket</a></p>
        `
        break

      case 'closed':
        subject = `Ticket Closed: #${data.ticketNumber}`
        body = `
          <h2>Your support ticket has been closed</h2>
          <p><strong>Ticket:</strong> #${data.ticketNumber} - ${data.subject}</p>
          <p>This ticket has been closed. If you need further assistance, please create a new ticket.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/support">View All Tickets</a></p>
        `
        break

      case 'assigned':
        subject = `Ticket Assigned: #${data.ticketNumber}`
        body = `
          <h2>Your support ticket has been assigned</h2>
          <p><strong>Ticket:</strong> #${data.ticketNumber} - ${data.subject}</p>
          <p>A support team member has been assigned to your ticket and will be in touch soon.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/support/${data.ticketId}">View Ticket</a></p>
        `
        break

      default:
        subject = `Update on Ticket #${data.ticketNumber}`
        body = `
          <h2>Your support ticket has been updated</h2>
          <p><strong>Ticket:</strong> #${data.ticketNumber} - ${data.subject}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/support/${data.ticketId}">View Ticket</a></p>
        `
    }

    // Send email notification
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: data.userEmail,
        subject,
        html: body,
        category: 'support'
      })
    })

    if (!emailResponse.ok) {
      console.error('Failed to send email notification')
    }

    // Create in-app notification
    await supabase
      .from('notifications')
      .insert({
        user_id: data.userId,
        type: 'support',
        title: subject,
        message: `Ticket #${data.ticketNumber}: ${data.subject}`,
        link: `/support/${data.ticketId}`,
        read: false
      })

    console.log(`Notification sent for ticket #${data.ticketNumber}`)
  } catch (error) {
    console.error('Failed to send ticket notification:', error)
  }
}

export async function notifyStaffNewTicket(ticketData: {
  ticketId: string
  ticketNumber: string
  subject: string
  category: string
  priority: string
  userEmail: string
}) {
  try {
    const supabase = createClient()

    // Get all admin users
    const { data: admins } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('role', 'admin')

    if (!admins || admins.length === 0) {
      console.log('No admin users found')
      return
    }

    // Send notification to each admin
    for (const admin of admins) {
      // Check admin notification preferences
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', admin.id)
        .single()

      if (preferences && !preferences.email_support) {
        continue
      }

      // Send email
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: admin.email,
          subject: `New Support Ticket: #${ticketData.ticketNumber}`,
          html: `
            <h2>New Support Ticket Received</h2>
            <p><strong>Ticket:</strong> #${ticketData.ticketNumber}</p>
            <p><strong>Subject:</strong> ${ticketData.subject}</p>
            <p><strong>Category:</strong> ${ticketData.category}</p>
            <p><strong>Priority:</strong> ${ticketData.priority}</p>
            <p><strong>From:</strong> ${ticketData.userEmail}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/support/${ticketData.ticketId}">View and Respond</a></p>
          `,
          category: 'support'
        })
      })

      // Create in-app notification
      await supabase
        .from('notifications')
        .insert({
          user_id: admin.id,
          type: 'support',
          title: `New Support Ticket: #${ticketData.ticketNumber}`,
          message: `${ticketData.subject} (${ticketData.priority} priority)`,
          link: `/admin/support/${ticketData.ticketId}`,
          read: false
        })
    }

    console.log(`Staff notified about new ticket #${ticketData.ticketNumber}`)
  } catch (error) {
    console.error('Failed to notify staff:', error)
  }
}

export async function notifyAssignedStaff(data: {
  ticketId: string
  ticketNumber: string
  subject: string
  assignedToId: string
  assignedToEmail: string
}) {
  try {
    const supabase = createClient()

    // Check staff notification preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', data.assignedToId)
      .single()

    if (preferences && !preferences.email_support) {
      console.log('Staff member has disabled support notifications')
      return
    }

    // Send email
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: data.assignedToEmail,
        subject: `Ticket Assigned to You: #${data.ticketNumber}`,
        html: `
          <h2>A support ticket has been assigned to you</h2>
          <p><strong>Ticket:</strong> #${data.ticketNumber}</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p>Please review and respond to this ticket as soon as possible.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/support/${data.ticketId}">View Ticket</a></p>
        `,
        category: 'support'
      })
    })

    // Create in-app notification
    await supabase
      .from('notifications')
      .insert({
        user_id: data.assignedToId,
        type: 'support',
        title: `Ticket Assigned: #${data.ticketNumber}`,
        message: data.subject,
        link: `/admin/support/${data.ticketId}`,
        read: false
      })

    console.log(`Staff member notified about ticket assignment #${data.ticketNumber}`)
  } catch (error) {
    console.error('Failed to notify assigned staff:', error)
  }
}
