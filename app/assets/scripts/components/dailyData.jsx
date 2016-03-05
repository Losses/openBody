'use strict';

const        net = require('../modules/network.jsx');
const          t = require('../modules/time.jsx');
const      React = require('react');

const         DetailPage = require('../modules/detailPage.jsx');
const          InfoBlock = require('../modules/infoBlock.jsx');
const ResizableSparkline = require('../modules/resizableSparkline.jsx');

let ExerciseData = React.createClass({
    nav: [
            {id:'summary',name:'概览',  icon:'table',    location:'/daily/:id/summary'},
            {id:'calorie',name:'热量',  icon:'fire',     location:'/daily/:id/calorie'},
            {id:'step',   name:'行走',  icon:'walk',     location:'/daily/:id/step'   },
            {id:'HR',     name:'心率',  icon:'HR',       location:'/daily/:id/HR'     }
        ],
        
    getInitialState: function(){
        return {
            docs:{},
            chart:{
                HR: [0],
                calorie:[0],
                step:[0]
            },
            info:{
                summary:[],
                HR:[],
                calorie:[],
                step:[]
            }
        };
    },
    
    componentDidMount: function(){
        let that, chartData, chartOption, info;
        
        that = this;
        
        net.get('/api/activity/daily/' + this.props.params.id, '', function(docs){
            if (!docs.success) return alert('SERVER SIDE ERROR!');

            ['HR_data', 'calories_data', 'steps_data'].map(i => {
                docs.docs[i] = docs.docs[i].split(',').map(j =>  parseFloat(j).toFixed(4));
            });
            
            chartData = {
                HR: docs.docs.HR_data,
                calorie:docs.docs.calories_data,
                step:docs.docs.steps_data
            };
            
            info = {
                summary: [
                    {
                        title:'概览',
                        data:[
                            {title:'行走',       value:docs.docs.steps,                  unit:'步'       },
                            {title:'爬楼',       value:docs.docs.floors_climbed,         unit:'层'       },
                            {title:'热量消耗',    value:docs.docs.calories,               unit:'cal'     },
                            {title:'UV暴露时长',  value:t.processTime(docs.docs.uv_exposure_minutes * 60)},
                            {title:'睡眠时长',    value:t.processTime(docs.docs.total_seconds_slept)     },
                        ]
                    },
                    {
                        title: '目标达成', unit:'%',
                        data:[
                            {title:'行走',     value:(100*docs.docs.steps/docs.docs.steps_goal).toFixed(2)      },
                            {title:'热量燃烧',  value:(100*docs.docs.calories/docs.docs.calories_goal).toFixed(2)},
                        ]
                    },
                    {
                        title: '活动',
                        data:[
                            {title:'运动时长',  value:t.processTime(docs.docs.total_seconds_all_activities)  },
                            {title:'跑步',     value:t.processTime(docs.docs.run_total_seconds)             },
                            {title:'健身',     value:t.processTime(docs.docs.guided_workout_total_seconds + 
                                                                           docs.docs.exercise_total_seconds)}
                        ]
                    }
                ],
                calorie:[
                    {
                        title:'概览',
                        data:[
                            {title:'热量消耗',    value:docs.docs.calories,               unit:'cal' }
                        ]
                    },
                    {
                        title:'细节', unit:'cal',
                        data:[
                            {title:'睡眠',    value:docs.docs.sleep_total_calories     },
                            {title:'跑步',    value:docs.docs.run_total_calories       },
                            {title:'健身',    value:docs.docs.exercise_total_calories +
                                               docs.docs.guided_workout_total_calories}
                        ]
                    }
                ],
                HR: [
                    {
                        title:'概览', unit:'bpm',
                        data:[
                                {title:'最高',  value:docs.docs.HR_highest },
                                {title:'均值',  value:docs.docs.HR_average },
                                {title:'最低',  value:docs.docs.HR_lowest  }
                        ]
                    }
                ],
                step: [
                    {
                        title:'概览', unit:'bpm',
                        data:[
                                {title:'行走',       value:docs.docs.steps,                      unit:'步'   },
                                {title:'里程',       value:docs.docs.total_distance_on_foot/100, unit:'m'    },
                                {title:'爬楼',       value:docs.docs.floors_climbed,             unit:'层'   },
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
            <div ref='calorie'>
                <InfoBlock data={this.state.info.calorie}/>
                <ResizableSparkline data={this.state.chart.calorie} min='0'/>
            </div>
            <div ref='step'>
                <InfoBlock data={this.state.info.step}/>
                <ResizableSparkline data={this.state.chart.step} min='0'/>
            </div>
        </DetailPage>
    }
});

module.exports = ExerciseData;