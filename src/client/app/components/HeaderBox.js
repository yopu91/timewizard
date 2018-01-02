import React from 'react';
import { Image, Header, Segment } from 'semantic-ui-react';

export default class HeaderBox extends React.Component {

  render() {
    return (
        <Segment clearing>
          <Image className="headerImage" src={require('images/sensefarm_logo.svg')} floated="right"/>
          <Header as='h2' floated='left'>
            {this.props.title}
          </Header>
        </Segment>

    );
  }

}
