'use strict';

const          React = require('react');
const       ReactDOM = require('react-dom');
const           Link = require('react-router').Link;
const          Route = require('react-router').Route;
const     IndexRoute = require('react-router').IndexRoute;
const         Router = require('react-router').Router;
const       Redirect = require('react-router').Redirect;
const browserHistory = require('react-router').browserHistory;

const          App = require('./components/app.jsx');
const     NotFound = require('./components/notfound.jsx');
const    Introduce = require('./components/introduce.jsx');
const ExerciseList = require('./components/exerciseList.jsx');
const    DailyList = require('./components/dailyList.jsx');
const    SleepList = require('./components/sleepList.jsx');
const      RunData = require('./components/runData.jsx');
const ExerciseData = require('./components/exerciseData.jsx');
const    DailyData = require('./components/dailyData.jsx');

const throttle = require('./modules/throttle.jsx');

throttle("resize", "optimizedResize");
throttle("scroll", "optimizedScroll");

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
        <IndexRoute component={Introduce} />
        <Route path="exercises" component={ExerciseList}/>
        <Route path="dailies" component={DailyList}/>
        <Route path="sleeps" component={SleepList}/>
        <Redirect from="run/:id" to="run/:id/summary" />
        <Route path="exercise/:id/:card" components={ExerciseData}/>
        <Redirect from="exercise/:id" to="exercise/:id/summary" />
        <Route path="run/:id/:card" components={RunData}/>
        <Redirect from="daily/:id" to="daily/:id/summary" />
        <Route path="daily/:id/:card" components={DailyData}/>
        <Route path="*" component={NotFound} />
    </Route>
  </Router>
), document.querySelector('.react'));

{
  window.addEventListener("optimizedScroll", function() {
    let header = document.querySelector('.data_view thead');

    if (!header) return true;
    
    header.style.marginLeft = -window.scrollX + 'px';
  });
};