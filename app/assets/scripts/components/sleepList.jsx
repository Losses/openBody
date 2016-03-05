'use strict';

const        t = require('../modules/time.jsx');
const       tb = require('../modules/table.jsx');
const      net = require('../modules/network.jsx');
const    React = require('react');
const       Dt = require('../modules/dataTable.jsx');

let columns = [
	{ name: 'date',                   title: '日期',    minWidth: 100},
	{ name: 'start_time',             title: '就寝时间', minWidth: 80},
	{ name: 'wake_up_time',           title: '起床时间', minWidth: 80},
    { name: 'duration',               title: '睡眠时长', minWidth: 80},
    { name: 'wake_ups',               title: '唤醒次数', minWidth: 100},
    { name: 'seconds_to_fall_asleep', title: '入睡耗时', minWidth: 100},
    { name: 'sleep_efficiency',       title: '睡眠效率', minWidth: 100},
    { name: 'sleep_restoration',      title: '睡眠获益', minWidth: 100},
    { name: 'HR_lowest',              title: '最低心率', minWidth: 100},
    { name: 'HR_average',             title: '平均心率', minWidth: 100},
    { name: 'HR_peak',                title: '最高心率', minWidth: 100}
];

let fetchData = function(callback){
    net.post('api/list/sleep', 'page=1', function(docs){
        let table;
        if (!docs.success) return callback(false);

        table = docs.docs.map(function(line){
            let dateNum, durationNum;

            dateNum                     = line.date;
            durationNum                 = line.duration;
            
            line.date                   = t.processDate(dateNum);
            line.start_time             = t.asClock(dateNum);
            line.duration               = t.processTime(line.duration, true);
            line.wake_up_time           = t.asClock(dateNum + durationNum*1000);
            line.seconds_to_fall_asleep = t.processTime(line.seconds_to_fall_asleep);

            return line;
        });

        callback(table);
    });
}

let SleepList = React.createClass({    
	render: function(){
		return <Dt
            keyName='id'
            className='data_view'
			dataSourceFun={fetchData}
			columns={columns}
		/>
	}
})

module.exports = SleepList;