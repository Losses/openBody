'use strict';

const xhr = new XMLHttpRequest();

let receiveData = function(xhr, success, failed){
    if(xhr.readyState==4){
        if (xhr.status==200)
            success(JSON.parse(xhr.responseText)) ;
        else
            failed(xhr.status, JSON.parse(xhr.responseText));
    }
}

let post = function(location, condition, success, failed){
    xhr.open('POST', location, true);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send(condition);

    xhr.onreadystatechange = () => receiveData(xhr, success, failed)
}

let get = function(location, condition, success, failed){
    xhr.open('GET', location, true);
    xhr.send();
    
    xhr.onreadystatechange = () => receiveData(xhr, success, failed)
}

exports.post = post;
exports.get = get;