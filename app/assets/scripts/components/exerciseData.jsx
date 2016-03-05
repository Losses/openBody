'use strict';

const        net = require('../modules/network.jsx');
const          t = require('../modules/time.jsx');
const      React = require('react');

const         DetailPage = require('../modules/detailPage.jsx');
const          InfoBlock = require('../modules/infoBlock.jsx');
const ResizableSparkline = require('../modules/resizableSparkline.jsx');

let ExerciseData = React.createClass({
    nav: [
            {id:'summary',name:'概览',  icon:'table',    location:'/exercise/:id/summary'},
            {id:'HR',     name:'心率',  icon:'HR',       location:'/exercise/:id/HR'     }
        ],
        
    getInitialState: function(){
        return {
            docs:{},
            chart:{
                HR: [0],
            },
            info:{
                summary:[],
                HR:[],
            }
        };
    },
    
    componentDidMount: function(){
        let that, chartData, chartOption, info;
        
        that = this;
        
        net.get('/api/activity/exercise/' + this.props.params.id, '', function(docs){
            if (!docs.success) return alert('SERVER SIDE ERROR!');

            docs.docs['HR_data'] = docs.docs['HR_data'].split(',').map(j =>  parseFloat(j).toFixed(4));
            
            chartData = {
                HR: docs.docs.HR_data
            };
            
            info = {
                summary: [
                    {
                        title:'概览',
                        data:[
                            {title:'运动时长',  value:t.processTime(docs.docs.duration)      },
                            {title:'暂停时间',  value:t.processTime(docs.docs.seconds_paused)},
                            {title:'运动评级',  value:docs.docs.cardio_benefit               }
                        ]
                    },
                    {
                        title: '热量燃烧', unit:'cal',
                        data:[
                            {title:'热量燃烧',    value:docs.docs.calories_burned           },
                            {title:'碳水化合物',  value:docs.docs.calories_burned_carbs     },
                            {title:'脂肪燃烧',  value:docs.docs.calories_burned_fats        }
                        ]
                    },
                    {
                        title: 'UV暴露',
                        data:[
                            {title:'UV水平',    value:docs.docs.UV                                 },
                            {title:'UV暴露时长',  value:t.processTime(docs.docs.UV_exposure_seconds)},
                        ]
                    }
                ],
                HR: [
                    {
                        title:'概览',
                        data:[
                                {title:'最高',  value:docs.docs.HR_peak    },
                                {title:'均值',  value:docs.docs.HR_average },
                                {title:'最低',  value:docs.docs.HR_lowest  }
                        ]
                    },
                    {
                        title:'心率区间', unit:'min',
                        data:[
                                {title:'无效',     value:docs.docs.HR_invalid_min      },
                                {title:'非常轻度',  value:docs.docs.HR_very_light_min   },
                                {title:'轻度',     value:docs.docs.HR_light_min        },
                                {title:'中度',     value:docs.docs.HR_moderate_min     },
                                {title:'困难',     value:docs.docs.HR_hard_min         },
                                {title:'最大心率',  value:docs.docs.HR_very_hard_min    }
                        ]
                    },
                    {
                        title:'恢复', unit:'bpm',
                        data:[
                                {title:'运动结束',      value:docs.docs.HR_finish          },
                                {title:'运动后1分钟',   value:docs.docs.HR_recovery_1_min  },
                                {title:'运动后2分钟',   value:docs.docs.HR_recovery_2_min  }
                        ]
                    }
                ]
            };
            
            that.setState({docs: docs.docs, chart: chartData, info: info});
        });
    },
    
    render:function(){
        return <DetailPage 
                    nav={this.nav}
                    id={this.props.params.id}
                    default='summary'
                    card={this.props.params.card}>
            <div ref='summary' originClass='hello'>
                <InfoBlock data={this.state.info.summary}/>
            </div>
            <div ref='HR'>
                <InfoBlock data={this.state.info.HR}/>
                <ResizableSparkline data={this.state.chart.HR} min='0'/>
            </div>
        </DetailPage>
    }
});

module.exports = ExerciseData;