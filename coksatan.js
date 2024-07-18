const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/scrape', async (req, res) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.amazon.co.uk/gp/bestsellers/?ref_=nav_cs_bestsellers');

    // Kategori linklerini ve adlarını topla
    const categories = await page.$$eval('div[role="treeitem"] a', links => links.map(link => ({
        name: link.textContent.trim(),
        url: link.href
    })));

    let allCategories = [];

    for (const category of categories) {
        await page.goto(category.url);

        const products = await page.evaluate(() => {
            const productElements = document.querySelectorAll('div[class*="zg-grid-general-faceout"]');
            const productData = [];

            productElements.forEach(element => {
                const titleElement = element.querySelector('div._cDEzb_p13n-sc-css-line-clamp-3_g3dy1');
                const priceElement = element.querySelector('span._cDEzb_p13n-sc-price_3mJ9Z');
                const imageElement = element.querySelector('img');
                const linkElement = element.querySelector('a.a-link-normal.aok-block');

                const title = titleElement ? titleElement.textContent.trim() : null;
                const price = priceElement ? priceElement.textContent.trim() : null;
                const imageUrl = imageElement ? imageElement.src : null;
                const href = linkElement ? linkElement.href : null;

                productData.push({ title, price, imageUrl, href });
            });

            return productData;
        });

        allCategories.push({
            category: category.name,
            url: category.url,
            products: products
        });
    }

    await browser.close();
    
    res.json(allCategories);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
