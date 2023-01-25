'use strict'

const MINE = '💣'
const FLAG = '🚩'
const HINT = '💡'
const LIVES = '❤'

var gBoard
var gWin = false
var gTimerInterval

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3
}

var gLevel = {
    SIZE: 4,
    MINES: 2
}


function onInit() {
    gBoard = buildBoard()
    renderBoard(gBoard, '.board')
    console.log('board', gBoard)
}

function restartGame(size, minesCount) {
    gLevel = {
        SIZE: size,
        MINES: minesCount
    }
    clearGame()
    changeSmiley('start')
    clearLives()
    onInit()
}


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

            const cell = mat[i][j]
            const className = `cell cell-${i}-${j}`
            var cellContent
            if (cell.isShown) {
                cellContent = (cell.isMine) ? MINE : cell.minesAroundCount
            } else {
                cellContent = ''
            }

            strHTML += `<td class="${className}" onmousedown="handleKey(event , this ,${i} , ${j})">${cellContent}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

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

function addMines(currLocation) {
    for (let i = 0; i < gLevel.MINES; i++) {
        var emptyLocations = getEmptyLocation(gBoard)
        var emptyLocationIdx = getRandomInt(0, emptyLocations.length)
        var emptyLocation = emptyLocations[emptyLocationIdx]
        if (emptyLocation.i === currLocation.i && emptyLocation.j === currLocation.j) i--
        else gBoard[emptyLocation.i][emptyLocation.j].isMine = true
    }
}

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

function checkGameOver() {
    if (!gGame.lives) {
        clearInterval(gTimerInterval)
        gWin = false
        gGame.isOn = false
        changeSmiley('sad')
    }
    else if (gGame.shownCount === gGame.SIZE * gGame.SIZE &&
        gGame.markedCount === gLevel.MINES) {
        clearInterval(gTimerInterval)
        gWin = true
        gGame.isOn = false
        changeSmiley('win')
    }
}

function handleKey(event, elCell, i, j) {
    window.oncontextmenu = (e) => {
        e.preventDefault()
    }
    switch (event.button) {
        case 0:
            onCellClicked('left', elCell, i, j)
            break
        case 2:
            onCellClicked('right', elCell, i, j)
            break
    }
}

function clearGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3
    }
    clearInterval(gTimerInterval)
}

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