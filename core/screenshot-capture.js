// TruthForge Screenshot Capture System
// Automated screenshot capture for UI validation

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class ScreenshotCapture {
    constructor() {
        this.outputDir = 'validation/screenshots';
        this.defaultTimeout = 30000;
        this.browsers = ['chromium-browser', 'google-chrome', 'chrome', 'firefox'];
        this.ensureOutputDir();
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    // Find available browser
    findBrowser() {
        for (const browser of this.browsers) {
            try {
                execSync(`which ${browser}`, { stdio: 'ignore' });
                return browser;
            } catch (error) {
                continue;
            }
        }
        return null;
    }

    // Capture screenshot of a specific URL
    async captureURL(url, options = {}) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = options.filename || `screenshot-${timestamp}.png`;
        const filepath = path.join(this.outputDir, filename);
        
        const config = {
            width: options.width || 1920,
            height: options.height || 1080,
            timeout: options.timeout || this.defaultTimeout,
            waitFor: options.waitFor || 2000,
            fullPage: options.fullPage || false
        };

        console.log(`📸 Capturing screenshot of ${url}`);
        
        try {
            // Try different screenshot methods in order of preference
            const result = await this.tryScreenshotMethods(url, filepath, config);
            
            if (result.success) {
                console.log(`✅ Screenshot saved: ${filepath}`);
                return {
                    success: true,
                    filepath: filepath,
                    url: url,
                    timestamp: new Date().toISOString(),
                    method: result.method,
                    filesize: fs.existsSync(filepath) ? fs.statSync(filepath).size : 0
                };
            } else {
                throw new Error(result.error || 'All screenshot methods failed');
            }
            
        } catch (error) {
            console.error(`❌ Screenshot capture failed: ${error.message}`);
            return {
                success: false,
                error: error.message,
                url: url,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Try different screenshot methods
    async tryScreenshotMethods(url, filepath, config) {
        const methods = [
            () => this.captureWithPuppeteer(url, filepath, config),
            () => this.captureWithPlaywright(url, filepath, config),
            () => this.captureWithHeadlessChrome(url, filepath, config),
            () => this.captureWithWkhtmltoimage(url, filepath, config)
        ];

        for (const method of methods) {
            try {
                const result = await method();
                if (result.success) {
                    return result;
                }
            } catch (error) {
                console.warn(`Screenshot method failed: ${error.message}`);
                continue;
            }
        }

        return { success: false, error: 'All screenshot methods failed' };
    }

    // Puppeteer-based screenshot (most reliable if available)
    async captureWithPuppeteer(url, filepath, config) {
        try {
            // Check if puppeteer is available
            execSync('npm list puppeteer', { stdio: 'ignore' });
            
            const puppeteerScript = `
const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: ${config.width}, height: ${config.height} });
    await page.goto('${url}', { waitUntil: 'networkidle2', timeout: ${config.timeout} });
    await page.waitForTimeout(${config.waitFor});
    await page.screenshot({ 
        path: '${filepath}',
        fullPage: ${config.fullPage}
    });
    await browser.close();
    console.log('Screenshot captured successfully');
})().catch(console.error);
            `;

            const tempScript = path.join('/tmp', `screenshot-${Date.now()}.js`);
            fs.writeFileSync(tempScript, puppeteerScript);
            
            execSync(`node ${tempScript}`, { 
                stdio: 'inherit',
                timeout: config.timeout + 10000
            });
            
            fs.unlinkSync(tempScript);
            
            if (fs.existsSync(filepath)) {
                return { success: true, method: 'puppeteer' };
            } else {
                return { success: false, error: 'Screenshot file not created' };
            }
            
        } catch (error) {
            throw new Error(`Puppeteer method failed: ${error.message}`);
        }
    }

    // Playwright-based screenshot
    async captureWithPlaywright(url, filepath, config) {
        try {
            execSync('npm list playwright', { stdio: 'ignore' });
            
            const playwrightScript = `
const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: ${config.width}, height: ${config.height} });
    await page.goto('${url}', { waitUntil: 'networkidle', timeout: ${config.timeout} });
    await page.waitForTimeout(${config.waitFor});
    await page.screenshot({ 
        path: '${filepath}',
        fullPage: ${config.fullPage}
    });
    await browser.close();
    console.log('Screenshot captured successfully');
})().catch(console.error);
            `;

            const tempScript = path.join('/tmp', `screenshot-playwright-${Date.now()}.js`);
            fs.writeFileSync(tempScript, playwrightScript);
            
            execSync(`node ${tempScript}`, { 
                stdio: 'inherit',
                timeout: config.timeout + 10000
            });
            
            fs.unlinkSync(tempScript);
            
            if (fs.existsSync(filepath)) {
                return { success: true, method: 'playwright' };
            } else {
                return { success: false, error: 'Screenshot file not created' };
            }
            
        } catch (error) {
            throw new Error(`Playwright method failed: ${error.message}`);
        }
    }

    // Headless Chrome screenshot
    async captureWithHeadlessChrome(url, filepath, config) {
        const browser = this.findBrowser();
        if (!browser) {
            throw new Error('No browser found');
        }

        try {
            const chromeArgs = [
                '--headless',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-web-security',
                `--window-size=${config.width},${config.height}`,
                `--virtual-time-budget=${config.waitFor}`,
                `--screenshot=${filepath}`,
                url
            ];

            execSync(`${browser} ${chromeArgs.join(' ')}`, {
                timeout: config.timeout,
                stdio: 'ignore'
            });

            if (fs.existsSync(filepath)) {
                return { success: true, method: 'headless-chrome' };
            } else {
                return { success: false, error: 'Screenshot file not created' };
            }
            
        } catch (error) {
            throw new Error(`Headless Chrome method failed: ${error.message}`);
        }
    }

    // wkhtmltoimage fallback
    async captureWithWkhtmltoimage(url, filepath, config) {
        try {
            execSync('which wkhtmltoimage', { stdio: 'ignore' });
            
            const wkArgs = [
                '--width', config.width,
                '--height', config.height,
                '--javascript-delay', config.waitFor,
                '--load-error-handling', 'ignore',
                '--load-media-error-handling', 'ignore',
                url,
                filepath
            ];

            execSync(`wkhtmltoimage ${wkArgs.join(' ')}`, {
                timeout: config.timeout,
                stdio: 'ignore'
            });

            if (fs.existsSync(filepath)) {
                return { success: true, method: 'wkhtmltoimage' };
            } else {
                return { success: false, error: 'Screenshot file not created' };
            }
            
        } catch (error) {
            throw new Error(`wkhtmltoimage method failed: ${error.message}`);
        }
    }

    // Capture multiple URLs in sequence
    async captureMultiple(urls, options = {}) {
        const results = [];
        
        for (const urlConfig of urls) {
            const url = typeof urlConfig === 'string' ? urlConfig : urlConfig.url;
            const urlOptions = typeof urlConfig === 'object' ? { ...options, ...urlConfig } : options;
            
            const result = await this.captureURL(url, urlOptions);
            results.push(result);
            
            // Small delay between captures
            if (options.delay) {
                await this.delay(options.delay);
            }
        }
        
        return results;
    }

    // Capture common localhost ports
    async captureLocalhost(options = {}) {
        const commonPorts = [3000, 3001, 4000, 5000, 8000, 8080, 9000];
        const urls = [];
        
        for (const port of commonPorts) {
            // Quick check if port is listening
            try {
                execSync(`curl -s --max-time 1 http://localhost:${port} > /dev/null`, 
                    { timeout: 2000 });
                urls.push({
                    url: `http://localhost:${port}`,
                    filename: `localhost-${port}-${Date.now()}.png`
                });
            } catch (error) {
                // Port not available, skip
                continue;
            }
        }
        
        if (urls.length === 0) {
            return [{
                success: false,
                error: 'No local servers detected',
                timestamp: new Date().toISOString()
            }];
        }
        
        console.log(`🔍 Found ${urls.length} running local server(s)`);
        return await this.captureMultiple(urls, options);
    }

    // Utility: delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get all screenshots with metadata
    getScreenshots() {
        if (!fs.existsSync(this.outputDir)) {
            return [];
        }
        
        return fs.readdirSync(this.outputDir)
            .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
            .map(file => {
                const filepath = path.join(this.outputDir, file);
                const stats = fs.statSync(filepath);
                return {
                    filename: file,
                    filepath: filepath,
                    size: stats.size,
                    created: stats.mtime.toISOString()
                };
            })
            .sort((a, b) => new Date(b.created) - new Date(a.created));
    }

    // Clean old screenshots (keep last N)
    cleanup(keepCount = 20) {
        const screenshots = this.getScreenshots();
        const toDelete = screenshots.slice(keepCount);
        
        let deleted = 0;
        for (const screenshot of toDelete) {
            try {
                fs.unlinkSync(screenshot.filepath);
                deleted++;
            } catch (error) {
                console.warn(`Failed to delete ${screenshot.filename}: ${error.message}`);
            }
        }
        
        console.log(`🗑️ Cleaned up ${deleted} old screenshots`);
        return deleted;
    }

    // Validate UI using screenshots
    async validateUI(expectedElements = []) {
        console.log('🔍 Starting UI validation with screenshots...');
        
        const validation = {
            screenshots: [],
            validationResults: [],
            timestamp: new Date().toISOString()
        };

        // Capture current state
        const screenshotResults = await this.captureLocalhost();
        validation.screenshots = screenshotResults;

        // Basic validation - check if screenshots were captured
        for (const result of screenshotResults) {
            if (result.success) {
                validation.validationResults.push({
                    type: 'screenshot_captured',
                    status: 'success',
                    url: result.url,
                    filepath: result.filepath,
                    filesize: result.filesize
                });
                
                // If we have expected elements, we could do image analysis here
                // For now, we just verify the screenshot exists and has reasonable size
                if (result.filesize < 1000) {
                    validation.validationResults.push({
                        type: 'screenshot_size_warning',
                        status: 'warning',
                        message: 'Screenshot file size is very small, may indicate rendering issue',
                        filepath: result.filepath,
                        filesize: result.filesize
                    });
                }
            } else {
                validation.validationResults.push({
                    type: 'screenshot_failed',
                    status: 'error',
                    url: result.url,
                    error: result.error
                });
            }
        }

        return validation;
    }
}

module.exports = ScreenshotCapture;