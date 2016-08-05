var Battleship = React.createClass({
  getInitialState: function() { 
    var myState;
    var storedData = sessionStorage.getItem( 'data' );

    if (storedData == null) {
      myState = {
        loggedIn: false,
        showLeaderboard: false,
        playingAGame: false,
        placingMyPieces: false
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
        playingAGame: true,
        placingMyPieces: true,
        numberOfPiecesLeft: 10
      });
    }.bind(this));
  },

  destroyCurrentGame: function() {
    $.ajax({
      url: getApiEndpoint() + 'games/' + this.state.gameID + '?token=' + this.state.token,
      type: 'DELETE',
      success: function (result) {
        this.setState({
          playingAGame: false
        });
      }.bind(this)
    });
  },

  handleTileOnClick: function(event) {
    var index = $(event.target).attr('value');
    console.log(index);
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

    var pieces = [];
    for (var i=0; i<25; i++) {
      pieces.push(<div value={i} onClick={this.handleTileOnClick} style={{borderBottom: '1px solid blue', borderLeft: '1px solid blue', width: '100px', height: '72px', float: 'left', textAlign: 'center', paddingTop: "28px"}}>
        <span style={{fontSize: "40px"}}>🚢</span>
      </div>);
    }

    return (
      <div>
        <button onClick={this.showLeaderboard}>Show leaderboard</button>
        <button onClick={this.destroyCurrentGame}>Destroy current game</button>
        <br/><br/>
        { this.state.placingMyPieces ? 'Click tile to place your pieces' : null }
        <br/>
        { this.state.placingMyPieces ? '(' + this.state.numberOfPiecesLeft + ' left)' : null }
        <br/><br/>
        <div style={{ borderTop: '1px solid blue', borderRight: '1px solid blue', width: '505px', height: '505px' }}>
          { pieces }
        </div>
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