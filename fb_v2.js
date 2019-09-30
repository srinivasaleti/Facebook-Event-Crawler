const puppeteer = require("puppeteer");
var fs = require("fs");
var util = require("util");
(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();
  await page.viewport({
    width: 1920,
    height: 1080
  });
  await page.goto("https://www.facebook.com/events/");

  await page.waitFor(2000);

  // await autoScroll(page);
  await scrollTo(page, 100);

  const ul = await page.$$(".uiList");
  const result = [];
  for (i = 0; i < 100; i++) {
    const posts = await ul[5].$$("li");
    const targetedPost = posts[i];
    expandPost(page, targetedPost);
    await page.waitFor(2000);
    let dim = await fetchPost(page, targetedPost);
    console.log(
      "============================================================================================================\n"
    );

    console.log(dim.title);
    result.push(dim);
  }

  fs.writeFileSync("./temp.js", util.inspect(result), "utf-8");
})();

const expandPost = async (page, post) => {
  let stop = false;
  while (true) {
    await page.waitFor(100);
    if (stop) {
      break;
    }
    try {
      const seeMore = await post.$('[title="See more"]');
      await seeMore.click();
    } catch (e) {
      stop = true;
    }
  }
};

const fetchPost = async (page, post) =>
  await page.evaluate(async post => {
    try {
      li = post;
      const description = li.querySelector('[role="button"]').textContent;
      const dateSpans = li
        .querySelector(".clearfix")
        .querySelector(".lfloat")
        .querySelectorAll("span");
      const title = li.querySelectorAll(".clearfix")[1].querySelector("a").text;
      const place = li.querySelectorAll(".clearfix")[1].querySelector("span")
        .textContent;
      return {
        description,
        date: dateSpans[1].textContent + " " + dateSpans[2].textContent,
        title,
        place
      };
    } catch (e) {
      return {};
    }
  }, post);

async function scrollTo(page, index) {
  for (i = 0; i < index; i++) {
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
    await page.waitFor(1000);
    await page.evaluate(height => {
      window.scrollBy(0, height);
    }, dim.height);
  }
}

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
