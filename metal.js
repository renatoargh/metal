var request = require('request'),
    jQuery = require('jquery'),
    env = require('jsdom').env,
    url = 'http://www.metal-archives.com';

module.exports.searchByBandName = function(name, startingAt, callback) {
    if(typeof callback === 'undefined') {
        callback = startingAt;
        startingAt = 0;
    }

    var path = '/search/ajax-band-search/?field=name&query=' + encodeURIComponent(name) + '&sEcho=1&iColumns=3&sColumns=&iDisplayStart=' + startingAt + '&iDisplayLength=200&mDataProp_0=0&mDataProp_1=1&mDataProp_2=2';

    request.get(url + path, {
        json: true
    }, function(err, response, body) {
        if(err) {
            return callback(err);
        } else if(response.statusCode !== 200) {
            return callback(new Error('Status code wasn\'t 200'));
        }

        callback(null, {
            found: body.iTotalRecords,
            showing: body.aaData.length,
            bands: body.aaData.map(function(band) {
                return {
                    name: band[0].match(/^<a(.*)>(.*)<\/a>/)[2],
                    url: band[0].match(/href="(.*)"/)[1],
                    id: band[0].match(/href="(.*)\/(\d+)"/)[2],
                    genre: band[1],
                    country: band[2]
                };
            })
        });
    });
};

module.exports.getBandById = function(id, callback) {
    var path = '/bands/doesnotmatter/' + id;

    request.get(url + path, function(err, response, body) {
        if(err) {
            return callback(err);
        } else if(response.statusCode !== 200) {
            return callback(new Error('Status code wasn\'t 200'));
        }

        env(body, function(err, window) {
            if(err) {
                callback(err);
            }

            var $ = jQuery(window);

            callback(null, {
                name: $('h1.band_name a').text().trim(),
                url: $('h1.band_name a').attr('href').trim(),
                country: $('dt:contains(Country of origin)').next().find('a').text(),
                status: $('dt:contains(Status)').next().text(),
                formedIn: $('dt:contains(Formed in)').next().text(),
                yearsActive: $('dt:contains(Years active)').next().text().replace(/\s/g, ''),
                genre: $('dt:contains(Genre)').next().text(),
                lyricalThemes: $('dt:contains(Lyrical themes)').next().text().split(',').map(function(theme) {
                    return theme.trim();
                }),
                currentLabel: $('dt:contains(Current label)').next().text(),
                currentLabelUrl: $('dt:contains(Current label)').next().find('a').attr('href'),
                lastLabel: $('dt:contains(Last label)').next().text(),
                lastLabelUrl: $('dt:contains(Last label)').next().find('a').attr('href'),
                addedBy: $('td:contains(Added by)').find('a').text(),
                addedByUrl: $('td:contains(Added by)').find('a').attr('href'),
                addedOn: $('td:contains(Added on)').text().match(/Added on: (.*)+/)[1],
                modifiedBy: $('td:contains(Modified by)').find('a').text(),
                modifiedByUrl: $('td:contains(Modified by)').find('a').attr('href'),
                modifiedOn: $('td:contains(Last modified on)').text().match(/Last modified on: (.*)+/)[1],
                logotypeImageUrl: $('.band_name_img a.image#logo').attr('href'),
                bandImageUrl: $('.band_img a.image#photo').attr('href'),
                notesUrl: $('a:contains(Read more)').size() > 0 && $('a:contains(Read more)').attr('onclick').toString().match(/readMore\('(.*)'\)/ )[1],
                similarArtistsUrl: 'http://www.metal-archives.com/band/ajax-recommendations/id/' + id,
                discographyUrl: 'http://www.metal-archives.com/band/discography/id/' + id + '/tab/all'
//                discography: $('table.discog tbody tr').map(function() {
//                    return {
//                        name: $(this).find('td:nth-child(1)').find('a').text(),
//                        releaseUrl: $(this).find('td:nth-child(1)').find('a').attr('href'),
//                        type: $(this).find('td:nth-child(2)').text(),
//                        year: $(this).find('td:nth-child(3)').text()
//                    };
//                }).get()
            });
        });
    });
};

module.exports.searchByBandName('', Math.floor(Math.random() * 95465), function(err, results) {
    var band = results.bands[Math.floor(Math.random() * results.bands.length)];
    module.exports.getBandById(band.id, function(err, band) {
        console.log(band);
    });
});