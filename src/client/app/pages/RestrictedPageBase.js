import React from 'react';
import api from 'services/ApiService';

export default class RestrictedPageBase extends React.Component {

  constructor(props) {
    super(props);
    if (!api.isAuthenticated()) {
      this.props.history.push('/');
    }
  }

}