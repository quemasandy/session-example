# 🤝 Contributing Guidelines

Thank you for your interest in contributing to the Session & Cookie Management Demo! This guide will help you get started with contributing to this educational project.

## 🎯 Project Goals

This project aims to:

- **Educate developers** about session-based authentication
- **Demonstrate best practices** for session management
- **Provide clear examples** of cookie handling
- **Show Redis integration** for session storage
- **Maintain educational value** over complexity

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/yourusername/session-example.git
cd session-example

# Add upstream remote
git remote add upstream https://github.com/originalusername/session-example.git
```

### 2. Set Up Development Environment

Follow the [Development Guide](DEVELOPMENT.md) for complete setup instructions:

```bash
# Start Redis
docker-compose up -d redis

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start development servers
npm run dev # In both backend and frontend directories
```

### 3. Create a Feature Branch

```bash
# Keep main branch updated
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

## 📝 Types of Contributions

### 🐛 Bug Reports

When reporting bugs, please include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Environment information** (OS, Node.js version, browser)
- **Console logs** and error messages
- **Screenshots** if applicable

**Bug Report Template:**

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Start the application
2. Navigate to...
3. Click on...
4. Observe error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 12.0]
- Node.js: [e.g., 18.16.0]
- Browser: [e.g., Chrome 114]
- Redis: [e.g., 7.0.11]

## Additional Context
Any other relevant information
```

### ✨ Feature Requests

For new features, please:

- **Check existing issues** to avoid duplicates
- **Explain the use case** and educational value
- **Consider the scope** - keep features focused on session management
- **Provide examples** of how it would work

### 🔧 Code Contributions

#### Areas for Contribution

1. **Educational Enhancements**
   - More detailed logging and explanations
   - Additional demo scenarios
   - Interactive tutorials or guides

2. **Technical Improvements**
   - Performance optimizations
   - Security enhancements
   - Error handling improvements
   - TypeScript type safety

3. **Monitoring and Debugging**
   - Enhanced Redis monitoring tools
   - Session analytics and reporting
   - Debug utilities and helpers

4. **Documentation**
   - Code comments and JSDoc
   - Architecture documentation
   - Troubleshooting guides
   - Tutorial content

#### Code Standards

- **Follow TypeScript best practices**
- **Add comprehensive JSDoc comments**
- **Include error handling**
- **Write educational console logs**
- **Maintain backward compatibility**

## 📋 Pull Request Process

### 1. Code Quality Checklist

Before submitting a PR, ensure:

- [ ] **Code follows project style guidelines**
- [ ] **All functions have JSDoc documentation**
- [ ] **TypeScript compilation succeeds without errors**
- [ ] **No console errors in browser**
- [ ] **Educational logging is maintained**
- [ ] **Session functionality still works**

### 2. Testing Checklist

- [ ] **Manual testing completed**
  - [ ] Login/logout flow works
  - [ ] Protected routes are accessible
  - [ ] Session persistence across browser refresh
  - [ ] Redis integration functions properly

- [ ] **Cross-browser testing** (Chrome, Firefox, Safari)
- [ ] **CORS functionality verified**
- [ ] **Session monitoring tools work**

### 3. Documentation Updates

- [ ] **Update README.md** if needed
- [ ] **Update ARCHITECTURE.md** for architectural changes
- [ ] **Update DEVELOPMENT.md** for new development processes
- [ ] **Add/update code comments**
- [ ] **Update API documentation** if endpoints changed

### 4. Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Educational Value
How does this change improve the educational aspects of the project?

## Testing
- [ ] Manual testing completed
- [ ] Cross-browser testing done
- [ ] Session functionality verified
- [ ] Redis integration tested

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 🎨 Code Style Guidelines

### TypeScript Standards

```typescript
// ✅ Good: Explicit types and comprehensive documentation
/**
 * Validates user credentials against the user database
 * 
 * @param username - User's login identifier
 * @param password - User's password (plaintext for demo)
 * @returns User object if valid, null if invalid
 */
function validateCredentials(username: string, password: string): User | null {
  return users.find(user => 
    user.username === username && user.password === password
  ) || null;
}

// ❌ Avoid: Implicit types and missing documentation
function validateCredentials(username, password) {
  return users.find(user => user.username === username && user.password === password);
}
```

### Logging Standards

```typescript
// ✅ Good: Educational logging with context
logWithEmoji('🔐', 'LOGIN ATTEMPT - Validating user credentials', {
  username,
  timestamp: new Date().toISOString(),
  note: '💡 Password is checked in plaintext for demo purposes'
});

// ❌ Avoid: Minimal logging without educational value
console.log('Login attempt');
```

### Error Handling

```typescript
// ✅ Good: Comprehensive error handling with user feedback
try {
  const response = await fetchWithCredentials('/api/profile');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`HTTP ${response.status}: ${errorData.message}`);
  }
  
  return await response.json();
} catch (error) {
  console.error('Profile fetch failed:', error);
  displayResponse({ 
    error: 'Failed to load profile. Please try again.',
    details: error.message 
  }, true);
  throw error;
}

// ❌ Avoid: Silent failures or generic error handling
const profile = await fetch('/api/profile').then(r => r.json()).catch(() => ({}));
```

## 🔒 Security Considerations

When contributing, please:

- **Never commit real secrets** or production credentials
- **Use environment variables** for configuration
- **Follow security best practices** for session handling
- **Document security implications** of changes
- **Test with security headers** enabled

### Security Review Checklist

- [ ] No hardcoded secrets or passwords
- [ ] Proper input validation and sanitization
- [ ] Session security flags maintained
- [ ] CORS configuration remains secure
- [ ] No XSS vulnerabilities introduced
- [ ] Error messages don't leak sensitive information

## 📚 Educational Focus

This project is primarily educational. When contributing:

### Do:
- **Add explanatory comments** to complex logic
- **Include console logging** that helps understanding
- **Write clear, readable code** over clever optimizations
- **Provide examples** in documentation
- **Explain the \"why\"** not just the \"what\"

### Don't:
- **Add unnecessary complexity** that obscures learning
- **Remove educational logging** without good reason
- **Make changes that break the learning flow**
- **Add features unrelated** to session management

## 🚫 What We Don't Accept

- **Production-oriented features** that complicate the demo
- **Complex authentication schemes** (OAuth, JWT, etc.)
- **Frontend frameworks** (React, Vue, Angular) - keep it vanilla
- **Advanced Redis features** beyond session storage
- **Breaking changes** without strong justification
- **Contributions without educational value**

## 🏷️ Issue Labels

We use these labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `educational` - Enhances learning value
- `security` - Security-related changes
- `monitoring` - Redis monitoring improvements

## 🎉 Recognition

Contributors will be:

- **Listed in the README** acknowledgments section
- **Credited in release notes** for significant contributions
- **Mentioned in commit messages** where appropriate

## 📞 Getting Help

If you need help:

1. **Check existing documentation** first
2. **Search closed issues** for similar problems
3. **Open a new issue** with the `help wanted` label
4. **Join discussions** in existing issues

## 📄 License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

Thank you for helping make this educational resource better! 🙏