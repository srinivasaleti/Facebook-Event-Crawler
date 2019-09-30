const puppeteer = require("puppeteer");
var fs = require("fs");
var util = require("util");

const fetchPosts = async (browser, from, to) => {
  console.log("Crawling Post " + from + " to Post " + to);
  const page = await browser.newPage();
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
    const targetedPost = posts[i];
    await page.waitFor(2000);
    let dim = await fetchPost(page, targetedPost);
    console.log(
      "============================================================================================================\n"
    );

    console.log({ [i]: dim });
    result.push(dim);
  }
  await page.close();
  return result;
};

const expandPost = async (page, post) => {
  let stop = false;
  while (true) {
    await page.waitFor(200);
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
  for (i = 0; i < index; i++) {
    console.log("Scrolling : " + i);
    if (i >= fromIndex) {
      const postsContainer = await page.$$(".uiList");
      const posts = await postsContainer[5].$$("li");
      await expandPost(page, posts[i]);
    }

    let dim =
      (await page.evaluate(
        async ({ i }) => {
          try {
            const postsUl = document.querySelectorAll(".uiList")[5];
            li = postsUl.querySelectorAll("li")[i];
            function getOffset(el) {
              const rect = el.getBoundingClientRect();
              const { height = 10, width = 10 } = rect;
              return {
                x: rect.left + window.scrollX,
                y: rect.top + window.scrollY,
                height,
                width
              };
            }
            return getOffset(li);
          } catch (e) {
            console.log("Scrolling Stopped");
          }
        },
        { i }
      )) || {};
    await page.waitFor(1000);
    await page.evaluate(height => {
      window.scrollBy(0, height);
    }, dim.height);
  }
  console.log("Scroll Completed");
}

const getData = async () => {
  let result = [];
  const inc = 10;
  const browser = await puppeteer.launch({
    headless: false
  });
  for (let j = 0; j < 40; j += inc) {
    try {
      const partialResult = await fetchPosts(browser, j, j + inc);
      result = [...result, ...partialResult];
    } catch (e) {
      console.log(e);
    }
  }
  await browser.close();

  fs.writeFileSync("./temp.js", util.inspect(result), "utf-8");
};

getData();
