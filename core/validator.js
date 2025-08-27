// TruthForge Core Validator
// Runtime validation and proof verification

const ScreenshotCapture = require('./screenshot-capture');
const SecurityValidator = require('./security-validator');

class TruthForgeValidator {
    constructor() {
        this.claimedBehaviors = [];
        this.actualBehaviors = [];
        this.validationActive = false;
        this.screenshotCapture = new ScreenshotCapture();
        this.securityValidator = new SecurityValidator();
    }

    // Start monitoring claims vs reality
    startValidation() {
        this.validationActive = true;
        console.log("🔍 TruthForge validation active");
    }

    // Record what AI agents claim will happen
    recordClaim(feature, expectedBehavior) {
        this.claimedBehaviors.push({
            feature,
            expected: expectedBehavior,
            timestamp: new Date().toISOString()
        });
    }

    // Capture what actually happens
    async captureReality() {
        if (!this.validationActive) return;

        const reality = {
            timestamp: new Date().toISOString(),
            apiResponses: await this.checkAPIHealth(),
            uiElements: await this.verifyUIState(),
            databaseState: await this.queryDatabase(),
            performance: await this.measurePerformance()
        };

        this.actualBehaviors.push(reality);
        return reality;
    }

    // Compare claims with reality
    validateAgainstReality() {
        const divergences = [];
        
        this.claimedBehaviors.forEach(claim => {
            const reality = this.findMatchingReality(claim);
            if (reality && !this.behaviorsMatch(claim.expected, reality)) {
                divergences.push({
                    claim: claim,
                    reality: reality,
                    severity: this.assessSeverity(claim, reality)
                });
            }
        });

        if (divergences.length > 0) {
            this.handleCatastrophicFailure(divergences);
        }

        return divergences;
    }

    // Create validation proof token
    createValidationToken(evidence) {
        const fs = require('fs');
        
        // Create .truthforge directory if it doesn't exist
        if (!fs.existsSync('.truthforge')) {
            fs.mkdirSync('.truthforge');
        }

        // Create validation token with evidence
        const validationData = {
            timestamp: new Date().toISOString(),
            evidence: evidence,
            validator: 'TruthForge Core'
        };

        fs.writeFileSync('.truthforge/validation-passed', JSON.stringify(validationData, null, 2));
        console.log("✅ Validation token created");
    }

    // Emergency procedures
    handleCatastrophicFailure(divergences) {
        console.log("🚨 CATASTROPHIC FAILURE DETECTED");
        console.log("Divergences found:", divergences);
        
        // Update failure memory
        this.updateFailureMemory(divergences);
        
        // Trigger emergency procedures
        this.triggerEmergencyProtocol();
    }

    async checkAPIHealth() {
        try {
            const healthResults = {
                status: 'healthy',
                endpoints: [],
                timestamp: new Date().toISOString()
            };

            // Check for common API endpoints
            const possibleEndpoints = [
                'http://localhost:3000/api/health',
                'http://localhost:8080/health',
                'http://localhost:4000/graphql',
                'http://localhost:5000/api/status'
            ];

            const { execSync } = require('child_process');
            
            for (const endpoint of possibleEndpoints) {
                try {
                    // Use curl with timeout to check endpoint
                    const result = execSync(`curl -s -o /dev/null -w "%{http_code}" --max-time 5 ${endpoint}`, 
                        { encoding: 'utf8', timeout: 6000 });
                    
                    const status = parseInt(result.trim());
                    healthResults.endpoints.push({
                        url: endpoint,
                        status: status,
                        healthy: status >= 200 && status < 400,
                        responseTime: Date.now()
                    });
                } catch (error) {
                    healthResults.endpoints.push({
                        url: endpoint,
                        status: 0,
                        healthy: false,
                        error: 'Connection failed'
                    });
                }
            }

            // Overall health status
            const healthyEndpoints = healthResults.endpoints.filter(e => e.healthy);
            if (healthyEndpoints.length === 0 && healthResults.endpoints.length > 0) {
                healthResults.status = 'critical';
            } else if (healthyEndpoints.length < healthResults.endpoints.length) {
                healthResults.status = 'degraded';
            }

            return healthResults;
            
        } catch (error) {
            return {
                status: 'error',
                endpoints: [],
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async verifyUIState() {
        try {
            // Check for common web UI patterns
            const uiValidation = {
                elements: [],
                errors: [],
                screenshots: [],
                timestamp: new Date().toISOString()
            };

            // Look for HTML files that might indicate a web UI
            const { execSync } = require('child_process');
            const fs = require('fs');
            
            try {
                // Find HTML files
                const htmlFiles = execSync('find . -name "*.html" -type f 2>/dev/null || true', 
                    { encoding: 'utf8' }).trim().split('\n').filter(f => f);
                
                uiValidation.elements.push({
                    type: 'html_files',
                    count: htmlFiles.length,
                    files: htmlFiles.slice(0, 5) // Limit to first 5
                });
            } catch (error) {
                uiValidation.errors.push({
                    type: 'file_search_error',
                    message: error.message
                });
            }

            // Check for common UI frameworks
            try {
                if (fs.existsSync('package.json')) {
                    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
                    
                    const uiFrameworks = ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt'];
                    const detectedFrameworks = uiFrameworks.filter(fw => 
                        Object.keys(dependencies || {}).some(dep => dep.includes(fw))
                    );

                    uiValidation.elements.push({
                        type: 'ui_frameworks',
                        detected: detectedFrameworks
                    });
                }
            } catch (error) {
                uiValidation.errors.push({
                    type: 'package_json_error',
                    message: error.message
                });
            }

            // Check if any local servers are running (potential UI) and capture screenshots
            try {
                const netstat = execSync('netstat -tln 2>/dev/null | grep ":300[0-9]\\|:400[0-9]\\|:500[0-9]\\|:800[0-9]" || true',
                    { encoding: 'utf8' }).trim();
                
                if (netstat) {
                    const runningPorts = netstat.split('\n').map(line => {
                        const match = line.match(/:(\d+)/);
                        return match ? parseInt(match[1]) : null;
                    }).filter(port => port);

                    uiValidation.elements.push({
                        type: 'running_servers',
                        ports: runningPorts,
                        message: 'Potential UI servers detected'
                    });

                    // Capture screenshots of running servers
                    try {
                        console.log('📸 Capturing screenshots of detected UI servers...');
                        const screenshotResults = await this.screenshotCapture.captureLocalhost();
                        
                        uiValidation.screenshots = screenshotResults.filter(result => result.success);
                        
                        if (screenshotResults.some(r => !r.success)) {
                            uiValidation.errors.push({
                                type: 'screenshot_errors',
                                failures: screenshotResults.filter(r => !r.success)
                            });
                        }
                    } catch (screenshotError) {
                        uiValidation.errors.push({
                            type: 'screenshot_capture_error',
                            message: screenshotError.message
                        });
                    }
                }
            } catch (error) {
                // Netstat might not be available on all systems
                uiValidation.errors.push({
                    type: 'network_check_error',
                    message: 'Could not check for running servers'
                });
            }

            return uiValidation;
            
        } catch (error) {
            return {
                elements: [],
                errors: [{
                    type: 'validation_error',
                    message: error.message
                }],
                screenshots: [],
                timestamp: new Date().toISOString()
            };
        }
    }

    async queryDatabase() {
        try {
            const dbValidation = {
                databases: [],
                tables: [],
                inconsistencies: [],
                connections: [],
                timestamp: new Date().toISOString()
            };

            const fs = require('fs');
            const { execSync } = require('child_process');

            // Check for common database files/configurations
            const dbIndicators = [
                { type: 'sqlite', patterns: ['*.db', '*.sqlite', '*.sqlite3'], command: 'sqlite3' },
                { type: 'postgres', patterns: ['.env'], envVars: ['DATABASE_URL', 'POSTGRES_URL'] },
                { type: 'mongodb', patterns: ['.env'], envVars: ['MONGODB_URL', 'MONGO_URL'] },
                { type: 'mysql', patterns: ['.env'], envVars: ['MYSQL_URL', 'MYSQL_DATABASE'] }
            ];

            // Check for SQLite databases
            try {
                const sqliteFiles = execSync('find . -name "*.db" -o -name "*.sqlite" -o -name "*.sqlite3" 2>/dev/null || true',
                    { encoding: 'utf8' }).trim().split('\n').filter(f => f);
                
                for (const dbFile of sqliteFiles) {
                    if (fs.existsSync(dbFile)) {
                        try {
                            // Get basic info about SQLite database
                            const tables = execSync(`sqlite3 "${dbFile}" ".tables"`, 
                                { encoding: 'utf8', timeout: 5000 }).trim();
                            
                            const tableList = tables ? tables.split(/\s+/).filter(t => t) : [];
                            
                            dbValidation.databases.push({
                                type: 'sqlite',
                                file: dbFile,
                                tables: tableList,
                                tableCount: tableList.length
                            });

                            // Check for basic data integrity
                            try {
                                const integrity = execSync(`sqlite3 "${dbFile}" "PRAGMA integrity_check;"`,
                                    { encoding: 'utf8', timeout: 5000 }).trim();
                                
                                if (integrity !== 'ok') {
                                    dbValidation.inconsistencies.push({
                                        database: dbFile,
                                        type: 'integrity_check',
                                        issue: integrity
                                    });
                                }
                            } catch (error) {
                                dbValidation.inconsistencies.push({
                                    database: dbFile,
                                    type: 'integrity_check_failed',
                                    error: error.message
                                });
                            }
                        } catch (error) {
                            dbValidation.inconsistencies.push({
                                database: dbFile,
                                type: 'access_error',
                                error: error.message
                            });
                        }
                    }
                }
            } catch (error) {
                // SQLite command might not be available
            }

            // Check for environment variables that might indicate remote databases
            try {
                if (fs.existsSync('.env')) {
                    const envContent = fs.readFileSync('.env', 'utf8');
                    const lines = envContent.split('\n');
                    
                    for (const line of lines) {
                        if (line.includes('DATABASE_URL') || line.includes('POSTGRES_URL') || 
                            line.includes('MONGODB_URL') || line.includes('MYSQL_URL')) {
                            
                            // Don't log the actual URL for security
                            const varName = line.split('=')[0];
                            dbValidation.connections.push({
                                type: 'environment_variable',
                                variable: varName,
                                detected: true
                            });
                        }
                    }
                }
            } catch (error) {
                dbValidation.inconsistencies.push({
                    type: 'env_file_error',
                    error: error.message
                });
            }

            // Check for common ORM/database configuration files
            const configFiles = ['prisma/schema.prisma', 'knexfile.js', 'sequelize.config.js', 'typeorm.config.ts'];
            for (const configFile of configFiles) {
                if (fs.existsSync(configFile)) {
                    dbValidation.connections.push({
                        type: 'config_file',
                        file: configFile,
                        detected: true
                    });
                }
            }

            return dbValidation;
            
        } catch (error) {
            return {
                databases: [],
                tables: [],
                inconsistencies: [{
                    type: 'validation_error',
                    error: error.message
                }],
                connections: [],
                timestamp: new Date().toISOString()
            };
        }
    }

    async measurePerformance() {
        try {
            const performance = {
                system: {},
                application: {},
                benchmarks: [],
                timestamp: new Date().toISOString()
            };

            const { execSync } = require('child_process');
            const os = require('os');
            const fs = require('fs');

            // System performance metrics
            performance.system = {
                memory: {
                    total: Math.round(os.totalmem() / 1024 / 1024), // MB
                    free: Math.round(os.freemem() / 1024 / 1024),   // MB
                    used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024),
                    percentage: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
                },
                cpu: {
                    cores: os.cpus().length,
                    model: os.cpus()[0].model,
                    loadAverage: os.loadavg()
                },
                uptime: Math.round(os.uptime())
            };

            // Application performance - check for Node.js processes
            try {
                const nodeProcesses = execSync('ps aux | grep node | grep -v grep || true',
                    { encoding: 'utf8' }).trim();
                
                if (nodeProcesses) {
                    const processes = nodeProcesses.split('\n').map(line => {
                        const parts = line.trim().split(/\s+/);
                        return {
                            pid: parts[1],
                            cpu: parseFloat(parts[2]) || 0,
                            memory: parseFloat(parts[3]) || 0,
                            command: parts.slice(10).join(' ')
                        };
                    });

                    performance.application.nodeProcesses = processes;
                    performance.application.totalCpuUsage = processes.reduce((sum, p) => sum + p.cpu, 0);
                    performance.application.totalMemoryUsage = processes.reduce((sum, p) => sum + p.memory, 0);
                }
            } catch (error) {
                performance.application.error = 'Could not check Node.js processes';
            }

            // Simple benchmark tests
            const benchmarks = [];

            // File I/O benchmark
            try {
                const startTime = Date.now();
                const testData = 'x'.repeat(10000);
                fs.writeFileSync('/tmp/truthforge-benchmark.txt', testData);
                const readData = fs.readFileSync('/tmp/truthforge-benchmark.txt', 'utf8');
                fs.unlinkSync('/tmp/truthforge-benchmark.txt');
                const endTime = Date.now();
                
                benchmarks.push({
                    name: 'file_io',
                    duration: endTime - startTime,
                    unit: 'ms',
                    description: '10KB file write/read/delete'
                });
            } catch (error) {
                benchmarks.push({
                    name: 'file_io',
                    error: error.message,
                    description: 'File I/O benchmark failed'
                });
            }

            // CPU benchmark (simple calculation)
            try {
                const startTime = Date.now();
                let result = 0;
                for (let i = 0; i < 100000; i++) {
                    result += Math.sqrt(i);
                }
                const endTime = Date.now();
                
                benchmarks.push({
                    name: 'cpu_calculation',
                    duration: endTime - startTime,
                    unit: 'ms',
                    description: '100k square root calculations',
                    result: Math.round(result)
                });
            } catch (error) {
                benchmarks.push({
                    name: 'cpu_calculation',
                    error: error.message,
                    description: 'CPU benchmark failed'
                });
            }

            // Network benchmark (if localhost servers are available)
            try {
                const startTime = Date.now();
                execSync('curl -s --max-time 3 http://localhost:3000 > /dev/null || curl -s --max-time 3 http://localhost:8080 > /dev/null || true',
                    { timeout: 4000 });
                const endTime = Date.now();
                
                if (endTime - startTime < 3500) { // If it didn't timeout
                    benchmarks.push({
                        name: 'local_http',
                        duration: endTime - startTime,
                        unit: 'ms',
                        description: 'Local HTTP server response'
                    });
                }
            } catch (error) {
                // Local server might not be running
            }

            performance.benchmarks = benchmarks;

            // Overall performance assessment
            const memoryPressure = performance.system.memory.percentage;
            const cpuLoad = performance.system.cpu.loadAverage[0];
            
            let status = 'good';
            if (memoryPressure > 85 || cpuLoad > performance.system.cpu.cores * 0.8) {
                status = 'poor';
            } else if (memoryPressure > 70 || cpuLoad > performance.system.cpu.cores * 0.6) {
                status = 'degraded';
            }

            performance.overallStatus = status;
            
            return performance;
            
        } catch (error) {
            return {
                system: {},
                application: {},
                benchmarks: [],
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    findMatchingReality(claim) {
        // Find reality snapshot that matches timeframe
        return this.actualBehaviors.find(reality => 
            new Date(reality.timestamp) > new Date(claim.timestamp)
        );
    }

    behaviorsMatch(expected, actual) {
        try {
            // Deep comparison of behaviors with tolerance for minor differences
            if (!expected || !actual) return false;
            
            // For API responses, check key fields
            if (expected.type === 'api' && actual.apiResponses) {
                return this.compareAPIBehavior(expected, actual.apiResponses);
            }
            
            // For UI elements, check presence and state
            if (expected.type === 'ui' && actual.uiElements) {
                return this.compareUIBehavior(expected, actual.uiElements);
            }
            
            // For database, check data consistency
            if (expected.type === 'database' && actual.databaseState) {
                return this.compareDatabaseBehavior(expected, actual.databaseState);
            }
            
            // For performance, check within acceptable ranges
            if (expected.type === 'performance' && actual.performance) {
                return this.comparePerformanceBehavior(expected, actual.performance);
            }
            
            // Fallback to JSON comparison with some tolerance
            const expectedStr = JSON.stringify(expected, null, 2);
            const actualStr = JSON.stringify(actual, null, 2);
            
            // Allow minor timestamp differences
            const normalizedExpected = expectedStr.replace(/"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"/g, '"TIMESTAMP"');
            const normalizedActual = actualStr.replace(/"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"/g, '"TIMESTAMP"');
            
            return normalizedExpected === normalizedActual;
            
        } catch (error) {
            console.warn('Behavior comparison failed:', error.message);
            return false;
        }
    }

    compareAPIBehavior(expected, actual) {
        // Check if API endpoints respond as expected
        if (expected.endpoints) {
            for (const expectedEndpoint of expected.endpoints) {
                const actualEndpoint = actual.endpoints.find(ep => ep.url === expectedEndpoint.url);
                if (!actualEndpoint) return false;
                
                // Allow some tolerance for response times
                if (expectedEndpoint.status && actualEndpoint.status !== expectedEndpoint.status) {
                    return false;
                }
            }
        }
        return true;
    }

    compareUIBehavior(expected, actual) {
        // Check if UI elements exist as expected
        if (expected.elements) {
            for (const expectedElement of expected.elements) {
                const found = actual.elements.some(el => 
                    el.type === expectedElement.type || 
                    (el.detected && el.detected.includes(expectedElement.name))
                );
                if (!found) return false;
            }
        }
        return true;
    }

    compareDatabaseBehavior(expected, actual) {
        // Check database state consistency
        if (expected.tables && actual.databases.length > 0) {
            const actualTables = actual.databases.flatMap(db => db.tables || []);
            for (const expectedTable of expected.tables) {
                if (!actualTables.includes(expectedTable)) return false;
            }
        }
        
        // Check for data inconsistencies
        if (actual.inconsistencies && actual.inconsistencies.length > 0) {
            return false;
        }
        
        return true;
    }

    comparePerformanceBehavior(expected, actual) {
        // Check performance within acceptable ranges
        if (expected.responseTime && actual.benchmarks) {
            const httpBenchmark = actual.benchmarks.find(b => b.name === 'local_http');
            if (httpBenchmark && httpBenchmark.duration > expected.responseTime * 2) {
                return false;
            }
        }
        
        if (expected.memoryUsage && actual.system && actual.system.memory) {
            if (actual.system.memory.percentage > expected.memoryUsage * 1.5) {
                return false;
            }
        }
        
        return true;
    }

    assessSeverity(claim, reality) {
        try {
            let severityScore = 0;
            const factors = [];

            // Check for critical system failures
            if (reality.apiResponses && reality.apiResponses.status === 'critical') {
                severityScore += 50;
                factors.push('Critical API failure detected');
            }

            if (reality.databaseState && reality.databaseState.inconsistencies.length > 0) {
                const dbIssues = reality.databaseState.inconsistencies.filter(i => 
                    i.type === 'integrity_check' || i.type === 'data_corruption'
                );
                if (dbIssues.length > 0) {
                    severityScore += 40;
                    factors.push('Database integrity issues found');
                }
            }

            // Check for performance degradation
            if (reality.performance && reality.performance.overallStatus === 'poor') {
                severityScore += 30;
                factors.push('Severe performance degradation');
            } else if (reality.performance && reality.performance.overallStatus === 'degraded') {
                severityScore += 15;
                factors.push('Performance degradation detected');
            }

            // Check for UI failures
            if (reality.uiElements && reality.uiElements.errors.length > 0) {
                severityScore += 20;
                factors.push('UI errors detected');
            }

            // Check claim type impact
            if (claim.expected && claim.expected.type) {
                switch (claim.expected.type) {
                    case 'security':
                        severityScore += 25;
                        factors.push('Security-related claim failure');
                        break;
                    case 'data_integrity':
                        severityScore += 30;
                        factors.push('Data integrity claim failure');
                        break;
                    case 'api':
                        severityScore += 20;
                        factors.push('API functionality claim failure');
                        break;
                    case 'ui':
                        severityScore += 10;
                        factors.push('UI functionality claim failure');
                        break;
                }
            }

            // Determine final severity
            let severity = 'LOW';
            if (severityScore >= 70) {
                severity = 'CRITICAL';
            } else if (severityScore >= 40) {
                severity = 'HIGH';
            } else if (severityScore >= 20) {
                severity = 'MEDIUM';
            }

            return {
                level: severity,
                score: severityScore,
                factors: factors,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            return {
                level: 'HIGH',
                score: 50,
                factors: ['Severity assessment failed'],
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    updateFailureMemory(divergences) {
        const fs = require('fs');
        
        try {
            const memoryFile = 'memory/failure-patterns.json';
            const memory = JSON.parse(fs.readFileSync(memoryFile, 'utf8'));
            
            divergences.forEach(divergence => {
                memory.patterns.push({
                    id: `failure-${Date.now()}`,
                    date: new Date().toISOString(),
                    description: `Claim: ${JSON.stringify(divergence.claim)} vs Reality: ${JSON.stringify(divergence.reality)}`,
                    severity: divergence.severity
                });
            });

            memory.statistics.total_failures_prevented += divergences.length;
            memory.last_updated = new Date().toISOString();
            
            fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
            console.log("🧠 Failure memory updated");
            
        } catch (error) {
            console.error("Failed to update failure memory:", error);
        }
    }

    triggerEmergencyProtocol() {
        console.log("🆘 Triggering emergency protocol...");
        
        try {
            const { execSync } = require('child_process');
            const fs = require('fs');
            
            // Create emergency log
            const emergencyData = {
                timestamp: new Date().toISOString(),
                event: 'catastrophic_failure_detected',
                claims: this.claimedBehaviors,
                reality: this.actualBehaviors,
                action: 'emergency_protocol_triggered'
            };
            
            if (!fs.existsSync('.truthforge')) {
                fs.mkdirSync('.truthforge');
            }
            
            fs.writeFileSync('.truthforge/emergency.log', JSON.stringify(emergencyData, null, 2));
            
            // Try to backup current state
            try {
                execSync('git add . && git commit -m "EMERGENCY: Catastrophic failure detected - auto backup" || true');
                console.log("📦 Emergency backup created");
            } catch (error) {
                console.warn("⚠️ Could not create emergency backup:", error.message);
            }
            
            // Check if emergency script exists
            if (fs.existsSync('./emergency-stop.sh')) {
                try {
                    execSync('./emergency-stop.sh', { stdio: 'inherit' });
                } catch (error) {
                    console.error("❌ Emergency script failed:", error.message);
                }
            } else {
                console.warn("⚠️ Emergency script not found. Manual intervention required.");
                
                // Basic emergency procedures
                console.log("🔧 Executing basic emergency procedures:");
                console.log("   1. Stopping validation");
                console.log("   2. Creating failure snapshot");
                console.log("   3. Alerting user");
                
                this.validationActive = false;
                
                // Alert user
                console.error("💥 CRITICAL SYSTEM FAILURE");
                console.error("🚨 Manual intervention required");
                console.error("📁 Check .truthforge/emergency.log for details");
            }
            
        } catch (error) {
            console.error("💀 Emergency protocol itself failed:", error.message);
            console.error("🆘 System may be in critical state - immediate manual intervention required");
        }
    }

    // Comprehensive validation with all evidence types
    async performComprehensiveValidation(options = {}) {
        console.log("🔥 TruthForge Comprehensive Validation Starting...");
        
        const validation = {
            timestamp: new Date().toISOString(),
            validationType: 'comprehensive',
            evidence: {},
            passed: false,
            score: 0,
            maxScore: 0,
            summary: {},
            recommendations: []
        };

        try {
            this.startValidation();

            // 1. Capture current system reality
            console.log("📊 Capturing system reality...");
            const reality = await this.captureReality();
            validation.evidence.systemState = reality;

            // 2. Run security validation
            console.log("🔒 Running security validation...");
            const securityResults = await this.securityValidator.validateSecurity();
            validation.evidence.security = securityResults;
            validation.score += securityResults.score || 0;
            validation.maxScore += securityResults.maxScore || 0;

            // 3. Capture UI screenshots if servers are running
            console.log("📸 Capturing UI evidence...");
            const uiValidation = await this.screenshotCapture.validateUI();
            validation.evidence.ui = uiValidation;

            // 4. Run any additional tests specified
            if (options.runTests) {
                console.log("🧪 Running test suite...");
                const testResults = await this.runTestSuite();
                validation.evidence.tests = testResults;
                
                if (testResults.passed) {
                    validation.score += 20;
                }
                validation.maxScore += 20;
            }

            // 5. Validate against any recorded claims
            console.log("⚖️ Validating against claims...");
            const claimValidation = this.validateAgainstReality();
            validation.evidence.claims = {
                divergences: claimValidation,
                claimedBehaviors: this.claimedBehaviors,
                actualBehaviors: this.actualBehaviors
            };

            if (claimValidation.length === 0) {
                validation.score += 15;
            }
            validation.maxScore += 15;

            // 6. Calculate overall validation score
            validation.overallScore = validation.maxScore > 0 
                ? Math.round((validation.score / validation.maxScore) * 100)
                : 0;

            // 7. Determine if validation passes
            validation.passed = this.determineValidationPass(validation);

            // 8. Generate summary and recommendations
            validation.summary = this.generateValidationSummary(validation);
            validation.recommendations = this.generateRecommendations(validation);

            // 9. Create validation token if passed
            if (validation.passed) {
                this.createValidationToken({
                    comprehensive: true,
                    score: validation.overallScore,
                    evidence: Object.keys(validation.evidence),
                    timestamp: validation.timestamp
                });
                console.log("✅ Comprehensive validation PASSED - Token created");
            } else {
                console.log("❌ Comprehensive validation FAILED - No token created");
            }

            return validation;

        } catch (error) {
            console.error("💥 Comprehensive validation failed:", error.message);
            return {
                timestamp: new Date().toISOString(),
                validationType: 'comprehensive',
                error: error.message,
                passed: false,
                score: 0
            };
        }
    }

    // Run test suite if available
    async runTestSuite() {
        const { execSync } = require('child_process');
        const fs = require('fs');
        
        try {
            // Check for package.json and test scripts
            if (fs.existsSync('package.json')) {
                const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                
                if (packageJson.scripts && packageJson.scripts.test) {
                    console.log("Running npm test...");
                    const output = execSync('npm test', { 
                        encoding: 'utf8', 
                        timeout: 60000,
                        stdio: 'pipe'
                    });
                    
                    return {
                        passed: true,
                        output: output,
                        framework: 'npm',
                        timestamp: new Date().toISOString()
                    };
                }
            }

            // Check for other test frameworks
            const testCommands = [
                'python -m pytest',
                'python -m unittest discover',
                'cargo test',
                'go test ./...',
                'mvn test'
            ];

            for (const command of testCommands) {
                try {
                    const output = execSync(command, { 
                        encoding: 'utf8', 
                        timeout: 30000,
                        stdio: 'pipe'
                    });
                    return {
                        passed: true,
                        output: output,
                        framework: command.split(' ')[0],
                        timestamp: new Date().toISOString()
                    };
                } catch (error) {
                    continue;
                }
            }

            return {
                passed: false,
                message: 'No test framework detected or tests failed',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            return {
                passed: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Determine if validation passes overall
    determineValidationPass(validation) {
        // Minimum score required
        if (validation.overallScore < 60) {
            return false;
        }

        // Check for critical security issues
        if (validation.evidence.security && validation.evidence.security.overallStatus === 'critical') {
            return false;
        }

        // Check for claim divergences
        if (validation.evidence.claims && validation.evidence.claims.divergences.length > 0) {
            const criticalDivergences = validation.evidence.claims.divergences.filter(d => 
                d.severity && (d.severity.level === 'CRITICAL' || d.severity.level === 'HIGH')
            );
            if (criticalDivergences.length > 0) {
                return false;
            }
        }

        // Check if tests ran and passed (if required)
        if (validation.evidence.tests && !validation.evidence.tests.passed) {
            return false;
        }

        return true;
    }

    // Generate validation summary
    generateValidationSummary(validation) {
        const summary = {
            overallScore: validation.overallScore,
            evidenceTypes: Object.keys(validation.evidence),
            securityStatus: validation.evidence.security?.overallStatus || 'unknown',
            uiScreenshots: validation.evidence.ui?.screenshots?.length || 0,
            claimDivergences: validation.evidence.claims?.divergences?.length || 0,
            testsPassed: validation.evidence.tests?.passed || false
        };

        return summary;
    }

    // Generate recommendations based on validation results
    generateRecommendations(validation) {
        const recommendations = [];

        // Security recommendations
        if (validation.evidence.security?.recommendations) {
            recommendations.push(...validation.evidence.security.recommendations.slice(0, 3));
        }

        // UI recommendations
        if (validation.evidence.ui?.validationResults) {
            const uiErrors = validation.evidence.ui.validationResults.filter(r => r.status === 'error');
            if (uiErrors.length > 0) {
                recommendations.push('Fix UI rendering issues detected in screenshots');
            }
        }

        // Test recommendations
        if (validation.evidence.tests && !validation.evidence.tests.passed) {
            recommendations.push('Fix failing tests before creating checkpoint');
        }

        // Claim divergence recommendations
        if (validation.evidence.claims?.divergences?.length > 0) {
            recommendations.push('Resolve claim vs reality divergences before proceeding');
        }

        return recommendations;
    }
}

module.exports = TruthForgeValidator;
