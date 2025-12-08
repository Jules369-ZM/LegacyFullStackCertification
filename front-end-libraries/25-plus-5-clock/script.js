class PomodoroClock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      breakLength: 5,
      sessionLength: 25,
      timeLeft: 25 * 60,
      timerLabel: 'Session',
      isRunning: false,
      intervalId: null
    };
    this.handleStartStop = this.handleStartStop.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleIncrement = this.handleIncrement.bind(this);
    this.handleDecrement = this.handleDecrement.bind(this);
    this.tick = this.tick.bind(this);
  }

  handleIncrement(type) {
    if (this.state.isRunning) return;

    if (type === 'break') {
      if (this.state.breakLength < 60) {
        this.setState({
          breakLength: this.state.breakLength + 1
        });
      }
    } else if (type === 'session') {
      if (this.state.sessionLength < 60) {
        this.setState({
          sessionLength: this.state.sessionLength + 1,
          timeLeft: (this.state.sessionLength + 1) * 60
        });
      }
    }
  }

  handleDecrement(type) {
    if (this.state.isRunning) return;

    if (type === 'break') {
      if (this.state.breakLength > 1) {
        this.setState({
          breakLength: this.state.breakLength - 1
        });
      }
    } else if (type === 'session') {
      if (this.state.sessionLength > 1) {
        this.setState({
          sessionLength: this.state.sessionLength - 1,
          timeLeft: (this.state.sessionLength - 1) * 60
        });
      }
    }
  }

  handleStartStop() {
    if (this.state.isRunning) {
      clearInterval(this.state.intervalId);
      this.setState({
        isRunning: false,
        intervalId: null
      });
    } else {
      const intervalId = setInterval(this.tick, 1000);
      this.setState({
        isRunning: true,
        intervalId: intervalId
      });
    }
  }

  handleReset() {
    clearInterval(this.state.intervalId);
    const beep = document.getElementById('beep');
    beep.pause();
    beep.currentTime = 0;

    this.setState({
      breakLength: 5,
      sessionLength: 25,
      timeLeft: 25 * 60,
      timerLabel: 'Session',
      isRunning: false,
      intervalId: null
    });
  }

  tick() {
    const { timeLeft, timerLabel, breakLength, sessionLength } = this.state;

    if (timeLeft === 0) {
      // Play beep sound
      const beep = document.getElementById('beep');
      beep.currentTime = 0;
      beep.play();

      // Switch between session and break
      if (timerLabel === 'Session') {
        this.setState({
          timerLabel: 'Break',
          timeLeft: breakLength * 60
        });
      } else {
        this.setState({
          timerLabel: 'Session',
          timeLeft: sessionLength * 60
        });
      }
    } else {
      this.setState({
        timeLeft: timeLeft - 1
      });
    }
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  render() {
    const {
      breakLength,
      sessionLength,
      timeLeft,
      timerLabel,
      isRunning
    } = this.state;

    return (
      <div className="pomodoro-clock" id="pomodoro-clock">
        <div className="clock-header">
          <h1>25 + 5 Clock</h1>
        </div>

        <div className="settings">
          <div className="setting-group" id="break-label">
            <div className="setting-label">Break Length</div>
            <div className="length-control">
              <button
                className="btn-small"
                id="break-decrement"
                onClick={() => this.handleDecrement('break')}
              >
                -
              </button>
              <div className="length-display" id="break-length">
                {breakLength}
              </div>
              <button
                className="btn-small"
                id="break-increment"
                onClick={() => this.handleIncrement('break')}
              >
                +
              </button>
            </div>
          </div>

          <div className="setting-group" id="session-label">
            <div className="setting-label">Session Length</div>
            <div className="length-control">
              <button
                className="btn-small"
                id="session-decrement"
                onClick={() => this.handleDecrement('session')}
              >
                -
              </button>
              <div className="length-display" id="session-length">
                {sessionLength}
              </div>
              <button
                className="btn-small"
                id="session-increment"
                onClick={() => this.handleIncrement('session')}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="timer">
          <div className="timer-label" id="timer-label">
            {timerLabel}
          </div>
          <div className="time-left" id="time-left">
            {this.formatTime(timeLeft)}
          </div>
        </div>

        <div className="controls">
          <button
            className="btn btn-primary"
            id="start_stop"
            onClick={this.handleStartStop}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            className="btn btn-secondary"
            id="reset"
            onClick={this.handleReset}
          >
            Reset
          </button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<PomodoroClock />, document.getElementById('root'));
