import React from 'react';
import { Segment, Input, Icon, Button } from 'semantic-ui-react';

class TimerClock extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            timerRunning: false
        };

        this.timerStart = this.timerStart.bind(this);
        this.timerStop = this.timerStop.bind(this);
        this.renderTimerButton = this.renderTimerButton.bind(this);
    }

    timerStart() {
        console.log('timerStart');
        this.setState({
            timerRunning: true
        });
    }

    timerStop() {
        console.log('timerStop');
        this.setState({
            timerRunning: false
        });
    }

    renderTimerButton() {
        let { timerRunning } = this.state;
        if (!timerRunning) {
            return (
                <Button icon onClick={this.timerStart} >
                    <Icon name='play' />
                </Button >
            );
        }
        else {
            return (
                <Button icon onClick={this.timerStop} >
                    <Icon name='stop' />
                </Button >
            );
        }
    }
    render() {
        return (
            <Segment>
                <Input placeholder='What are you working on?' />
                {this.renderTimerButton()}
            </Segment>
        );
    }
}

TimerClock.defaultProps = {
    startTime: 0
};

export default TimerClock;