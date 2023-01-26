'use strict'

const MINE = '💣'
const FLAG = '🚩'
const HINT = '💡'
const LIVES = '❤'

var gGame
var gBoard
var gWin = false
var gTimerInterval

var gLevel = {
    SIZE: 4,
    MINES: 2
}

// rendering the game 
function onInit() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
        safeCount: 3,
        manualMode: false , 
    }
    gBoard = buildBoard()
    renderBoard(gBoard, '.board')
}

// Restarting the game with smiley btn or a level select
function onRestartGame(size, minesCount) {
    gLevel = {
        SIZE: size,
        MINES: minesCount
    }
    clearGame()
    document.querySelector('.timer span').innerText = '0.000'
    onInit()
    clearManualMode()
}

// Buliding the board and rendering it with nothing inside
function buildBoard() {
    var size = gLevel.SIZE
    const board = []

    for (var i = 0; i < size; i++) {
        board.push([])

        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

function renderBoard(mat, selector) {

    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            const className = `cell cell-${i}-${j}`

            strHTML += `<td class="${className}" onmousedown="onHandleKey(event , this ,${i} , ${j})"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

// Setting the mines count around a cell and updating the modal
function setMinesNegsCount(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) continue
            board[i][j].minesAroundCount = negsCount(board, i, j)
        }
    }
}

function negsCount(board, cellI, cellJ) {
    var negsCount = 0
    for (let i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (let j = cellJ - 1; j <= cellJ + 1; j++) {
            if (cellI === i && cellJ === j) continue
            if (j < 0 || j >= board.length) continue
            if (board[i][j].isMine) negsCount++
        }
    }
    return negsCount
}

// Adding mines after the first click
function addMines(currLocation) {
    var emptyLocations = getEmptyLocations(gBoard)
    for (let i = 0; i < gLevel.MINES; i++) {
        var emptyLocationIdx = getRandomInt(0, emptyLocations.length)
        var emptyLocation = emptyLocations.splice(emptyLocationIdx, 1)
        if (emptyLocation[0].i === currLocation.i && emptyLocation[0].j === currLocation.j) i--
        else gBoard[emptyLocation[0].i][emptyLocation[0].j].isMine = true
    }
}

// Changing smiley with switch for every situation
function changeSmiley(smiley) {
    var elBtn = document.querySelector('.btn-restart')
    switch (smiley) {
        case 'bombed':
            elBtn.innerText = '🤯'
            break
        case 'saved':
            elBtn.innerText = '😮'
            break
        case 'sad':
            elBtn.innerText = '😭'
            break
        case 'win':
            elBtn.innerText = '😎'
            break
        case 'start':
            elBtn.innerText = '😀'
            break
    }
}

// Checking if game is over and clearing intervals
function checkGameOver() {
    gGame.shownCount = checkShownCount(gBoard)
    var cellsCount = gLevel.SIZE * gLevel.SIZE - gLevel.MINES
    console.log('gGame.shownCount', gGame.shownCount)
    console.log('gGame.markedCount', gGame.markedCount)
    console.log('gLevel.mines', gLevel.MINES)
    console.log('cellsCount', cellsCount)
    if (!gGame.lives) {
        showAllMines()
        clearInterval(gTimerInterval)
        gWin = false
        gGame.isOn = false
        changeSmiley('sad')
    }
    else if (gGame.shownCount === cellsCount && gGame.markedCount === gLevel.MINES) {
        clearInterval(gTimerInterval)
        gWin = true
        gGame.isOn = false
        changeSmiley('win')
    }
}

function checkShownCount(board) {
    var shownCount = 0
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            if (board[i][j].isShown) shownCount++
        }
    }
    return shownCount
}

// Handling the click and sending it to the function cellClicked
function onHandleKey(event, elCell, i, j) {
    window.oncontextmenu = (e) => {
        e.preventDefault()
    }
    switch (event.button) {
        case 0:
            cellClicked('left', elCell, i, j)
            break
        case 2:
            cellClicked('right', elCell, i, j)
            break
    }
}

// Clearing game for a restart
function clearGame() {
    clearInterval(gTimerInterval)
    clearHints()
    clearLives()
    changeSmiley('start')
}

// Adding back Lives when restart
function clearLives() {
    var elLives = document.querySelectorAll('.lives p')
    for (let i = 0; i < elLives.length; i++) {
        elLives[i].classList.remove('lost-live')
    }
}

function timer() {
    var startTime = Date.now();

    gTimerInterval = setInterval(function () {
        var elapsedTime = Date.now() - startTime;
        document.querySelector('.timer span').innerHTML = (elapsedTime / 1000).toFixed(3);
    }, 37);
}

// Showing all mines location when game is over
function showAllMines() {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) renderCell({ i: i, j: j }, MINE)
        }
    }
}

// Adding back hints when game over
function clearHints() {
    var elHints = document.querySelectorAll('.hint')
    for (let i = 0; i < elHints.length; i++) {
        elHints[i].style.visibility = 'visible'
    }
}

function clearManualMode() {
    gManualMinesCount = gLevel.MINES
    showMinesLeft()
    document.querySelector('.manual-mode').classList.remove('clicked')
}