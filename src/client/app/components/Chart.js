import React from 'react';
import chartjs from 'chart.js';

export default class Chart extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <canvas height={this.props.height} width={this.props.width} ref={(c) => { 
        this.canvas = c; 
      }} />
    );
  }

  updateChart() {
    if (this.chart) this.chart.destroy();
    var ctx = this.canvas.getContext("2d");
    this.chart = new chartjs(ctx, {
      type: this.props.type,
      data: this.props.data,
      options: this.props.options
    });
  }

  componentDidMount() {
    this.updateChart();
  }

  componentDidUpdate() {
    this.updateChart();
  }

  componentWillUnmount() {
    if (this.chart) this.chart.destroy();
  }

}