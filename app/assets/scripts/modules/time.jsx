'use strict';

const f = require('./format.jsx');
const _uesr_utc = 8;

let p = function(str){
    return f.pad(str, 2);
}

let NewTransUtc = function(date){
    return new Date(date + 60000 * _uesr_utc);
}

let processDate = function(date){
    let d = NewTransUtc(date);
    
    return d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate()); 
}

let processTime = function(time, toHour){
    if (!toHour)
        return parseInt(time / 60) + ':' + p(time % 60);
    else{
        let hour = parseInt(time / 3600);
        let minute = p(parseInt((time % 3600) / 60));
        let second = p(time - hour * 3600 - minute * 60);
        
        return [hour, minute, second].join(':');
    }
}

let asClock = function(date, includeSecond){
    let d = NewTransUtc(date);
    
    let [h, m, s] = [p(d.getHours()), p(d.getMinutes() + 1), p(d.getSeconds() + 1)];
    
    if (!includeSecond)
        return h + ':' + m; 
    else
        return h + ':' + m + ':' + s; 
}

exports.processDate = processDate;
exports.processTime = processTime;
exports.asClock = asClock;