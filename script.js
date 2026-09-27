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

    // For minimax algorithm
    const undoMark = (row, column) => {
        if (!isCellValid(row, column)) return false;
        board[row][column] = null;
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
            line.every(([r, c]) => board[r][c] === mark)) || null;

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
        undoMark,
        getEmptyCells,
        isFull,
        findWinningLine,
        printBoard,
        reset
    };
})();

function createPlayer(defaultName, mark) {
    let name = defaultName;
    let score = 0;
    let bot = false;
        
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

    const isBot = () => bot;
    
    const setBot = (value) => {
        bot = Boolean(value);
    }; 

    return {
        getName,
        setName,
        getMark,
        getScore,
        addScore,
        resetScore,
        isBot,
        setBot
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

    const setupPlayers = ({playerOne, playerTwo, vsBot = false} = {}) => {
        players[0].setName(playerOne);
        players[0].setBot(false);
        players[1].setName(
            vsBot ? playerTwo || "Bot" : playerTwo
        );
        players[1].setBot(vsBot);
        playerIndex = 0;
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
            return {ok:true, status: "tie"};
        };

        switchTurn();
        return {
            ok: true,
            status: "playing",
        };
    };
    
    // Minimax algorithm for unbeatable bot
    const minimax = (depth, isMaximizing, botMark, playerMark) => {
        const botLine = Gameboard.findWinningLine(botMark);
        if (botLine) return 10 - depth;

        const playerLine = Gameboard.findWinningLine(playerMark);
        if (playerLine) return depth - 10;

        if (Gameboard.isFull()) return 0;

        const emptyCells = Gameboard.getEmptyCells();

        if (isMaximizing) {
            let best = -Infinity;
            for (const [r, c] of emptyCells) {
                Gameboard.placeMark(r, c, botMark);
                const score = minimax(depth + 1, false, botMark, playerMark);
                Gameboard.undoMark(r, c);
                best = Math.max(best, score);
            };
            return best;
        };

        let best = Infinity;
        for (const [r, c] of emptyCells) {
            Gameboard.placeMark(r, c, playerMark);
            const score = minimax(depth + 1, true, botMark, playerMark);
            Gameboard.undoMark(r, c);
            best = Math.min(best, score);
        };
        return best;
    };

    const findBestMove = (botMark, playerMark) => {
        let bestScore = -Infinity;
        let bestMove = null;

        Gameboard.getEmptyCells().forEach(([r, c]) => {
            Gameboard.placeMark(r, c, botMark);
            const score = minimax(0, false, botMark, playerMark);
            Gameboard.undoMark(r, c);

            if (score > bestScore) {
                bestScore = score;
                bestMove = [r, c];
            };
        });
        return bestMove;
    };

    const botTurn = () => {
        const botMark = activePlayer.getMark();
        const playerMark = botMark === "X" ? "O" : "X";

        const move = findBestMove(botMark, playerMark);
        if (!move) return {ok: false, reason: "no-moves"};

        const [row, column] = move;
        return playRound(row, column);
    };

    return {
        getPlayers,
        getActivePlayer,
        isGameOver,
        getWinner,
        getWinningLine,
        setupPlayers,
        switchTurn,
        newRound,
        resetScores,
        playRound,
        botTurn
    };
})();

const DisplayController = ( function() {
    const boardGrid = document.querySelector("#boardGrid");

    const status = document.querySelector('#status');

    const playerOneInput = document.querySelector('#p1-name');
    const playerOneName = document.querySelector('#playerOneName');
    const playerOneScore = document.querySelector('#playerOneScore');

    const playerTwoInput = document.querySelector('#p2-name');
    const playerTwoName = document.querySelector('#playerTwoName');
    const playerTwoScore = document.querySelector('#playerTwoScore');

    const playerVsPlayer = document.querySelector('#pvp');
    const playerVsBot = document.querySelector('#pvb');

    const newGameBtn = document.querySelector('#newGame');
    const rematchBtn = document.querySelector('#rematch');

    const setupDialog = document.querySelector('.setupDialog');
    const setupForm = document.querySelector('.setupForm');
    const setupBtn = document.querySelector('#startBtn');

    const symbol = (mark) =>
        mark === "X"
        ? `<svg class="symbol-x" viewBox="0 0 100 100" aria-hidden="true">
                <line class="stroke1" x1="25" y1="25" x2="75" y2="75"/>
                <line class="stroke2" x1="75" y1="25" x2="25" y2="75"/>
            </svg>`
        : `<svg class="symbol-o" viewBox="0 0 100 100" aria-hidden="true">
                <circle class="ring" cx="50" cy="50" r="28"/>
            </svg>`;

    const createCells = () => {
        for (let r = 0; r < Gameboard.getRows(); r++) {
            for (let c = 0; c < Gameboard.getColumns(); c++) {
                const cell = document.createElement('button');
                cell.type = "button";
                cell.className = "cell is-empty";
                cell.dataset.row = String(r);
                cell.dataset.column = String(c);
                cell.dataset.mark = "";
                cell.innerHTML = `
                    <span class="ghost ghost--x" aria-hidden="true"></span>
                    <span class="ghost ghost--o" arie-hidden="true"></span>
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
                cell.classList.toggle('is-empty', next === "");
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

    const renderTurn = () => {
        const active = GameController.getActivePlayer();
        const over = GameController.isGameOver();
        const mark = active.getMark();

        boardGrid.classList.toggle('turn-x', !over && mark === "X");
        boardGrid.classList.toggle('turn-o', !over && mark === "O");
    };

    const setStatus = (text) => {
        status.textContent = text;
    };

    const renderWinner = (line) => {
        boardGrid.classList.add('has-winner');
        line.forEach(([r, c]) => getCell(r, c).classList.add('is-winner'));
    };

    const clearRender = () => {
        boardGrid.classList.remove('has-winner');
        boardGrid.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('is-winner');
        });
    };

    const announceTurn = () => {
        const active = GameController.getActivePlayer();
        const mark = active.getMark();
        status.classList.remove('status-tie');
        status.classList.remove('status-occupied');
        status.classList.toggle('status-x', mark === "X");
        status.classList.toggle('status-o', mark === "O");
        
        const name = active.getName();
        if (name.endsWith("s")) {
            setStatus(
                active.isBot() ? `${name} is thinking...` : `${name}' turn`
            );
        }
        else if (name.endsWith("S")) {
            setStatus(
                active.isBot() ? `${name} is thinking...` : `${name}' turn`
            );
        }
        else {
            setStatus(
                active.isBot() ? `${name} is thinking...` : `${name}'s turn`
            );
        }
    };

    const evalMatch = (move) => {
        if (move.status === "win") {
            setStatus(`${move.winner.getName()} wins`);
            renderWinner(move.line);
            renderScoreBoard();
            renderTurn();
        }
        else if (move.status === "tie") {
            status.classList.remove('status-occupied');
            status.classList.toggle('status-tie');
            setStatus("It's a tie");
        }
        
        renderScoreBoard();
        renderTurn();
    };

    let botTimer = null;
    const botMove = () => {
        const active = GameController.getActivePlayer();
        if (GameController.isGameOver() || !active.isBot()) return;

        boardGrid.classList.toggle('disable-board');
        announceTurn();

        botTimer = window.setTimeout(
            () => {
                const move = GameController.botTurn();
                if (!move || !move.ok) return;

                render();

                if (move.status === "playing") {
                    renderTurn();
                    announceTurn();
                    boardGrid.classList.remove('disable-board');
                }
                else {
                    evalMatch(move);
                }
            },
            1250
        );
    };

    const cancelBotMove = () => {
        window.clearTimeout(botTimer);
        botTimer = null;
    };

    const matchTurn = (row, column) => {
        const move = GameController.playRound(row, column);
        if (!move.ok) {
            if (move.reason === "cell-taken") {
                status.classList.remove('status-tie');
                status.classList.toggle('status-occupied');
                setStatus('Square is occupied');
            };
            return;
        };

        render();

        if (move.status !== "playing") {
            evalMatch(move);
            return;
        };

        renderTurn();
        announceTurn();
        botMove();
    };

    const startGame = () => {
        clearRender();
        cancelBotMove();
        GameController.setupPlayers({
            playerOne: playerOneInput.value,
            playerTwo: playerVsBot.checked 
                ? playerTwoInput.value || "Bot" : playerTwoInput.value,
            vsBot: playerVsBot.checked
        });

        GameController.newRound();
        GameController.resetScores();
        render();
        renderTurn();
        renderScoreBoard();
        announceTurn();
        botMove();
    };

    const startRound = () => {
        boardGrid.classList.remove('disable-board');
        clearRender();
        cancelBotMove();
        GameController.newRound();
        render();
        renderTurn();
        renderScoreBoard();
        announceTurn();
        botMove();
    };

    const bindEvents = () => {
        boardGrid.addEventListener('click', (event) => {
            const cell = event.target.closest('.cell');
            matchTurn(Number(cell.dataset.row), Number(cell.dataset.column));
        });

        setupDialog.addEventListener('cancel', () => {
            boardGrid.classList.toggle('disable-board');
            status.classList.toggle('choose-mode');
            setStatus('Board is locked! I wonder why...');
            rematchBtn.setAttribute('style', 'pointer-events: none;');
            newGameBtn.setAttribute('style', 'background-color: #38B000;');
        });

        setupBtn.addEventListener('click', () => {
            boardGrid.classList.remove('disable-board');
            status.classList.remove('choose-mode');
            rematchBtn.removeAttribute('style');
            newGameBtn.removeAttribute('style');

            startGame();
            setupDialog.close();
        });

        const syncModeFields = () => {
            const vsBot = playerVsBot.checked;
            playerTwoInput.disabled = vsBot;
            playerTwoInput.placeholder = vsBot ? "Bot" : "Player 2";
            if (vsBot) playerTwoInput.value = "";
        };
        playerVsBot.addEventListener('change', syncModeFields);
        playerVsPlayer.addEventListener('change', syncModeFields);

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
        renderTurn();
        renderScoreBoard();
        bindEvents();
        setupDialog.showModal();
    };

    return {
        initialize,
    };
})();

DisplayController.initialize();
