'use strict'

var gMegaHintClicks = 0
var firstCell = {}
var lastCell

// Hints feature

// pick the cells that needs to be shown
function makeRevealArr(cellI, cellJ) {
    gRevealed = []
    for (let i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (let j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue
            var currCell = gBoard[i][j]
            var currLocation = { i: i, j: j }
            var cellContent
            if (currCell.isShown) continue
            if (currCell.isMarked) continue
            if (currCell.isMine) cellContent = MINE
            else  cellContent = currCell.minesAroundCount
            gRevealed.push({ location: currLocation, content: cellContent })
        }
    }
}

// Reveal hint cells
function reveal() {
    for (let i = 0; i < gRevealed.length; i++) {
        renderCell(gRevealed[i].location, gRevealed[i].content)
        var elCell = document.querySelector(`.cell-${gRevealed[i].location.i}-${gRevealed[i].location.j}`)
        if (gRevealed[i].content === MINE) elCell.classList.add('bombed')
        else elCell.classList.add('clicked')
    }
}

// Hide hint cells
function HideReveal() {
    for (let i = 0; i < gRevealed.length; i++) {
        renderCell(gRevealed[i].location, '')
        var elCell = document.querySelector(`.cell-${gRevealed[i].location.i}-${gRevealed[i].location.j}`)
        if (gRevealed[i].content === MINE) elCell.classList.remove('bombed')
        else elCell.classList.remove('clicked')
    }
}

// Safe click feature
function onSafeClick(elBtnSafe) {
    if (!gGame.safeCount) return
    if (!gGame.isOn) return
    var emptyLocation = getUnrevealedLocation(gBoard)
    if (!emptyLocation) return
    elBtnSafe.classList.add('clicked')
    var className = getClassName(emptyLocation)
    document.querySelector(className).classList.add('safe-cell')
    setTimeout(() => {
        document.querySelector(className).classList.remove('safe-cell')
        elBtnSafe.classList.remove('clicked')
    }, 1100);
    gGame.safeCount--
    document.querySelector('.safe span').innerText = gGame.safeCount
}

// Using to give safe click with a unrevelaed cell
function getUnrevealedLocation(board) {
    var res = []
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (!board[i][j].isMine && !board[i][j].isShown) res.push({ i: i, j: j })
        }
    }
    return res[getRandomInt(0, res.length)]
}

// Save steps to undo feature
function saveSteps(currLocation) {
    prevSteps.push(currLocation)
}

function onUndo() {
    var step = (prevSteps.splice(prevSteps.length - 1, 1))
    if (step[0].i >= 0) {
        undo(step, 0)
    } else {
        var steps = step[0].slice()
        for (let i = 0; i < steps.length; i++) {
            undo(steps, i)
        }
    }
}

function undo(step, i) {
    var currCell = gBoard[step[i].i][step[i].j]
    currCell.isShown = false
    renderCell(step[i], '')
    var className = getClassName(step[i])
    var elCell = document.querySelector(className)
    if (currCell.isMine) elCell.classList.remove('bombed')
    else elCell.classList.remove('clicked')
}

// Open best score local storage
function onBestScore() {
    if (gGame.isOn) return
    gBestScoreMode = (gBestScoreMode) ? false : true
    var phoneElements = document.querySelectorAll('.hide')
    for (let i = 0; i < phoneElements.length; i++) {
        phoneElements[i].hidden = (phoneElements[i].hidden) ? false : true
    }
    var elScoreDiv = document.querySelector('.score')
    elScoreDiv.hidden = (elScoreDiv.hidden) ? false : true
}

function onMegaHint(elBtn) {
    if (!gGame.isOn) return
    if (gMegaHintClicks === 2) return
    gGame.megaHint = (gGame.megaHint) ? false : true
    console.log('gGame.megaHint', gGame.megaHint)
    if (gGame.megaHint) {
        elBtn.style.backgroundColor = 'yellow'
        elBtn.style.color = 'black'
        makeSound('left')
    } else {
        elBtn.style.backgroundColor = 'black'
        elBtn.style.color = 'white'
    }
}

function firstMegaHint(currLocation) {
    firstCell.i = currLocation.i
    firstCell.j = currLocation.j
    var className = getClassName(currLocation)
    document.querySelector(className).classList.add('mega-hint1')
    gMegaHintClicks++
    makeSound('right')
}

function secondMegaHint(secondLocation) {
    gRevealed = []
    for (let i = firstCell.i; i <= secondLocation.i; i++) {
        for (let j = firstCell.j; j <= secondLocation.j; j++) {
            var currCell = gBoard[i][j]
            var currLocation = { i: i, j: j }
            if (currCell.isShown) continue
            if (currCell.isMine) {
                var cellContent = MINE
            } else {
                var cellContent = currCell.minesAroundCount
            }
            gRevealed.push({ location: currLocation, content: cellContent })
        }
    }
    reveal()
    setTimeout(HideReveal, 2000)
    var className = getClassName(firstCell)
    document.querySelector(className).classList.remove('mega-hint1')
    var elMegaBtn = document.querySelector('.mega-hint')
    elMegaBtn.style.backgroundColor = 'black'
    elMegaBtn.style.color = 'white'
    firstCell = {}
    gMegaHintClicks++
    document.querySelector('.mega-hint span').innerText = '0'
}

function onExterminator() {
    if (!gGame.isOn) return
    if (!gGame.exterminator) return
    var minesLocations = getMinesLocations(gBoard)
    makeSound('dog')
    for (let i = 0; i < 3; i++) {
        if (!minesLocations.length) return
        var currMineLoc = minesLocations.splice(getRandomInt(0, minesLocations.length - 1), 1)
        gBoard[currMineLoc[0].i][currMineLoc[0].j].isMine = false
        updateMinesNegsCount(currMineLoc[0].i , currMineLoc[0].j)
        renderCell(currMineLoc[0], MINE)
        setTimeout(renderCell, 1000, currMineLoc[0], '')
        gLevel.MINES--
    }
    gGame.exterminator--
}

function getMinesLocations(board) {
    var minesLocations = []
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            if (board[i][j].isMine) minesLocations.push({ i: i, j: j })
        }
    }
    return minesLocations
}

function updateMinesNegsCount(cellI , cellJ) {
    for (let i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (let j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue
            var currCell = gBoard[i][j]
            var currLocation = { i: i, j: j }
            if(currCell.isMine) continue
            if(currCell.minesAroundCount > 0) currCell.minesAroundCount--
            if(!currCell.isShown) continue
            renderCell(currLocation , currCell.minesAroundCount)
        }
    }
}