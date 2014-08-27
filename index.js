var fs = require('fs');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

fs.readdirSync(__dirname + "/action").forEach(function (f) {
    if (!f.match(/\.js$/)) return;
    module.exports[f.replace(/\.js$/, '')] = require('./action/' + f);
});