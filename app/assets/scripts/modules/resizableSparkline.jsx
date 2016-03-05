'use strict';

const React = require('react');

import {Sparklines, SparklinesLine} from 'react-sparklines';

const ResizableSparkline = React.createClass({
    listener: {},
    
    getInitialState:function (){
        return {
            windowWidth: window.innerWidth,
            color: this.props.color ? this.props.color : '#4291ff',
            minHeight: this.props.minHeight ? this.props.minHeight : 150,
            margin: this.props.margin ? this.props.margin : 47,
        }
    },
    
    componentDidMount: function(){
        let that = this;
        
        this.listener = window.addEventListener('optimizedResize', function(event){
            that.setState({
                windowWidth: window.innerWidth
            });
            console.log(window.innerWidth);
        });
    },
    
    componentWillUnmount: function(){
        window.removeEventListener('optimizedResize', this.listener);
    },
    
    render: function(){
        let height, content;
        
        height = (this.state.windowWidth * 0.3 < this.state.minHeight) ?
                                 this.state.windowWidth * 0.3 : this.state.minHeight;

        return <Sparklines data={this.props.data}
                    width={this.state.windowWidth - this.state.margin}
                    height={height}
                    min={this.props.min}>
            <SparklinesLine color={this.state.color} 
                            style={{fillOpacity: ".5" }}/>
        </Sparklines>
    }
});

module.exports = ResizableSparkline;