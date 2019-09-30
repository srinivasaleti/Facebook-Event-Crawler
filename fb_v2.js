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
  const elements = await page.$$(".uiList");
  const result = [];
  for (i = 0; i < 100; i++) {
    const posts = await elements[5].$$("li");
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
