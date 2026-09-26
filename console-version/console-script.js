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

    const getBoard = () => board;
    const getRows = () => rows;
    const getColumns = () => columns;

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
            line.every(([r, c]) => board[r][c] === mark)) || null;

    const printBoard = () => {
        console.table(board);
    };

    const reset = () => {
        createBoard();
    };

    return {
        getRows,
        getColumns,
        isCellEmpty,
        placeMark,
        getEmptyCells,
        isFull,
        findWinningLine,
        printBoard,
        reset,
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
    let isOver = false;
    let result = null;
    let winner = null;
    let winningLine = null;

    const getPlayers = () => players;
    const getActivePlayer = () => activePlayer;
    const isGameOver = () => isOver;
    const getWinner = () => winner;
    const getWinningLine = () => winningLine;

    const inputNum = () => {
        let input = prompt(`${activePlayer.getName()}'s turn ${activePlayer.getMark()} (row, column)`);
        const row = Number(input.split(",")[0]);
        const column = Number(input.split(",")[1]);
        playRound(row, column);
    };

    const setUpPlayers = ({playerOne, playerTwo} = {}) => {
        players[0].setName(playerOne);
        players[1].setName(playerTwo);
    };

    const switchTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const newRound = () => {
        Gameboard.reset();
        isOver = false;
        result = null;
        winner = null;
        winningLine = null;
        activePlayer= players[playerIndex];
        playerIndex = playerIndex === 0 ? 1 : 0;
        Gameboard.printBoard();
        inputNum();
    };

    const resetScores = () => {
        players.forEach(player => player.resetScore());
    };

    const playRound = (row, column) => {
        const mark = activePlayer.getMark();
        const move = Gameboard.placeMark(row, column, mark);
        if (!move) {
            console.log('Cell is occupied');
            inputNum();
            return;
        };

        const line = Gameboard.findWinningLine(mark);
        if (line) {
            isOver = true;
            result = "win";
            winner = activePlayer;
            winningLine = line;
            activePlayer.addScore();
            console.log(`${players[0].getName()} : ${players[0].getScore()}`);
            console.log(`${players[1].getName()} : ${players[1].getScore()}`);
            confirm(`${activePlayer.getName()} WON`);
            if (confirm) {
                newRound();
            };
            return;
        }

        if (Gameboard.isFull()) {
            console.log(`${players[0].getName()} : ${players[0].getScore()}`);
            console.log(`${players[1].getName()} : ${players[1].getScore()}`);
            alert(`IT'S A TIE`);
            newRound();
            isOver = true;
            result = "tie";
            return;
        };

        switchTurn();
        inputNum();
        return;
    };
    
    return {
        getPlayers,
        getActivePlayer,
        isGameOver,
        getWinner,
        getWinningLine,
        setUpPlayers,
        switchTurn,
        inputNum,
        newRound,
        resetScores,
        playRound,
    };
})();

const DisplayController = ( function() {
    const startMatch = () => {
        GameController.setUpPlayers({
            playerOne: prompt(`Player 1 name`, `Player 1`),
            playerTwo: prompt(`Player 2 name`, `Player 2`),
        });
        GameController.inputNum();
    };

    const playBtn = document.querySelector('#play');
    const play = () => {
        playBtn.addEventListener('click', () => {
            Gameboard.reset();
            GameController.resetScores();
            Gameboard.printBoard();
            startMatch();
        });
    };

    return {play};
})();

DisplayController.play();
