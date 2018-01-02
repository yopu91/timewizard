import React from 'react';
import { Container, Grid, Form, Input, Button, Image, Message } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import api from 'services/ApiService';

export default class LoginPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      loading: false
    };

    // Redirect to overview if already loged in.
    if (api.isAuthenticated()) {
      this.props.history.replace('/overview');
    }

    this.emailChange = this.emailChange.bind(this);
    this.passwordChange = this.passwordChange.bind(this);
    this.signInClick = this.signInClick.bind(this);
  }  
  
  emailChange(event) {
    this.setState({ email: event.target.value });
  }

  passwordChange(event) {
    this.setState({ password: event.target.value });
  }

  async signInClick() {
    this.setState({ errorMessage: undefined, loading: true });
    try {
      let result = await api.post('login', { email: this.state.email, password: this.state.password });
      switch (result.status) {
        case 200:
          api.setAuthToken(result.data.token);
          this.props.history.push('/overview');
          break;
        case 401:
          this.setState({ errorMessage: 'Wrong email or password', loading: false });
          break;
        default:
          this.setState({ errorMessage: 'Unknown error', loading: false });
          break;
      }
    }
    catch (err) {
      this.setState({ errorMessage: 'Network error', loading: false });
    }
  }

  dismissErrorMessage() {
    this.setState({ errorMessage: undefined });
  }

  render() {
    
    return (
      <Container className='fullHeight'>
        <Grid className='fullHeight' verticalAlign='middle' centered>
          <Grid.Row>
            <Grid.Column computer={6} mobile={14}>
              <Image centered src={require('images/sensefarm_logo.svg')} style={{ padding: 10 }} />
              <Form onSubmit={this.signInClick}>
                <Form.Field>
                  <Input icon='at' iconPosition='left' placeholder='Email' type='email' value={this.state.email} onChange={this.emailChange} />
                </Form.Field>
                <Form.Field>
                  <Input icon='lock' iconPosition='left' placeholder='Password' type='password' value={this.state.password} onChange={this.passwordChange} />
                </Form.Field>
                <Form.Field>
                  <Button loading={this.state.loading} disabled={this.state.loading} fluid positive size='big' type='submit'>Sign In</Button>
                </Form.Field>
                <div style={{ minHeight: '4em' }}>
                  <Message negative hidden={!this.state.errorMessage} onDismiss={this.dismissErrorMessage.bind(this)}>{this.state.errorMessage}</Message>
                </div>
                <Form.Field>
                  <p style={{textAlign: 'center'}}>Don&apos;t have an account? <Link to='/register'>Create one!</Link></p>
                </Form.Field>
              </Form>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }

}
