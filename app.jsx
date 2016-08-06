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
    var domain = 'maxplomer.auth0.com';
    var clientID = '0EauSF7D5vmXS5L6IR9X06LVrpAnYlpm';

    var lock = new Auth0Lock(clientID, domain);
    lock.show({
      focusInput: false,
      popup: true,
    }, function (err, profile, token) {
      if (err === null) {
        this.setState({
          loggedIn: true,
          token: token
        });

        $.post(getApiEndpoint() + 'users?token=' + token, {email: profile["email"]});
      }
    }.bind(this));
  },

  showLeaderboard: function() {
    $.get(getApiEndpoint() + 'users', function (result) {
      console.log(result);
      this.setState({
        leaderboard: result,
        showLeaderboard: true
      });
    }.bind(this));
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
        numberOfPiecesLeft: 10,
        computerTiles: result.tiles.slice(0,25),
        myTiles: result.tiles.slice(25,50),
        finished: false
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
    if (this.state.placingMyPieces) {
      var index = $(event.target).attr('value');

      $.ajax({
        url: getApiEndpoint() + 'games/' + this.state.gameID + '/place_ship?token=' + this.state.token,
        type: 'PATCH',
        data: { index: index },
        success: function (result) {
          var numberOfPiecesLeft = this.state.numberOfPiecesLeft - 1;
          var placingMyPieces = (numberOfPiecesLeft > 0);

          this.setState({
            myTiles: result.tiles.slice(25,50),
            numberOfPiecesLeft: numberOfPiecesLeft,
            placingMyPieces: placingMyPieces
          });
        }.bind(this)
      });
    }
  },

  handleComputerTileOnClick: function(event) {
    if (!this.state.finished) {
      var index = $(event.target).attr('value');

      $.ajax({
        url: getApiEndpoint() + 'games/' + this.state.gameID + '/bomb_computer?token=' + this.state.token,
        type: 'PATCH',
        data: { index: index },
        success: function (result) {
          this.setState({
            computerTiles: result.tiles.slice(0,25),
            myTiles: result.tiles.slice(25,50),
            finished: result.finished,
            player_won: result.player_won
          });
        }.bind(this)
      });
    }
  },

  componentDidUpdate: function() {
    sessionStorage.setItem( 'data', JSON.stringify(this.state) );
  },

  render: function() {
    if (this.state.showLeaderboard) {
      var users = []
      for (var i=0; i<this.state.leaderboard.length; i++) {
        users.push(<li>{ this.state.leaderboard[i].email }  ({ this.state.leaderboard[i].time_took_to_win } sec)</li>);
      }
      return (
        <div>
          <button onClick={this.hideLeaderboard}>Hide leaderboard</button>
          <ul>
            { users }
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
          <button onClick={this.showLeaderboard}>Show leaderboard</button> &nbsp;&nbsp;&nbsp;
          <button onClick={this.startANewGame}>Start a new game</button>
        </div>
      );
    }

    var pieces = [];
    for (var i=0; i<25; i++) {
      if (!this.state.myTiles[i].visited) {
        if (this.state.myTiles[i].ship) {
          pieces.push(<div className="player-tile-ship">
            <span style={{fontSize: "40px"}}>🚢</span>
          </div>);
        } else {
          pieces.push(<div value={i} onClick={this.handleTileOnClick} className="player-tile"></div>);
        }
      } else {
        if (this.state.myTiles[i].ship) {
          pieces.push(<div className="player-tile-ship" style={{backgroundColor: 'red'}}>
            <span style={{fontSize: "40px"}}>🚢</span>
          </div>);
        } else {
          pieces.push(<div value={i} className="player-tile" style={{backgroundColor: 'grey'}}></div>);
        }
      }
    }

    if (!this.state.placingMyPieces) {
      var computerPieces = [];
      for (var i=0; i<25; i++) {
        if (!this.state.computerTiles[i].visited) {
          computerPieces.push(<div value={i} onClick={this.handleComputerTileOnClick} className="computer-tile"></div>);
        } else {
          if (this.state.computerTiles[i].ship) {
            computerPieces.push(<div className="computer-tile-ship">
              <span style={{fontSize: "30px"}}>🚢</span>
            </div>);
          } else {
            computerPieces.push(<div className="computer-tile" style={{backgroundColor: 'grey'}}></div>);
          }
        }
      }
    }

    return (
      <div>
        <button onClick={this.showLeaderboard}>Show leaderboard</button> &nbsp;&nbsp;&nbsp;
        <button onClick={this.destroyCurrentGame}>Destroy current game</button> &nbsp;&nbsp;&nbsp;
        
        { this.state.finished ? (<button onClick={this.startANewGame} style={{marginRight: '20px'}}>Start a new game</button>) : null }

        { this.state.finished && this.state.player_won ? 'The game is finished and you won!' : null }
        { this.state.finished && !this.state.player_won ? 'The game is finished and you lost!' : null }

        <br/><br/>
        
        { this.state.placingMyPieces ? 'Click tile to place your pieces' : 'Computer\'s board (Click tile to bomb)' }
        <br/>
        
        { this.state.placingMyPieces ? null : (
          <div className="computer-tiles-holder">
            { computerPieces }
          </div>
        )}

        { this.state.placingMyPieces ? '(' + this.state.numberOfPiecesLeft + ' left)' : null }
        <br/>
        
        { this.state.placingMyPieces ? null : 'My board' }
        <br/>        
        
        <div className="player-tiles-holder">
          { pieces }
        </div>
      </div>
    );
  }
});


var getApiEndpoint = function() {
  // OPTION 1 : Uncomment for running locally
  //return 'http://localhost:3001/';

  // Option 2: Uncomment for running in production
  return 'https://battleship-maxplomer.herokuapp.com/';
}


React.render(<Battleship/>, document.body);