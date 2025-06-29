---
name: Bug Report
about: Create a report to help us improve the session management demo
title: '[BUG] '
labels: ['bug']
assignees: ''
---

## 🐛 Bug Description

A clear and concise description of what the bug is.

## 🔄 Steps to Reproduce

1. Start the application with `docker-compose up -d redis`
2. Run backend with `npm run dev`
3. Run frontend with `npm run dev`
4. Go to 'http://localhost:5173'
5. Click on '....'
6. See error

## ✅ Expected Behavior

A clear and concise description of what you expected to happen.

## ❌ Actual Behavior

A clear and concise description of what actually happened.

## 🖼️ Screenshots

If applicable, add screenshots to help explain your problem.

## 🌐 Environment

**Desktop:**
- OS: [e.g. macOS 13.0, Windows 11, Ubuntu 22.04]
- Browser: [e.g. Chrome 114, Firefox 115, Safari 16]
- Node.js version: [e.g. 18.16.0]
- npm version: [e.g. 9.5.1]

**Session Management Demo:**
- Which part affected: [backend/frontend/redis]
- Redis version: [e.g. 7.0.11]
- Docker version: [e.g. 20.10.24]

## 📋 Session Information

**When the bug occurs:**
- [ ] During login
- [ ] When accessing protected routes
- [ ] During logout
- [ ] When checking session status
- [ ] Other: ___________

**Session state:**
- [ ] User not logged in
- [ ] User logged in
- [ ] Session expired
- [ ] Redis connection issues

## 🔍 Browser DevTools Information

**Console Errors:**
```
Paste any console errors here
```

**Network Issues:**
```
Paste any network-related errors or suspicious requests here
```

**Cookie Information:**
- Session cookie present: [Yes/No]
- Cookie details: [HttpOnly, Secure, SameSite values]

## 🔧 Backend Logs

```
Paste relevant backend console output here (look for emoji-prefixed logs)
```

## 🔍 Redis Information

If relevant, include output from Redis monitoring:

```bash
# Output from: npm run monitor:list
# Or any Redis CLI commands
```

## 🧪 Additional Testing

- [ ] I have tested this in multiple browsers
- [ ] I have tested with a fresh session (cleared cookies)
- [ ] I have restarted Redis
- [ ] I have restarted the backend server
- [ ] I have checked the browser's network tab
- [ ] I have verified Redis is running with `docker-compose ps`

## 📚 Additional Context

Add any other context about the problem here. For example:
- Does this affect the educational value of the demo?
- Are there any workarounds?
- When did this start happening?

## 🔗 Related Issues

Link any related issues here.

---

**For Maintainers:**

- [ ] Bug confirmed
- [ ] Environment reproduced
- [ ] Impact assessed
- [ ] Fix priority assigned