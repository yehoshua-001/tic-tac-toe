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
        if (!isCellEmpty(row, column)) return false;
        board[row][column] = mark;
        return true;
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

    const reset = () => {
        createBoard();
    };

    return {
        getBoard,
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
    };

    const resetScores = () => {
        players.forEach(player => player.resetScore());
    };

    const playRound = (row, column) => {
        if (isOver) {
            return {ok: false, reason: "game-over"};
        };

        const mark = activePlayer.getMark();

        if (!Gameboard.placeMark(row, column, mark)) {
            return {ok: false, reason: "cell-taken"};
        };

        const line = Gameboard.findWinningLine(mark);
        if (line) {
            isOver = true;
            result = "win";
            winner = activePlayer;
            winningLine = line;
            activePlayer.addScore();
            return {ok: true, status: "win", winner, line};
        }

        if (Gameboard.isFull()) {
            isOver = true;
            result = "tie";
            ties += 1;
            return {ok:true, status: "tie"};
        };

        switchTurn();
        return {
            ok: true,
            status: "playing",
        };
    };
    
    return {
        getPlayers,
        getActivePlayer,
        getTies,
        isGameOver,
        getWinner,
        getWinningLine,
        setUpPlayers,
        switchTurn,
        newRound,
        resetScores,
        playRound,
    };
})();

const DisplayController = ( function() {
    const boardGrid = document.querySelector("#boardGrid");

    const status = document.querySelector('#status');
    const playerOneName = document.querySelector('#playerOneName');
    const playerOneScore = document.querySelector('#playerOneScore');
    const playerTwoName = document.querySelector('#playerTwoName');
    const playerTwoScore = document.querySelector('#playerTwoScore');
    const newGameBtn = document.querySelector('#newGame');
    const rematchBtn = document.querySelector('#rematch');

    const setupDialog = document.querySelector('.setupDialog');
    const setupForm = document.querySelector('.setupForm');
    const setupBtn = document.querySelector('#startBtn');
    const playerOneInput = document.querySelector('#p1-name');
    const playerTwoInput = document.querySelector('#p2-name');

    const symbol = (mark) =>
        mark === "X"
            ? `<svg class="x-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>close</title>
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>`
            : `<svg class="o-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>circle-outline</title>
                    <path d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>`;

    const createCells = () => {
        for (let r = 0; r < Gameboard.getRows(); r++) {
            for (let c = 0; c < Gameboard.getColumns(); c++) {
                const cell = document.createElement('button');
                cell.type = "button";
                cell.className = "cell";
                cell.dataset.row = String(r);
                cell.dataset.column = String(c);
                cell.dataset.mark = "";
                cell.innerHTML = `
                    <span class="x-mark"></span>
                    <span class="o-mark"></span>
                    <span class="mark"></span>`;
                boardGrid.appendChild(cell);
            };
        };
    };

    const getCell = (row, column) => 
        boardGrid.querySelector(`[data-row="${row}"][data-column="${column}"]`);

    const render = () => {
        const board = Gameboard.getBoard();
        
        board.forEach((row, r) => {
            row.forEach((value, c) => {
                const cell = getCell(r, c);
                if (!cell) return;

                const current = cell.dataset.mark || "";
                const next = value || "";
                if (current === next) return;

                cell.dataset.mark = next;
                cell.querySelector('.mark').innerHTML = next ? symbol(next) : "";
            });
        });
    };

    const renderScoreBoard = () => {
        const [one, two] = GameController.getPlayers();

        playerOneName.textContent = one.getName();
        playerOneScore.textContent = String(one.getScore());
        playerTwoName.textContent = two.getName();
        playerTwoScore.textContent = String(two.getScore());
    };

    const setStatus = (text) => {
        status.textContent = text;
    };

    const announceTurn = () => {
        const active = GameController.getActivePlayer();
        setStatus(`${active.getName()}'s turn`);        
    };

    const playMatch = (row, column) => {
        const move = GameController.playRound(row, column);
        if (!move.ok) {
            if (move.reason === "cell-taken") {
                setStatus('Square is occupied');
            };
            return;
        };

        render();

        if (move.status !== "playing") {
            if (move.status === "win") {
                setStatus(`${move.winner.getName()} wins`);
                renderScoreBoard();
            }
            else if (move.status === "tie") {
                setStatus("It's a tie");
            }
            return;
        };

        announceTurn();
    };

    const startGame = () => {
        GameController.setUpPlayers({
            playerOne: playerOneInput.value,
            playerTwo: playerTwoInput.value,
        });

        GameController.newRound();
        GameController.resetScores();
        render();
        renderScoreBoard();
        announceTurn();
    };

    const startRound = () => {
        GameController.newRound();
        render();
        renderScoreBoard();
        announceTurn();
    };

    const bindEvents = () => {
        boardGrid.addEventListener('click', (event) => {
            const cell = event.target.closest('.cell');
            playMatch(Number(cell.dataset.row), Number(cell.dataset.column));
        });

        setupBtn.addEventListener('click', () => {
            startGame();
            setupDialog.close();
        });

        newGameBtn.addEventListener('click', () => {
            setupDialog.showModal();
        });

        rematchBtn.addEventListener('click', () => {
            startRound();
        });
    };

    const initialize = () => {
        createCells();
        render();
        renderScoreBoard();
        announceTurn();
        bindEvents();
        setupDialog.showModal();
    };

    return {
        initialize,
    };
})();

DisplayController.initialize();
