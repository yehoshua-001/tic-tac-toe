"use strict";

const Gameboard = ( function() {
    const rows = 3;
    const columns = 3;
    const board = [];

    const createBoard = () => {
        board.length = 0;
        for (let r = 0; r < rows; r++) {
            board[r] = [];
            for (let c = 0; c < columns; c++) {
                board[r][c] = null;
            }
        };
    };
    createBoard();

    const winningPatterns = [
        // rows
        [[0, 0], [0, 1], [0, 2],],
        [[1, 0], [1, 1], [1, 2],],
        [[2, 0], [2, 1], [2, 2],],
        // columns
        [[0, 0], [1, 0], [2, 0],],
        [[0, 1], [1, 1], [2, 1],],
        [[0, 2], [1, 2], [2, 2],],
        // diagonals
        [[0, 0], [1, 1], [2, 2],],
        [[0, 2], [1, 1], [2, 0],],
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
            return false;
        }
        else {
            board[row][column] = mark;
            printBoard();
            return true;
        }
    };

    const getEmptyCells = () => {
        const emptyCells = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                if (board[r][c] === null) {
                    emptyCells.push([r, c]);
                }
            }
        }
        return emptyCells;
    };

    const isFull = () => getEmptyCells().length === 0;

    const findWinningLine = (mark) =>
        winningPatterns.find((line) => 
            line.every(([r, c]) => board[r][c] === mark),
        ) || null;

    const printBoard = () => {
        console.table(board);
    };

    return {
        isCellEmpty,
        placeMark,
        getEmptyCells,
        isFull,
        findWinningLine,
        printBoard,
    };
})();

function createPlayer(defaultName, mark) {
    let name = defaultName;
    let score = 0;
    
    const getName = () => name;

    const setName = (value) => {
        name = String(value ?? "").trim() || defaultName;
    };

    const getMark = () => mark;

    const getScore = () => score;

    const addScore = () => {
        score += 1;
    };

    const resetScore = () => {
        score = 0;
    };

    return {
        getName,
        setName,
        getMark,
        getScore,
        addScore,
        resetScore,
    };
}

const GameController = ( function() {
    const players = [
        createPlayer('Player 1', 'X'),
        createPlayer('Player 2', 'O'),
    ];

    let playerIndex = 0;
    let activePlayer = players[playerIndex];
    let ties = 0;
    let isOver = false;
    let result = null;
    let winner = null;
    let winningLine = null;

    const getPlayers = () => players;
    const getActivePlayer = () => activePlayer;
    const getTies = () => ties;
    const isGameOver = () => isOver;
    const getWinner = () => winner;
    const getWinningLine = () => winningLine;

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
            console.log('Cell is occupied');
            inputNum();
            return {
                ok: false,
                reason: "cell-taken",
                row,
                column,
            };
        };

        const line = Gameboard.findWinningLine(mark);
        if (line) {
            isOver = true;
            result = "win";
            winner = activePlayer;
            winningLine = line;
            activePlayer.addScore();
            console.log(`${activePlayer.getName()} WON`)
            console.log(`${players[0].getName()} : ${players[0].getScore()}`)
            console.log(`${players[1].getName()} : ${players[1].getScore()}`)
            return {
                ok: true,
                status: "win",
                row,
                column,
                mark,
                winner,
                line,
            };
        }

        if (Gameboard.isFull()) {
            console.log(`IT'S A TIE`)
            isOver = true;
            result = "tie";
            ties += 1;
            return {
                ok: true,
                status: "tie",
                row,
                column,
                mark,
            };
        };

        switchTurn();
        inputNum();
        return {
            ok: true,
            status: "playing",
            row,
            column,
            mark,
            next: activePlayer,
        };
    };
    
    return {
        getPlayers,
        getActivePlayer,
        getTies,
        isGameOver,
        getWinner,
        getWinningLine,
        switchTurn,
        inputNum, // for console mode
        playRound,
    };
})();

Gameboard.printBoard();
GameController.inputNum();