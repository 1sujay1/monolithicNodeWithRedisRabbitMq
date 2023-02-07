
const fs = require('fs');
const pathExtension = require('path');

function profileFolder(path) {
    let Folderpath = path;

    if (!fs.existsSync(Folderpath)) {
        fs.mkdirSync(Folderpath);
        fs.mkdirSync('public/uploads/profile/xs/');
        fs.mkdirSync('public/uploads/profile/sm/');
        fs.mkdirSync('public/uploads/profile/md/');
    }

    return Folderpath;
}

function profileCoverFolder(path) {
    let Folderpath = path;

    console.log(Folderpath);


    if (!fs.existsSync(Folderpath)) {
        fs.mkdirSync(Folderpath);
    }

    return Folderpath;
}

function pdfFolder(path) {
    let Folderpath = path;

    if (!fs.existsSync(Folderpath)) {
        fs.mkdirSync(Folderpath);
    }

    return Folderpath;
}

function postFolder(folderPath) {

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
        fs.mkdirSync(folderPath + 'video/');
        fs.mkdirSync(folderPath + 'image/');
        fs.mkdirSync(folderPath + 'document/');
    } else {
        return true;
    }

    return folderPath;

}

module.exports = {
    profileFolder,
    postFolder,
    profileCoverFolder,
    pdfFolder
};