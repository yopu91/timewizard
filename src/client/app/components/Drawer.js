import React from 'react';
import { NavLink } from 'react-router-dom';

export default class Drawer extends React.Component {

  render() {
    return (
      <div className="drawer">
        <ul>
          <li><NavLink to='/overview'><i className="fa fa-home"></i></NavLink></li>
          <li><NavLink to='/timer'><i className="fa fa-clock-o"></i></NavLink></li>
          <li><NavLink to='/report'><i className="fa fa-random"></i></NavLink></li>
          <li><NavLink to='/account'><i className="fa fa-user"></i></NavLink></li>
          <li className="pulldown"><NavLink to='/logout'><i className="fa fa-sign-out"></i></NavLink></li>
        </ul>
      </div>
    );
  }
}
