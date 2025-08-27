// TruthForge Security Validation System
// Comprehensive security testing and validation

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

class SecurityValidator {
    constructor() {
        this.outputDir = 'validation/security';
        this.commonPorts = [3000, 3001, 4000, 5000, 8000, 8080, 9000];
        this.ensureOutputDir();
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    // Main security validation entry point
    async validateSecurity() {
        console.log('🔒 Starting comprehensive security validation...');
        
        const validation = {
            timestamp: new Date().toISOString(),
            tests: [],
            vulnerabilities: [],
            recommendations: [],
            score: 0,
            maxScore: 0
        };

        try {
            // Run all security tests
            const tests = [
                () => this.testFileSystemSecurity(),
                () => this.testEnvironmentVariables(),
                () => this.testDependencyVulnerabilities(),
                () => this.testWebServerSecurity(),
                () => this.testInputValidation(),
                () => this.testAuthenticationSecurity(),
                () => this.testCryptographicSecurity()
            ];

            for (const test of tests) {
                try {
                    const result = await test();
                    validation.tests.push(result);
                    validation.score += result.score || 0;
                    validation.maxScore += result.maxScore || 0;
                    
                    if (result.vulnerabilities) {
                        validation.vulnerabilities.push(...result.vulnerabilities);
                    }
                    if (result.recommendations) {
                        validation.recommendations.push(...result.recommendations);
                    }
                } catch (error) {
                    validation.tests.push({
                        name: 'Unknown Test',
                        status: 'error',
                        error: error.message,
                        score: 0,
                        maxScore: 10
                    });
                }
            }

            // Calculate overall security score
            validation.overallScore = validation.maxScore > 0 
                ? Math.round((validation.score / validation.maxScore) * 100)
                : 0;

            validation.overallStatus = this.determineOverallStatus(validation.overallScore, validation.vulnerabilities);

            // Save detailed report
            await this.saveSecurityReport(validation);

            return validation;

        } catch (error) {
            console.error(`Security validation failed: ${error.message}`);
            return {
                timestamp: new Date().toISOString(),
                error: error.message,
                tests: [],
                vulnerabilities: [],
                score: 0,
                overallStatus: 'error'
            };
        }
    }

    // Test file system security
    async testFileSystemSecurity() {
        const test = {
            name: 'File System Security',
            status: 'running',
            checks: [],
            vulnerabilities: [],
            recommendations: [],
            score: 0,
            maxScore: 30
        };

        try {
            // Check for sensitive files
            const sensitiveFiles = [
                '.env', '.env.local', '.env.production',
                'config.json', 'secrets.json',
                'id_rsa', 'id_dsa', '*.pem', '*.key',
                'database.yml', 'wp-config.php'
            ];

            const foundSensitive = [];
            for (const pattern of sensitiveFiles) {
                try {
                    const found = execSync(`find . -name "${pattern}" -type f 2>/dev/null || true`,
                        { encoding: 'utf8' }).trim();
                    if (found) {
                        foundSensitive.push(...found.split('\n').filter(f => f));
                    }
                } catch (error) {
                    // Continue with other checks
                }
            }

            if (foundSensitive.length > 0) {
                test.vulnerabilities.push({
                    severity: 'medium',
                    type: 'sensitive_files_exposed',
                    description: 'Sensitive files found in repository',
                    files: foundSensitive,
                    impact: 'Potential credential exposure'
                });
                test.recommendations.push('Move sensitive files outside repository or add to .gitignore');
            } else {
                test.score += 10;
            }

            // Check file permissions
            try {
                const worldWritable = execSync('find . -type f -perm -002 2>/dev/null || true',
                    { encoding: 'utf8' }).trim();
                
                if (worldWritable) {
                    test.vulnerabilities.push({
                        severity: 'low',
                        type: 'world_writable_files',
                        description: 'World-writable files found',
                        files: worldWritable.split('\n').filter(f => f),
                        impact: 'Potential unauthorized file modification'
                    });
                    test.recommendations.push('Review and fix file permissions');
                } else {
                    test.score += 10;
                }
            } catch (error) {
                // Permission check might not work on all systems
            }

            // Check for .git directory exposure
            if (fs.existsSync('.git')) {
                try {
                    const gitConfig = fs.readFileSync('.git/config', 'utf8');
                    if (gitConfig.includes('http://') && !gitConfig.includes('https://')) {
                        test.vulnerabilities.push({
                            severity: 'low',
                            type: 'insecure_git_remote',
                            description: 'Git remote uses HTTP instead of HTTPS',
                            impact: 'Potential man-in-the-middle attacks'
                        });
                        test.recommendations.push('Use HTTPS for git remotes');
                    } else {
                        test.score += 10;
                    }
                } catch (error) {
                    // Git config might not be readable
                }
            }

            test.status = 'completed';
            return test;

        } catch (error) {
            test.status = 'error';
            test.error = error.message;
            return test;
        }
    }

    // Test environment variables security
    async testEnvironmentVariables() {
        const test = {
            name: 'Environment Variables Security',
            status: 'running',
            vulnerabilities: [],
            recommendations: [],
            score: 0,
            maxScore: 20
        };

        try {
            if (fs.existsSync('.env')) {
                const envContent = fs.readFileSync('.env', 'utf8');
                const lines = envContent.split('\n');
                
                const suspiciousPatterns = [
                    { pattern: /password\s*=/i, name: 'password in .env' },
                    { pattern: /secret\s*=/i, name: 'secret in .env' },
                    { pattern: /key\s*=[^=]*$/i, name: 'key in .env' },
                    { pattern: /token\s*=/i, name: 'token in .env' },
                    { pattern: /=\s*""/i, name: 'empty credentials' }
                ];

                const foundIssues = [];
                for (const line of lines) {
                    for (const { pattern, name } of suspiciousPatterns) {
                        if (pattern.test(line) && !line.startsWith('#')) {
                            foundIssues.push({ line: line.substring(0, 50), issue: name });
                        }
                    }
                }

                if (foundIssues.length > 0) {
                    test.vulnerabilities.push({
                        severity: 'high',
                        type: 'sensitive_env_vars',
                        description: 'Potentially sensitive environment variables found',
                        details: foundIssues,
                        impact: 'Credential exposure if .env file is committed'
                    });
                    test.recommendations.push('Ensure .env files are in .gitignore');
                    test.recommendations.push('Use environment-specific credential management');
                } else {
                    test.score += 15;
                }

                // Check if .env is in .gitignore
                if (fs.existsSync('.gitignore')) {
                    const gitignore = fs.readFileSync('.gitignore', 'utf8');
                    if (gitignore.includes('.env')) {
                        test.score += 5;
                    } else {
                        test.vulnerabilities.push({
                            severity: 'critical',
                            type: 'env_not_ignored',
                            description: '.env file exists but not in .gitignore',
                            impact: 'Environment variables may be committed to repository'
                        });
                        test.recommendations.push('Add .env* to .gitignore immediately');
                    }
                }
            } else {
                test.score += 10; // No .env file found
            }

            test.status = 'completed';
            return test;

        } catch (error) {
            test.status = 'error';
            test.error = error.message;
            return test;
        }
    }

    // Test dependency vulnerabilities
    async testDependencyVulnerabilities() {
        const test = {
            name: 'Dependency Vulnerabilities',
            status: 'running',
            vulnerabilities: [],
            recommendations: [],
            score: 0,
            maxScore: 25
        };

        try {
            if (fs.existsSync('package.json')) {
                // Try npm audit
                try {
                    const auditResult = execSync('npm audit --json', { encoding: 'utf8', timeout: 30000 });
                    const audit = JSON.parse(auditResult);
                    
                    if (audit.vulnerabilities) {
                        const vulnCount = Object.keys(audit.vulnerabilities).length;
                        if (vulnCount > 0) {
                            test.vulnerabilities.push({
                                severity: 'medium',
                                type: 'npm_vulnerabilities',
                                description: `${vulnCount} npm package vulnerabilities found`,
                                details: audit,
                                impact: 'Potential security vulnerabilities in dependencies'
                            });
                            test.recommendations.push('Run "npm audit fix" to resolve vulnerabilities');
                            test.score += Math.max(0, 15 - vulnCount * 2);
                        } else {
                            test.score += 15;
                        }
                    }
                } catch (error) {
                    // npm audit might fail, try alternative approaches
                    test.recommendations.push('Run npm audit manually to check for vulnerabilities');
                }

                // Check for outdated dependencies
                try {
                    const outdated = execSync('npm outdated --json', { encoding: 'utf8', timeout: 20000 });
                    if (outdated.trim()) {
                        const outdatedPackages = JSON.parse(outdated);
                        const count = Object.keys(outdatedPackages).length;
                        
                        if (count > 5) {
                            test.vulnerabilities.push({
                                severity: 'low',
                                type: 'outdated_dependencies',
                                description: `${count} outdated packages found`,
                                impact: 'Missing security patches and bug fixes'
                            });
                            test.recommendations.push('Update outdated dependencies regularly');
                            test.score += 5;
                        } else {
                            test.score += 10;
                        }
                    } else {
                        test.score += 10;
                    }
                } catch (error) {
                    // npm outdated might fail if no package.json
                }
            }

            // Check for Python dependencies if present
            if (fs.existsSync('requirements.txt') || fs.existsSync('Pipfile')) {
                try {
                    execSync('safety check', { encoding: 'utf8', timeout: 30000 });
                    test.score += 5;
                } catch (error) {
                    if (error.message.includes('vulnerabilities found')) {
                        test.vulnerabilities.push({
                            severity: 'medium',
                            type: 'python_vulnerabilities',
                            description: 'Python package vulnerabilities found',
                            impact: 'Potential security vulnerabilities in Python dependencies'
                        });
                        test.recommendations.push('Run "safety check" and update vulnerable packages');
                    }
                }
            }

            test.status = 'completed';
            return test;

        } catch (error) {
            test.status = 'error';
            test.error = error.message;
            return test;
        }
    }

    // Test web server security
    async testWebServerSecurity() {
        const test = {
            name: 'Web Server Security',
            status: 'running',
            vulnerabilities: [],
            recommendations: [],
            score: 0,
            maxScore: 30
        };

        try {
            const runningServers = [];
            
            // Check for running servers
            for (const port of this.commonPorts) {
                try {
                    execSync(`curl -s --max-time 2 -I http://localhost:${port}`, { timeout: 3000 });
                    runningServers.push(port);
                } catch (error) {
                    // Server not running on this port
                }
            }

            if (runningServers.length === 0) {
                test.score += 10; // No servers running
                test.status = 'completed';
                return test;
            }

            // Test each running server
            for (const port of runningServers) {
                const serverTests = await this.testServerPort(port);
                test.vulnerabilities.push(...serverTests.vulnerabilities);
                test.recommendations.push(...serverTests.recommendations);
                test.score += serverTests.score;
            }

            test.status = 'completed';
            return test;

        } catch (error) {
            test.status = 'error';
            test.error = error.message;
            return test;
        }
    }

    // Test specific server port
    async testServerPort(port) {
        const result = {
            vulnerabilities: [],
            recommendations: [],
            score: 0
        };

        try {
            // Test HTTP headers
            const headers = execSync(`curl -s -I http://localhost:${port}`, 
                { encoding: 'utf8', timeout: 5000 });
            
            const securityHeaders = [
                'x-frame-options',
                'x-content-type-options',
                'x-xss-protection',
                'strict-transport-security',
                'content-security-policy'
            ];

            const missingHeaders = securityHeaders.filter(header => 
                !headers.toLowerCase().includes(header)
            );

            if (missingHeaders.length > 0) {
                result.vulnerabilities.push({
                    severity: 'medium',
                    type: 'missing_security_headers',
                    description: `Missing security headers on port ${port}`,
                    details: missingHeaders,
                    impact: 'Potential XSS, clickjacking, and other client-side attacks'
                });
                result.recommendations.push(`Add security headers: ${missingHeaders.join(', ')}`);
            } else {
                result.score += 5;
            }

            // Test for server information disclosure
            if (headers.includes('Server:') || headers.includes('X-Powered-By:')) {
                result.vulnerabilities.push({
                    severity: 'low',
                    type: 'server_info_disclosure',
                    description: `Server information disclosed on port ${port}`,
                    impact: 'Information leakage that could help attackers'
                });
                result.recommendations.push('Hide server version information');
            } else {
                result.score += 3;
            }

            // Test for HTTPS (if running on standard web ports)
            if ([80, 3000, 8000, 8080].includes(port)) {
                try {
                    execSync(`curl -s --max-time 2 https://localhost:${port + 443} -k`, { timeout: 3000 });
                    result.score += 5; // HTTPS available
                } catch (error) {
                    result.vulnerabilities.push({
                        severity: 'medium',
                        type: 'no_https',
                        description: `No HTTPS available for port ${port}`,
                        impact: 'Data transmitted in plain text'
                    });
                    result.recommendations.push('Enable HTTPS/TLS encryption');
                }
            }

        } catch (error) {
            // Server might not be accessible
        }

        return result;
    }

    // Test input validation
    async testInputValidation() {
        const test = {
            name: 'Input Validation',
            status: 'running',
            vulnerabilities: [],
            recommendations: [],
            score: 0,
            maxScore: 20
        };

        try {
            // Look for potential SQL injection vulnerabilities
            const sqlPatterns = [
                'SELECT.*FROM.*WHERE',
                'INSERT.*INTO.*VALUES',
                'UPDATE.*SET.*WHERE',
                'DELETE.*FROM.*WHERE'
            ];

            const codeFiles = [];
            try {
                const findResult = execSync('find . -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.php" 2>/dev/null || true',
                    { encoding: 'utf8' }).trim();
                if (findResult) {
                    codeFiles.push(...findResult.split('\n').filter(f => f));
                }
            } catch (error) {
                // Continue with other tests
            }

            let potentialSQLInjections = 0;
            let hasInputValidation = false;

            for (const file of codeFiles.slice(0, 20)) { // Limit to avoid timeout
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    
                    // Check for SQL patterns with string concatenation
                    for (const pattern of sqlPatterns) {
                        if (new RegExp(pattern + '.*\\+.*\\$', 'i').test(content)) {
                            potentialSQLInjections++;
                        }
                    }

                    // Check for input validation patterns
                    const validationPatterns = [
                        'express-validator',
                        'joi',
                        'yup',
                        'validate',
                        'sanitize'
                    ];

                    if (validationPatterns.some(pattern => content.includes(pattern))) {
                        hasInputValidation = true;
                    }

                } catch (error) {
                    // File might not be readable
                }
            }

            if (potentialSQLInjections > 0) {
                test.vulnerabilities.push({
                    severity: 'high',
                    type: 'potential_sql_injection',
                    description: `${potentialSQLInjections} potential SQL injection vulnerabilities found`,
                    impact: 'Database compromise and data theft'
                });
                test.recommendations.push('Use parameterized queries and input validation');
            } else {
                test.score += 10;
            }

            if (hasInputValidation) {
                test.score += 10;
            } else {
                test.vulnerabilities.push({
                    severity: 'medium',
                    type: 'no_input_validation',
                    description: 'No input validation libraries detected',
                    impact: 'Potential injection and validation bypass attacks'
                });
                test.recommendations.push('Implement comprehensive input validation');
            }

            test.status = 'completed';
            return test;

        } catch (error) {
            test.status = 'error';
            test.error = error.message;
            return test;
        }
    }

    // Test authentication security
    async testAuthenticationSecurity() {
        const test = {
            name: 'Authentication Security',
            status: 'running',
            vulnerabilities: [],
            recommendations: [],
            score: 0,
            maxScore: 25
        };

        try {
            // Look for authentication patterns in code
            const authPatterns = [
                { pattern: /password.*=.*"[^"]{1,5}"/i, issue: 'weak_password', severity: 'high' },
                { pattern: /jwt.*secret.*=.*"[^"]{1,20}"/i, issue: 'weak_jwt_secret', severity: 'high' },
                { pattern: /bcrypt|scrypt|argon2/i, issue: 'secure_hashing', severity: 'positive' },
                { pattern: /md5|sha1(?!.*hmac)/i, issue: 'weak_hashing', severity: 'medium' },
                { pattern: /session.*secret.*=.*"[^"]{1,20}"/i, issue: 'weak_session_secret', severity: 'medium' }
            ];

            const codeFiles = [];
            try {
                const findResult = execSync('find . -name "*.js" -o -name "*.ts" -o -name "*.py" 2>/dev/null | head -20',
                    { encoding: 'utf8' }).trim();
                if (findResult) {
                    codeFiles.push(...findResult.split('\n').filter(f => f));
                }
            } catch (error) {
                // Continue
            }

            let hasSecureHashing = false;
            const foundIssues = [];

            for (const file of codeFiles) {
                try {
                    // Skip scanning security validator files and test files to avoid false positives
                    if (file.includes('security-validator.js') || 
                        file.includes('validator.js') || 
                        file.includes('.test.js') || 
                        file.includes('.eslintrc.js')) {
                        continue;
                    }
                    
                    const content = fs.readFileSync(file, 'utf8');
                    
                    for (const { pattern, issue, severity } of authPatterns) {
                        if (pattern.test(content)) {
                            if (issue === 'secure_hashing') {
                                hasSecureHashing = true;
                            } else {
                                foundIssues.push({ file, issue, severity });
                            }
                        }
                    }
                } catch (error) {
                    // File not readable
                }
            }

            // Evaluate findings
            if (hasSecureHashing) {
                test.score += 10;
            } else {
                test.vulnerabilities.push({
                    severity: 'medium',
                    type: 'no_secure_hashing',
                    description: 'No secure password hashing detected',
                    impact: 'Passwords may be stored insecurely'
                });
                test.recommendations.push('Use bcrypt, scrypt, or Argon2 for password hashing');
            }

            for (const issue of foundIssues) {
                test.vulnerabilities.push({
                    severity: issue.severity,
                    type: issue.issue,
                    description: `Authentication security issue in ${issue.file}`,
                    impact: 'Potential authentication bypass or credential theft'
                });
            }

            if (foundIssues.length === 0) {
                test.score += 15;
            }

            test.status = 'completed';
            return test;

        } catch (error) {
            test.status = 'error';
            test.error = error.message;
            return test;
        }
    }

    // Test cryptographic security
    async testCryptographicSecurity() {
        const test = {
            name: 'Cryptographic Security',
            status: 'running',
            vulnerabilities: [],
            recommendations: [],
            score: 0,
            maxScore: 15
        };

        try {
            // Check for hardcoded encryption keys or weak crypto
            const cryptoPatterns = [
                { pattern: /crypto\.createCipher\(/i, issue: 'deprecated_crypto', severity: 'medium' },
                { pattern: /des|rc4|md4/i, issue: 'weak_crypto_algorithm', severity: 'high' },
                { pattern: /randomBytes\(.*[1-9]\)/i, issue: 'good_random', severity: 'positive' },
                { pattern: /Math\.random\(\)/i, issue: 'weak_random', severity: 'medium' }
            ];

            const codeFiles = [];
            try {
                const findResult = execSync('find . -name "*.js" -o -name "*.ts" 2>/dev/null | head -15',
                    { encoding: 'utf8' }).trim();
                if (findResult) {
                    codeFiles.push(...findResult.split('\n').filter(f => f));
                }
            } catch (error) {
                // Continue
            }

            let hasGoodCrypto = false;
            const issues = [];

            for (const file of codeFiles) {
                try {
                    // Skip scanning security validator files and test files to avoid false positives
                    if (file.includes('security-validator.js') || 
                        file.includes('validator.js') || 
                        file.includes('.test.js') || 
                        file.includes('.eslintrc.js')) {
                        continue;
                    }
                    
                    const content = fs.readFileSync(file, 'utf8');
                    
                    for (const { pattern, issue, severity } of cryptoPatterns) {
                        if (pattern.test(content)) {
                            if (issue === 'good_random') {
                                hasGoodCrypto = true;
                            } else {
                                issues.push({ file, issue, severity });
                            }
                        }
                    }
                } catch (error) {
                    // File not readable
                }
            }

            if (hasGoodCrypto) {
                test.score += 8;
            }

            if (issues.length === 0) {
                test.score += 7;
            } else {
                for (const issue of issues) {
                    test.vulnerabilities.push({
                        severity: issue.severity,
                        type: issue.issue,
                        description: `Cryptographic issue in ${issue.file}`,
                        impact: 'Weak encryption or random number generation'
                    });
                }
                test.recommendations.push('Use strong cryptographic algorithms and secure random number generation');
            }

            test.status = 'completed';
            return test;

        } catch (error) {
            test.status = 'error';
            test.error = error.message;
            return test;
        }
    }

    // Determine overall security status
    determineOverallStatus(score, vulnerabilities) {
        const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical').length;
        const highVulns = vulnerabilities.filter(v => v.severity === 'high').length;

        if (criticalVulns > 0) return 'critical';
        if (highVulns > 2) return 'poor';
        if (score < 50) return 'poor';
        if (score < 70) return 'fair';
        if (score < 85) return 'good';
        return 'excellent';
    }

    // Save security report
    async saveSecurityReport(validation) {
        const reportPath = path.join(this.outputDir, `security-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(validation, null, 2));
        
        // Also create a summary report
        const summary = {
            timestamp: validation.timestamp,
            score: validation.overallScore,
            status: validation.overallStatus,
            totalVulnerabilities: validation.vulnerabilities.length,
            criticalVulnerabilities: validation.vulnerabilities.filter(v => v.severity === 'critical').length,
            highVulnerabilities: validation.vulnerabilities.filter(v => v.severity === 'high').length,
            recommendations: validation.recommendations.slice(0, 5) // Top 5 recommendations
        };

        const summaryPath = path.join(this.outputDir, `security-summary-${Date.now()}.json`);
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

        console.log(`📋 Security report saved: ${reportPath}`);
        console.log(`📊 Security summary saved: ${summaryPath}`);
    }
}

module.exports = SecurityValidator;