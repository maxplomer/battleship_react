var Battleship = React.createClass({
  getInitialState: function() {
    var myState = {
    };

    return myState;
  },

  componentDidMount: function() {
    $.get(getApiEndpoint() + 'ping', function (result) {
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


var getApiEndpoint = function() {
  // OPTION 1 : Uncomment for running locally
  // return 'http://localhost:3001/';

  // Option 2: Uncomment for running in production
  return 'https://battleship-maxplomer.herokuapp.com/';
}


React.render(<Battleship/>, document.body);