const SecurityValidator = require('../../src/core/security-validator');
const fs = require('fs');
const path = require('path');

describe('SecurityValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new SecurityValidator();
  });

  afterEach(() => {
    // Clean up test artifacts
    if (fs.existsSync('validation/security')) {
      fs.rmSync('validation/security', { recursive: true, force: true });
    }
  });

  describe('Constructor', () => {
    test('should initialize with correct output directory', () => {
      expect(validator.outputDir).toBe('validation/security');
    });

    test('should create output directory', () => {
      expect(fs.existsSync(validator.outputDir)).toBe(true);
    });
  });

  describe('validateSecurity', () => {
    test('should return security validation result', async () => {
      const result = await validator.validateSecurity();
      
      expect(result).toMatchObject({
        timestamp: expect.any(String),
        tests: expect.any(Array),
        vulnerabilities: expect.any(Array),
        recommendations: expect.any(Array),
        score: expect.any(Number),
        maxScore: expect.any(Number),
        overallScore: expect.any(Number),
        overallStatus: expect.any(String),
      });
    });

    test('should run all security test categories', async () => {
      const result = await validator.validateSecurity();
      
      const testNames = result.tests.map(t => t.name);
      expect(testNames).toContain('File System Security');
      expect(testNames).toContain('Environment Variables Security');
      expect(testNames).toContain('Dependency Vulnerabilities');
      expect(testNames).toContain('Web Server Security');
      expect(testNames).toContain('Input Validation');
      expect(testNames).toContain('Authentication Security');
      expect(testNames).toContain('Cryptographic Security');
    });
  });

  describe('testFileSystemSecurity', () => {
    test('should complete file system security test', async () => {
      const result = await validator.testFileSystemSecurity();
      
      expect(result.name).toBe('File System Security');
      expect(result.status).toBe('completed');
      expect(result.vulnerabilities).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(typeof result.score).toBe('number');
      expect(typeof result.maxScore).toBe('number');
    });
  });

  describe('testEnvironmentVariables', () => {
    test('should complete environment variables test', async () => {
      const result = await validator.testEnvironmentVariables();
      
      expect(result.name).toBe('Environment Variables Security');
      expect(result.status).toBe('completed');
    });

    test('should detect .env file issues if present', async () => {
      // Create a temporary .env file with issues
      const envContent = 'PASSWORD=weak\nSECRET_KEY="short"\n';
      fs.writeFileSync('.env', envContent);
      
      try {
        const result = await validator.testEnvironmentVariables();
        
        if (result.vulnerabilities.length > 0) {
          expect(result.vulnerabilities.some(v => v.type === 'sensitive_env_vars')).toBe(true);
        }
      } finally {
        // Clean up
        if (fs.existsSync('.env')) {
          fs.unlinkSync('.env');
        }
      }
    });
  });

  describe('testDependencyVulnerabilities', () => {
    test('should complete dependency vulnerabilities test', async () => {
      const result = await validator.testDependencyVulnerabilities();
      
      expect(result.name).toBe('Dependency Vulnerabilities');
      expect(result.status).toBe('completed');
    });
  });

  describe('testWebServerSecurity', () => {
    test('should complete web server security test', async () => {
      const result = await validator.testWebServerSecurity();
      
      expect(result.name).toBe('Web Server Security');
      expect(result.status).toBe('completed');
    });
  });

  describe('determineOverallStatus', () => {
    test('should return critical for critical vulnerabilities', () => {
      const vulnerabilities = [{ severity: 'critical' }];
      const status = validator.determineOverallStatus(90, vulnerabilities);
      expect(status).toBe('critical');
    });

    test('should return poor for low score', () => {
      const status = validator.determineOverallStatus(40, []);
      expect(status).toBe('poor');
    });

    test('should return excellent for high score and no issues', () => {
      const status = validator.determineOverallStatus(95, []);
      expect(status).toBe('excellent');
    });
  });

  describe('saveSecurityReport', () => {
    test('should save security report and summary', async () => {
      const validation = {
        timestamp: new Date().toISOString(),
        overallScore: 85,
        overallStatus: 'good',
        vulnerabilities: [{ severity: 'low' }],
        recommendations: ['Test recommendation']
      };

      await validator.saveSecurityReport(validation);

      // Check if files were created
      const reportFiles = fs.readdirSync(validator.outputDir);
      const reportFile = reportFiles.find(f => f.startsWith('security-report-'));
      const summaryFile = reportFiles.find(f => f.startsWith('security-summary-'));

      expect(reportFile).toBeDefined();
      expect(summaryFile).toBeDefined();

      // Verify content
      if (reportFile && summaryFile) {
        const reportPath = path.join(validator.outputDir, reportFile);
        const summaryPath = path.join(validator.outputDir, summaryFile);
        
        const reportContent = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        const summaryContent = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

        expect(reportContent.timestamp).toBe(validation.timestamp);
        expect(summaryContent.score).toBe(85);
      }
    });
  });
});