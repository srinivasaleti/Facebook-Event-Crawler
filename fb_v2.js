const puppeteer = require("puppeteer");
var fs = require("fs");
var util = require("util");

const fetchPosts = async (page, from, to) => {
  console.log("Crawling Post " + from + " to Post " + to);

  await page.viewport({
    width: 1920,
    height: 1080
  });
  await page.goto("https://www.facebook.com/events/");
  await page.waitFor(2000); //wait for page to load

  await scrollTo(page, from, to);
  const ul = await page.$$(".uiList");
  const result = [];
  for (let i = from; i < to; i++) {
    const posts = await ul[5].$$("li");
    console.log(i, posts.length);
    const targetedPost = posts[i];
    await expandPost(page, targetedPost);
    let dim = await fetchPost(page, targetedPost);
    console.log(
      "============================================================================================================\n"
    );

    console.log({ [i]: dim });
    result.push(dim);
  }
  return result;
};

const expandPost = async (page, post) => {
  let stop = false;
  while (true) {
    await page.waitFor(50);
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
      const img = li
        .querySelector("div")
        .querySelector("div")
        .querySelector("div")
        .querySelector("a")
        .querySelector("img").src;
      const title = li.querySelectorAll(".clearfix")[1].querySelector("a").text;
      const place = li.querySelectorAll(".clearfix")[1].querySelector("span")
        .textContent;
      return {
        description,
        date: dateSpans[1].textContent + " " + dateSpans[2].textContent,
        title,
        img,
        place
      };
    } catch (e) {
      return {};
    }
  }, post);

async function scrollTo(page, fromIndex, index) {
  for (i = 0; i < fromIndex / 10; i++) {
    await page.evaluate(height => {
      window.scrollBy(0, document.body.scrollHeight);
    });
    await page.waitFor(1000);
  }
}

const getData = async () => {
  let result = [];
  const inc = 10;
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  for (let j = 0; j < 100; j += inc) {
    try {
      const partialResult = await fetchPosts(page, j, j + inc);
      result = [...result, ...partialResult];
    } catch (e) {
      console.log(e);
    }
  }
  await page.close();
  await browser.close();

  fs.writeFileSync("./temp.js", util.inspect(result), "utf-8");
};

getData();
