import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import RouteMode from './pages/Route';
import LocalModePage from './pages/LocalMode';
import PythonModePage from './pages/PythonMode';
import ClusterModePage from './pages/ClusterMode';


ReactDOM.render(
  <Router>
    <div>
      <Route path="/" exact component={HomePage} />
      <Route path="/route" component={RouteMode} />
      <Route path="/local" component={LocalModePage} />
      <Route path="/python" component={PythonModePage} />
      <Route path="/cluster" component={ClusterModePage} />

    </div>
  </Router>,
  
  document.getElementById('root'),
);

window.onload = function(){
  setTimeout(function(){
  var loader = document.getElementsByClassName("loader")[0];
  loader.className="loader fadeout" ;
  setTimeout(function(){loader.style.display="none"},1000)
  },1000)
}
