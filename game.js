// PWA
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('service-worker.js').then(registration => {
//             console.log('Service worker registered:', registration);
//         }).catch(error => {
//             console.log('Service worker registration failed:', error);
//         });
//     });
// }
// /PWA


//Initial References
// let draggableObjects;
// let dropPoints;

const startEasy = document.getElementById("start-easy");
const startMedium = document.getElementById("start-medium");
const startHard = document.getElementById("start-hard");
const buttons = [startEasy, startMedium, startHard];
let totalPoints = 0;
let maxPoints;

// const result = document.getElementById("result");
const controls = document.querySelector(".controls-container");
const dragContainer = document.querySelector(".answers-div");
const dropContainer = document.querySelector(".answer");


let answerObjects;
let currentDiff;

let deviceType = "";
let initialX = 0,
    initialY = 0;
let currentElement = "";
let moveElement = false;

//Detect touch device
const isTouchDevice = () => {
    try {
        //We try to create Touch Event (It would fail for desktops and throw error)
        document.createEvent("TouchEvent");
        deviceType = "touch";
        return true;
    } catch (e) {
        deviceType = "mouse";
        return false;
    }
};

// //Drag & Drop Functions
// function dragStart(e) {
//     if (isTouchDevice()) {
//         initialX = e.touches[0].clientX;
//         initialY = e.touches[0].clientY;
//         //Start movement for touch
//         moveElement = true;
//         currentElement = e.target;
//     } else {
//         //For non touch devices set data to be transfered
//         e.dataTransfer.setData("text/plain", e.target.id);
//         // console.log(e.getData("text"));
//         // window.console.log(e.getData("text"));
//     }
// }
//Drag & Drop Functions
function dragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.id);
}

//Events fired on the drop target
function dragOver(e) {
    e.preventDefault();
}

//For touchscreen movement
// const touchMove = (e) => {
//     if (moveElement) {
//         e.preventDefault();
//         let newX = e.touches[0].clientX;
//         let newY = e.touches[0].clientY;
//         let currentSelectedElement = document.getElementById(e.target.id);
//         currentSelectedElement.parentElement.style.top =
//             currentSelectedElement.parentElement.offsetTop - (initialY - newY) + "px";
//         currentSelectedElement.parentElement.style.left =
//             currentSelectedElement.parentElement.offsetLeft -
//             (initialX - newX) +
//             "px";
//         initialX = newX;
//         initialY - newY;
//     }
// };


const drop = (e) => {
    e.preventDefault();

    const id = e.dataTransfer.getData('text/plain');
    const piece = document.getElementById(id);


    // if(clickedElementIndex != null){
    //     let existingTile = e.target.querySelector(`[id="answer${id}"]`);
    //     console.log(e.target)
    //     // existingTile.remove();
    //     dragContainer.appendChild(e.target);
    // }


    let answerarea = document.getElementById("answer-select");

    if (answerarea.hasChildNodes()) {
        let existingTile = answerarea.firstChild;
        dragContainer.appendChild(existingTile)
        // console.log(existingTile);
    }


    answerarea.appendChild(piece);
    // piece.classList.add("dragged")


    // const existingTile = e.target.querySelector(`[id="answer${id}"]`);
    // console.log(existingTile)
    // if (existingTile) {
    //     // Remove the existing tile from the drop zone and reset its position
    //     existingTile.remove();
    //     dragContainer.appendChild(existingTile);
    //     // existingTile.style.bottom = '0';
    // }
    // else {
    //     e.target.appendChild(piece);
    // }
    clickedElementIndex = id.slice(-1);
}

// const drop = (e) => {
//     e.preventDefault();
//     //For touch screen
//     // if (isTouchDevice()) {
//     //     moveElement = false;
//     //     //Select country name div using the custom attribute
//     //     const currentDrop = document.querySelector(`div[data-id='${e.target.id}']`);
//     //     //Get boundaries of div
//     //     const currentDropBound = currentDrop.getBoundingClientRect();
//     //     //if the position of flag falls inside the bounds of the countru name
//     //     if (
//     //         initialX >= currentDropBound.left &&
//     //         initialX <= currentDropBound.right &&
//     //         initialY >= currentDropBound.top &&
//     //         initialY <= currentDropBound.bottom
//     //     ) {
//     //         currentDrop.classList.add("dropped");
//     //         //hide actual image
//     //         currentElement.classList.add("hide");
//     //         currentDrop.innerHTML = ``;
//     //         //Insert new img element
//     //         currentDrop.insertAdjacentHTML(
//     //             "afterbegin",
//     //             `<img src= "${currentElement.id}.png">`
//     //         );
//     //         count += 1;
//     //     }
//     // } else {
//         //Access data
//         const draggedElementData = e.dataTransfer.getData("text/plain");
//         //Get custom attribute value
//         const droppableElementData = e.target.getAttribute("data-id");
//         if (draggedElementData === droppableElementData) {
//             const draggedElement = document.getElementById(draggedElementData);
//             //dropped class
//             e.target.classList.add("dropped");
//             //hide current img
//             draggedElement.classList.add("hide");
//             //draggable set to false
//             draggedElement.setAttribute("draggable", "false");
//             e.target.innerHTML = ``;
//             //insert new img
//             e.target.insertAdjacentHTML(
//                 "afterbegin",
//                 `<img src="${draggedElementData}.png">`
//             );
//             count += 1;
//         }
//     // }
// };


// const shakeDetector = new ShakeDetector();
const shakeDetector = new window.ShakeDetector();
const onShake = () => {
    console.log('shake!');
    document.getElementById("difficulty").style.color = "green";

};



buttons.forEach((element) => {
    element.addEventListener("click", function () {
        currentElement = "";
        document.getElementById("game-container").style.display = "block";

        controls.classList.add("hide");
        element.classList.add("hide");

        // shake detection
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            // for iOS 13+
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        // window.addEventListener('devicemotion', () => {});

                        shakeDetector.confirmPermissionGranted();
                        shakeDetector.start();
                    }
                })
                .catch(console.error);
        } else {
            // handle regular non iOS 13+ devices
            shakeDetector.start();
        }
        window.addEventListener(ShakeDetector.SHAKE_EVENT, onShake);
        // /shake detection


        fetch('./settings.json')
            .then((response) => response.json())
            .then((json) => loadSettings(json.difficulty, element.value));
    })
});

var clickedElementIndex = null;

const clickCheck = (e) => {
    clickedElementIndex = e.target.id.slice(-1);
}


var questions = [];

var dif;
var cur;
async function loadSettings(diff, curr){
    dif = diff;
    cur = curr;
    loadGame(dif,cur);
}

async function loadGame(difficulties, current) {
    currentDiff = current;
    let q;
    let t;
    switch (current) {
        case "lahka":
            q = difficulties[0].lahka.questions;
            t = difficulties[0].lahka.timer;
            document.getElementById("difficulty").innerText = "Ľahká";
            break;
        case "stredna":
            q = difficulties[1].stredna.questions;
            t = difficulties[1].stredna.timer;
            document.getElementById("difficulty").innerText = "Stredná";
            break;
        case "tazka":
            q = difficulties[2].tazka.questions;
            t = difficulties[2].tazka.timer;
            document.getElementById("difficulty").innerText = "Ťažká";
            break;
    }
    for (let i = 0; i < q.length; i++) {
        questions.push(q[i]);
    }
    maxPoints = questions.length;

    answerObjects = document.querySelectorAll(".option");

    answerObjects.forEach((element) => {
        // element.addEventListener("click", clickCheck);

        element.addEventListener("dragstart", dragStart);
        //for touch screen
        // element.addEventListener("touchstart", dragStart);
        // element.addEventListener("touchend", drop);
        // element.addEventListener("touchmove", touchMove);
    });


    document.getElementById("answer-select").addEventListener("dragover", dragOver);
    document.getElementById("answer-select").addEventListener("drop", drop);

    //start game
    handleGame(t);
}


const progressBar = document.querySelector('.progress-bar');

function displayQuestion(i) {
    let answerarea = document.getElementById("answer-select");

    if (answerarea.hasChildNodes()) {
        let existingTile = answerarea.firstChild;
        dragContainer.appendChild(existingTile)
    }

    document.getElementById("question").style.color = "black";
    document.getElementById("question").innerText = questions[i].question;
    document.getElementById("answer0").innerText = questions[i].answers[0];
    document.getElementById("answer1").innerText = questions[i].answers[1];
    document.getElementById("answer2").innerText = questions[i].answers[2];
    document.getElementById("answer3").innerText = questions[i].answers[3];
}


const questionArea = document.getElementById("question")
function checkAnswer(i) {
    // console.log(questions)
    // console.log(i)
    // console.log(questions[i]);
    // console.log(questions[i].correct);
    if (clickedElementIndex === questions[i].correct) { //if last char of ID of selected element === questions[i].correct
        totalPoints++;
        document.getElementById("score").innerText = totalPoints + "/5";
        if(totalPoints===maxPoints){
            console.log("win");
            questionArea.innerText = "Vyhra!!!";
            totalPoints = 0
            document.getElementById("new-game").style.display = "";
            return;
        }
        // console.log("correct");
        questionArea.innerText = "Spravne";
    } else { //if wrong
        // console.log("wrong");
        questionArea.innerText = "Nespravne";
        totalPoints = 0;
        document.getElementById("score").innerText = totalPoints + "/5";
    }
    questions.splice(i, 1);
    if (questions.length === 0) {
        document.getElementById("repeat").style.display = "";
        return;
    }
    document.getElementById("next").style.display = "";
}

var maxTime;

document.getElementById("next").addEventListener("click", function () {
    handleGame(maxTime);
})
document.getElementById("repeat").addEventListener("click", function () {
    loadGame(dif,cur);
})

document.getElementById("new-game").addEventListener("click", function () {
    open("./index.html", "_self");
})

document.getElementById("help").addEventListener("click", function () {
    console.log("help")
})

function handleGame(timerCount) {
    //generate all Qs from set difficulty also cache, if cached or empty dont generate
    document.getElementById("new-game").style.display = "none";
    document.getElementById("next").style.display = "none";
    document.getElementById("repeat").style.display = "none";
    maxTime = timerCount;
    progressBar.style.width = "100%";

    document.getElementById("score").innerText = totalPoints + "/5";


    let i = Math.floor(Math.random() * questions.length);
    displayQuestion(i);
    const countdown = setInterval(() => {
        timerCount--;
        progressBar.style.width = (timerCount / maxTime) * 100 + '%';

        if (timerCount === 0) {
            clearInterval(countdown);
            checkAnswer(i);
        }
    }, 1000);
}

