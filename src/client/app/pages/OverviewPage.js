import React from 'react';
import { Container} from 'semantic-ui-react';
import RestrictedPageBase from 'pages/RestrictedPageBase';
import Drawer from 'components/Drawer';
import Footer from 'components/Footer';
import HeaderBox from 'components/HeaderBox';

export default class OverviewPage extends RestrictedPageBase {

  constructor(props) {
    super(props);

    this.state = {
    };

  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  renderContactInformation() {
    return (
      <p> Hello there, welcome to timewizard!</p>
    );
  }


  render() {
    return (
      <div className="fullHeight">
        <Drawer />
        <div className='mainContent'>
          <HeaderBox title="Overview" />
          <Container>
              {this.renderContactInformation()}
          </Container>
          <Footer />
        </div>
      </div>
    );
  }

}