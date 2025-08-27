// Jest setup file for TruthForge tests
const fs = require('fs');
const path = require('path');

// Global test configuration
global.TRUTHFORGE_TEST_MODE = true;

// Mock console in test environment to reduce noise
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Only show important messages in tests
console.log = (message, ...args) => {
  if (typeof message === 'string' && (
    message.includes('CRITICAL') ||
    message.includes('ERROR') ||
    message.includes('FAIL') ||
    process.env.JEST_VERBOSE === 'true'
  )) {
    originalConsoleLog(message, ...args);
  }
};

console.error = (message, ...args) => {
  // Always show errors
  originalConsoleError(message, ...args);
};

// Clean up test artifacts after each test
afterEach(() => {
  // Clean up temporary validation files
  const testArtifacts = [
    '.truthforge/test-validation-passed',
    'validation/test-screenshots',
    'validation/test-security',
  ];

  testArtifacts.forEach(artifact => {
    const fullPath = path.join(process.cwd(), artifact);
    if (fs.existsSync(fullPath)) {
      if (fs.statSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
    }
  });
});

// Global test helpers
global.createMockValidationToken = () => {
  const tokenDir = path.join(process.cwd(), '.truthforge');
  if (!fs.existsSync(tokenDir)) {
    fs.mkdirSync(tokenDir, { recursive: true });
  }

  const tokenData = {
    timestamp: new Date().toISOString(),
    evidence: { test: true },
    validator: 'TruthForge Test'
  };

  fs.writeFileSync(
    path.join(tokenDir, 'test-validation-passed'),
    JSON.stringify(tokenData, null, 2)
  );
};

global.cleanupMockValidationToken = () => {
  const tokenPath = path.join(process.cwd(), '.truthforge', 'test-validation-passed');
  if (fs.existsSync(tokenPath)) {
    fs.unlinkSync(tokenPath);
  }
};

// Extend Jest matchers
expect.extend({
  toBeValidationResult(received) {
    const pass = received &&
      typeof received === 'object' &&
      received.hasOwnProperty('passed') &&
      received.hasOwnProperty('score') &&
      received.hasOwnProperty('evidence');

    if (pass) {
      return {
        message: () => `Expected ${received} not to be a validation result`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} to be a validation result with passed, score, and evidence properties`,
        pass: false,
      };
    }
  },

  toHaveValidationToken(received) {
    const tokenExists = fs.existsSync(path.join(received || process.cwd(), '.truthforge', 'validation-passed'));

    if (tokenExists) {
      return {
        message: () => `Expected validation token not to exist`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected validation token to exist`,
        pass: false,
      };
    }
  },
});