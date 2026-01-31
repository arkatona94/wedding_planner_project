const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

    try {
        console.log('Navigating to Vendors page...');
        await page.goto('http://localhost:3000/vendors', { waitUntil: 'domcontentloaded' });

        console.log('Taking screenshot of initial state...');
        await page.screenshot({ path: 'vendors_initial.png', fullPage: true });

        console.log('Waiting for H1...');
        await page.waitForSelector('h1', { timeout: 3000 });
        console.log('Found H1');

        console.log('Waiting for vendor cards...');
        await page.waitForSelector('.card', { timeout: 5000 });

        console.log('Success! Screenshot saved to vendors_page_verify.png');
        await page.screenshot({ path: 'vendors_page_verify.png', fullPage: true });

    } catch (error) {
        console.error('Error verifying page:', error);
        await page.screenshot({ path: 'vendors_page_error.png', fullPage: true });

        try {
            const content = await page.content();
            console.log('Page Content Preview:', content.substring(0, 500));
        } catch (e) { console.error('Could not read content'); }

    } finally {
        await browser.close();
    }
})();
