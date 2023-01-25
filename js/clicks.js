'use strict'

var gHintClicked = false
var gRevealed = []

function onCellClicked(event, elCell, cellI, cellJ) {
    var currLocation = { i: cellI, j: cellJ }
    var currCell = gBoard[cellI][cellJ]
    if (event === 'right') handleRightKlick(currLocation, currCell)
    else handleLeftKlick(elCell, currLocation, currCell)
}


function handleLeftKlick(elCell, currLocation, currCell) {

    if (gGame.shownCount === 0 && !gGame.isOn) {
        timer()
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

    if (!gGame.isOn) return
    if (currCell.isMarked) return
    if (currCell.isShown) return

    if(gHintClicked) {
        makeRevealArr(currLocation.i , currLocation.j)
        reveal()
        setTimeout(HideReveal , 1000)
        return
    }

    currCell.isShown = true

    if (currCell.isMine) {
        changeLives(gGame.lives)
        gGame.shownCount++
        gGame.lives--
        renderCell(currLocation, MINE)
        changeSmiley('bombed')
        checkGameOver()
        elCell.classList.add('bombed')
    } else {
        if (currCell.minesAroundCount === 0) {
            expandNegs(currLocation.i, currLocation.j)
        }
        gGame.shownCount++
        renderCell(currLocation, currCell.minesAroundCount)
        changeSmiley('saved')
        checkGameOver()
        elCell.classList.add('clicked')
    }
    console.log('gGame.shownCount', gGame.shownCount)
}

function handleRightKlick(currLocation, currCell) {
    if (!gGame.isOn) return
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

function expandNegs(cellI, cellJ) {
    for (let i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (let j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= gBoard.length) continue
            var currCell = gBoard[i][j]
            var currLocation = { i: i, j: j }
            if (currCell.isMine) continue
            currCell.isShown = true
            renderCell(currLocation, currCell.minesAroundCount)
            gGame.shownCount++
            document.querySelector(`.cell-${i}-${j}`).classList.add('clicked')
        }
    }
}

function changeLives(num) {
    document.querySelector(`.live${num}`).classList.add('lost-live')
}

function onHintReveal() {
    gHintClicked = (gHintClicked) ? false : true
}

function makeRevealArr(cellI , cellJ) {
    gRevealed = []
    for (let i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (let j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue
            var currCell = gBoard[i][j]
            var currLocation = { i: i, j: j }
            if(currCell.isShown) continue
            if (currCell.isMine) {
                var cellContent = MINE
                gRevealed.push({location: currLocation , content: cellContent})
            } else {
                var cellContent = currCell.minesAroundCount
                gRevealed.push({location: currLocation , content: cellContent})
            }
        }
    }
}

function reveal() {
    for (let i = 0; i < gRevealed.length; i++) {
        renderCell(gRevealed[i].location , gRevealed[i].content)
        document.querySelector(`.cell-${gRevealed[i].location.i}-${gRevealed[i].location.j}`).classList.add('clicked')
    }
}

function HideReveal() {
    for (let i = 0; i < gRevealed.length; i++) {
        renderCell(gRevealed[i].location , '')
        document.querySelector(`.cell-${gRevealed[i].location.i}-${gRevealed[i].location.j}`).classList.remove('clicked')
    }
}