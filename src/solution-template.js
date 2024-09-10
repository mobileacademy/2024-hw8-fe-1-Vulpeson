/*
*
* "board" is a matrix that holds data about the
* game board, in a form of BoardSquare objects
*
* openedSquares holds the position of the opened squares
*
* flaggedSquares holds the position of the flagged squares
*
 */

const bombProbabilityInput = document.getElementById('bombProbability');
const maxProbabilityInput = document.getElementById('maxProbability');
const difficultyDropdown = document.getElementById('difficulty');

let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;
let gameOver = false;

let bombProbability = 3;
let maxProbability = 15;

bombProbabilityInput.addEventListener('input', function() {
    bombProbability = parseInt(this.value);
    regenerateBoard();
});

maxProbabilityInput.addEventListener('input', function() {
    maxProbability = parseInt(this.value);
    regenerateBoard();
});

difficultyDropdown.addEventListener('change', function() {
    const difficulty = this.value;
    if (difficulty === 'easy') {
        minesweeperGameBootstrapper(9, 9, bombProbability);
    } else if (difficulty === 'medium') {
        minesweeperGameBootstrapper(16, 16, bombProbability);
    } else if (difficulty === 'expert') {
        minesweeperGameBootstrapper(25, 25, bombProbability);
    }
});

function regenerateBoard() {
    const difficulty = difficultyDropdown.value;
    if (difficulty === 'easy') {
        minesweeperGameBootstrapper(9, 9, bombProbability);
    } else if (difficulty === 'medium') {
        minesweeperGameBootstrapper(16, 16, bombProbability);
    } else if (difficulty === 'expert') {
        minesweeperGameBootstrapper(25, 25, bombProbability);
    }
}

function minesweeperGameBootstrapper(rowCount, colCount, bombProbability) {
    gameOver = false;
    bombCount = 0;
    openedSquares = [];
    flaggedSquares = [];
    board = [];
    generateBoard({'rowCount': rowCount, 'colCount': colCount, 'bombProbability': bombProbability});
    renderBoard(rowCount, colCount);
}

function generateBoard(boardMetadata) {
    squaresLeft = boardMetadata.colCount * boardMetadata.rowCount;

    for (let i = 0; i < boardMetadata.colCount; i++) {
        board[i] = new Array(boardMetadata.rowCount);
    }

    for (let i = 0; i < boardMetadata.colCount; i++) {
        for (let j = 0; j < boardMetadata.rowCount; j++) {
            board[i][j] = new BoardSquare(false, 0);

            if (Math.random() * maxProbability < boardMetadata.bombProbability) {
                board[i][j].hasBomb = true;
                bombCount++;
            }
        }
    }
    countVicinityBombs();
}

function countVicinityBombs() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (!board[i][j].hasBomb) {
                let bombCount = 0;
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        if (isValidSquare(i + x, j + y) && board[i + x][j + y].hasBomb) {
                            bombCount++;
                        }
                    }
                }
                board[i][j].bombsAround = bombCount;
            }
        }
    }
}

function isValidSquare(x, y) {
    return x >= 0 && x < board.length && y >= 0 && y < board[0].length;
}

class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb;
        this.bombsAround = bombsAround;
    }
}

class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


function renderBoard(rowCount, colCount) {
    const gameBoard = document.getElementById('game-board');
    gameBoard.style.gridTemplateColumns = `repeat(${colCount}, 30px)`;
    gameBoard.innerHTML = '';

    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            const squareElement = document.createElement('div');
            squareElement.classList.add('square');
            squareElement.dataset.x = i;
            squareElement.dataset.y = j;
            squareElement.addEventListener('click', handleSquareClick);
            squareElement.addEventListener('contextmenu', handleRightClick);
            gameBoard.appendChild(squareElement);
        }
    }
}



function handleSquareClick(event) {
    if (gameOver) return;
    const x = parseInt(event.target.dataset.x);
    const y = parseInt(event.target.dataset.y);

    if (board[x][y].hasBomb) {
        revealAllBombs();
        document.getElementById('game-status').textContent = 'Game Over!';
        gameOver = true;
    } else {
        openSquare(x, y);
        checkWin();
    }
}

function handleRightClick(event) {
    event.preventDefault();
    if (gameOver) return;

    const x = parseInt(event.target.dataset.x);
    const y = parseInt(event.target.dataset.y);

    if (!openedSquares.some(sq => sq.x === x && sq.y === y)) {
        if (!flaggedSquares.some(sq => sq.x === x && sq.y === y)) {
            event.target.classList.add('flag');
            flaggedSquares.push(new Pair(x, y));
        } else {
            event.target.classList.remove('flag');
            flaggedSquares = flaggedSquares.filter(sq => !(sq.x === x && sq.y === y));
        }
    }
}

function openSquare(x, y) {
    if (!isValidSquare(x, y) || openedSquares.some(sq => sq.x === x && sq.y === y)) return;

    const squareElement = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    openedSquares.push(new Pair(x, y));
    
    squareElement.classList.add('opened');
    squareElement.style.backgroundColor = 'lightgreen';  // Safe square turns light green
    squareElement.textContent = board[x][y].bombsAround || '';
    
    squaresLeft--;

    if (board[x][y].bombsAround === 0) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                openSquare(x + dx, y + dy);
            }
        }
    }
}

function revealAllBombs() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].hasBomb) {
                const squareElement = document.querySelector(`[data-x="${i}"][data-y="${j}"]`);
                squareElement.classList.add('bomb');
                squareElement.textContent = '💣';
            }
        }
    }
}

function checkWin() {
    if (squaresLeft === bombCount) {
        document.getElementById('game-status').textContent = 'You Win!';
        gameOver = true;
    }
}


minesweeperGameBootstrapper(9, 9, bombProbability);
// TODO create the other required functions such as 'discovering' a tile, and so on (also make sure to handle the win/loss cases)
