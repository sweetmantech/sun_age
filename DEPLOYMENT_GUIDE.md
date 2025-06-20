# Solara Deployment Guide

## 🚀 Quick Start

### Local Development
```bash
# Setup development environment
./scripts/dev-setup.sh

# Start development server
npm run dev

# Run full CI checks locally
npm run ci
```

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm run start

# Health check
npm run health
```

## 📋 Build Checklist

Before deploying, run through the [BUILD_CHECKLIST.md](./BUILD_CHECKLIST.md) to ensure everything is ready.

## 🔧 CI/CD Pipeline

### GitHub Actions Workflow
The CI/CD pipeline automatically runs on:
- **Push to main/develop**: Full build, test, and deploy
- **Pull Requests**: Lint, type check, and build test

### Pipeline Stages
1. **Lint & Type Check**: ESLint + TypeScript validation
2. **Build Test**: Production build verification
3. **Security Audit**: npm audit for vulnerabilities
4. **Deploy**: Automatic deployment to Vercel (main branch only)
5. **Post-Deployment Tests**: Health checks and API validation
6. **Performance Check**: Lighthouse CI analysis

### Required Secrets
Set these in your GitHub repository settings:

```bash
# Vercel Deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_PROJECT_PRODUCTION_URL=your_production_url

# Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_URL=your_app_url
```

## 🛠️ Development Commands

### Code Quality
```bash
npm run type-check      # TypeScript check
npm run lint            # ESLint check
npm run lint:fix        # ESLint with auto-fix
npm run format          # Prettier format
npm run format:check    # Prettier check
```

### Build & Test
```bash
npm run build           # Production build
npm run test:build      # Full build test
npm run ci              # CI pipeline locally
npm run health          # Health check
```

### Development
```bash
npm run dev             # Development server
npm run start           # Production server
npm run setup           # Development setup
npm run clean           # Clean all caches
```

## 🔍 Monitoring & Debugging

### Health Check Endpoint
- **URL**: `/api/health`
- **Method**: GET
- **Response**: Application status and service health

### Common Issues

#### Build Failures
1. Check dependency versions in `package.json`
2. Run `npm run clean && pnpm install`
3. Verify TypeScript errors with `npm run type-check`
4. Check for missing environment variables

#### Runtime Errors
1. Check browser console for client-side errors
2. Verify API endpoints are responding
3. Check environment variables are set correctly
4. Test in different browsers

#### Frame Integration Issues
1. Verify Frame SDK version compatibility
2. Check Farcaster API status
3. Test frame metadata generation
4. Verify wallet integration

## 📊 Performance Targets

- **First Load JS**: < 500kB ✅ (Current: 305kB)
- **Build Time**: < 30s ✅ (Current: 13s)
- **Type Check**: < 10s ✅
- **Lint**: < 5s ✅

## 🔐 Security

### Environment Variables
- Never commit `.env.local` to version control
- Use GitHub Secrets for production values
- Rotate API keys regularly
- Use least-privilege access for database connections

### Dependencies
- Run `npm audit` regularly
- Keep dependencies updated
- Monitor for security vulnerabilities
- Use `pnpm audit` for additional checks

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests pass (`npm run ci`)
- [ ] Build succeeds locally
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] API endpoints tested
- [ ] Frame metadata verified

### Post-Deployment
- [ ] Health check passes
- [ ] Journal feature functional
- [ ] Frame integration working
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Mobile responsiveness verified

## 📈 Monitoring

### Health Monitoring
- Monitor `/api/health` endpoint
- Set up uptime monitoring
- Track error rates and response times
- Monitor database connection health

### Performance Monitoring
- Track Core Web Vitals
- Monitor bundle sizes
- Track API response times
- Monitor user engagement metrics

## 🔄 Rollback Strategy

### Quick Rollback
1. Revert to previous commit
2. Trigger deployment
3. Verify health check passes
4. Test critical functionality

### Database Rollback
1. Restore from backup if needed
2. Run migration rollback scripts
3. Verify data integrity
4. Update application if necessary

## 📞 Support

### Debugging Resources
- [BUILD_CHECKLIST.md](./BUILD_CHECKLIST.md) - Build troubleshooting
- [README.md](./README.md) - Project overview
- GitHub Issues - Bug reports and feature requests

### Team Contacts
- **Lead Developer**: [Your Name]
- **DevOps**: [DevOps Contact]
- **Product**: [Product Contact]

---

**Last Updated**: $(date)
**Version**: 1.0.0 