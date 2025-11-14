# Priority Action Items - DealersChoice

## 🚨 CRITICAL - Fix Immediately

### 1. Hardcoded API Key Exposure
**File:** `dealer2023-main/Demon0515-MongoDB-731/ClientApp/src/API.js`
**Issue:** VideoSDK JWT token hardcoded in source code
**Action Required:**
```javascript
// BEFORE (INSECURE):
export const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// AFTER (SECURE):
export const authToken = process.env.REACT_APP_VIDEOSDK_TOKEN;
```
**Steps:**
1. Create `.env` file (add to .gitignore)
2. Move token to environment variable
3. Rotate the exposed VideoSDK API key immediately
4. Update deployment configuration

---

### 2. File Upload Security Vulnerability
**File:** `dealer2023-main/Demon0515-MongoDB-731/Controllers/AuthController.cs`
**Lines:** 108-170
**Issue:** Inadequate file validation, direct web-accessible storage
**Action Required:**
- Add MIME type validation
- Implement magic number checking
- Move uploads outside web root
- Add virus scanning
- Implement per-user rate limiting

---

### 3. Insecure CORS Configuration
**File:** `dealer2023-main/Demon0515-MongoDB-731/Program.cs`
**Lines:** 58-65
**Issue:** Allows all origins with credentials
**Action Required:**
```csharp
// BEFORE (INSECURE):
.SetIsOriginAllowed((host) => true)

// AFTER (SECURE):
.WithOrigins("https://yourdomain.com", "https://app.yourdomain.com")
```

---

## ⚠️ HIGH PRIORITY - Fix This Week

### 4. Exception Swallowing
**Files:** Multiple controllers
**Count:** 20+ instances
**Action Required:**
- Add proper logging to all catch blocks
- Remove empty catch blocks
- Create standardized error responses

### 5. Critical Bugs
**Bug #1:** `GameHash.cs` line 75 - Array index off by one
```csharp
// BEFORE (BUG):
int index = random.Next(0, Deck.Count - 1);

// AFTER (FIXED):
int index = random.Next(0, Deck.Count);
```

**Bug #2:** `GameClass.cs` line 27 - Logger never initialized
```csharp
// BEFORE (NULL REFERENCE):
private readonly ILogger<AuthController> _logger; // never assigned

// AFTER (FIXED):
private readonly ILogger<GameClass> _logger;
// Assign in constructor
```

**Bug #3:** `GameController.cs` line 163 - Duplicate HTTP attribute

---

## 📋 MEDIUM PRIORITY - Fix This Month

### 6. Add Test Infrastructure
**Current:** 0% test coverage
**Target:** 70%+ coverage
**Action Required:**
1. Add xUnit test project
2. Add Moq for dependency injection
3. Setup in-memory test database
4. Write tests for critical paths:
   - Authentication
   - Game state management
   - File uploads

### 7. Refactor GameController
**File:** `dealer2023-main/Demon0515-MongoDB-731/Controllers/GameController.cs`
**Lines:** 1,182 lines (too large)
**Action Required:**
- Split into 3-4 smaller controllers
- Extract business logic to services
- Add interfaces for testability

### 8. Fix Service Lifetimes
**File:** `dealer2023-main/Demon0515-MongoDB-731/Program.cs`
**Lines:** 27-36
**Issue:** All services registered as Singleton (thread-safety issues)
**Action Required:**
```csharp
// BEFORE (PROBLEMATIC):
builder.Services.AddSingleton<GameStateService>();

// AFTER (CORRECT):
builder.Services.AddScoped<IGameStateService, GameStateService>();
```

---

## 📝 LOWER PRIORITY - Plan for Next Quarter

### 9. Add Database Indexes
**Action Required:**
- Create indexes on GameCode
- Create indexes on user Email
- Add compound indexes for common queries

### 10. Improve Frontend
**Action Required:**
- Add TypeScript
- Configure ESLint
- Update dependencies
- Add frontend tests

### 11. Documentation
**Action Required:**
- Add API documentation (Swagger)
- Create architecture diagram
- Write deployment guide
- Add inline code documentation

---

## Quick Wins (< 2 hours each)

1. ✅ Remove commented-out code
2. ✅ Replace Console.WriteLine with ILogger
3. ✅ Extract magic numbers to constants
4. ✅ Fix typos (e.g., "Authorizatino")
5. ✅ Add .editorconfig for consistent formatting
6. ✅ Update outdated packages with security patches
7. ✅ Add health check endpoint
8. ✅ Add response compression

---

## Security Checklist

- [ ] Remove hardcoded secrets
- [ ] Rotate exposed API keys
- [ ] Implement secure file upload
- [ ] Fix CORS policy
- [ ] Add input validation everywhere
- [ ] Implement JWT refresh tokens
- [ ] Add rate limiting
- [ ] Add security headers
- [ ] Implement HTTPS redirect
- [ ] Add SQL/NoSQL injection protection
- [ ] Implement CSRF protection
- [ ] Add logging of security events
- [ ] Setup automated security scanning

---

## Testing Checklist

- [ ] Setup test project structure
- [ ] Add unit tests for services (50+ tests)
- [ ] Add unit tests for controllers (40+ tests)
- [ ] Add integration tests (20+ tests)
- [ ] Add SignalR hub tests (10+ tests)
- [ ] Add frontend unit tests (30+ tests)
- [ ] Add E2E tests (10+ tests)
- [ ] Setup CI/CD pipeline with tests
- [ ] Add code coverage reporting
- [ ] Achieve 70%+ code coverage

---

## Code Quality Checklist

- [ ] Remove all commented-out code
- [ ] Extract magic numbers to constants
- [ ] Add XML documentation comments
- [ ] Implement consistent naming conventions
- [ ] Add proper error handling throughout
- [ ] Remove code duplication
- [ ] Split large methods (>50 lines)
- [ ] Split large classes (>500 lines)
- [ ] Add logging consistently
- [ ] Remove unused using statements

---

## Monitoring and Observability Checklist

- [ ] Add Application Insights
- [ ] Implement structured logging
- [ ] Add performance counters
- [ ] Add health checks
- [ ] Add metrics collection
- [ ] Setup alerts for errors
- [ ] Add distributed tracing
- [ ] Monitor database performance
- [ ] Track API response times
- [ ] Monitor SignalR connection health

---

## Estimated Timeline

| Phase | Duration | Effort |
|-------|----------|--------|
| Phase 1: Critical Security | 2 weeks | 28 hours |
| Phase 2: Critical Bugs | 1 week | 28 hours |
| Phase 3: Testing | 2 weeks | 40 hours |
| Phase 4: Refactoring | 3 weeks | 56 hours |
| Phase 5: Performance | 2 weeks | 44 hours |
| Phase 6: Frontend | 2 weeks | 36 hours |
| **Total** | **12 weeks** | **232 hours** |

---

## Next Steps

1. **Today:** Remove hardcoded API key and rotate credentials
2. **This Week:** Fix file upload security and CORS
3. **This Week:** Fix critical bugs (#1, #2, #3)
4. **Next Week:** Setup test infrastructure
5. **Next Week:** Begin exception handling refactor
6. **Week 3-4:** Add critical path tests
7. **Month 2-3:** Execute refactoring plan

---

**Last Updated:** November 14, 2025
