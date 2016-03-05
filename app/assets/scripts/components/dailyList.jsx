'use strict';

const        t = require('../modules/time.jsx');
const      net = require('../modules/network.jsx');
const    React = require('react');
const       Dt = require('../modules/dataTable.jsx');

let columns = [
	{ name: 'date',                         title: '日期',      minWidth: 100},
	{ name: 'steps',                        title:'运动步数',    minWidth: 100},
	{ name: 'total_kilometers_moved',       title: '行走公里',   minWidth: 100},
    { name: 'total_floors_climbed',         title: '楼梯攀爬',   minWidth: 80},
    { name: 'total_seconds_all_activities', title: '运动时长',   minWidth: 100},
    { name: 'total_seconds_slept',          title: '睡眠时长',   minWidth: 100},
    { name: 'line.uv_exposure_minutes',     title: 'UV暴露时间', minWidth: 100},
    { name: 'HR_lowest',                    title: '最低心率',   minWidth: 80},
    { name: 'HR_average',                   title: '平均心率',   minWidth: 80},
    { name: 'HR_highest',                   title: '最高心率',   minWidth: 80}
];

let fetchData = function(callback){
    net.post('api/list/daily', 'page=1', function(docs){
        let table;
        if (!docs.success) return callback(false);

        table = docs.docs.map(function(line){
            line.date                         = t.processDate(line.date);
            line.total_seconds_all_activities = t.processTime(line.total_seconds_all_activities);
            line.total_seconds_slept          = t.processTime(line.total_seconds_slept, true);
            line.uv_exposure_minutes          = t.processTime(line.uv_exposure_minutes*60);
            return line;
        });

        callback(table);
    });
}

let DailyList = React.createClass({    
	render: function(){
		return <Dt
            keyName='id'
            className='data_view'
            location='/daily/:id'
			dataSourceFun={fetchData}
			columns={columns}
		/>
	}
})

module.exports = DailyList;