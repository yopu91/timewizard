import React from 'react';

export default class Footer extends React.Component {

  render() {
    return (
      <footer className="footer">
        <a href="https://sensefarm.com">sensefarm.com</a> &copy; Sensefarm - Version {VERSION}
      </footer>
    );
  }
}