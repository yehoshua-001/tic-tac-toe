"use strict";

const Gameboard = ( function() {
    const rows = 3;
    const columns = 3;
    const board = [];

    for (let r = 0; r < rows; r++) {
        board[r] = [];
        for (let c = 0; c < columns; c++) {
            board[r][c] = null;
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

    const isCellValid = (row, column) =>
        Number.isInteger(row) && 
        Number.isInteger(column) &&
        row >= 0 && 
        row < rows &&
        column >= 0 && 
        column < columns;

    const isCellEmpty = (row, column) =>
        isCellValid(row, column) && board[row][column] === null;

    const placeMark = (row, column, mark) => {
        if (!isCellEmpty(row, column)) {
            console.log('Cell is occupied');
            return false;
        }
        else {
            board[row][column] = mark;
            printBoard();
            return true;
        }
    };

    const printBoard = () => {
        console.table(board);
    }; 

    return {
        isCellEmpty,
        placeMark,
        printBoard,
    };
})();

function createPlayer(defaultName, mark) {
    let name = defaultName;
    
    const getName = () => name;

    const setName = (value) => {
        name = String(value ?? "").trim() || defaultName;
    };

    return {
        getName,
        setName,
        getMark: () => mark,
    };
}

const GameController = ( function() {
    const players = [
        createPlayer('Player 1', 'X'),
        createPlayer('Player 2', 'O'),
    ];

    let index = 0;
    let activePlayer = players[index];

    const switchTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    // This is for console mode
    const inputNum = () => {
        let input = prompt(`${activePlayer.getName()}'s turn ${activePlayer.getMark()} (row, column)`);
        const row = Number(input.split(",")[0]);
        const column = Number(input.split(",")[1]);
        playRound(row, column);
    };

    const playRound = (row, column) => {
        const mark = activePlayer.getMark();
        const move = Gameboard.placeMark(row, column, mark);

        if (!move) {
            inputNum();
            return;
        };

        switchTurn();
        inputNum();

        return {
            row,
            column,
            mark,
        };
    };
    
    return {
        inputNum,
        playRound,
    };
})();

Gameboard.printBoard();
GameController.inputNum();