"use strict";

const Gameboard = ( function() {
    const rows = 3;
    const columns = 3;
    const board = [];

    for (let r = 0; r < rows; r++) {
        board[r] = [];
        for (let c = 0; c < columns; c++) {
            board[r][c] = "";
        }
    };

    const winningCombinations = [
        [0, 1, 2], // rows
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6], // columns
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8], // diagonals
        [2, 4, 6]
    ];    

    const placeMark = (row, column) => {
        let mark = "X"
        board[row][column] = mark;
        printBoard();
        GameController.inputNum();
    };

    const printBoard = () => {
        console.table(board);
        console.log(board.length)
    }; 

    return {
        printBoard,
        placeMark,
    };
})();

const GameController = ( function() {
    // This is for console mode
    const inputNum = () => {
        let input = prompt("Row, Column");
        const row = Number(input.split(",")[0]);
        const column = Number(input.split(",")[1]);
        Gameboard.placeMark(row, column);
    };
    
    return {
        inputNum
    };
})();

GameController.inputNum();