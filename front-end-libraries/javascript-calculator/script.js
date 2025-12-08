class Calculator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentValue: '0',
      formula: '',
      previousValue: '0',
      operation: null,
      waitingForOperand: false
    };
    this.handleNumber = this.handleNumber.bind(this);
    this.handleOperator = this.handleOperator.bind(this);
    this.handleEquals = this.handleEquals.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.handleDecimal = this.handleDecimal.bind(this);
  }

  handleNumber(num) {
    const { currentValue, waitingForOperand } = this.state;

    if (waitingForOperand) {
      this.setState({
        currentValue: String(num),
        waitingForOperand: false
      });
    } else {
      this.setState({
        currentValue: currentValue === '0' ? String(num) : currentValue + num
      });
    }
  }

  handleOperator(nextOperator) {
    const { currentValue, formula, operation } = this.state;
    const inputValue = parseFloat(currentValue);

    if (operation && waitingForOperand) {
      this.setState({
        operation: nextOperator
      });
      return;
    }

    if (formula === '' || operation === null) {
      this.setState({
        formula: currentValue + nextOperator,
        operation: nextOperator,
        waitingForOperand: true
      });
    } else {
      const currentValueNum = parseFloat(currentValue);
      const previousValueNum = parseFloat(formula.slice(0, -1));
      const computedValue = this.calculate(previousValueNum, currentValueNum, operation);

      this.setState({
        currentValue: String(computedValue),
        formula: computedValue + nextOperator,
        operation: nextOperator,
        waitingForOperand: true
      });
    }
  }

  calculate(firstValue, secondValue, operation) {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  }

  handleEquals() {
    const { currentValue, formula, operation } = this.state;
    const currentValueNum = parseFloat(currentValue);

    if (operation && formula) {
      const previousValueNum = parseFloat(formula.slice(0, -1));
      const computedValue = this.calculate(previousValueNum, currentValueNum, operation);

      this.setState({
        currentValue: String(computedValue),
        formula: '',
        operation: null,
        waitingForOperand: true
      });
    }
  }

  handleClear() {
    this.setState({
      currentValue: '0',
      formula: '',
      previousValue: '0',
      operation: null,
      waitingForOperand: false
    });
  }

  handleDecimal() {
    const { currentValue, waitingForOperand } = this.state;

    if (waitingForOperand) {
      this.setState({
        currentValue: '0.',
        waitingForOperand: false
      });
    } else if (currentValue.indexOf('.') === -1) {
      this.setState({
        currentValue: currentValue + '.'
      });
    }
  }

  render() {
    const { currentValue, formula } = this.state;

    return (
      <div className="calculator" id="calculator">
        <div className="calculator-header">
          <h1>JavaScript Calculator</h1>
        </div>

        <div className="display" id="display">
          <div className="formula" id="formula-display">{formula}</div>
          <div className="display-text">{currentValue}</div>
        </div>

        <div className="button-grid">
          <button
            className="btn btn-clear"
            id="clear"
            onClick={this.handleClear}
          >
            AC
          </button>
          <button
            className="btn btn-operator"
            id="divide"
            onClick={() => this.handleOperator('÷')}
          >
            ÷
          </button>
          <button
            className="btn btn-operator"
            id="multiply"
            onClick={() => this.handleOperator('×')}
          >
            ×
          </button>

          <button
            className="btn btn-number"
            id="seven"
            onClick={() => this.handleNumber(7)}
          >
            7
          </button>
          <button
            className="btn btn-number"
            id="eight"
            onClick={() => this.handleNumber(8)}
          >
            8
          </button>
          <button
            className="btn btn-number"
            id="nine"
            onClick={() => this.handleNumber(9)}
          >
            9
          </button>
          <button
            className="btn btn-operator"
            id="subtract"
            onClick={() => this.handleOperator('-')}
          >
            -
          </button>

          <button
            className="btn btn-number"
            id="four"
            onClick={() => this.handleNumber(4)}
          >
            4
          </button>
          <button
            className="btn btn-number"
            id="five"
            onClick={() => this.handleNumber(5)}
          >
            5
          </button>
          <button
            className="btn btn-number"
            id="six"
            onClick={() => this.handleNumber(6)}
          >
            6
          </button>
          <button
            className="btn btn-operator"
            id="add"
            onClick={() => this.handleOperator('+')}
          >
            +
          </button>

          <button
            className="btn btn-number"
            id="one"
            onClick={() => this.handleNumber(1)}
          >
            1
          </button>
          <button
            className="btn btn-number"
            id="two"
            onClick={() => this.handleNumber(2)}
          >
            2
          </button>
          <button
            className="btn btn-number"
            id="three"
            onClick={() => this.handleNumber(3)}
          >
            3
          </button>
          <button
            className="btn btn-equals"
            id="equals"
            onClick={this.handleEquals}
          >
            =
          </button>

          <button
            className="btn btn-number btn-zero"
            id="zero"
            onClick={() => this.handleNumber(0)}
          >
            0
          </button>
          <button
            className="btn btn-number"
            id="decimal"
            onClick={this.handleDecimal}
          >
            .
          </button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Calculator />, document.getElementById('root'));
