'use strict';

const React = require('react');

let Introduce = React.createClass({
   render:function(){
       return (
       <div className='introduce'>
           <div className='main_header'>
                <h1> Open Body </h1>
           </div>
           <section className='content'>
                <div className='avatar writer'
                     src='./assets/imgs/avatar.png'
                     alt='一个小说作者头像一样的，白色皮肤的人。'>
                </div>
                <div className='description'>
                    <div>
                        <h2>欢迎来到Open Body！</h2>
                        <p>您好，我是Losses Don，很高兴见到你！</p>
                        <p>我在这里开放了我的大部分个人健康数据，我的个人数据与本数据获取程序在Apache 2.0开源协议下开源，
                        您可以依据您的兴趣或研究需要下载我的数据并进行商业或非商业的使用。</p>
                        <p>本站为您提供了 SQLite 3 格式的数据库，该数据库包含了目前全部的可用数据：</p>
                        <a href='/data.sqlite3' className='download'>
                            <span className='text'>下载数据库</span>
                            <span className='size'>288 kb</span>
                        </a>
                    </div>
                </div>
           </section>
       </div>
       )
   } 
});

module.exports = Introduce;