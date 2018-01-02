import React from 'react';
import { NavLink } from 'react-router-dom';

export default class Drawer extends React.Component {

  render() {
    return (
      <div className="drawer">
        <ul>
          <li><NavLink to='/overview'><i className="fa fa-home"></i></NavLink></li>
          <li><NavLink to='/graph'><i className="fa fa-area-chart"></i></NavLink></li>
          <li><NavLink to='/devices'><i className="fa fa-list"></i></NavLink></li>
          <li><NavLink to='/map'><i className="fa fa-map-marker"></i></NavLink></li>
          <li><NavLink to='/account'><i className="fa fa-user"></i></NavLink></li>
          <li><NavLink to='/help'><i className="fa fa-question"></i></NavLink></li>
          <li className="pulldown"><NavLink to='/logout'><i className="fa fa-sign-out"></i></NavLink></li>
        </ul>
      </div>
    );
  }
}
