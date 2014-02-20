var request = require('request'),
    jQuery = require('jquery'),
    env = require('jsdom').env,
    url = 'http://www.metal-archives.com';

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

            callback(null, $('h1.band_name a').text());
        });
    });
};