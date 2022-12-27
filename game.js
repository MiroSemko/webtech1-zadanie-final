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
let currentQuestionIndex;

// const result = document.getElementById("result");
const controls = document.querySelector(".controls-container");
const dragContainer = document.querySelector(".answers-div");


let answerObjects;
let currentDiff;

// let deviceType = "";
// let initialX = 0,
//     initialY = 0;
let currentElement = "";
// let moveElement = false;

//Detect touch device
// const isTouchDevice = () => {
//     try {
//         //We try to create Touch Event (It would fail for desktops and throw error)
//         document.createEvent("TouchEvent");
//         deviceType = "touch";
//         return true;
//     } catch (e) {
//         deviceType = "mouse";
//         return false;
//     }
// };

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

    let answerArea = document.getElementById("answer-select");

    if (answerArea.hasChildNodes()) {
        let existingTile = answerArea.firstElementChild;
        dragContainer.appendChild(existingTile);
        existingTile.style.position = "absolute";
        existingTile.style.width = "33%";
        let existingTileID = Number(existingTile.id.slice(-1));
        if (existingTileID % 2 === 0) {
            existingTile.style.left = "10%";
            if (existingTileID < 2) {
                existingTile.style.top = "50%";
            } else {
                existingTile.style.top = "70%";
            }
        } else {
            existingTile.style.right = "10%";
            if (existingTileID < 2) {
                existingTile.style.top = "50%";
            } else {
                existingTile.style.top = "70%";
            }
        }
    }

    answerArea.appendChild(piece);
    piece.style.width = "98%";
    piece.style.position = "static";

    clickedElementIndex = id.slice(-1);
}


const shakeDetector = new window.ShakeDetector();
const onShake = () => {
    console.log('shake!');
    document.getElementById("difficulty").style.color = "green";
    removeTwoOptions();
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
        // shake detection

        fetch('./settings.json')
            .then((response) => response.json())
            .then((json) => loadSettings(json.difficulty, element.value));
    })
});

let clickedElementIndex = null;

const clickCheck = (e) => {
    clickedElementIndex = e.target.id.slice(-1);
    const selectedID = e.target.id;
    const piece = document.getElementById(selectedID);
    let answerArea = document.getElementById("answer-select");
    if (answerArea.hasChildNodes()) {
        let existingTile = answerArea.firstElementChild;
        dragContainer.appendChild(existingTile);
        existingTile.style.position = "absolute";
        existingTile.style.width = "33%";
        let existingTileID = Number(existingTile.id.slice(-1));
        if (existingTileID % 2 === 0) {
            existingTile.style.left = "10%";
            if (existingTileID < 2) {
                existingTile.style.top = "50%";
            } else {
                existingTile.style.top = "70%";
            }
        } else {
            existingTile.style.right = "10%";
            if (existingTileID < 2) {
                existingTile.style.top = "50%";
            } else {
                existingTile.style.top = "70%";
            }
        }
    }
    answerArea.appendChild(piece);
    piece.style.width = "98%";
    piece.style.position = "static";
}


let questions = [];

let dif;
let cur;
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
        element.addEventListener("click", clickCheck);
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

function removeTwoOptions() {
    const correct = Number(questions[currentQuestionIndex].correct);
    let random1 = Math.floor(Math.random() * questions.length);
    let random2 = Math.floor(Math.random() * questions.length);
    while (correct === random1 || correct === random2) {
        if (correct === random1) {
            random1 = Math.floor(Math.random() * questions.length);
        }
        if (correct === random2) {
            random2 = Math.floor(Math.random() * questions.length);
        }
    }

}

const progressBar = document.querySelector('.progress-bar');

function displayQuestion(i) {
    let answerArea = document.getElementById("answer-select");

    if (answerArea.hasChildNodes()) {
        let existingTile = answerArea.firstChild;
        dragContainer.appendChild(existingTile)
    }

    document.getElementById("question").style.color = "black";
    document.getElementById("question").innerText = questions[i].question;
    document.getElementById("answer0").innerText = questions[i].answers[0];
    document.getElementById("answer1").innerText = questions[i].answers[1];
    document.getElementById("answer2").innerText = questions[i].answers[2];
    document.getElementById("answer3").innerText = questions[i].answers[3];
}


const questionArea = document.getElementById("question");
// const answerArea = document.getElementById("answer-area")
function checkAnswer() {
    if (clickedElementIndex === questions[currentQuestionIndex].correct) { //if last char of ID of selected element === questions[i].correct
        totalPoints++;
        document.getElementById("score").innerText = totalPoints + "/5";
        if(totalPoints===maxPoints){
            console.log("win");
            questionArea.innerText = "Vyhra!!!";
            totalPoints = 0
            document.getElementById("new-game").style.display = "";
            return;
        }
        questionArea.innerText = "Spravne";
    } else {
        questionArea.innerText = "Nespravne";
        totalPoints = 0;
        document.getElementById("score").innerText = totalPoints + "/5";
    }
    questions.splice(currentQuestionIndex, 1);
    if (questions.length === 0) {
        document.getElementById("repeat").style.display = "";
        return;
    }
    document.getElementById("next").style.display = "";
}

let maxTime;

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
    answerObjects.forEach((element) => {
        element.style.position = "absolute";
        element.style.width = "33%";
        let elementID = Number(element.id.slice(-1));
        if (elementID % 2 === 0) {
            element.style.left = "10%";
            if (elementID < 2) {
                element.style.top = "50%";
            } else {
                element.style.top = "70%";
            }
        } else {
            element.style.right = "10%";
            if (elementID < 2) {
                element.style.top = "50%";
            } else {
                element.style.top = "70%";
            }
        }
    });
    //generate all Qs from set difficulty also cache, if cached or empty don't generate
    document.getElementById("new-game").style.display = "none";
    document.getElementById("next").style.display = "none";
    document.getElementById("repeat").style.display = "none";
    maxTime = timerCount;
    progressBar.style.width = "100%";

    document.getElementById("score").innerText = totalPoints + "/5";

    currentQuestionIndex = Math.floor(Math.random() * questions.length);
    displayQuestion(currentQuestionIndex);
    const countdown = setInterval(() => {
        timerCount--;
        progressBar.style.width = (timerCount / maxTime) * 100 + '%';

        if (timerCount === 0) {
            clearInterval(countdown);
            checkAnswer();
        }
    }, 1000);
}

