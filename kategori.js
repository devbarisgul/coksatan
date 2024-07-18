const puppeteer = require('puppeteer');
const mysql = require('mysql');

// MySQL bağlantı ayarları
const connection = mysql.createConnection({
    host: '89.252.183.227', // MySQL sunucu adresi
    user: 'fuz_ticaret', // MySQL kullanıcı adı
    password: 'jOiDXRBS1', // MySQL şifre
    database: 'fuz_ticaret' // Veritabanı adı
});

// Puppeteer ile eBay kategorilerini çekme fonksiyonu
async function scrapeCategories() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.ebay.com/b/Baby-Essentials/2984/bn_1854104');

    //await page.click('button.b-list__footer-resetbutton');

    const mainCategories = await page.$$('li.b-links-accordion');

    for (const category of mainCategories) {
        const mainCategoryTitle = await category.$eval('span.b-accordion-text', span => span.textContent.trim());
        console.log('Ana Kategori:', mainCategoryTitle);

        // Ana kategoriyi MySQL'e ekle
        const insertMainCategoryQuery = `INSERT INTO kategoriler (baslik) VALUES ('${mainCategoryTitle}')`;
        await executeQuery(insertMainCategoryQuery);

        await category.click('button.b-accordion-handler');

        const subcategories = await category.$$('ul.b-accordion-subtree li');

        for (const subcategory of subcategories) {
            const subcategoryLink = await subcategory.$eval('a', a => ({
                text: a.textContent.trim(),
                href: a.href
            }));
            console.log('Alt Kategori:', subcategoryLink.text, 'Link:', subcategoryLink.href);

            // Alt kategoriyi MySQL'e eklemek için ana kategorinin ID'sini al
            const selectMainCategoryIdQuery = `SELECT id FROM kategoriler WHERE baslik = '${mainCategoryTitle}'`;
            const mainCategoryIdResult = await executeQuery(selectMainCategoryIdQuery);
            const mainCategoryId = mainCategoryIdResult[0].id;

            // Alt kategoriyi MySQL'e ekle
            const insertSubcategoryQuery = `INSERT INTO alt_kategoriler (kategori_id, baslik, link) VALUES (${mainCategoryId}, "${subcategoryLink.text}", "${subcategoryLink.href}")`;
            await executeQuery(insertSubcategoryQuery);
        }
    }

    await browser.close();
}

// MySQL sorgusunu yürütme fonksiyonu
function executeQuery(query) {
    return new Promise((resolve, reject) => {
        connection.query(query, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

// Ana fonksiyon, veritabanı bağlantısını açar ve kategorileri çeker
async function main() {
    try {
        // MySQL bağlantısını aç
        await new Promise((resolve, reject) => {
            connection.connect(error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        // Kategorileri çek ve MySQL'e ekle
        await scrapeCategories();

    } catch (error) {
        console.error('Hata oluştu:', error);
    } finally {
        // Bağlantıyı kapat
        connection.end();
    }
}

// Ana fonksiyonu çağır
main();
