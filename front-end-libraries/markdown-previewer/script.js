const defaultMarkdown = `# Welcome to my React Markdown Previewer!

## This is a sub-heading...
### And here's some other cool stuff:

Heres some code, \`<div></div>\`, between 2 backticks.

\`\`\`
// this is multi-line code:

function anotherExample(firstLine, lastLine) {
  if (firstLine == '\`\`\`' && lastLine == '\`\`\`') {
    return multiLineCode;
  }
}
\`\`\`

You can also make text **bold**... whoa!
Or _italic_.
Or... wait for it... **_both!_**
And feel free to go crazy ~~crossing stuff out~~.

There's also [links](https://www.freecodecamp.org), and
> Block Quotes!

And if you want to get really crazy, even tables:

Wild Header | Crazy Header | Another Header?
------------ | ------------- | -------------
Your content can | be here, and it | can be here....
And here. | Okay. | I think we get it.

- And of course there are lists.
  - Some are bulleted.
     - With different indentation levels.
        - That look like this.


1. And there are numbered lists too.
1. Use just 1s if you want!
1. And last but not least, let's not forget embedded images:

![freeCodeCamp Logo](https://cdn.freecodecamp.org/testable-projects-fcc/images/fcc_secondary.svg)
`;

class MarkdownPreviewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      markdown: defaultMarkdown
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({
      markdown: event.target.value
    });
  }

  render() {
    const { markdown } = this.state;

    // Configure marked options for security
    marked.setOptions({
      breaks: true,
      gfm: true
    });

    // Render markdown to HTML
    const renderedHTML = marked(markdown);

    return (
      <div className="app-container">
        <div className="panel">
          <div className="panel-header">
            <i className="fas fa-edit"></i>
            Editor
          </div>
          <div className="panel-content">
            <textarea
              id="editor"
              value={markdown}
              onChange={this.handleChange}
              placeholder="Enter your markdown here..."
            />
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <i className="fas fa-eye"></i>
            Preview
          </div>
          <div className="panel-content">
            <div
              id="preview"
              className="preview"
              dangerouslySetInnerHTML={{ __html: renderedHTML }}
            />
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<MarkdownPreviewer />, document.getElementById('root'));
