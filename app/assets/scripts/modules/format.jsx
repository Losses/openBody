'use strict';

let pad = function (nr, n,str){
    str = parseInt(str);
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}

exports.pad = pad;