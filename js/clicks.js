'use strict'

var gHintClicked = false
var elHintClicked
var gManualMinesCount = 0
var gRevealed = []
var prevSteps = []
var saveExpand = []

// Getting the event from HandleKey and handling left or right
function cellClicked(event, elCell, cellI, cellJ) {
    if (gBestScoreMode) return
    var currLocation = { i: cellI, j: cellJ }
    var currCell = gBoard[cellI][cellJ]
    if (gGame.megaHint && !gMegaHintClicks) {
        firstMegaHint(currLocation)
        return
    }
    if (gGame.megaHint && gMegaHintClicks === 1) {
        secondMegaHint(currLocation)
        return
    }
    if (currCell.isShown) return
    if (event === 'right') handleRightKlick(currLocation, currCell)
    else handleLeftKlick(elCell, currLocation, currCell)
    checkGameOver()
}

// Handling left click
function handleLeftKlick(elCell, currLocation, currCell) {

    // Manual Mode
    if (gGame.manualMode && !gGame.isOn) {
        handleManualMode(currLocation, currCell)
        showMinesLeft()
        if (!gManualMinesCount) {
            renderBoard(gBoard, '.board')
            setMinesNegsCount(gBoard)
            gGame.isOn = true
            saveSteps(currLocation)
            document.querySelector('.manual-mode').classList.remove('clicked')
        }
        return
    }

    // First click
    if (gGame.shownCount === 0) {
        renderCell(currLocation, currCell.minesAroundCount)
        if (!gGame.manualMode) {
            addMines(currLocation)
            setMinesNegsCount(gBoard)
            handleExpend(currLocation)
            saveSteps(currLocation)
        }
        timer()
        elCell.classList.add('clicked')
        gGame.isOn = true
        currCell.isShown = true
        return
    }

    if (!gGame.isOn) return
    if (currCell.isMarked) return

    // Handle hint
    if (gHintClicked) {
        handleHint(currLocation)
        return
    }

    currCell.isShown = true

    // Cell is mine or number and handle
    if (currCell.isMine) {

        handleMine(elCell, currLocation)
    } else {
        if (!currCell.minesAroundCount) handleExpend(currLocation)
        renderCell(currLocation, currCell.minesAroundCount)
        changeSmiley('saved')
        elCell.classList.add('clicked')
        if (currCell.minesAroundCount) saveSteps(currLocation)
    }
}

// Handling right click
function handleRightKlick(currLocation, currCell) {
    if (!gGame.isOn) return

    if (currCell.isMarked) {
        currCell.isMarked = false
        renderCell(currLocation, '')
        gGame.flagCount++
        document.querySelector('.flag-count').innerText = gGame.flagCount
        if (currCell.isMine) gGame.markedCount--
    } else {
        if (!gGame.flagCount) return
        currCell.isMarked = true
        renderCell(currLocation, FLAG)
        gGame.flagCount--
        document.querySelector('.flag-count').innerText = gGame.flagCount
        if (currCell.isMine) gGame.markedCount++
    }
    saveSteps(currLocation)
}

function onHintReveal(elHint) {
    if (!gGame.isOn) return
    gHintClicked = (gHintClicked) ? false : true
    elHint.classList.toggle('hint-clicked')
    elHintClicked = elHint
}

function handleHint(currLocation) {
    makeRevealArr(currLocation.i, currLocation.j)
    reveal()
    setTimeout(HideReveal, 1000)
    gHintClicked = false
    elHintClicked.style.visibility = 'hidden'
    return
}

// expanding neighbors when cicking on cell with no mines around
function expandNegs(cellI, cellJ) {
    for (let i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (let j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= gBoard.length) continue
            var currCell = gBoard[i][j]
            var currLocation = { i: i, j: j }
            if (currCell.isMine) continue
            if (!currCell.isShown) saveExpand.push(currLocation)
            else continue
            currCell.isShown = true
            renderCell(currLocation, currCell.minesAroundCount)
            document.querySelector(`.cell-${i}-${j}`).classList.add('clicked')
            if (currCell.minesAroundCount === 0) {
                expandNegs(currLocation.i, currLocation.j)
            }
        }
    }
}

// Changing lives when clicking a bomb
function changeLives(num) {
    document.querySelector(`.live${num}`).classList.add('lost-live')
}

// Manual mode
function onManualMode(elBtnManual) {
    if (gGame.isOn) return
    elBtnManual.classList.toggle('clicked')
    gManualMinesCount = gLevel.MINES
    gGame.manualMode = (gGame.manualMode) ? false : true
    showMinesLeft()
}

function handleManualMode(currLocation, currCell) {
    if (gGame.isOn) return
    currCell.isMine = true
    renderCell(currLocation, MINE)
    gManualMinesCount--
}

function showMinesLeft() {
    var elManualCount = document.querySelector('.manual-mode span')
    elManualCount.hidden = (gGame.manualMode) ? false : true
    elManualCount.innerText = gManualMinesCount + '💣'
    if (!gManualMinesCount) elManualCount.hidden = true
}

function onDarkMode() {
    var elCells = document.querySelectorAll('.cell')
    for (let i = 0; i < elCells.length; i++) {
        elCells[i].classList.toggle('dark-cell')
    }
    document.querySelector('.phone-game').classList.toggle('dark-phone')
    document.querySelector('.timer').classList.toggle('dark-color')
    document.querySelector('.camera').classList.toggle('dark-background')
    document.querySelector('.btn-dark').classList.toggle('dark-background')
    document.querySelector('.undo').classList.toggle('dark-background')
}

function handleMine(elCell, currLocation) {
    changeLives(gGame.lives)
    gGame.lives--
    gLevel.MINES--
    renderCell(currLocation, MINE)
    changeSmiley('bombed')
    elCell.classList.add('bombed')
    saveSteps(currLocation)
    makeSound('mine')
}

function handleExpend(currLocation) {
    saveExpand = []
    saveExpand.push(currLocation)
    expandNegs(currLocation.i, currLocation.j)
    prevSteps.push(saveExpand)
}