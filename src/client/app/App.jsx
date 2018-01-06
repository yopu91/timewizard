require('./App.css');

import React from 'react';
import { Switch, Route } from 'react-router-dom';

import MobileService from 'services/MobileService';

import LoginPage from 'pages/LoginPage';
import RegisterPage from 'pages/RegisterPage';
import OverviewPage from 'pages/OverviewPage';
import AccountPage from 'pages/AccountPage';
import ActivatePage from 'pages/ActivatePage';
import ActivationRequiredPage from 'pages/ActivationRequiredPage';
import LogoutPage from 'pages/LogoutPage';
import TimerPage from 'pages/TimerPage';
import ReportPage from 'pages/ReportPage';

export default class App extends React.Component {

  async componentDidMount() {
    MobileService.init();
  }

  render() {
    return (
      <Switch>
        <Route exact path='/' component={LoginPage}/>
        <Route path='/timer' component={TimerPage}/>
        <Route path='/report' component={ReportPage}/>
        <Route path='/register' component={RegisterPage}/>
        <Route path='/activate' component={ActivatePage} />
        <Route path='/notactivated' component={ActivationRequiredPage} />
        <Route path='/overview' component={OverviewPage}/>
        <Route path='/account' component={AccountPage}/>
        <Route path='/logout' component={LogoutPage} />
      </Switch>
    );
  }

}
