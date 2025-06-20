# Solara Build Checklist

## Pre-Build Checks

### Dependencies
- [ ] `pnpm-lock.yaml` is up to date with `package.json`
- [ ] All Frame SDK dependencies are installed:
  - [ ] `@solana/web3.js` (dev dependency)
  - [ ] `ox` (for ethereum wallet types)
  - [ ] `zod` (for validation)
  - [ ] `@farcaster/frame-core` (local package)
- [ ] No peer dependency conflicts
- [ ] No deprecated package warnings

### TypeScript
- [ ] `npx tsc --noEmit --project .` passes
- [ ] No missing module errors
- [ ] All API routes use correct Next.js 15 parameter types
- [ ] No unescaped entities in JSX
- [ ] React Hook dependencies are properly declared

### Code Quality
- [ ] `npm run lint` passes
- [ ] No ESLint warnings or errors
- [ ] All imports are properly typed
- [ ] No unused variables or imports

## Build Process

### Local Build
```bash
# 1. Install dependencies
pnpm install

# 2. Type check
npx tsc --noEmit --project .

# 3. Lint
npm run lint

# 4. Build
npm run build

# 5. Test build output
npm run start
```

### Expected Build Output
- ✅ Compiled successfully
- ✅ Linting and checking validity of types
- ✅ Collecting page data
- ✅ Generating static pages
- ✅ Collecting build traces
- ✅ Finalizing page optimization

## Common Issues & Solutions

### Missing Dependencies
**Error**: `Cannot find module 'package-name'`
**Solution**: Add missing package to dependencies or devDependencies

### Next.js 15 API Routes
**Error**: Invalid parameter types
**Solution**: Use `{ params }: { params: Promise<{ id: string }> }` and await params

### React Hook Dependencies
**Error**: Missing dependency in useEffect
**Solution**: Add missing dependencies to dependency array

### Unescaped Entities
**Error**: `'` can be escaped with `&apos;`
**Solution**: Use `&apos;` or `&#39;` in JSX

### Frame SDK Issues
**Error**: Missing Solana or ox types
**Solution**: Add `@solana/web3.js` and `ox` as dependencies

## Deployment Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] Build succeeds locally
- [ ] Environment variables are set
- [ ] Database migrations are applied
- [ ] API endpoints are tested

### Post-Deployment
- [ ] Health check passes
- [ ] Journal feature works
- [ ] Frame integration works
- [ ] No console errors
- [ ] Performance is acceptable

## Environment Variables

### Required
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_URL=
```

### Optional
```bash
VERCEL_PROJECT_PRODUCTION_URL=
OPENAI_API_KEY=
ENCRYPTION_SALT=
```

## Performance Targets

- **First Load JS**: < 500kB
- **Build Time**: < 30s
- **Type Check**: < 10s
- **Lint**: < 5s

## Troubleshooting

### Build Fails
1. Check dependency versions
2. Clear node_modules and reinstall
3. Check TypeScript errors
4. Verify Next.js compatibility

### Runtime Errors
1. Check environment variables
2. Verify API endpoints
3. Check browser console
4. Test in different browsers

### Frame Issues
1. Verify Frame SDK version
2. Check Farcaster API status
3. Test frame metadata
4. Verify wallet integration 