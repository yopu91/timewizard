import React from 'react';
import { Container, Segment, Grid, Form, Button, Message } from 'semantic-ui-react';
import RestrictedPageBase from 'pages/RestrictedPageBase';
import Drawer from 'components/Drawer';
import HeaderBox from 'components/HeaderBox';
import Footer from 'components/Footer';
import api from 'services/ApiService';
import ReactTelInput from 'react-telephone-input';

export default class AccountPage extends RestrictedPageBase {

  constructor(props) {
    super(props);
    this.state = {
      user: {
        id: '',
        firstname: '',
        lastname: '',
        email: '',
        phone: ''
      },
      errorFields: [],
      currentpassword: '',
      newpassword: '',
      newpassword2: '',
      passwordErrorFields: []
    };

    this.onSavePasswordClick = this.onSavePasswordClick.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.getData();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async getData() {
    let result = await api.get(`users/me`);
    if (this.mounted) {
      this.setState({
        user: result.data
      });
    }
  }

  onFieldChange(field, event) {
    let newUser = Object.assign({}, this.state.user);
    newUser[field] = event.target.value;
    this.setState({ user: newUser });
  }

  onPasswordFieldChange(field, event) {
    let newState = {
      passwordErrorFields: this.state.passwordErrorFields.filter((f) => f !== field)
    };
    newState[field] = event.target.value;
    this.setState(newState);
  }

  onPhoneChange(number) {
    let newUser = Object.assign({}, this.state.user);
    newUser.phone = number.replace(/ /g, '');
    this.setState({ user: newUser });
  }

  async onSaveClick() {


    if (!/^[^{}()[\]<>\\/]+$/.test(this.state.user.firstname)) {
      this.setState({ success: false, errorFields: ['firstname'], errorMessage: 'Please enter a valid first name.' });
      return;
    }
    else if (!/^[^{}()[\]<>\\/]+$/.test(this.state.user.lastname)) {
      this.setState({ success: false, errorFields: ['lastname'], errorMessage: 'Please enter a valid last name.' });
      return;
    }
    else if (this.state.user.email.length < 1) {
      this.setState({ success: false, errorFields: ['email'], errorMessage: 'Please enter a valid email-address.' });
      return;
    }
    else if (!/^\+[1-9]{1}[0-9]{3,14}$/.test(this.state.user.phone)) {
      this.setState({ success: false, errorFields: ['phone'], errorMessage: 'Please enter a valid phone number.' });
      return;
    }

    this.setState({ success: false, errorMessage: undefined, errorFields: [], loading: true });

    let result = await api.put('users/' + this.state.user.id, this.state.user);

    if (result.status === 200) {
      this.setState({ success: true, loading: false });
    }
    else if (result.status === 409) {
      this.setState({ errorMessage: 'Another user with this email or phone number is already registered.', loading: false });
    }
    else {
      this.setState({ errorMessage: 'Unknown error.', loading: false });
    }
  }

  
  dismissErrorMessage() {
    this.setState({ errorMessage: undefined, errorFields: [] });
  }

  async onSavePasswordClick() {

    if (this.state.currentpassword.length < 8) {
      this.setState({ passwordChangeSuccess: false, passwordErrorFields: ['currentpassword'], passwordErrorMessage: 'Please enter your current password.' });
      return;
    }
    else if (this.state.newpassword.length < 8) {
      this.setState({ passwordChangeSuccess: false, passwordErrorFields: ['newpassword'], passwordErrorMessage: 'Please enter a new password with a minimum length of 8 characters.' });
      return;
    }
    else if (this.state.newpassword !== this.state.newpassword2) {
      this.setState({ passwordChangeSuccess: false, passwordErrorFields: ['newpassword', 'newpassword2'], passwordErrorMessage: 'Password fields do not match.' });
      return;
    }

    this.setState({ passwordChangeSuccess: false, passwordErrorMessage: undefined, passwordErrorFields: [], loading: true });

    let result = await api.put('users/' + this.state.user.id, {
      currentPassword: this.state.currentpassword,
      password: this.state.newpassword
    });

    if (result.status === 200) {
      this.setState({ passwordChangeSuccess: true, loading: false, newpassword: '', newpassword2: '', currentpassword: '' });
    }
    else if (result.status === 403) {
      this.setState({ passwordErrorFields: ['currentpassword'], passwordErrorMessage: 'The current password is incorrect.', loading: false });
    }
    else {
      this.setState({ passwordErrorMessage: 'Unknown error.', loading: false });
    }
  }

  dismissPasswordErrorMessage() {
    this.setState({ passwordErrorMessage: undefined, passwordErrorFields: [] });
  }

  render() {
    return (
      <div className="fullHeight">
        <Drawer />
        <div className='mainContent'>
          <HeaderBox title="Account" />
          <Container>
            <Grid textAlign='center'>
              <Grid.Row>
                <Grid.Column width={16} computer={10} textAlign='left'>
                  <Segment clearing>
                    <h3 style={{ textAlign: 'center', padding: 20 }}>User Information</h3>
                    <Form onSubmit={this.onSaveClick} success={this.state.success} error={this.state.errorMessage !== undefined}>
                      <Form.Group widths='equal'>
                        <Form.Input
                          label='First name'
                          placeholder='First name'
                          value={this.state.user.firstname}
                          error={this.state.errorFields.includes('firstname')}
                          onChange={this.onFieldChange.bind(this, 'firstname')}
                        />
                        <Form.Input
                          label='Last name'
                          placeholder='Last name'
                          value={this.state.user.lastname}
                          error={this.state.errorFields.includes('lastname')}
                          onChange={this.onFieldChange.bind(this, 'lastname')}
                        />
                      </Form.Group>
                      <Form.Input
                        label='Email'
                        icon='at'
                        iconPosition='left'
                        placeholder='Email'
                        type='email'
                        value={this.state.user.email}
                        error={this.state.errorFields.includes('email')}
                        onChange={this.onFieldChange.bind(this, 'email')}
                      />
                      <Form.Field error={this.state.errorFields.includes('phone')}>
                        <label>Phone number</label>
                        <ReactTelInput defaultCountry="se" value={this.state.user.phone} onChange={this.onPhoneChange.bind(this)} flagsImagePath={require('images/flags.png')} />
                      </Form.Field>
                      <Message
                        error
                        header='Failed to update information'
                        content={this.state.errorMessage}
                        onDismiss={this.dismissErrorMessage.bind(this)}
                      />
                      <Message
                        success
                        header='User information updated'
                        content='Your user information was successfully updated.'
                      />
                      <Form.Field>
                        <Button positive floated='right' size='medium' type='submit'>Save</Button>
                      </Form.Field>
                    </Form>
                  </Segment>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column width={16} computer={10} textAlign='left'>
                  <Segment clearing>
                    <h3 style={{ textAlign: 'center', padding: 20 }}>Change password</h3>
                    <Form onSubmit={this.onSavePasswordClick} success={this.state.passwordChangeSuccess} error={this.state.passwordErrorMessage !== undefined}>
                      <Form.Input
                        icon='lock'
                        iconPosition='left'
                        label='Current password'
                        placeholder='Password'
                        type='password'
                        value={this.state.currentpassword}
                        error={this.state.passwordErrorFields.includes('currentpassword')}
                        onChange={this.onPasswordFieldChange.bind(this, 'currentpassword')}
                      />
                      <Form.Input
                        icon='lock'
                        iconPosition='left'
                        label='New password'
                        placeholder='New password'
                        type='password'
                        value={this.state.newpassword}
                        error={this.state.passwordErrorFields.includes('newpassword')}
                        onChange={this.onPasswordFieldChange.bind(this, 'newpassword')}
                      />
                      <Form.Input
                        icon='lock'
                        iconPosition='left'
                        label='Repeat password'
                        placeholder='Repeat new password'
                        type='password'
                        value={this.state.newpassword2}
                        error={this.state.passwordErrorFields.includes('newpassword2')}
                        onChange={this.onPasswordFieldChange.bind(this, 'newpassword2')}
                      />
                      <Message
                        error
                        header='Failed to change password'
                        content={this.state.passwordErrorMessage}
                        onDismiss={this.dismissPasswordErrorMessage.bind(this)}
                      />
                      <Message
                        success
                        header='Password changed'
                        content='Your password change was successful.'
                      />
                      <Form.Field>
                        <Button positive floated='right' size='medium' type='submit'>Save</Button>
                      </Form.Field>
                    </Form>
                  </Segment>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Container>
          <Footer />
        </div>
      </div>
    );
  }
}
