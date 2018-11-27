#!/usr/bin/env node
/* eslint no-console:0 */

const fs = require('fs').promises;
const http = require('http');

const downloadRegex = new RegExp(
    '<a.*href=.([^\'"]+)[^>]*>Download Wallpaper',
    'is');

/**
 * Fetches the content at a given URL and returns it as a buffer.
 * @param {string} url the URL to download as text
 * @return {Promise<Buffer>} a promise that resolves to the buffer content
 */
const fetch = url => new Promise((yes, no) => {
    http.get(url, res => {
        if (res.statusCode !== 200) {
            no(new Error(`ERROR: HTTP Code ${res.statusCode} for: ${url}`));
        } else {
            const data = /** @type {Buffer[]} */([]);
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => yes(Buffer.concat(data)));
        }
    }).on('error', err => no(err));
});

/**
 * Downloads a facet of a given index at a given year.
 * @param {number} year the year the facet was made
 * @param {number} index the facet number to download
 * @return {Promise} a promise that resolves when the image is downloaded
 */
const downloadImage = async (year, index) => {
    try {
        const fileName = `./images/${year}-${index}.jpg`;
        const page = await fetch(`http://www.facets.la/${year}/${index}/`);
        const url  = page.toString().match(downloadRegex);
        if (url && url[1]) {
            await fs.writeFile(fileName, await fetch(url[1]));
        }
    } catch(e) { }
};

/**
 * Downloads every facet image.
 * @return {Promise} a promise that resolves when all facets are downloaded.
 */
const downloadPages = async () => {
    for(let i=1; i < 366; i += 1) {
        console.log(`Downloading image ${i}...`);
        await Promise.all([
            downloadImage(2013, i),
            downloadImage(2014, i),
        ]);
    }
};

downloadPages();