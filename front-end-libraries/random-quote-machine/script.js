const quotes = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky"
  },
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker"
  },
  {
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon"
  },
  {
    text: "The purpose of our lives is to be happy.",
    author: "Dalai Lama"
  },
  {
    text: "Get busy living or get busy dying.",
    author: "Stephen King"
  },
  {
    text: "You only live once, but if you do it right, once is enough.",
    author: "Mae West"
  },
  {
    text: "The mind is everything. What you think you become.",
    author: "Buddha"
  },
  {
    text: "The best revenge is massive success.",
    author: "Frank Sinatra"
  },
  {
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde"
  },
  {
    text: "Two roads diverged in a wood, and I—I took the one less traveled by, And that has made all the difference.",
    author: "Robert Frost"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins"
  },
  {
    text: "In the end, it's not the years in your life that count. It's the life in your years.",
    author: "Abraham Lincoln"
  }
];

class QuoteMachine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentQuote: quotes[0],
      currentColor: '#667eea'
    };
    this.getRandomQuote = this.getRandomQuote.bind(this);
    this.tweetQuote = this.tweetQuote.bind(this);
  }

  getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    this.setState({
      currentQuote: randomQuote,
      currentColor: randomColor
    });
  }

  tweetQuote() {
    const { text, author } = this.state.currentQuote;
    const tweetText = `"${text}" - ${author}`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
  }

  render() {
    const { currentQuote, currentColor } = this.state;

    return (
      <div className="quote-container" style={{ borderColor: currentColor }}>
        <div className="quote-text" style={{ color: currentColor }}>
          {currentQuote.text}
        </div>
        <div className="quote-author" style={{ color: currentColor }}>
          - {currentQuote.author}
        </div>
        <div className="button-container">
          <button
            className="btn btn-secondary"
            onClick={this.tweetQuote}
            style={{ backgroundColor: currentColor }}
            title="Tweet this quote"
          >
            <i className="fab fa-twitter"></i>
            Tweet
          </button>
          <button
            className="btn btn-primary"
            onClick={this.getRandomQuote}
            style={{ backgroundColor: currentColor }}
          >
            <i className="fas fa-random"></i>
            New Quote
          </button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<QuoteMachine />, document.getElementById('root'));
