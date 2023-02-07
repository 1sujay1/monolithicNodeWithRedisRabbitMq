const fs = require("fs");

function folderCheck(folderPath) {
  let Folderpath = folderPath;
  if (!fs.existsSync(Folderpath)) {
    fs.mkdirSync(Folderpath, { recursive: true });
  }

  return Folderpath;
}

module.exports = {
  folderCheck,
};
