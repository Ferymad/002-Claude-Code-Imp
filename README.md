# TruthForge 🔥

[![CI/CD Status](https://github.com/Ferymad/002-Claude-Code-Imp/workflows/TruthForge%20CI%2FCD/badge.svg)](https://github.com/Ferymad/002-Claude-Code-Imp/actions)
[![codecov](https://codecov.io/gh/Ferymad/002-Claude-Code-Imp/branch/master/graph/badge.svg)](https://codecov.io/gh/Ferymad/002-Claude-Code-Imp)
[![npm version](https://badge.fury.io/js/truthforge.svg)](https://badge.fury.io/js/truthforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**AI Development Without Lies** - A production-ready validation framework that prevents "false consensus catastrophic failures" through comprehensive proof-required validation.

## 🎯 What is TruthForge?

TruthForge transforms AI-assisted development from "hope it works" to "prove it works" by:

- **🔍 Evidence-Based Validation**: Every claim must be backed by actual proof
- **📸 Visual Verification**: Automated screenshot capture of UI functionality  
- **🔒 Security Scanning**: 7 comprehensive vulnerability test categories
- **⚖️ Consensus Breaking**: Prevents false agreement through structured debate
- **🛡️ Safety Systems**: Emergency protocols and instant rollback capabilities
- **🤖 Claude Code Integration**: Native integration with Claude Code workflows

## 🚀 Quick Start

### Installation

```bash
npm install -g truthforge
```

### Basic Usage

```bash
# Run comprehensive validation
truthforge --comprehensive

# Quick validation
truthforge

# With test execution
truthforge --run-tests

# Show help
truthforge --help
```

### Claude Code Integration

TruthForge includes native Claude Code integration:

```bash
# Use these commands in Claude Code
/validate              # Trigger proof-required validation
/checkpoint "name"      # Create validated checkpoint
/rollback              # Emergency rollback
/consensus-break       # Force agent disagreement
```

## 🏗️ Architecture

### Core Components

```
src/
├── core/               # Validation engines
│   ├── validator.js    # Main validation orchestrator
│   ├── security-validator.js  # Security testing
│   └── screenshot-capture.js  # UI validation
├── cli/                # Command-line interface
└── agents/             # Claude Code agents
```

### Validation Flow

1. **System State Capture**: Document current state of all systems
2. **Security Analysis**: Run comprehensive vulnerability scans  
3. **UI Verification**: Capture screenshots of running interfaces
4. **Performance Testing**: Measure system performance and load
5. **Test Execution**: Run all available test suites (no mocks)
6. **Evidence Synthesis**: Generate validation report with proof
7. **Token Creation**: Issue validation token only after all evidence collected

## 📋 Evidence Requirements

TruthForge requires **actual evidence** for every claim:

| Evidence Type | Description | Required For |
|---------------|-------------|--------------|
| 📸 Screenshots | Visual proof of UI functionality | UI claims |
| 🧪 Test Results | Actual test execution output | Functionality claims |
| 🔒 Security Report | Vulnerability scan results | Security claims |
| 📊 Performance Metrics | Response times, load capacity | Performance claims |
| 🗄️ Database State | Actual database content verification | Data claims |
| 🌐 API Health | Live endpoint testing | API claims |

## 🔧 Configuration

### Project Setup

```bash
# Initialize TruthForge in your project
npm install truthforge
npm run install:hooks
```

### Configuration Files

- `config/truthforge.config.json` - Main configuration
- `config/proof-requirements.md` - Evidence checklist  
- `.claude/` - Claude Code integration settings

### Environment Variables

```bash
# Optional: Customize validation behavior
TRUTHFORGE_TIMEOUT=30000
TRUTHFORGE_SECURITY_LEVEL=strict
TRUTHFORGE_EVIDENCE_PATH=./validation
```

## 🧪 Testing

### Run Tests

```bash
# Full test suite
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests  
npm run test:e2e

# Security tests
npm run test:security
```

### Test Coverage

TruthForge maintains high test coverage:

- **Unit Tests**: Core validation logic
- **Integration Tests**: Component interactions
- **Security Tests**: Vulnerability detection
- **Performance Tests**: Load and stress testing
- **UI Tests**: Screenshot validation

## 🔒 Security Features

### Vulnerability Categories

1. **File System Security**: Sensitive file detection, permission checks
2. **Environment Variables**: Credential exposure prevention  
3. **Dependency Analysis**: Known vulnerability scanning
4. **Web Server Security**: Header analysis, info disclosure
5. **Input Validation**: Injection vulnerability detection
6. **Authentication Security**: Weak credential detection
7. **Cryptographic Security**: Algorithm strength validation

### Security Standards

- **OWASP Top 10** compliance
- **CWE** (Common Weakness Enumeration) coverage
- **NIST** security framework alignment
- Regular security dependency updates

## 📖 Documentation

- **[API Documentation](docs/api/)** - Complete API reference
- **[User Guide](docs/guides/user-guide.md)** - Detailed usage instructions
- **[Developer Guide](docs/guides/developer-guide.md)** - Contributing guidelines
- **[Troubleshooting](docs/guides/troubleshooting.md)** - Common issues and solutions
- **[Examples](docs/examples/)** - Real-world usage examples

## 🛠️ Development

### Prerequisites

- Node.js ≥ 14.0.0
- npm ≥ 6.0.0

### Local Development

```bash
# Clone repository
git clone https://github.com/Ferymad/002-Claude-Code-Imp.git
cd 002-Claude-Code-Imp

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run linting
npm run lint

# Format code
npm run format
```

### Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. **Run TruthForge validation** (`npm run validate:comprehensive`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

**Important**: All contributions must pass TruthForge validation before merging.

## 🎯 Use Cases

### AI Development Teams
- Prevent false consensus in AI-assisted coding
- Ensure claims are backed by evidence
- Automated validation in CI/CD pipelines

### Quality Assurance
- Comprehensive testing with proof requirements
- Visual regression testing with screenshots
- Security vulnerability detection

### DevOps & Deployment  
- Pre-deployment validation with evidence
- Rollback capabilities with safety checkpoints
- Performance monitoring and benchmarking

## 📊 Validation Scoring

TruthForge uses a comprehensive scoring system:

- **Security Score** (30%): Vulnerability assessment results
- **Test Coverage** (25%): Actual test execution and coverage
- **Performance** (20%): System benchmarks and response times
- **Evidence Quality** (15%): Completeness of proof collection
- **Claims Accuracy** (10%): Alignment between claims and reality

**Passing Score**: ≥ 60% overall with no critical security issues

## 🆘 Emergency Procedures

### Catastrophic Failure Recovery

```bash
# Emergency stop all operations
npm run emergency

# Rollback to last checkpoint
npm run rollback

# Check system status
npm run validate
```

### Safety Features

- **Automatic Backup**: Creates backup before validation
- **Git Worktrees**: Isolated safety environments
- **Token Lifecycle**: Time-limited validation tokens
- **Failure Memory**: Learning from past failures

## 📈 Roadmap

- [ ] **Multi-language Support**: Python, Java, Go validators
- [ ] **Cloud Integration**: AWS, GCP, Azure validation
- [ ] **Advanced AI**: ML-based failure prediction
- [ ] **Enterprise Features**: Team dashboards, reporting
- [ ] **Mobile Testing**: React Native, Flutter support

## 🤝 Community

- **GitHub Discussions**: Ask questions, share ideas
- **Issue Tracker**: Report bugs, request features  
- **Discord Server**: Real-time community support
- **Twitter**: [@TruthForge](https://twitter.com/truthforge) - Updates and news

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Claude Code Team** - For the amazing development platform
- **Security Community** - For vulnerability detection patterns
- **Open Source Contributors** - For continuous improvements

---

**TruthForge: Because hope is not a strategy** 🔥

*Transform your AI development from "it works" to "here's proof it works"*