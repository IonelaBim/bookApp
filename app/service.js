"use strict";

const _jade = require('jade');
const fs = require('fs');

/*========= module exports ==========*/
module.exports.compileToHtml = compileToHtml;

/*=======   SendGrid functions   =========*/
function compileToHtml (template, propertyName,  propertyValue, callback) {
    fs.readFile(template, 'utf8', function(err, file) {
        if(err){
            return callback(err);
        }
        else {
            var compiledTmpl = _jade.compile(file);
            var html = compiledTmpl({[propertyName] :propertyValue});
            callback(null, html);
        };
    })
}
