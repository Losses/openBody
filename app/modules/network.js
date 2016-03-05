'use strict';

let parseUrl = function(url){
    return url.split('/');
}

let sendJson = function(res, code, obj){
    res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
    res.write(JSON.stringify(obj));
    res.end();
}

let sendError = function(res, code, msg){
    let responseJson = {
        code: code,
        msg: msg
    };
    
    sendJson(res, code, responseJson)
}

exports.parseUrl = parseUrl;
exports.sendJson = sendJson;
exports.sendError = sendError;