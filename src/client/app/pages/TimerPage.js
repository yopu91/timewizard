import React from 'react';
import { Container} from 'semantic-ui-react';
import RestrictedPageBase from 'pages/RestrictedPageBase';
import Drawer from 'components/Drawer';
import Footer from 'components/Footer';
import HeaderBox from 'components/HeaderBox';
import TimerClock from 'components/TimerClock';

export default class TimerPage extends RestrictedPageBase {

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


  render() {
    return (
      <div className="fullHeight">
        <Drawer />
        <div className='mainContent'>
          <HeaderBox title="Timer" />
          <Container>
            <TimerClock />
          </Container>
          <Footer />
        </div>
      </div>
    );
  }

}