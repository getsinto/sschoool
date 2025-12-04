# Test Quick Reference Guide

## Course Assignment Permissions - Test Suite

### Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage
```

### Test Files

1. **Smoke Tests**: `__tests__/smoke.test.ts`
   - Basic validation and setup verification
   - 4 test cases

2. **Property-Based Tests**: `lib/permissions/__tests__/coursePermissions.property.test.ts`
   - Core correctness properties
   - 42 test cases, 4,200+ iterations

### Run Specific Tests

```bash
# Run only smoke tests
npm test -- __tests__/smoke.test.ts

# Run only property tests
npm test -- lib/permissions/__tests__/coursePermissions.property.test.ts

# Run specific property
npm test -- -t "Admin-only course creation"

# Run tests matching pattern
npm test -- -t "Property 1"
```

### Test Output

Expected output when all tests pass:
```
PASS  __tests__/smoke.test.ts
PASS  lib/permissions/__tests__/coursePermissions.property.test.ts

Test Suites: 2 passed, 2 total
Tests:       46 passed, 46 total
Snapshots:   0 total
Time:        ~8s
```

### Coverage Report

```bash
npm run test:coverage
```

View coverage report at: `coverage/lcov-report/index.html`

### Debugging Tests

```bash
# Run with verbose output
npm test -- --verbose

# Run single test file
npm test -- __tests__/smoke.test.ts --verbose

# Debug specific test
npm test -- -t "Property 1" --verbose
```

### Property Test Details

Each property test runs 100 iterations with randomly generated inputs:

- **Property 1**: Admin-only course creation (7 tests)
- **Property 2**: Course creator tracking (8 tests)
- **Property 3**: Assignment uniqueness (4 tests)
- **Property 4**: Single primary teacher (5 tests)
- **Property 6**: Teacher course visibility (8 tests)
- **Property 7**: Non-assigned course access denial (10 tests)

### Requirements Coverage

Tests validate these requirements:
- 1.1, 1.2, 1.3, 1.4 (Course creation)
- 2.1, 2.3 (Teacher assignments)
- 3.1, 3.2, 3.4 (Course visibility)
- 7.5 (Assignment uniqueness)

### Common Issues

**Issue**: Tests fail with module not found
```bash
# Solution: Install dependencies
npm install
```

**Issue**: TypeScript errors
```bash
# Solution: Check TypeScript configuration
npm run type-check
```

**Issue**: Slow test execution
```bash
# Solution: Run specific tests instead of all
npm test -- __tests__/smoke.test.ts
```

### CI/CD Integration

Add to your CI pipeline:
```yaml
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

### Next Steps

To expand test coverage:
1. Add integration tests for API endpoints
2. Add database tests for RLS policies
3. Add UI component tests
4. Add performance tests

See `TASK_10_COMPLETE_SUMMARY.md` for detailed information.
