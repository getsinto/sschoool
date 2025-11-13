# Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Code Quality
- [ ] All tests pass locally
- [ ] No TypeScript errors
- [ ] Linting passes without errors
- [ ] Code reviewed and approved
- [ ] All features tested locally

### Environment Variables
- [ ] All required environment variables documented in `.env.example`
- [ ] Production environment variables added to Vercel
- [ ] API keys are production-ready (not test keys)
- [ ] Secrets are properly secured
- [ ] Database connection strings verified

### Database
- [ ] All migrations tested locally
- [ ] Migrations run successfully on staging
- [ ] Database backup created
- [ ] RLS policies are active
- [ ] Indexes are optimized
- [ ] Sample data removed (if any)

### Third-Party Services
- [ ] Supabase project is production-ready
- [ ] Stripe account in live mode
- [ ] PayPal account configured for production
- [ ] Razorpay account configured for production
- [ ] Resend domain verified
- [ ] Zoom app approved (if required)
- [ ] Google OAuth consent screen approved
- [ ] Gemini API quota sufficient

### Security
- [ ] All API endpoints have proper authentication
- [ ] Rate limiting implemented
- [ ] CORS configured correctly
- [ ] Security headers set
- [ ] File upload validation working
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF protection implemented

### Performance
- [ ] Images optimized
- [ ] Bundle size analyzed
- [ ] Lazy loading implemented
- [ ] API responses cached where appropriate
- [ ] Database queries optimized
- [ ] CDN configured

### Webhooks
- [ ] Stripe webhook URL configured
- [ ] PayPal webhook URL configured
- [ ] Razorpay webhook URL configured
- [ ] Zoom webhook URL configured
- [ ] All webhook secrets set
- [ ] Webhook signatures verified

## Deployment

### Vercel Setup
- [ ] Project connected to Git repository
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Custom domain added
- [ ] DNS records updated
- [ ] SSL certificate active

### Initial Deploy
- [ ] Code pushed to main branch
- [ ] Build completes successfully
- [ ] No build errors or warnings
- [ ] Deployment URL accessible
- [ ] Health check endpoint returns 200

### Domain Configuration
- [ ] Custom domain configured
- [ ] www redirect working
- [ ] HTTPS enabled
- [ ] SSL certificate valid
- [ ] DNS propagation complete

## Post-Deployment

### Verification
- [ ] Homepage loads correctly
- [ ] All routes accessible
- [ ] API endpoints responding
- [ ] Database connection working
- [ ] File uploads working
- [ ] Email sending working

### User Flows
- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Password reset works
- [ ] Course enrollment works
- [ ] Payment processing works (test transaction)
- [ ] Live class creation works
- [ ] Assignment submission works
- [ ] Quiz taking works
- [ ] Chatbot responds correctly

### Admin Functions
- [ ] Admin dashboard accessible
- [ ] User management works
- [ ] Course management works
- [ ] Payment management works
- [ ] Email system works
- [ ] Reports generate correctly

### Monitoring
- [ ] Health check endpoint monitored
- [ ] Error tracking configured
- [ ] Analytics tracking
- [ ] Log monitoring set up
- [ ] Uptime monitoring active
- [ ] Alert notifications configured

### Documentation
- [ ] Deployment guide updated
- [ ] API documentation current
- [ ] User guide available
- [ ] Admin guide available
- [ ] Troubleshooting guide updated

## Rollback Plan

### Preparation
- [ ] Previous deployment identified
- [ ] Rollback procedure documented
- [ ] Database backup available
- [ ] Team notified of deployment

### If Issues Occur
- [ ] Issue documented
- [ ] Rollback initiated if critical
- [ ] Team notified
- [ ] Post-mortem scheduled

## Communication

### Before Deployment
- [ ] Team notified of deployment time
- [ ] Users notified of potential downtime (if any)
- [ ] Support team briefed

### After Deployment
- [ ] Team notified of successful deployment
- [ ] Users notified of new features
- [ ] Documentation updated
- [ ] Changelog published

## Performance Baseline

Record these metrics after deployment:

- [ ] Homepage load time: _____ ms
- [ ] API response time: _____ ms
- [ ] Database query time: _____ ms
- [ ] Time to first byte: _____ ms
- [ ] Lighthouse score: _____

## Sign-Off

- [ ] Technical lead approval
- [ ] QA approval
- [ ] Product owner approval
- [ ] Deployment completed by: _______________
- [ ] Date: _______________
- [ ] Time: _______________

---

## Notes

Add any deployment-specific notes here:

```
[Your notes]
```

## Issues Encountered

Document any issues during deployment:

```
[Issues and resolutions]
```
