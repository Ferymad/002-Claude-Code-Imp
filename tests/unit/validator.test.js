const TruthForgeValidator = require('../../src/core/validator');
const fs = require('fs');
const path = require('path');

describe('TruthForgeValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new TruthForgeValidator();
  });

  afterEach(() => {
    // Clean up any validation tokens
    const tokenPath = path.join(process.cwd(), '.truthforge', 'validation-passed');
    if (fs.existsSync(tokenPath)) {
      fs.unlinkSync(tokenPath);
    }
  });

  describe('Constructor', () => {
    test('should initialize with empty claims and behaviors', () => {
      expect(validator.claimedBehaviors).toEqual([]);
      expect(validator.actualBehaviors).toEqual([]);
      expect(validator.validationActive).toBe(false);
    });

    test('should initialize screenshot capture and security validator', () => {
      expect(validator.screenshotCapture).toBeDefined();
      expect(validator.securityValidator).toBeDefined();
    });
  });

  describe('startValidation', () => {
    test('should activate validation', () => {
      validator.startValidation();
      expect(validator.validationActive).toBe(true);
    });
  });

  describe('recordClaim', () => {
    test('should record a claim with timestamp', () => {
      const feature = 'test-feature';
      const expectedBehavior = { type: 'api', status: 200 };
      
      validator.recordClaim(feature, expectedBehavior);
      
      expect(validator.claimedBehaviors).toHaveLength(1);
      expect(validator.claimedBehaviors[0]).toMatchObject({
        feature,
        expected: expectedBehavior,
      });
      expect(validator.claimedBehaviors[0].timestamp).toBeDefined();
    });
  });

  describe('captureReality', () => {
    test('should return null if validation not active', async () => {
      const result = await validator.captureReality();
      expect(result).toBeUndefined();
    });

    test('should capture system state when validation active', async () => {
      validator.startValidation();
      const reality = await validator.captureReality();
      
      expect(reality).toMatchObject({
        timestamp: expect.any(String),
        apiResponses: expect.any(Object),
        uiElements: expect.any(Object),
        databaseState: expect.any(Object),
        performance: expect.any(Object),
      });
    });
  });

  describe('createValidationToken', () => {
    test('should create validation token with evidence', () => {
      const evidence = { test: 'evidence' };
      validator.createValidationToken(evidence);
      
      const tokenPath = path.join(process.cwd(), '.truthforge', 'validation-passed');
      expect(fs.existsSync(tokenPath)).toBe(true);
      
      const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
      expect(tokenData).toMatchObject({
        evidence,
        validator: 'TruthForge Core',
        timestamp: expect.any(String),
      });
    });
  });

  describe('validateAgainstReality', () => {
    test('should return empty array when no claims', () => {
      const divergences = validator.validateAgainstReality();
      expect(divergences).toEqual([]);
    });

    test('should detect divergences between claims and reality', () => {
      validator.recordClaim('test', { type: 'api', status: 200 });
      validator.actualBehaviors.push({
        timestamp: new Date().toISOString(),
        apiResponses: { status: 'critical' }
      });

      const divergences = validator.validateAgainstReality();
      expect(divergences).toHaveLength(1);
    });
  });

  describe('performComprehensiveValidation', () => {
    test('should perform validation and return result', async () => {
      const result = await validator.performComprehensiveValidation();
      
      expect(result).toBeValidationResult();
      expect(result.validationType).toBe('comprehensive');
      expect(result.evidence).toBeDefined();
    });

    test('should create validation token when passing', async () => {
      // Mock a passing validation scenario
      jest.spyOn(validator, 'determineValidationPass').mockReturnValue(true);
      
      const result = await validator.performComprehensiveValidation();
      
      expect(result.passed).toBe(true);
      expect(process.cwd()).toHaveValidationToken();
    });
  });

  describe('behaviorsMatch', () => {
    test('should return false for null inputs', () => {
      expect(validator.behaviorsMatch(null, null)).toBe(false);
      expect(validator.behaviorsMatch({}, null)).toBe(false);
      expect(validator.behaviorsMatch(null, {})).toBe(false);
    });

    test('should compare API behaviors correctly', () => {
      const expected = {
        type: 'api',
        endpoints: [{ url: 'http://localhost:3000', status: 200 }]
      };
      const actual = {
        apiResponses: {
          endpoints: [{ url: 'http://localhost:3000', status: 200, healthy: true }]
        }
      };

      expect(validator.behaviorsMatch(expected, actual)).toBe(true);
    });
  });

  describe('assessSeverity', () => {
    test('should assess LOW severity for minor issues', () => {
      const claim = { expected: { type: 'ui' } };
      const reality = { 
        uiElements: { errors: [{ type: 'minor' }] },
        performance: { overallStatus: 'good' }
      };

      const severity = validator.assessSeverity(claim, reality);
      expect(severity.level).toBe('LOW');
    });

    test('should assess CRITICAL severity for system failures', () => {
      const claim = { expected: { type: 'security' } };
      const reality = { 
        apiResponses: { status: 'critical' },
        databaseState: { 
          inconsistencies: [{ type: 'integrity_check', issue: 'corruption' }] 
        }
      };

      const severity = validator.assessSeverity(claim, reality);
      expect(severity.level).toBe('CRITICAL');
    });
  });
});