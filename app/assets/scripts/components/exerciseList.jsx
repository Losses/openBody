'use strict';

const        t = require('../modules/time.jsx');
const       tb = require('../modules/table.jsx');
const      net = require('../modules/network.jsx');
const    React = require('react');
const       Dt = require('../modules/dataTable.jsx');

let columns = [
	{ name: 'event_type',      title: '#',      fixedWidth: 50 },
	{ name: 'date',            title: '日期',    minWidth: 100  },
	{ name: 'duration',        title: '运动时间', minWidth: 100  },
	{ name: 'seconds_paused',  title: '休息时间', minWidth: 100  },
    { name: 'calories_burned', title: '热量燃烧', minWidth: 100  },
    { name: 'cardio_benefit',  title: '运动评级', minWidth: 100  },
    { name: 'UV',              title: 'UV等级',  minWidth: 100  },
    { name: 'HR_average',      title: '平均心率', minWidth: 100  },
    { name: 'HR_peak',         title: '最高心率', minWidth: 100  }
];

let fetchData = function(callback){
    net.post('api/list/exercise', 'page=1', function(docs){
        let table;
        if (!docs.success) return callback(false);

        table = docs.docs.map(function(line){
            line.event_type     = tb.getIcon(line.event_type);
            line.date           = t.processDate(line.date);
            line.duration       = t.processTime(line.duration);
            line.seconds_paused = t.processTime(line.seconds_paused);
                            
            return line;
        });

        callback(table);
    });
}

let ExerciseList = React.createClass({    
	render: function(){
		return <Dt
            keyName='id'
            className='data_view'
			dataSourceFun={fetchData}
            location='/:type/:id'
			columns={columns}
		/>
	}
})

module.exports = ExerciseList;