var Tesseract = require("tesseract.js");

const month = ["SEPT", "DEC", "OCT"];

const hasMonth = line => {
  return month.some(x => line.indexOf(x) != -1);
};

const validLines = async image => {
  const p = await Tesseract.recognize(image);
  let monthFound = false;
  return p["lines"]
    .map(x => {
      if (hasMonth(x["text"])) {
        monthFound = true;
      }
      if (monthFound) {
        return x["text"];
      }
    })
    .filter(x => x != undefined);
};

const firstAndRemaingWordsOfLine = line => {
  const words = line && line.split(" ");
  const remain = words.filter((word, index) => index != 0).join(" ");
  return { first: words[0], remain };
};

const processImage = async image => {
  const lines = await validLines(image);
  const firstLineData = firstAndRemaingWordsOfLine(lines[0]);
  const secondLineData = firstAndRemaingWordsOfLine(lines[1]);
  data = lines.filter((x, index) => index > 2).join("");
  const result = {
    date: firstLineData.first + " " + secondLineData.first,
    title: firstLineData.remain,
    data
  };
  console.log({ [image]: result });
};

processImage("1.png");
processImage("2.png");
processImage("3.png");
processImage("4.png");
processImage("5.png");
