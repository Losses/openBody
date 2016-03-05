'use strict';

const    React = require('react');

const     Link = require('react-router').Link;
const ReactDOM = require('react-dom');

let DetailPage = React.createClass({
    getLocation: function(location){
        let id = this.props.id;
        return location.replace(':id',id.replace(/[^0-9]/g,""));
    },
    getIcon: icon => 'icon-' + icon,
    
    getClassName: function(object){
        let className = object.props.originClass ? object.props.originClass : '';
        
        if (object.ref && object.ref === this.props.card)
            return className + ' current';
        else
            return className;
    },
    
    render:function(){
        let children = this.props.children.map(o => {
            return React.cloneElement(o, 
                {
                    className: this.getClassName(o),
                    key: o.ref
                }
            );
        });
        
        return <div className='detail_page'>
            <nav className='main_header'>
                 <ul ref='navigationList'>
                    {
                        this.props.nav.map(i => {
                            return <li key={i.id}>
                                        <Link to={this.getLocation(i.location)} 
                                              className={this.getIcon(i.icon)}>{i.name}</Link>
                                   </li>
                        })
                    }
                 </ul>
            </nav>
            <div className='main_content'>
                {children}
            </div>
        </div>
    }
});

module.exports = DetailPage;