'use strict';

const React = require('react');
const Link = require('react-router').Link;

let App = React.createClass({
   render:function(){
       return (
       <div>
           <header>
               <nav className='pg_nav'>
                   <li className='logo'><Link to='/' className='icon-ob'>Open Body</Link></li>
                   <li><Link to='/dailies' className='icon-calendar'>每日数据</Link></li>
                   <li><Link to='/exercises' className='icon-fire'>活动数据</Link></li>
                   <li><Link to='/sleeps' className='icon-sleep'>睡眠数据</Link></li>
               </nav>
           </header>
   
           <section className='main'>
               {this.props.children}
           </section>
       </div>
       )
   } 
});

module.exports = App;