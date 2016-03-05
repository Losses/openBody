'use strict';
const _page_size = 300;

const sql = require('sqlite3').verbose();
const net = require('./network.js');

var db;

const message = {
    dbDidNotInit: {
        success: false,
        msg: 'dbConDidNotInit'
    },
    customErr: err => ({
        success: false,
        msg: err
    })
}

let checkCondition = function (condition) {
    if (!condition) condition = {};

    condition.page = condition.page ? condition.page - 1 : 0;
    return condition;
}

let dbInit = function (location) {
    db = new sql.Database(location);
    return true;
}

let queryList = function (type, condition, callback) {
    let offset, query;

    if (!db) {
        callback(message.dbDidNotInit);
        return;
    }
    
    condition = checkCondition(condition);
    offset = condition.page * 50;

    switch (type) {
        case 'exercise':
            query = 'SELECT * FROM `AllActivity` ORDER BY date DESC LIMIT ? OFFSET ?';
            break;
        case 'sleep':
            query = 'SELECT * FROM `Sleep` ORDER BY date DESC LIMIT ? OFFSET ?';
            break;
        case 'daily':
            query = 'SELECT * FROM `Daily` ORDER BY date DESC LIMIT ? OFFSET ?';
            break;
        default:
            return callback(message.customErr('dataTypeNotSupported'));
    }

    db.all(query, _page_size, offset, function (err, docs) {
        if (err) return callback(message.customErr(err));
        
        callback({
            success: true,
            docs: docs
        });
    });
};

let tableNameSwitch = function(name){
    return name.replace(/\b\w+\b/g, function(word){
        return word.substring(0,1).toUpperCase()+word.substring(1);}
    );
}

let queryActivity = function(type, id, callback) {
    let query;
    
    type = tableNameSwitch(type);
    
    //WARNING: SECURE CHECK! DONT REMOVE THIS!
    if (['Exercise', 'Sleep', 'Run', 'Daily'].indexOf(type) === -1)
        return callback(message.customErr('dataTypeNotSupported'));

    query = 'SELECT * FROM `' + type + '` Where `id` = ?';
    
    db.get(query, id, function(err, docs){
        if (err) return callback(message.customErr(err));

        callback({
            success: true,
            docs:docs
        })
    })
}

let getList = function(req, res){
    let url = net.parseUrl(req.originalUrl);
    
    if (['exercise', 'sleep', 'daily'].indexOf(url[3]) === -1){
        net.sendError(res, 404, 'The list you find did not exists ¯\\_(ツ)_/¯');
        return false;
    }
    
    queryList(url[3], req.body, function(obj){
        if (!obj.success) return net.sendError(res, 500, obj.msg);
        
        net.sendJson(res, 200, obj);
    })
};

let getActivity = function(req, res){
    let url, type, id;
    
    url = net.parseUrl(req.originalUrl);
    type = url[3];
    id = url[4];
    
    if (['exercise', 'sleep', 'run', 'daily'].indexOf(type) === -1){
        net.sendJson(res, 404, 'Wrong activity type (;´༎ຶД༎ຶ`)');
        return false;
    }
    
    queryActivity(type, id, function(obj){
        if (!obj.success) return net.sendError(res, 500, obj.msg);
        
        net.sendJson(res, 200, obj);
    });
}

exports.dbInit = dbInit;
exports.getList = getList;
exports.getActivity = getActivity;