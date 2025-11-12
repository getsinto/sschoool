# Zoom Integration - Deployment Checklist

## Pre-Deployment Checklist

### 1. Zoom Account Setup
- [ ] Create Zoom account (Pro or higher for cloud recording)
- [ ] Access Zoom Marketplace (marketplace.zoom.us)
- [ ] Create Server-to-Server OAuth app
- [ ] Note down Account ID, Client ID, Client Secret
- [ ] Activate the OAuth app

### 2. Zoom App Configuration
- [ ] Add required scopes:
  - [ ] meeting:write:admin
  - [ ] meeting:read:admin
  - [ ] recording:write:admin
  - [ ] recording:read:admin
  - [ ] user:read:admin
- [ ] Configure webhook endpoint (optional but recommended)
- [ ] Set webhook secret token
- [ ] Subscribe to events:
  - [ ] meeting.started
  - [ ] meeting.ended
  - [ ] meeting.participant_joined
  - [ ] meeting.participant_left
  - [ ] recording.completed

### 3. Environment Variables
- [ ] Add to `.env.local` (development):
  ```env
  ZOOM_ACCOUNT_ID=your_account_id
  ZOOM_CLIENT_ID=your_client_id
  ZOOM_CLIENT_SECRET=your_client_secret
  ZOOM_WEBHOOK_SECRET_TOKEN=your_webhook_secret
  ```
- [ ] Add to production environment (Vercel/hosting platform)
- [ ] Verify variables are loaded correctly

### 4. Database Migration
- [ ] Run migration: `supabase migration up`
- [ ] Verify tables created:
  - [ ] meeting_participants
  - [ ] meeting_recordings
  - [ ] live_classes (with new columns)
- [ ] Verify functions created:
  - [ ] update_participant_duration()
  - [ ] get_meeting_attendance_summary()
- [ ] Verify RLS policies are active

### 5. Dependencies
- [ ] Verify all npm packages installed
- [ ] Check for any missing UI components
- [ ] Ensure TypeScript compiles without errors
- [ ] Run `npm run build` to check for build errors

## Testing Checklist

### 6. Basic Functionality
- [ ] Create a test meeting
- [ ] Verify meeting appears in database
- [ ] Copy join link
- [ ] Join meeting as student
- [ ] Verify pre-meeting checks work
- [ ] Test audio/video in meeting
- [ ] Leave meeting
- [ ] Verify attendance recorded

### 7. Teacher Features
- [ ] Create meeting from teacher dashboard
- [ ] Update meeting details
- [ ] Start meeting as host
- [ ] View live attendance
- [ ] Export attendance to CSV
- [ ] Cancel meeting
- [ ] Verify cancellation notification

### 8. Recording Features
- [ ] Start recording during meeting
- [ ] Stop recording
- [ ] Verify recording status updates
- [ ] Wait for recording processing
- [ ] View recordings list
- [ ] Play recording
- [ ] Download recording

### 9. Admin Features
- [ ] View all meetings
- [ ] Create meeting for any course
- [ ] View attendance for all meetings
- [ ] Access all recordings
- [ ] Manage meeting settings

### 10. Security Testing
- [ ] Verify students can only join their enrolled courses
- [ ] Test meeting password protection
- [ ] Verify waiting room functionality
- [ ] Test RLS policies (students can't see other's data)
- [ ] Verify teachers can only manage their meetings
- [ ] Test admin access to all meetings

### 11. Mobile Testing
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Verify responsive design
- [ ] Test touch controls
- [ ] Verify video quality on mobile
- [ ] Test device switching

### 12. Error Handling
- [ ] Test with invalid meeting ID
- [ ] Test with expired meeting
- [ ] Test with cancelled meeting
- [ ] Test network disconnection
- [ ] Test with invalid credentials
- [ ] Verify error messages are user-friendly

### 13. Webhook Testing
- [ ] Trigger meeting.started event
- [ ] Verify database updates
- [ ] Trigger meeting.ended event
- [ ] Verify attendance finalized
- [ ] Trigger recording.completed event
- [ ] Verify recording data saved

## Performance Checklist

### 14. Optimization
- [ ] Lazy load Zoom components
- [ ] Implement caching for meeting list
- [ ] Optimize attendance queries
- [ ] Add loading states
- [ ] Implement error boundaries
- [ ] Add retry logic for failed API calls

### 15. Monitoring
- [ ] Set up error logging
- [ ] Monitor API rate limits
- [ ] Track meeting creation success rate
- [ ] Monitor webhook delivery
- [ ] Set up alerts for failures

## Documentation Checklist

### 16. User Documentation
- [ ] Create teacher guide
- [ ] Create student guide
- [ ] Create admin guide
- [ ] Document common issues
- [ ] Create FAQ section

### 17. Technical Documentation
- [ ] Document API endpoints
- [ ] Document database schema
- [ ] Document webhook events
- [ ] Document environment variables
- [ ] Create troubleshooting guide

## Production Deployment

### 18. Pre-Launch
- [ ] Review all code changes
- [ ] Run full test suite
- [ ] Check for console errors
- [ ] Verify all environment variables
- [ ] Test with production Zoom account
- [ ] Backup database

### 19. Launch
- [ ] Deploy to production
- [ ] Run database migration
- [ ] Verify environment variables loaded
- [ ] Test basic functionality
- [ ] Monitor error logs
- [ ] Check webhook delivery

### 20. Post-Launch
- [ ] Monitor first few meetings
- [ ] Check attendance tracking
- [ ] Verify recordings processing
- [ ] Monitor API usage
- [ ] Collect user feedback
- [ ] Address any issues immediately

## Maintenance Checklist

### 21. Regular Maintenance
- [ ] Monitor Zoom API rate limits
- [ ] Check recording storage usage
- [ ] Review attendance data accuracy
- [ ] Update Zoom SDK if needed
- [ ] Check for Zoom API changes
- [ ] Review and optimize queries

### 22. Monthly Tasks
- [ ] Review error logs
- [ ] Check webhook delivery rate
- [ ] Analyze meeting statistics
- [ ] Review user feedback
- [ ] Update documentation
- [ ] Plan feature enhancements

## Rollback Plan

### 23. If Issues Occur
- [ ] Document the issue
- [ ] Check error logs
- [ ] Verify environment variables
- [ ] Test Zoom API directly
- [ ] Check database state
- [ ] Rollback if necessary
- [ ] Communicate with users

## Success Criteria

### 24. Launch Success Metrics
- [ ] 95%+ meeting creation success rate
- [ ] 100% attendance tracking accuracy
- [ ] 90%+ recording processing success
- [ ] <2 second page load time
- [ ] Zero security vulnerabilities
- [ ] Positive user feedback

## Notes

### Important Reminders
- Zoom API has rate limits (varies by plan)
- Cloud recording requires Pro account or higher
- Webhooks may have delivery delays
- Recording processing can take several minutes
- Test thoroughly before production launch
- Have rollback plan ready
- Monitor closely after launch

### Support Contacts
- Zoom Support: support.zoom.us
- Zoom Developer Forum: devforum.zoom.us
- Zoom API Status: status.zoom.us

## Sign-Off

- [ ] Development Team Lead: _________________ Date: _______
- [ ] QA Team Lead: _________________ Date: _______
- [ ] Product Manager: _________________ Date: _______
- [ ] System Administrator: _________________ Date: _______

---

**Deployment Date:** _________________

**Deployed By:** _________________

**Production URL:** _________________

**Notes:** _________________________________________________
