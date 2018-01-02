import React from 'react';
import { Grid, Loader } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import api from 'services/ApiService';
import queryString from 'query-string';

export default class ActivatePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      failed: false
    };
    this.activate();
  }

  async activate() {
    let query = queryString.parse(this.props.location.search);
    let result = await api.post('activate', { token: query.token });

    if (result.status === 204) {
      await api.getUser(true);
      this.props.history.replace('/?activated');
    }
    else {
      this.setState({ failed: true });
    }
 
  }

  render() {
    return (
      <Grid className='fullHeight' verticalAlign='middle' centered>
        <Grid.Row>
          <Grid.Column>
            { this.state.failed ?
              <h2 style={{textAlign: 'center'}}>Activation failed! Please <Link to='/'>login</Link> to request a new activation link.</h2> :
              <Loader active inline='centered'/>
            }
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}
