const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.goto("https://www.facebook.com/events/");

  await page.waitFor(2000);
  const elements = await page.$$(".uiList");

  for (i = 0; i < 10; i++) {
    const posts = await elements[5].$$("li");
    const targetedPost = posts[i];
    let stop = false;
    while (true) {
      await page.waitFor(200);
      if (stop) {
        break;
      }
      try {
        const seeMore = await targetedPost.$('[title="See more"]');
        await seeMore.click();
      } catch (e) {
        stop = true;
      }
    }
    let dim = await page.evaluate(
      async ({ i }) => {
        const postsUl = document.querySelectorAll(".uiList")[5];
        li = postsUl.querySelectorAll("li")[i];
        function getOffset(el) {
          const rect = el.getBoundingClientRect();
          return {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
            height: rect.height,
            width: rect.width
          };
        }
        return getOffset(li);
      },
      { i }
    );
    await page.waitFor(2000);
    await page.screenshot({
      path: i + ".jpeg",
      type: "jpeg",
      clip: dim,
      omitBackground: true,
      quality: 100
    });
    await page.waitFor(1000);
    await page.evaluate(height => {
      window.scrollBy(0, height);
    }, dim.height);
  }
})();
