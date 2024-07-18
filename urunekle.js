const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

app.get('/login', async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // 1. Adım: eBay ana sayfasına git
    await page.goto('https://www.ebay.com', { waitUntil: 'networkidle2' });

    // 2. Adım: 'Sign in' butonuna tıkla
    await page.waitForSelector('a[href="https://signin.ebay.com/ws/eBayISAPI.dll?SignIn&sgfl=gh&ru=https%3A%2F%2Fwww.ebay.com%2F"]');
    await page.click('a[href="https://signin.ebay.com/ws/eBayISAPI.dll?SignIn&sgfl=gh&ru=https%3A%2F%2Fwww.ebay.com%2F"]');

    await new Promise(resolve => setTimeout(resolve, 6000));
    await page.waitForSelector('input[data-testid="userid"]');
    await page.type('input[data-testid="userid"]', 'alicanbasol@gmail.com');
    await page.waitForSelector('button[data-testid="signin-continue-btn"]', { visible: true });
    await page.click('button[data-testid="signin-continue-btn"]');

    await new Promise(resolve => setTimeout(resolve, 6000));
    await page.waitForSelector('input[data-testid="pass"]');
    await page.type('input[data-testid="pass"]', 'bvm76u@KC$yg-QR');
    await page.waitForSelector('button#sgnBt', { visible: true });
    await page.click('button#sgnBt');

    await new Promise(resolve => setTimeout(resolve, 6000));
    //await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.goto('https://www.ebay.com/lstng?draftId=4321990548010&mode=AddItem', { waitUntil: 'networkidle2' });

    // Başarı mesajı
    res.send('Login işlemi tamamlandı ve URL\'ye gidildi');
    //await browser.close();
  } catch (error) {
    console.error(error);
    res.status(500).send('Bir hata oluştu: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
