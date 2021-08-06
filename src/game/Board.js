import React from 'react';
import Square from './Square';
import './Board.css';
import Logic from './Logic';

const stones = {
  black: "●",
  white: "○",
};



// Renders Board Items
class Board extends React.Component {
  constructor(props) {
    super(props);

    this.logic = new Logic();

    const empty_board = Array(361).fill(null);

    this.state = {
      squares: empty_board,
      blackIsNext: true,
      score: this.logic.score(empty_board),
      hash_codes: [this.logic.hash_board(empty_board)],
      current_hash: this.logic.hash_board(empty_board),
      passes: 0,
      autoplay: false,
      game_over: false
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handlePass = this.handlePass.bind(this);
    this.handleRandom = this.handleRandom.bind(this);
    this.handleAutoplay = this.handleAutoplay.bind(this);
    this.isIllegalMove = this.isIllegalMove.bind(this);
    this.determineWinner = this.determineWinner.bind(this);
  }

  handleAutoplay(event) {
    if (this.state.game_over) {
      return;
    }

    this.setState({
      autoplay: event.target.checked
    });

    if (event.target.checked) {
      let autoplay_timer = setInterval(
        () => {
          if (!this.state.autoplay) {
            clearInterval(autoplay_timer);
          } else {
            this.handleRandom(null);
          }
        }, 100 // adjust timer to personal pref, or have slider?
      );
    }
  }


  handleReset() {
    const empty_board = Array(361).fill(null);

    this.setState((state) => ({
      squares: empty_board,
      blackIsNext: true,
      score: this.logic.score(empty_board),
      hash_codes: [this.logic.hash_board(empty_board)],
      current_hash: this.logic.hash_board(empty_board),
      passes: 0,
      autoplay: false,
      game_over: false
    }));
  }

  determineWinner() {
    let winner = `Game Over!!! ${stones.black} has won the game!!!`; // default
    if (this.state.score.black < this.state.score.white) {
      winner = `Game Over!!! ${stones.white} has won the game!!!`;
    } else if (this.state.score.black === this.state.score.white) {
      winner = `Game Over? Seems to be a tie...`
    }
    return winner;
  }

  handlePass(event, autoplay=false) {
    if (this.state.game_over) {
      this.setState({autoplay:false});
      return; //easy way to avoid new moves
    }

    let game_over = false;
    if (this.state.passes + 1 === 2) {
      alert(this.determineWinner());
      game_over = true;
    } else if (this.state.passes + 1 > 2){
      game_over = true;
    }

    this.setState((state) => ({
      blackIsNext: !state.blackIsNext,
      passes: state.passes + 1,
      autoplay: ((!state.game_over || game_over) ? autoplay : false),
      game_over: (state.game_over ? true : game_over)
    }));
    // maybe recompute hash, and the end game condition is if hash appears 2 before.
  }

  // refactor?
  isIllegalMove(hash_code, squares_pos, show_alert=true) {
    // return false; // uncomment if you want to void these rules
    let is_illegal = false;
    if (hash_code === this.state.hash_codes[this.state.hash_codes.length-2]){
      if (show_alert) {
        this.setState({autoplay: false});
        alert('Warning! Ko: Cannot return to previous position!');
      }
      is_illegal = true;
    } else if (squares_pos === null) {
      if (show_alert) {
        this.setState({autoplay: false});
        alert('Warning! Suicide: Cannot commit suicide!');
      }
      is_illegal = true;
    } else if (this.state.game_over) {
      this.setState({autoplay: false});
      is_illegal = true; //easy way to avoid new moves
    }
    return is_illegal;
  }

  handleRandom(event) {
    if (this.state.game_over) {
      this.setState({autoplay:false});
      return; //easy way to avoid new moves
    }

    // take random turn, in fact, call handleClick on random empty index.
    const stone = this.state.blackIsNext ? stones.black : stones.white;

    let [squares, rand_pos] = this.logic.random_turn(this.state.squares.slice(), stone);
    let hash_code = this.logic.hash_board(squares);

    // Question: Should we do while loop until valid? To avoid illegal moves?
    // Break on count, then just pass
    // if (this.isIllegalMove(hash_code, squares[rand_pos])) {
    //   return;
    // }

    let tries = 5; // tech gives us 6 tries
    while (this.isIllegalMove(hash_code, squares[rand_pos], false) && tries > 0) {
      [squares, rand_pos] = this.logic.random_turn(this.state.squares.slice(), stone);
      hash_code = this.logic.hash_board(squares);
      tries = tries - 1;
    }

    if (this.isIllegalMove(hash_code, squares[rand_pos], false)) {
      this.handlePass(null, true);
      return;
    }

    const score = this.logic.score(squares);

    this.setState((state) => ({
      squares: squares,
      blackIsNext: !state.blackIsNext,
      score: score,
      current_hash: hash_code,
      hash_codes: state.hash_codes.concat([hash_code]),
      passes: 0,
      autoplay: (event === null)
    }));

  }


  handleClick(i) {
    let squares = this.state.squares.slice();
    if (squares[i] || this.state.game_over) {
      this.setState({autoplay:false});
      return;
    }

    // UPDATE with game logic!!!!
    // squares[i] = this.state.blackIsNext ? stones.Black : stones.White;
    const stone = this.state.blackIsNext ? stones.black : stones.white;
    squares = this.logic.place(squares, i, stone);
    const score = this.logic.score(squares);
    const hash_code = this.logic.hash_board(squares);

    if (this.isIllegalMove(hash_code, squares[i])) {
      return;
    }

    this.setState((state) => ({
      squares: squares,
      blackIsNext: !state.blackIsNext,
      score: score,
      current_hash: hash_code,
      hash_codes: state.hash_codes.concat([hash_code]),
      passes: 0,
      autoplay: false
    }));

  }

  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.state.squares[i]}
        onClick={() => this.handleClick(i)} //pre-pop with index
      />
    );
  }


  render() {
    let status = 'Current player: ' + (this.state.blackIsNext ? stones.black : stones.white);
    if (this.state.game_over) {
      status = this.determineWinner();
    }
    const score_status = `Score: ${stones.black}: ${this.state.score.black}, ${stones.white}: ${this.state.score.white}, Contested: ${this.state.score.disputed}`;
    const squares = this.state.squares.map((object, i) => this.renderSquare(i));

    const board_rows = Array(19).fill(null).map(
      (elem, i) => (
        <div className="board-row" key={i}>
          {squares.slice(i * 19, i * 19 + 19)}
        </div>
      )
    );

    return (
      <div>
        <div className="status">{status}</div>
        {board_rows}
        <div className="status">{score_status}</div>
        <div className="status">
          <button className="status-button" onClick={this.handleReset}>Reset</button>
          <button className="status-button" onClick={this.handlePass}>Pass</button>
          <button className="status-button" onClick={this.handleRandom}>Random</button>
        </div>
        <div className="status">
          Autoplay
          <label className="switch">
            <input type="checkbox" checked={this.state.autoplay} onChange={this.handleAutoplay}/>
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    );

    // Add AutoPlay Button!!!!!!!!
  }


}


export default Board;
