var fs      = require('fs');
var path    = require('path');
var spawn   = require('child_process').spawn;

var es      = require('event-stream');
var xray    = require('x-ray');
var request = require('request');

// Use X-Ray to scrape for all files

es.readable(function(count, callback) {
    console.log('[INFO] Scraping for urls...');

    xray('http://www.facets.la/2014/365/')
    .select('.print-info + .size13 a[href]')
    .paginate('#search-box-prev a[href]')
    .limit(365)
    .run(function(err, picUrls) {
        if (err) {
            callback('[ERROR] ' + err, null);
        } else {
            picUrls.forEach(function(item) {
                if (item) {
                    this.emit('data', item);
                }
            }.bind(this));

            console.log('[INFO] Downloading images...');
            this.emit('end');
            callback();
        }
    }.bind(this));
})


// Download each file

.pipe(es.map(function(url, cb) {
    var fn = './' + path.join('./images/', path.basename(url));
    request(url)
    .pipe(fs.createWriteStream(fn))
    .on('finish', function() {
        cb(null, fn);
    }.bind(this));

}))
.on('data', function(f) { console.log('[INFO] Downloaded ' + f); })
.on('end',  function(a) { console.log('[INFO] Done Downloading'); });
