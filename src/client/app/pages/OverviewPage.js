import React from 'react';
import RestrictedPageBase from 'pages/RestrictedPageBase';
import { Statistic, Button, Tab, Menu, Item, Divider, Table } from 'semantic-ui-react';
import api from 'services/ApiService';
import Drawer from 'components/Drawer';
import HeaderBox from 'components/HeaderBox';
import Footer from 'components/Footer';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { getSensorUnit, capitalizeFirst } from 'services/UtilityService';

export default class OverviewPage extends RestrictedPageBase {

  constructor(props) {
    super(props);
    this.state = {
      devices: [],
      deviceCount: 0,
      alarmDevices: [],
      amountAlarmDevice: 0,
      showAlarms: false,
      watchDevices: [],
      showWatching: true,
      panes: []
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.updateDevices();
    this.updateStats();
    this.updateInterval = setInterval(() => this.updateStats(), 5000);
    this.getAlarmNotices();
    this.getWatchedDevices();
    this.populatePanes();

  }

  componentWillUnmount() {
    this.mounted = false;
    clearInterval(this.updateInterval);
  }

  async updateDevices() {
    let user = await api.getUser();
    let result = await api.get('users/' + user.id + '/devices');
    if (this.mounted) {
      this.setState({
        devices: result.data.results
      });
    }
    this.populatePanes();
  }

  async getAlarmNotices() {
    let user = await api.getUser();
    let result = await api.get('users/' + user.id + '/alarms/notices');
    this.setState({
      alarmDevices: result.data,
      amountAlarmDevice: result.data.length
    }
    );
    this.populatePanes();
  }

  //
  async getWatchedDevices() {
    let user = await api.getUser();
    let result = await api.get('users/' + user.id + '/devices/watching');
    this.setState({
      watchDevices: result.data,
    }
    );
    this.populatePanes();
  }

  async updateStats() {
    // Fetch data
    let user = await api.getUser();
    let result = await api.get('users/' + user.id + '/devices?limit=0');
    if (this.mounted) {
      this.setState({
        deviceCount: result.data.total
      });
    }
  }

  populatePanes() {
    let renderPane = [];
    let firstPane = {};
    let secondPane = {};
    let thirdPane = {};
    firstPane.menuItem = <Menu.Item key='totalDevices'><Statistic size="small" label='Total devices' value={this.state.devices.length} /></Menu.Item>;
    firstPane.render = this.renderTotalDevicePane.bind(this);
    renderPane.push(firstPane);

    secondPane.menuItem = <Menu.Item key='activeAlarms'><Statistic color="red" size="small" label='Active Alarms' value={this.state.alarmDevices.length} /></Menu.Item>;
    secondPane.render = this.renderAlarmDevicePane.bind(this);
    renderPane.push(secondPane);

    thirdPane.menuItem = <Menu.Item key='watchedDevices'><Statistic color="blue" size="small" label='Watched devices' value={this.state.watchDevices.length} /></Menu.Item>;
    thirdPane.render = this.renderWatchedDevicePane.bind(this);
    renderPane.push(thirdPane);

    this.setState({ panes: renderPane });
  }

  renderSensorData(device) {
    let sensorArray = [];
    if (device) {
      device.data.map((sensor) => {
        sensorArray.push(
          <Table.Row key={sensor.identifier}>
            <Table.Cell>{capitalizeFirst(sensor.identifier)}</Table.Cell>
            <Table.Cell>{sensor.value + ' ' + getSensorUnit(sensor.type)}</Table.Cell>
          </Table.Row>
        );
      });
    }
    return (
      <Table unstackable>
        <Table.Body>
          {sensorArray}
        </Table.Body>
      </Table>
    );
  }

  getUpdatedTimeInterval(updatedTime) {
    let timeDiffDays = 0;
    let timeDiffHour = 0;
    let timeDiffMinutes = 0;
    if (updatedTime) {
      let currentTime = moment();
      timeDiffDays = currentTime.diff(moment(updatedTime), 'days');
      timeDiffHour = currentTime.diff(moment(updatedTime), 'hours');
      timeDiffMinutes = currentTime.diff(moment(updatedTime), 'minutes');
      if (timeDiffDays > 0) {
        return timeDiffDays + ' day(s) ago';
      }
      else if (timeDiffHour > 0) {
        return timeDiffHour + ' hour(s) ago';
      }
      else if (timeDiffMinutes < 1) {
        return 'Just now';
      }
      else {
        return timeDiffMinutes + ' minute(s) ago';
      }
    }
    return 'Has never reported';
  }

  renderTotalDevicePane() {
    if (this.state.devices.length > 0) {

      const devices = this.state.devices.map((device) => {
        return [
          <Item key={device.id}>
            <Item.Content>
              <Item.Header>{<Link to={'/devices/' + device.id}>{device.name}</Link>}</Item.Header>
              <Item.Meta>{'Last updated: '+this.getUpdatedTimeInterval(device.updated)}</Item.Meta>
              <Item.Description>
                {this.renderSensorData(device)}
              </Item.Description>
              <Item.Extra>
                <Button size="small" floated="right" color='blue' content="Show Graph" onClick={this.showGraph.bind(this, device)} />
              </Item.Extra>
            </Item.Content>
          </Item>,
          <Divider key={device.id + '-divider'} />
        ];
      }
      );

      return (
        <Tab.Pane>
          <Item.Group>
            {devices}
          </Item.Group>
        </Tab.Pane>
      );
    }
  }

  renderAlarmDevicePane() {
    if (this.state.alarmDevices.length > 0) {
      const devices = this.state.alarmDevices.map((alarm) => {
        let sensor = alarm.device.data.find((sensor) => {
          return sensor.id === alarm.sensor;
        });

        return [
          <Item key={alarm.id}>
            <Item.Content>
              <Item.Header as='a'>{capitalizeFirst(sensor.type)} alarm</Item.Header>
              <Item.Meta>{moment(alarm.added).format('LLL')}</Item.Meta>
              <Item.Description>
                <Link to={'/devices/' + alarm.device.id}>{alarm.device.name}</Link> reported a value of <b>{alarm.value + getSensorUnit(sensor.type)}</b>
              </Item.Description>
              <Item.Extra>
                <Button size="small" floated="right" color='red' content="Dismiss" onClick={this.dismissAlarm.bind(this, alarm)} />
                <Button size="small" floated="right" color='blue' content="Show Graph" onClick={this.showAlarmGraph.bind(this, alarm)} />
              </Item.Extra>
            </Item.Content>
          </Item>,
          <Divider key={alarm.id + '-divider'} />
        ];
      }
      );
      return (
        <Tab.Pane>
          <Item.Group>
            {devices}
          </Item.Group>
        </Tab.Pane>
      );
    }
  }

  renderWatchedDevicePane() {
    if (this.state.watchDevices.length > 0) {
      const devices = this.state.watchDevices.map((watch) => {
        return [
          <Item key={watch.id}>
            <Item.Content>
              <Item.Header>{<Link to={'/devices/' + watch.id}>{watch.name}</Link>}</Item.Header>
              <Item.Meta>{'Last updated: '+this.getUpdatedTimeInterval(watch.updated)}</Item.Meta>
              <Item.Description>
                {this.renderSensorData(watch)}
              </Item.Description>
              <Item.Extra>
                <Button size="small" floated="right" color='blue' content="Show Graph" onClick={this.showGraph.bind(this, watch)} />
              </Item.Extra>
            </Item.Content>
          </Item>,
          <Divider key={watch.id + '-divider'} />
        ];
      }
      );

      return (
        <Tab.Pane>
          <Item.Group>
            {devices}
          </Item.Group>
        </Tab.Pane>
      );
    }
  }

  async dismissAlarm(alarm) {
    let result = await api.put("alarms/notices/" + alarm.id, {
      dismissed: true
    });
    this.getAlarmNotices();
  }

  showAlarmGraph(alarm) {
    this.props.history.push('/graph?view=single&id=' + alarm.device.id);
  }

  showGraph(device) {
    this.props.history.push('/graph?view=single&id=' + device.id);
  }

  render() {
    return (
      <div className="fullHeight">
        <Drawer />
        <div className='mainContent'>
          <HeaderBox title="Overview" />
          <Tab panes={this.state.panes} menu={{ fluid: true, widths: 3, attached: true, borderless: true }} />
          <Footer />
        </div>
      </div>
    );
  }
}
