'use strict';

const React = require('react');

let InfoBlock = React.createClass({
    render:function(){
        return <div>
            {this.props.data.map((o, i) => {
                return (
                    <div className='info_block' key={i}>
                    <h3>{o.title}</h3>
                    <ul>
                        {o.data.map((_o, _i) => {
                            return (
                                <li key={_i}>
                                    <span className='title'>{_o.title}</span>
                                    <span className='content'>
                                        <span className='value'>{_o.value}</span>
                                        <span className='unit'>{_o.unit || o.unit}</span>
                                    </span> 
                                </li>
                            )
                            })
                        }
                    </ul>
                </div>
                )
                })
            }
        </div>
    }
});

module.exports = InfoBlock;