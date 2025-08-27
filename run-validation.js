#!/usr/bin/env node

// TruthForge Validation Runner
// Command-line interface for the comprehensive validation system

const TruthForgeValidator = require('./core/validator');
const path = require('path');
const fs = require('fs');

async function main() {
    const args = process.argv.slice(2);
    const options = {
        runTests: args.includes('--run-tests') || args.includes('--comprehensive'),
        verbose: args.includes('--verbose') || args.includes('-v'),
        comprehensive: args.includes('--comprehensive')
    };

    console.log('🔥 TruthForge Validation System Starting...');
    console.log(`📁 Working directory: ${process.cwd()}`);
    console.log(`⚙️  Options: ${JSON.stringify(options)}`);
    console.log('');

    try {
        const validator = new TruthForgeValidator();
        
        // Run comprehensive validation
        const result = await validator.performComprehensiveValidation(options);
        
        // Display results
        console.log('');
        console.log('📊 VALIDATION RESULTS');
        console.log('='.repeat(50));
        console.log(`Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Score: ${result.overallScore || 0}% (${result.score || 0}/${result.maxScore || 0})`);
        console.log(`Evidence Types: ${result.summary?.evidenceTypes?.join(', ') || 'None'}`);
        
        if (result.summary) {
            console.log('');
            console.log('📋 SUMMARY');
            console.log('-'.repeat(30));
            console.log(`Security Status: ${result.summary.securityStatus}`);
            console.log(`UI Screenshots: ${result.summary.uiScreenshots}`);
            console.log(`Claim Divergences: ${result.summary.claimDivergences}`);
            console.log(`Tests Passed: ${result.summary.testsPassed ? 'Yes' : 'No/Not Run'}`);
        }

        // Show security details
        if (result.evidence?.security) {
            const security = result.evidence.security;
            console.log('');
            console.log('🔒 SECURITY ANALYSIS');
            console.log('-'.repeat(30));
            console.log(`Overall Security Score: ${security.overallScore || 0}%`);
            console.log(`Status: ${security.overallStatus}`);
            console.log(`Vulnerabilities Found: ${security.vulnerabilities?.length || 0}`);
            
            if (security.vulnerabilities && security.vulnerabilities.length > 0) {
                console.log('');
                console.log('⚠️ VULNERABILITIES:');
                security.vulnerabilities.slice(0, 5).forEach((vuln, index) => {
                    console.log(`${index + 1}. [${vuln.severity.toUpperCase()}] ${vuln.description}`);
                });
                
                if (security.vulnerabilities.length > 5) {
                    console.log(`... and ${security.vulnerabilities.length - 5} more`);
                }
            }
        }

        // Show recommendations
        if (result.recommendations && result.recommendations.length > 0) {
            console.log('');
            console.log('💡 RECOMMENDATIONS');
            console.log('-'.repeat(30));
            result.recommendations.slice(0, 5).forEach((rec, index) => {
                console.log(`${index + 1}. ${rec}`);
            });
        }

        // Show validation token status
        console.log('');
        console.log('🎫 VALIDATION TOKEN');
        console.log('-'.repeat(30));
        if (fs.existsSync('.truthforge/validation-passed')) {
            const tokenData = JSON.parse(fs.readFileSync('.truthforge/validation-passed', 'utf8'));
            console.log(`✅ Token created: ${tokenData.timestamp}`);
            console.log('🔒 Ready for checkpoint creation');
        } else {
            console.log('❌ No validation token (validation failed)');
            console.log('🚫 Cannot create checkpoint until validation passes');
        }

        // Save detailed report
        const reportPath = path.join('validation', `validation-report-${Date.now()}.json`);
        fs.mkdirSync('validation', { recursive: true });
        fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
        console.log('');
        console.log(`📄 Detailed report saved: ${reportPath}`);

        console.log('');
        console.log(result.passed ? 
            '🎯 VALIDATION SUCCESSFUL - Ready for checkpoint!' : 
            '💥 VALIDATION FAILED - Fix issues before proceeding'
        );
        
        process.exit(result.passed ? 0 : 1);

    } catch (error) {
        console.error('💀 Validation system error:', error.message);
        if (options.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Show usage if --help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
TruthForge Validation System

Usage: node run-validation.js [options]

Options:
  --run-tests        Run test suites during validation
  --comprehensive    Full validation with all evidence types  
  --verbose, -v      Show detailed output and errors
  --help, -h         Show this help message

Examples:
  node run-validation.js                    # Basic validation
  node run-validation.js --run-tests        # Include test execution
  node run-validation.js --comprehensive    # Full validation with all evidence

The validation system will:
1. Capture system state and performance metrics
2. Run security vulnerability scanning
3. Take screenshots of any running UI servers
4. Execute test suites (if --run-tests specified)
5. Generate comprehensive validation report
6. Create validation token if all criteria are met

Only after receiving a validation token can you create checkpoints.
`);
    process.exit(0);
}

main();