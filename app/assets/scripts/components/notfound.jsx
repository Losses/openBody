'use strict';

const React = require('react');

let notFound = React.createClass({
   render:function(){
       return (
       <div className='introduce'>
           <div className='main_header'>
                <h1> 404 NotFound </h1>
           </div>
           <section className='content'>
                <div className='avatar not_found'
                     alt='一个画着文件消失标识的图标。'>
                </div>
                <div className='description'>
                    <div>
                        <h2>
                            您所寻找的资源不存在
                        </h2>
                        <p>您所寻找的资源不存在，请核实资源地址后重新尝试访问 (σﾟ∀ﾟ)σ。</p>
                    </div>
                </div>
           </section>
       </div>
       )
   } 
});

module.exports = notFound;