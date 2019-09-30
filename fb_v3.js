const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.goto("https://www.facebook.com/events/");

  await autoScroll(page);

  await page.setViewport({
    width: 1200,
    height: 800
  });

  const elements = await page.$$(".uiList");
  await page.waitFor(2000);
  const posts = await elements[5].$$("li");
  for (i = 0; i < posts.length; i++) {
    console.log("Exapnding Li : " + (i + 1));
    let stop = false;
    while (true) {
      await page.waitFor(200);
      if (stop) {
        break;
      }
      try {
        const seeMore = await posts[i].$('[title="See more"]');
        await seeMore.click();
      } catch (e) {
        stop = true;
      }
    }
    await page.waitFor(2000);
    await posts[i].screenshot({ path: i + ".png" });
  }
})();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
