const crypto = require('crypto');


const stones = {
  black: "●",
  white: "○",
};

// Class to Handle All Game Logic, Called By Board
class Logic {


  hash_board(squares) {
    return crypto.createHash('sha1').update(squares.toString()).digest('hex');
  }

  random_turn(squares, stone) {
    let empty_positions = squares.reduce(
      (a, e, i) => (e === null) ? a.concat(i) : a, []
    );

    const rand_pos = empty_positions[Math.floor(Math.random() * empty_positions.length)];

    return [this.place(squares, rand_pos, stone), rand_pos];
  }


  place(squares, i, stone) {
    // place stone
    squares[i] = stone;

    // evaluate other stones
    squares = this.evaluate(squares, i);

    return squares;
  }


  evaluate(squares, i) {
    for (const n_i of this.get_adjacent(i).concat([i])) {
      const chain_data = this.get_chain(squares, n_i);
      if (!chain_data.has_liberty) {
        // delete
        for (const c_i of chain_data.chain) {
          squares[c_i] = null;
        }
      }
    }
    return squares;
  }


  get_chain(squares, i) {
    const stone = squares[i];

    if (stone === null) {
      return {has_liberty:true, chain: new Set()};
    }

    let chain_data = {has_liberty:false, chain: new Set([i])};

    let stack = [i];
    let visited = new Set(); //add(el) & has('el')

    while (stack.length > 0) {

      const node = stack.pop();

      if (!visited.has(node)) {
        visited.add(node);

        for (const adj_pos of this.get_adjacent(node)){
          if (squares[adj_pos] === null) {
            chain_data.has_liberty = true;
          } else if (squares[adj_pos] === stone) {
            stack.push(adj_pos);
            chain_data.chain.add(adj_pos);
          }
        }
      }
    }
    return chain_data;
  }


  get_adjacent(i) {
    const [x, y] = this.index_to_coord(i);
    let neighbors = [];

    if (x > 0) {
      neighbors.push(this.coord_to_index(x - 1, y));
    }
    if (x < 18) {
      neighbors.push(this.coord_to_index(x + 1, y));
    }
    if (y > 0) {
      neighbors.push(this.coord_to_index(x, y - 1));
    }
    if (y < 18) {
      neighbors.push(this.coord_to_index(x, y + 1));
    }

    return neighbors;
  }

  index_to_coord(i) {
    return [Math.floor(i / 19), i % 19];
  }

  coord_to_index(x, y){
    return x * 19 + y;
  }



  score(squares) {
    let empty_positions = squares.reduce(
      (a, e, i) => (e === null) ? a.concat(i) : a, []
    );

    let accounted_for = new Set();
    let belonging = {
      black: new Set(), white: new Set(), disputed: new Set(), neutral: new Set()
    };

    for (const empty of empty_positions) {
      if (!accounted_for.has(empty)) {
        const data = this.get_area(squares, empty);
        accounted_for = union(accounted_for, data.chain);  //UNION
        if (data.neighbors.length === 2) {
          belonging.disputed = union(belonging.disputed, data.chain);
        } else if (data.neighbors.length === 1) {
          belonging[data.neighbors[0]] = union(belonging[data.neighbors[0]], data.chain)
        } else {
          belonging.neutral = union(belonging.neutral, data.chain)
        }
      }
    }

    for (const color of ['black', 'white']) {
      const pieces = squares.reduce(
        (a, e, i) => (e === stones[color]) ? a.concat(i) : a, []
      );
      belonging[color] = union(belonging[color], pieces);
    }

    // we can actually color
    return {
      black: belonging.black.size,
      white: belonging.white.size,
      disputed: belonging.disputed.size,
      neutral: belonging.neutral.size,
    }
  }


  get_area(squares, i) {
    const stone = squares[i];
    let chain = new Set([i]);
    let stack = [i];
    let visited = new Set(); //add(el) & has('el')
    let disputed = new Set();

    while (stack.length > 0) {
      const node = stack.pop();
      if (!visited.has(node)) {
        visited.add(node);
        for (const adj_pos of this.get_adjacent(node)) {
          if (squares[adj_pos] !== null) {
            const st = (squares[adj_pos] === stones.black) ? 'black' : 'white';
            disputed.add(st);
          } else if (squares[adj_pos] === stone)  {
            stack.push(adj_pos);
            chain.add(adj_pos)
          }
        }
      }
    }
    return {neighbors: [...disputed], chain: chain}
  }

}

// aux union function
function union(setA, setB) {
    let _union = new Set(setA)
    for (let elem of setB) {
        _union.add(elem)
    }
    return _union
}




export default Logic;
