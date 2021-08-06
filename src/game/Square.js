import React from 'react';
import './Square.css';

// const stones = {
//   black: "●",
//   white: "○",
// };

function Square (props) {
  // given value, change class name for dynamic highlighting
  // let square_class;

  // switch (props.value) {
  //   case stones.black:
  //     square_class = "square-black";
  //     break;
  //   case stones.white:
  //     square_class = "square-white";
  //     break;
  //   default:
  //     square_class = "square-empty";
  //     break;
  // }


  return (
    <button
      className={'square'}
      onClick={props.onClick}>
      {props.value}
    </button>
  );
}

export default Square;
