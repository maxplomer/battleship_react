var Battleship = React.createClass({
  getInitialState: function() {
    var myState = {
    };

    return myState;
  },

  componentDidMount: function() {
    this.serverRequest = $.get('http://localhost:3001/ping', function (result) {
      this.setState({
        message: result
      });
    }.bind(this));
  },

  componentDidUpdate: function() {
  },

  render: function() {
    return (
      <div>
        Helloworld { this.state.message }
      </div>
    );
  }
});

React.render(<Battleship/>, document.body);