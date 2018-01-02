import React from 'react';
import api from 'services/ApiService';

export default class Logout extends React.Component {
  constructor(props) {
    super(props);
    api.setAuthToken(null);
    props.history.replace('/');
  }

  render() {
    // This page does not render
    return null;
  }
}
