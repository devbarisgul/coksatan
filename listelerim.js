const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

app.get('/login', async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // eBay ana sayfasına git
    await page.goto('https://www.ebay.com', { waitUntil: 'networkidle2' });

    // 'Sign in' butonuna tıkla
    await page.waitForSelector('a[href="https://signin.ebay.com/ws/eBayISAPI.dll?SignIn&sgfl=gh&ru=https%3A%2F%2Fwww.ebay.com%2F"]');
    await page.click('a[href="https://signin.ebay.com/ws/eBayISAPI.dll?SignIn&sgfl=gh&ru=https%3A%2F%2Fwww.ebay.com%2F"]');

    await new Promise(resolve => setTimeout(resolve, 4000));
    await page.waitForSelector('input[data-testid="userid"]');
    await page.type('input[data-testid="userid"]', 'alicanbasol@gmail.com');
    await page.waitForSelector('button[data-testid="signin-continue-btn"]');
    await page.click('button[data-testid="signin-continue-btn"]');

    await new Promise(resolve => setTimeout(resolve, 4000));
    await page.waitForSelector('input[data-testid="pass"]');
    await page.type('input[data-testid="pass"]', 'bvm76u@KC$yg-QR');
    await page.waitForSelector('button#sgnBt');
    await page.click('button#sgnBt');

    await new Promise(resolve => setTimeout(resolve, 4000));
    await page.waitForSelector('a[title="My eBay"]');
    await page.click('a[title="My eBay"]');
    await new Promise(resolve => setTimeout(resolve, 4000));
    await page.waitForSelector('a[href="/sh/lst/active"]');
    await page.click('a[href="/sh/lst/active"]');
    await new Promise(resolve => setTimeout(resolve, 4000));

    let allProductLinks = [];
    let currentPage = 1;
    const totalPages = 85; // toplam sayfa sayısı

    while (currentPage <= totalPages) {
      // Ürünlerin href'lerini topla
      const productLinks = await page.$$eval('.column-title__text a', links =>
        links.map(link => link.href)
      );
      allProductLinks.push(...productLinks);

      // Sonraki sayfaya geç
      if (currentPage < totalPages) {
        await page.waitForSelector('form.go-to-page .textbox__control');
        await page.evaluate((pageNumber) => {
          document.querySelector('form.go-to-page .textbox__control').value = pageNumber;
        }, currentPage + 1);

        await page.click('form.go-to-page button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 4000));
      }

      currentPage++;
    }

    await browser.close();
    res.json(allProductLinks);

  } catch (error) {
    console.error(error);
    res.status(500).send('Bir hata oluştu: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
