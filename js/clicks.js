'use strict'

var gHintClicked = false
var elHintClicked
var gManualMinesCount = 0
var gRevealed = []
var prevSteps = []
var saveExpand = []

// Getting the event from HandleKey and handling left or right
function cellClicked(event, elCell, cellI, cellJ) {
    var currLocation = { i: cellI, j: cellJ }
    var currCell = gBoard[cellI][cellJ]
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
        if (!gGame.manualMode) {
            addMines(currLocation)
            setMinesNegsCount(gBoard)
            saveSteps(currLocation)
        }
        timer()
        renderCell(currLocation, currCell.minesAroundCount)
        elCell.classList.add('clicked')
        gGame.isOn = true
        currCell.isShown = true
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

        changeLives(gGame.lives)
        gGame.lives--
        gLevel.MINES--
        renderCell(currLocation, MINE)
        changeSmiley('bombed')
        elCell.classList.add('bombed')
        saveSteps(currLocation)
    } else {
        if (!currCell.minesAroundCount) {
            saveExpand = []
            saveExpand.push(currLocation)
            expandNegs(currLocation.i, currLocation.j)
            prevSteps.push(saveExpand)
        }
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
        if (currCell.isMine) gGame.markedCount--
    } else {
        currCell.isMarked = true
        renderCell(currLocation, FLAG)
        if (currCell.isMine) gGame.markedCount++
    }
    saveSteps(currLocation)
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
            else {
                continue
            }
            currCell.isShown = true
            renderCell(currLocation, currCell.minesAroundCount)
            document.querySelector(`.cell-${i}-${j}`).classList.add('clicked')
            if (currCell.minesAroundCount === 0) {
                expandNegs(currLocation.i, currLocation.j)
            }
        }
    }
}

// updating the hint if clicked or not
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

// pick the cells that needs to be shown
function makeRevealArr(cellI, cellJ) {
    gRevealed = []
    for (let i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (let j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue
            var currCell = gBoard[i][j]
            var currLocation = { i: i, j: j }
            if (currCell.isShown) continue
            if (currCell.isMine) {
                var cellContent = MINE
                gRevealed.push({ location: currLocation, content: cellContent })
            } else {
                var cellContent = currCell.minesAroundCount
                gRevealed.push({ location: currLocation, content: cellContent })
            }
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

// Changing lives when clicking a bomb
function changeLives(num) {
    document.querySelector(`.live${num}`).classList.add('lost-live')
}

function onSafeClick(elBtnSafe) {
    if (!gGame.safeCount) return
    if (!gGame.isOn) return
    console.log('elBtnSafe', elBtnSafe)
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

function getUnrevealedLocation(board) {
    var res = []
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (!board[i][j].isMine && !board[i][j].isShown) res.push({ i: i, j: j })
        }
    }
    return res[getRandomInt(0, res.length)]
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

// Save steps to undo
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
    console.log('currCell', currCell)
    currCell.isShown = false
    renderCell(step[i], '')
    var className = getClassName(step[i])
    var elCell = document.querySelector(className)
    if (currCell.isMine) elCell.classList.remove('bombed')
    else elCell.classList.remove('clicked')
}

function onDarkMode() {
    var elCells = document.querySelectorAll('.cell')
    for (let i = 0; i < elCells.length; i++) {
        elCells[i].classList.toggle('dark-cell')
    }
    document.querySelector('.phone').classList.toggle('dark-phone')
    document.querySelector('.timer').classList.toggle('dark-color')
    document.querySelector('.camera').classList.toggle('dark-background')
    document.querySelector('.btn-dark').classList.toggle('dark-background')
    document.querySelector('.undo').classList.toggle('dark-background')
}