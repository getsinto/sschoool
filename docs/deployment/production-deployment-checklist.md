# Production Deployment Checklist

## Overview

This checklist ensures all steps are completed for a safe and successful production deployment.

## Pre-Deployment (1-2 Days Before)

### Code Quality
- [ ] All feature branches merged to main
- [ ] Code review completed and approved
- [ ] All tests passing (unit, integration, property-based)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Build succeeds locally
- [ ] No console errors or warnings

### Testing
- [ ] End-to-end testing completed
- [ ] All critical user flows tested
- [ ] Performance testing completed
- [ ] Security testing completed
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness tested
- [ ] Accessibility testing completed

### Database
- [ ] All migrations tested in staging
- [ ] Migration rollback plan documented
- [ ] Database backup created
- [ ] RLS policies verified
- [ ] Indexes optimized
- [ ] Query performance tested

### Environment Configuration
- [ ] All environment variables documented
- [ ] Production environment variables set in Vercel
- [ ] API keys and secrets rotated
- [ ] OAuth redirect URIs updated
- [ ] Webhook URLs configured
- [ ] Email domain verified
- [ ] CDN configured

### Third-Party Services
- [ ] Google Meet OAuth credentials configured
- [ ] Zoom OAuth credentials configured
- [ ] Stripe production keys set
- [ ] PayPal production credentials set
- [ ] Razorpay production keys set
- [ ] Resend API key configured
- [ ] Sentry DSN configured
- [ ] Gemini API key set

### Documentation
- [ ] Deployment guide updated
- [ ] API documentation current
- [ ] Troubleshooting guide updated
- [ ] Runbooks created for common issues
- [ ] Team trained on new features

### Monitoring
- [ ] Sentry project configured
- [ ] Alert rules set up
- [ ] Slack notifications configured
- [ ] Uptime monitoring enabled
- [ ] Performance monitoring active
- [ ] Error tracking tested

---

## Deployment Day

### Morning (Before Deployment)

#### Team Preparation
- [ ] Deployment team assembled
- [ ] Roles and responsibilities assigned
- [ ] Communication channels established
- [ ] Rollback plan reviewed
- [ ] Emergency contacts confirmed

#### Final Checks
- [ ] Verify staging environment matches production
- [ ] Run final test suite
- [ ] Check for any last-minute commits
- [ ] Verify no critical bugs in backlog
- [ ] Confirm maintenance window (if needed)

#### Backup
- [ ] Create database backup
- [ ] Export current environment variables
- [ ] Document current deployment version
- [ ] Save current Vercel deployment URL
- [ ] Backup critical configuration files

### Deployment Execution

#### Step 1: Pre-Deployment Communication
- [ ] Notify team of deployment start
- [ ] Post in team Slack channel
- [ ] Update status page (if applicable)
- [ ] Set "deploying" status in monitoring

#### Step 2: Database Migration
- [ ] Connect to production database
- [ ] Run migrations:
```bash
npx supabase db push --db-url "postgresql://..."
```
- [ ] Verify migrations applied successfully
- [ ] Check migration logs for errors
- [ ] Test critical database queries

#### Step 3: Code Deployment
- [ ] Update version in package.json
- [ ] Commit version change
- [ ] Create git tag
- [ ] Push to repository
- [ ] Deploy to Vercel:
```bash
vercel --prod
```
- [ ] Monitor deployment logs
- [ ] Wait for deployment to complete

#### Step 4: Sentry Release
- [ ] Create Sentry release:
```bash
sentry-cli releases new 1.0.0
sentry-cli releases set-commits 1.0.0 --auto
sentry-cli releases finalize 1.0.0
```
- [ ] Upload source maps
- [ ] Mark release as deployed
- [ ] Verify release appears in Sentry

#### Step 5: Immediate Verification
- [ ] Check deployment status in Vercel
- [ ] Verify production URL is accessible
- [ ] Test health check endpoint
- [ ] Check for any immediate errors in Sentry
- [ ] Verify no 500 errors in logs

---

## Post-Deployment (First Hour)

### Critical Feature Verification

#### Authentication
- [ ] User login works
- [ ] User registration works
- [ ] Password reset works
- [ ] Session management works
- [ ] OAuth connections work

#### Google Meet Integration
- [ ] OAuth authorization flow works
- [ ] Meeting creation works
- [ ] Token refresh works
- [ ] Disconnection works

#### File Uploads
- [ ] Image upload works
- [ ] Video upload works
- [ ] Document upload works
- [ ] File deletion works
- [ ] File access permissions enforced

#### Teacher Features
- [ ] Student list loads with real data
- [ ] Student progress displays correctly
- [ ] Messaging works
- [ ] Grading works
- [ ] Data export works

#### Payment Processing
- [ ] Stripe payments work
- [ ] PayPal payments work
- [ ] Razorpay payments work
- [ ] Webhooks receiving events
- [ ] Enrollment created after payment

#### Session Timeout
- [ ] Inactivity warning appears
- [ ] Automatic logout works
- [ ] Session refresh works
- [ ] Cross-tab sync works

### Monitoring

#### Sentry
- [ ] No critical errors
- [ ] Error rate normal
- [ ] Performance metrics acceptable
- [ ] No memory leaks
- [ ] No infinite loops

#### Vercel
- [ ] Function execution times normal
- [ ] No function timeouts
- [ ] Bandwidth usage normal
- [ ] Build logs clean

#### Database
- [ ] Connection pool healthy
- [ ] Query performance normal
- [ ] No slow queries
- [ ] RLS policies working
- [ ] No connection errors

#### Performance
- [ ] Page load times < 3s
- [ ] API response times < 500ms
- [ ] Time to First Byte < 1s
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing

---

## Post-Deployment (First 24 Hours)

### Continuous Monitoring

#### Every Hour (First 6 Hours)
- [ ] Check Sentry for new errors
- [ ] Review Vercel logs
- [ ] Monitor database performance
- [ ] Check API response times
- [ ] Verify no user complaints

#### Every 4 Hours (Next 18 Hours)
- [ ] Review error trends
- [ ] Check performance metrics
- [ ] Monitor storage usage
- [ ] Review payment transactions
- [ ] Check email delivery

### User Feedback
- [ ] Monitor support channels
- [ ] Check for bug reports
- [ ] Review user feedback
- [ ] Address critical issues immediately
- [ ] Document any workarounds

### Team Communication
- [ ] Daily standup on deployment status
- [ ] Share metrics with team
- [ ] Document any issues found
- [ ] Update troubleshooting guide
- [ ] Celebrate successful deployment! 🎉

---

## Post-Deployment (First Week)

### Daily Tasks
- [ ] Review Sentry dashboard
- [ ] Check performance metrics
- [ ] Monitor error rates
- [ ] Review user feedback
- [ ] Address any issues

### Weekly Tasks
- [ ] Comprehensive error review
- [ ] Performance analysis
- [ ] User satisfaction survey
- [ ] Team retrospective
- [ ] Documentation updates

---

## Rollback Procedure

### When to Rollback

Rollback immediately if:
- Critical functionality broken
- Data loss occurring
- Security vulnerability discovered
- Error rate > 5%
- Payment processing failing
- Database corruption detected

### Rollback Steps

#### 1. Immediate Actions
- [ ] Notify team of rollback decision
- [ ] Stop any ongoing deployments
- [ ] Document reason for rollback

#### 2. Code Rollback
```bash
# Revert to previous deployment in Vercel
vercel rollback

# Or redeploy previous version
git checkout v0.9.9
vercel --prod --force
```

#### 3. Database Rollback (if needed)
```bash
# Restore from backup
psql $DATABASE_URL < backup_20240109_120000.sql

# Or revert specific migrations
npx supabase db reset --db-url "postgresql://..."
```

#### 4. Verification
- [ ] Verify previous version deployed
- [ ] Test critical functionality
- [ ] Check error rates normalized
- [ ] Confirm users can access platform

#### 5. Post-Rollback
- [ ] Notify team of rollback completion
- [ ] Document what went wrong
- [ ] Create tickets for issues
- [ ] Plan fix and re-deployment

---

## Success Criteria

### Deployment Successful If:
- ✓ All critical features working
- ✓ No critical errors in Sentry
- ✓ Error rate < 1%
- ✓ Performance metrics within targets
- ✓ No user complaints about major issues
- ✓ All monitoring systems green
- ✓ Database healthy
- ✓ Payment processing working

### Deployment Failed If:
- ✗ Critical features broken
- ✗ Error rate > 5%
- ✗ Performance degraded significantly
- ✗ Data loss occurring
- ✗ Security issues discovered
- ✗ Payment processing failing

---

## Post-Deployment Report

### Deployment Summary

**Date:** _______________  
**Version:** _______________  
**Deployed By:** _______________  
**Duration:** _______________  

### Metrics

- **Deployment Time:** _____ minutes
- **Downtime:** _____ minutes (if any)
- **Errors During Deployment:** _____
- **Rollbacks Required:** _____

### Issues Encountered

| Issue | Severity | Resolution | Time to Resolve |
|-------|----------|------------|-----------------|
| | | | |

### Performance Comparison

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Page Load Time | | | |
| API Response Time | | | |
| Error Rate | | | |
| Database Query Time | | | |

### Lessons Learned

**What Went Well:**
- 
- 
- 

**What Could Be Improved:**
- 
- 
- 

**Action Items:**
- [ ] 
- [ ] 
- [ ] 

### Sign-Off

**Deployment Lead:** _______________  
**Date:** _______________  

**Technical Lead:** _______________  
**Date:** _______________  

**Product Owner:** _______________  
**Date:** _______________  

---

## Appendix

### Useful Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs

# Check database connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Test API endpoint
curl https://yourdomain.com/api/health

# Check Sentry errors
sentry-cli issues list

# View recent commits
git log --oneline -10
```

### Emergency Contacts

- **On-Call Engineer:** [Phone/Slack]
- **Database Admin:** [Phone/Slack]
- **DevOps Lead:** [Phone/Slack]
- **Product Owner:** [Phone/Slack]
- **CTO:** [Phone/Slack]

### External Service Status Pages

- Vercel: https://www.vercel-status.com/
- Supabase: https://status.supabase.com/
- Stripe: https://status.stripe.com/
- Sentry: https://status.sentry.io/

