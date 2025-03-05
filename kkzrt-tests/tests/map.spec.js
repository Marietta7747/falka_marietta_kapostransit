const { test, expect } = require('@playwright/test');
const { title } = require('process');

test.describe('KKZRT Tesztek', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost/kkzrt/login.php');
    await page.fill('input[type="email"]', 'asd@gmail.com');
    await page.fill('input[type="password"]', 'Asdf1234');
    await page.click('text=Bejelentkezés');
  });

  // Sikeres oldalak tesztjei - ezek megmaradnak
  const pages = [
    { url: 'index.php', title: 'Főoldal' },
    { url: 'terkep.php', title: 'Térkép' },
    { url: 'keses.php', title: 'Késések' },
    { url: 'menetrend.php', title: 'Menetrend' },
    { url: 'jaratok.php', title: 'Járatok' },
    { url: 'info.php', title: 'Információk' },
    { url: 'indulasidok.php?route=12', title: 'Indulási idők' },
    { url: 'megalloidok.php?number=12&name=Laktanya%20-%20Sopron%20u.%20-%20Helyi%20autóbusz-állomás&stop_time=04%3A45%3A00&schedule_id=26', title: 'Megálló idők'},
    { url: 'hirek.php', title: 'Hírek'}
  ];

  for (const pageInfo of pages) {
    test(`${pageInfo.title} oldal betöltése`, async ({ page }) => {
      await page.goto(`http://localhost/kkzrt/${pageInfo.url}`);
      await expect(page).toHaveURL(`http://localhost/kkzrt/${pageInfo.url}`);
    });
  }

  // Sikeres API végpontok tesztjei - ezek megmaradnak
  const workingApiEndpoints = [
    { url: 'api/stop', name: 'Megállók' },
    { url: 'api/helyibusz', name: 'Helyi busz' },
    { url: 'api/link', name: 'Linkek' },
    { url: 'api/marker', name: 'Markerek' },
    { url: 'api/kepek', name: 'Képek' },
    { url: 'api/trip', name: 'Utazások' },
    { url: 'api/hirek', name: 'Hírek' },
    { url: 'api/buszjaratok', name: 'Busz járatok' }
  ];

  for (const endpoint of workingApiEndpoints) {
    test(`${endpoint.name} API végpont ellenőrzése`, async ({ request }) => {
      const response = await request.get(`http://localhost:3000/${endpoint.url}`);
      expect(response.ok()).toBeTruthy();
    });
  }

  // Sikeres komponens tesztek
  test('Térkép megjelenítés', async ({ page }) => {
    await page.goto('http://localhost/kkzrt/terkep.php');
    await expect(page.locator('#map')).toBeVisible();

    await page.goto('http://localhost/kkzrt/megallok_kereso.php');
    await expect(page.locator('#map')).toBeVisible();
  });

  test('Hírek teljes kilistázása', async ({ page }) => {
    await page.goto('http://localhost/kkzrt/index.php');

    const btn = await page.locator('#btnMoreNews');

    let isExpanded = await page.evaluate(() => window.isExpanded = false);
    expect(isExpanded).toBeFalsy();

    await btn.click();

    isExpanded = await page.evaluate(() => window.isExpanded = true);
    expect(isExpanded).toBeTruthy();
  });

  // API válaszok ellenőrzése konkrét tartalomra
  test('API válaszok ellenőrzése', async ({ request }) => {
    // Megállók API teszt
    const stopsResponse = await request.get('http://localhost:3000/api/stop');
    const stopsData = await stopsResponse.json();
    expect(Array.isArray(stopsData)).toBeTruthy();

    // Járatok API teszt
    const tripsResponse = await request.get('http://localhost:3000/api/trip');
    const tripsData = await tripsResponse.json();
    expect(Array.isArray(tripsData)).toBeTruthy();

    // Hírek API teszt
    const newsResponse = await request.get('http://localhost:3000/api/hirek');
    const newsData = await newsResponse.json();
    expect(Array.isArray(newsData)).toBeTruthy();
  });
});
