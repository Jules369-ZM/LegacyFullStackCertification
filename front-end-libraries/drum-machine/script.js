const drumPads = [
  {
    keyCode: 81,
    keyTrigger: 'Q',
    id: 'Heater-1',
    url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3'
  },
  {
    keyCode: 87,
    keyTrigger: 'W',
    id: 'Heater-2',
    url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-2.mp3'
  },
  {
    keyCode: 69,
    keyTrigger: 'E',
    id: 'Heater-3',
    url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-3.mp3'
  },
  {
    keyCode: 65,
    keyTrigger: 'A',
    id: 'Heater-4',
    url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-4.mp3'
  },
  {
    keyCode: 83,
    keyTrigger: 'S',
    id: 'Clap',
    url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-6.mp3'
  },
  {
    keyCode: 68,
    keyTrigger: 'D',
    id: 'Open-HH',
    url: 'https://s3.amazonaws.com/freecodecamp/drums/Dsc_Oh.mp3'
  },
  {
    keyCode: 90,
    keyTrigger: 'Z',
    id: "Kick-n'-Hat",
    url: 'https://s3.amazonaws.com/freecodecamp/drums/Kick_n_Hat.mp3'
  },
  {
    keyCode: 88,
    keyTrigger: 'X',
    id: 'Kick',
    url: 'https://s3.amazonaws.com/freecodecamp/drums/RP4_KICK_1.mp3'
  },
  {
    keyCode: 67,
    keyTrigger: 'C',
    id: 'Closed-HH',
    url: 'https://s3.amazonaws.com/freecodecamp/drums/Cev_H2.mp3'
  }
];

class DrumMachine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      display: 'Welcome to Drum Machine',
      power: true,
      volume: 0.5
    };
    this.playSound = this.playSound.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.togglePower = this.togglePower.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }

  playSound(keyTrigger, soundId) {
    if (!this.state.power) return;

    const audio = document.getElementById(keyTrigger);
    audio.currentTime = 0;
    audio.volume = this.state.volume;
    audio.play();

    // Update display
    this.setState({
      display: soundId
    });

    // Add visual feedback
    if (soundId) {
      const padId = soundId.replace(/\s+/g, '-').replace(/'/g, '');
      const pad = document.getElementById(padId);
      if (pad) {
        pad.classList.add('active');
        setTimeout(() => pad.classList.remove('active'), 100);
      }
    }
  }

  handleKeyPress(event) {
    const keyPressed = event.key.toUpperCase();
    const drumPad = drumPads.find(pad => pad.keyTrigger === keyPressed);

    if (drumPad) {
      this.playSound(drumPad.keyTrigger, drumPad.id);
    }
  }

  togglePower() {
    this.setState({
      power: !this.state.power,
      display: this.state.power ? 'Power Off' : 'Power On'
    });
  }

  handleVolumeChange(event) {
    const volume = event.target.value;
    this.setState({
      volume: volume,
      display: `Volume: ${Math.round(volume * 100)}`
    });

    // Clear display after 1 second
    setTimeout(() => {
      this.setState({ display: 'Welcome to Drum Machine' });
    }, 1000);
  }

  render() {
    return (
      <div className="drum-machine" id="drum-machine">
        <div className="machine-header">
          <h1>Drum Machine</h1>
        </div>

        <div className="display" id="display">
          <div className="display-text">{this.state.display}</div>
        </div>

        <div className="drum-pads">
          {drumPads.map(pad => (
            <button
              key={pad.keyTrigger}
              className="drum-pad"
              id={pad.id.replace(/\s+/g, '-').replace(/'/g, '')}
              onClick={() => this.playSound(pad.keyTrigger, pad.id)}
            >
              {pad.keyTrigger}
              <audio
                className="clip"
                id={pad.keyTrigger}
                src={pad.url}
              ></audio>
            </button>
          ))}
        </div>

        <div className="controls">
          <div className="power-switch">
            <div
              className={`switch ${this.state.power ? 'active' : ''}`}
              onClick={this.togglePower}
            >
              <div className="switch-slider"></div>
            </div>
            <div className="switch-label">Power</div>
          </div>

          <div className="volume-control">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={this.state.volume}
              onChange={this.handleVolumeChange}
              className="volume-slider"
              id="volume-slider"
            />
            <div className="volume-label">Volume</div>
          </div>
        </div>

        <div className="instructions">
          Click the pads or press Q, W, E, A, S, D, Z, X, C to play sounds
        </div>
      </div>
    );
  }
}

ReactDOM.render(<DrumMachine />, document.getElementById('root'));
