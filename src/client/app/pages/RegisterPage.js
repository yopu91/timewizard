import React from 'react';
import { Container, Grid, Form, Button, Message } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import ReactTelInput from 'react-telephone-input';
import api from 'services/ApiService';

require('./ReactTelInput.css');

export default class LoginPage extends React.Component {

  constructor(props) {
    super(props);

    // Redirect to overview if already loged in.
    if (api.isAuthenticated()) {
      this.props.history.replace('/overview');
    }

    this.state = {
      firstname: '',
      lastname: '',
      email: '',
      phone: '+46',
      password: '',
      password2: '',
      errorFields: [],
      success: false
    };

    this.registerClick = this.registerClick.bind(this);
  }

  onFieldChange(field, event) {
    let newState = {
      errorFields: this.state.errorFields.filter((f) => f !== field)
    };
    newState[field] = event.target.value;
    this.setState(newState);
  }

  onPhoneChange(number) {
    let errorFields = this.state.errorFields.filter((field) => field !== 'phone');
    this.setState({ errorFields, phone: number.replace(/ /g, '') });
  }

  async registerClick() {

    if (!/^[^{}()[\]<>\\/]+$/.test(this.state.firstname)) {
      this.setState({ errorFields: ['firstname'], errorMessage: 'Please enter a valid first name.' });
      return;
    }
    else if (!/^[^{}()[\]<>\\/]+$/.test(this.state.lastname)) {
      this.setState({ errorFields: ['lastname'], errorMessage: 'Please enter a valid last name.' });
      return;
    }
    else if (this.state.email.length < 1) {
      this.setState({ errorFields: ['email'], errorMessage: 'Please enter a valid email-address.' });
      return;
    }
    else if (!/^\+[1-9]{1}[0-9]{3,14}$/.test(this.state.phone)) {
      this.setState({ errorFields: ['phone'], errorMessage: 'Please enter a valid phone number.' });
      return;
    }
    else if (this.state.password.length < 8) {
      this.setState({ errorFields: ['password'], errorMessage: 'Please enter a password with a minimum length of 8 characters.' });
      return;
    }
    else if (this.state.password !== this.state.password2) {
      this.setState({ errorFields: ['password', 'password2'], errorMessage: 'Password fields do not match.' });
      return;
    }

    this.setState({ errorMessage: undefined, errorFields: [], loading: true });

    let result = await api.post('register', {
      firstname: this.state.firstname,
      lastname: this.state.lastname,
      email: this.state.email,
      phone: this.state.phone,
      password: this.state.password
    });

    if (result.status === 201) {
      this.setState({ success: true, loading: false });
    }
    else if (result.status === 409) {
      this.setState({ errorMessage: 'A user with this email or phone number is already registered.', loading: false });
    }
    else {
      this.setState({ errorMessage: 'Unknown error.', loading: false });
    }

  }

  dismissErrorMessage() {
    this.setState({ errorMessage: undefined, errorFields: [] });
  }

  render() {

    return (
      <Container className='fullHeight'>
        <Grid className='fullHeight' verticalAlign='middle' centered>
          <Grid.Row>
            <Grid.Column largeScreen={6} computer={8} mobile={14}>
              <h1 style={{ textAlign: 'center', padding: 20 }}>Register Account</h1>
              <Form onSubmit={this.registerClick} hidden={this.state.success} error={this.state.errorMessage !== undefined}>
                <Form.Group widths='equal'>
                  <Form.Input
                    error={this.state.errorFields.includes('firstname')}
                    disabled={this.state.loading}
                    label='First name'
                    placeholder='First name'
                    value={this.state.firstname}
                    onChange={this.onFieldChange.bind(this, 'firstname')} />
                  <Form.Input
                    error={this.state.errorFields.includes('lastname')}
                    disabled={this.state.loading}
                    label='Last name'
                    placeholder='Last name'
                    value={this.state.lastname}
                    onChange={this.onFieldChange.bind(this, 'lastname')} />
                </Form.Group>
                <Form.Input
                  error={this.state.errorFields.includes('email')}
                  disabled={this.state.loading}
                  icon='at'
                  iconPosition='left'
                  type='email'
                  label='Email'
                  placeholder='Email'
                  value={this.state.email}
                  onChange={this.onFieldChange.bind(this, 'email')}
                />
                <Form.Field error={this.state.errorFields.includes('phone')}>
                  <label>Phone number</label>
                  <ReactTelInput
                    disabled={this.state.loading}
                    defaultCountry="se"
                    value={this.state.phone}
                    onChange={this.onPhoneChange.bind(this)}
                    flagsImagePath={require('images/flags.png')} />
                </Form.Field>
                <Form.Group widths='equal'>
                  <Form.Input
                    error={this.state.errorFields.includes('password')}
                    disabled={this.state.loading}
                    icon='lock'
                    iconPosition='left'
                    label='Password'
                    placeholder='Password'
                    type='password'
                    value={this.state.password}
                    onChange={this.onFieldChange.bind(this, 'password')}
                  />
                  <Form.Input
                    error={this.state.errorFields.includes('password2')}
                    disabled={this.state.loading}
                    icon='lock'
                    iconPosition='left'
                    label='Repeat password'
                    placeholder='Password'
                    type='password'
                    value={this.state.password2}
                    onChange={this.onFieldChange.bind(this, 'password2')}
                  />
                </Form.Group>
                <Form.Field>
                  <Button
                    fluid
                    positive
                    size='big'
                    type='submit'
                    loading={this.state.loading}
                    disabled={this.state.loading || this.state.success}
                  >
                    Register
                  </Button>
                </Form.Field>
                <Message
                  error
                  header='Failed to register account'
                  content={this.state.errorMessage}
                  onDismiss={this.dismissErrorMessage.bind(this)}
                />
                <Form.Field>
                  <p style={{ textAlign: 'center' }}>Already have an account? <Link to='/'>Sign in!</Link></p>
                </Form.Field>
              </Form>
              <Message
                success
                hidden={!this.state.success}
                header='Registration successful'
                content='Your registration was successful, please check your email for activation instructions.'
              />
              { this.state.success ? <p style={{ textAlign: 'center' }}><Link to='/'>Sign in!</Link></p> : null }
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }

}
