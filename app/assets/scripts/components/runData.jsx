'use strict';

const        net = require('../modules/network.jsx');
const          t = require('../modules/time.jsx');
const      React = require('react');

const         DetailPage = require('../modules/detailPage.jsx');
const          InfoBlock = require('../modules/infoBlock.jsx');
const ResizableSparkline = require('../modules/resizableSparkline.jsx');

let RunData = React.createClass({
    nav: [
            {id:'summary',name:'概览',  icon:'table',    location:'/run/:id/summary'},
            {id:'HR',     name:'心率',  icon:'HR',       location:'/run/:id/HR'     },
            {id:'pace',   name:'速度',  icon:'speed',    location:'/run/:id/pace'   },
            {id:'map',    name:'地图',  icon:'location', location:'/run/:id/map'    }
        ],
        
    getInitialState: function(){
        return {
            docs:{},
            chart:{
                pace: [[0],[0]],
                HR: [[0],[0]],
                elevation: [[0],[0]],
            },
            info:{
                summary:[],
                HR:[],
                pace:[]
            }
        };
    },
    
    componentDidMount: function(){
        let that, chartData, chartOption, info;
        
        that = this;
        
        net.get('/api/activity/run/' + this.props.params.id, '', function(docs){
            if (!docs.success) return alert('SERVER SIDE ERROR!');

            ['time_rule', 'pace_data', 'HR_data', 'elevation_data',
             'split_distance', 'split_pace', 'split_HR'].map(i => {
                docs.docs[i] = docs.docs[i].split(',').map(j =>  parseFloat(j).toFixed(4));
            });
            
            docs.docs.pace_data = docs.docs.pace_data.map(i => 1.60934 * 60 / i);
            
            chartData = {
                pace: [docs.docs.time_rule, docs.docs.pace_data],
                HR: [docs.docs.time_rule, docs.docs.HR_data],
                elevation: [docs.docs.time_rule, docs.docs.elevation_data]
            };
            
            info = {
                summary: [
                    {
                        title:'概览',
                        data:[
                            {title:'总里程',    value:docs.docs.distance / 100, unit:'m'     },
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
                ],
                pace:[
                    {
                        title:'概览', unit:'min/km',
                        data:[
                            {title:'平均速度',    value:((docs.docs.duration / docs.docs.distance) * (10000/6)).toFixed(2)},
                            {title:'最大瞬时速度', value:(Math.min.apply(null, docs.docs.split_pace)/60).toFixed(2)}
                        ]
                    },
                    {
                        title:'分段',
                        data:docs.docs.split_distance.map((i, j) => {
                            let distance = i;
                            while(distance[distance.length - 1] === '0' || distance[distance.length - 1] === '.'){
                                distance = distance.slice(0, distance.length - 1);
                            }
                            return {title:distance + ' km', value:t.processTime(docs.docs.split_pace[j])}
                        })
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
            <div ref='pace'>
                <InfoBlock data={this.state.info.pace}/>
                <ResizableSparkline data={this.state.chart.pace}/>
            </div>
            <div ref='map'>
                出于隐私保护原因，我们不在站点上向您提供详细的地图数据；如果您需要此部分数据请单独联系我 :)
                <ResizableSparkline data={this.state.chart.elevation} min='0'/>
            </div>
        </DetailPage>
    }
});

module.exports = RunData;