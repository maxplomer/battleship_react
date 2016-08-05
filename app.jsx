var Battleship = React.createClass({
  getInitialState: function() { 
    var myState;
    var storedData = sessionStorage.getItem( 'data' );

    if (storedData == null) {
      myState = {
        loggedIn: false,
        showLeaderboard: false,
        playingAGame: false
      };
    } else  {
      myState = JSON.parse(storedData);
    }

    return myState;
  },

  login: function() {
    console.log('login');
    var domain = 'maxplomer.auth0.com';
    var clientID = '0EauSF7D5vmXS5L6IR9X06LVrpAnYlpm';

    var lock = new Auth0Lock(clientID, domain);
    lock.show({
      focusInput: false,
      popup: true,
    }, function (err, profile, token) {
      if (err === null) {
        console.log(token);
        console.log(profile["email"]);
        console.log(profile["user_id"]);
        this.setState({
          loggedIn: true,
          token: token,
          email: profile["email"],
          user_id: profile["user_id"]
        });

        $.post(getApiEndpoint() + 'users?token=' + token, function (result) {
          console.log(result);
        });
      }
    }.bind(this));
  },

  showLeaderboard: function() {
    this.setState({showLeaderboard: true});
  },

  hideLeaderboard: function() {
    this.setState({showLeaderboard: false});
  },

  startANewGame: function() {
    $.post(getApiEndpoint() + 'games?token=' + this.state.token, function (result) {
      this.setState({
        gameID: result.id,
        playingAGame: true
      });
    }.bind(this));
  },

  destroyCurrentGame: function() {
    $.delete(getApiEndpoint() + 'games/' + this.state.gameID + '?token=' + this.state.token, function (result) {
      this.setState({
        playingAGame: false
      });
    }.bind(this));
  },

  componentDidUpdate: function() {
    sessionStorage.setItem( 'data', JSON.stringify(this.state) );
  },

  render: function() {
    if (this.state.showLeaderboard) {
      return (
        <div>
          <button onClick={this.hideLeaderboard}>Hide leaderboard</button>
          <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
            <li>4</li>
          </ul>
        </div>
      );
    }

    if (!this.state.loggedIn) {
      return (
        <div>
          <button onClick={this.login}>Login</button>
        </div>
      );
    }

    if (!this.state.playingAGame) {
      return (
        <div>
          <button onClick={this.startANewGame}>Start a new game</button>
        </div>
      );
    }

    return (
      <div>
        Helloworld { this.state.message } <br/>
        <button onClick={this.showLeaderboard}>Show leaderboard</button>
        <button onClick={this.destroyCurrentGame}>Destroy current game</button>
      </div>
    );
  }
});


var getApiEndpoint = function() {
  // OPTION 1 : Uncomment for running locally
  return 'http://localhost:3001/';

  // Option 2: Uncomment for running in production
  //return 'https://battleship-maxplomer.herokuapp.com/';
}


React.render(<Battleship/>, document.body);