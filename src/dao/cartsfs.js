const fs = require("fs");

function readFromFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath));
}

function writeToFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data));
}

module.exports = {
  readFromFile,
  writeToFile,
};
