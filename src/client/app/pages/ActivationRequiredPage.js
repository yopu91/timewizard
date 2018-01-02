import React from 'react';
import RestrictedPageBase from 'pages/RestrictedPageBase';
import { Grid } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import api from 'services/ApiService';

export default class ActivationRequiredPage extends RestrictedPageBase {
  constructor(props) {
    super(props);
    this.state = {
      sent: false
    };
  }

  async resend() {
    if (!this.state.sent) {
      await api.get('activate/resend');
      this.setState({ sent: true });
    }
  }

  render() {
    return (
      <Grid className='fullHeight' verticalAlign='middle' centered>
        <Grid.Row>
          <Grid.Column>
            <h2 style={{textAlign: 'center'}}>Activation required!</h2>
            <p style={{textAlign: 'center'}}><a onClick={this.resend.bind(this)}>Resend activation email</a> or <Link to='/logout'>Logout</Link></p>
            { this.state.sent ? <h2 style={{textAlign: 'center'}}>Link Sent!</h2> : null }
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}
