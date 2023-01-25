'use strict'

var gHintClicked = false
var hintRevealed = []


function onCellClicked(event, elCell, cellI, cellJ) {
    var currLocation = { i: cellI, j: cellJ }
    var currCell = gBoard[cellI][cellJ]
        if (event === 'right') handleRightKlick(currLocation, currCell)
        else handleLeftKlick(elCell, currLocation, currCell)
}


function handleLeftKlick(elCell, currLocation, currCell) {

    if (gGame.shownCount === 0 && !gGame.isOn) {
        renderCell(currLocation, '')
        addMines(currLocation)
        setMinesNegsCount(gBoard)
        console.log('gBoard', gBoard)
        gGame.shownCount++
        elCell.classList.add('clicked')
        gGame.isOn = true
        currCell.isShown = true
        return
    }

    if(!gGame.isOn) return
    if (currCell.isMarked) return
    if (currCell.isShown) return
    if (gHintClicked) {
        negsReveal(gBoard, currLocation.i, currLocation.j)
        gHintClicked = false
        return
    }
    currCell.isShown = true

    if (currCell.isMine) {
        gGame.lives--
        gLevel.MINES--
        changeLives()
        renderCell(currLocation, MINE)
        changeSmiley('bombed')
        checkGameOver()
        elCell.classList.add('bombed')
    } else {
        gGame.shownCount++
        renderCell(currLocation, currCell.minesAroundCount)
        changeSmiley('saved')
        checkGameOver()
        elCell.classList.add('clicked')
    }
}

function handleRightKlick(currLocation, currCell) {
    if(!gGame.isOn) return
    if (currCell.isShown) return

    if (currCell.isMarked) {
        currCell.isMarked = false
        renderCell(currLocation, '')
        if (currCell.isMine) gGame.markedCount--
        checkGameOver()
    } else {
        currCell.isMarked = true
        renderCell(currLocation, FLAG)
        if (currCell.isMine) gGame.markedCount++
        checkGameOver()
    }
    return
}

function hintClick(num) {
    document.querySelector(`.hint${num}`).classList.add('hint-clicked')
    gHintClicked = true
}

function negsReveal(board, cellI, cellJ) {

    for (let i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (let j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board.length) continue
            var currCell = board[i][j]
            var currLocation = { i: cellI, j: cellJ }
            if (currCell.isShown) continue
            hintRevealed.push(currCell)
            if (currCell.isMine) renderCell(currLocation, MINE)
            else renderCell(currLocation, currCell.minesAroundCount)
        }
    }
}

function closeRevealed() {
    
}

function changeLives() {
    var lives = document.querySelector('.lives span')
    if (gGame.lives === 3) lives.innerText = '❤❤❤'
    if (gGame.lives === 2) lives.innerText = '❤❤💔'
    if (gGame.lives === 1) lives.innerText = '❤💔💔'
    if (!gGame.lives) lives.innerText = '💔💔💔'
}