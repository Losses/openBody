'use strict';

const React = require('react');

const iconset = {
    Run: '/assets/imgs/icons/run.svg',
    Exercise: '/assets/imgs/icons/exercise.svg'
}

const getIconSrc = function(type){
    return iconset[type]
}

let getIcon = function(type){
    return <img src={getIconSrc(type)} alt={type} />;
};

exports.getIcon = getIcon;