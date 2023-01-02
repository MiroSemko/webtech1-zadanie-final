// PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').then(registration => {
        console.log('Service worker registered:', registration);
    }).catch(error => {
        console.log('Service worker registration failed:', error);
    });
}
// PWA


// global constants and variables

const startEasy = document.getElementById("start-easy");
const startMedium = document.getElementById("start-medium");
const startHard = document.getElementById("start-hard");
const buttons = [startEasy, startMedium, startHard];
const questionText = document.getElementById("question");
const initPageDiv = document.querySelector(".controls-container");
const draggableDivs = document.querySelector(".answers-div");
const progressBar = document.querySelector('.progress-bar');
const answerArea = document.getElementById("answer-select");


// Sound effects used from Pixabay.com //
const correct = new Audio("./assets/cha-ching.mp3");
const incorrect = new Audio("./assets/failure.mp3");
const win = new Audio("./assets/success-fanfare.mp3");


let totalPoints = localStorage.getItem("body") === null ? 0 : localStorage.getItem("body");
let maxPoints;
let currentQuestionIndex;
let usedHelp = localStorage.getItem("jokerUsed") !== null;
let resume = false;
let currentDiff;
let questions = [];
let answerDivs;
let clickedElementIndex = null;
let dif;
let cur;
let q;
let maxTime;


const shakeDetector = new window.ShakeDetector();
const onShake = () => {
    console.log('shake!');
    if (!usedHelp) {
        document.getElementById("joker").style.backgroundColor = "#46484D";
        removeTwoOptions();
    }
};

const drop = (e) => {
    e.preventDefault();

    const id = e.dataTransfer.getData('text/plain');
    const piece = document.getElementById(id);

    dragAnswer(piece);

    clickedElementIndex = id.slice(-1);

    answerArea.classList.remove("droppable-hover");

}

const clickCheck = (e) => {
    clickedElementIndex = e.target.id.slice(-1);
    const selectedID = e.target.id;
    const piece = document.getElementById(selectedID);

    dragAnswer(piece);

}


/////////////////////////           CODE ON SCRIPT LOAD          ////////////////////////////////

if (localStorage.getItem("obtiaznost") != null) {
    resume = true;
    console.log(resume);
}

if (!resume) {
    console.log("new game");
    buttons.forEach((element) => {
        element.addEventListener("click", function () {
            document.getElementById("game-container").style.display = "block";
            initPageDiv.classList.add("hide");
            element.classList.add("hide");

            initializeShakeListener();

            fetch('./settings.json')
                .then((response) => response.json())
                .then((json) => loadSettings(json.difficulty, element.value));
        })
    });
} else {
    if (usedHelp) {
        document.getElementById("joker").style.backgroundColor = "#46484D";
    }
    console.log("continue");
    document.getElementById("game-container").style.display = "block";
    initPageDiv.classList.add("hide");
    buttons.forEach((element) => {
        element.classList.add("hide");
    });

    initializeShakeListener();

    fetch('./settings.json')
        .then((response) => response.json())
        .then((json) => loadSettings(json.difficulty, localStorage.getItem("obtiaznost")));
}

document.getElementById("joker").addEventListener("click", () => {
    if (!usedHelp) {
        localStorage.setItem("jokerUsed", "used");
        document.getElementById("joker").style.backgroundColor = "#46484D";
        removeTwoOptions();
    }
});

document.getElementById("next").addEventListener("click", function () {
    handleGame(maxTime);
});
document.getElementById("repeat").addEventListener("click", function () {
    loadGame(dif, cur);
});

document.getElementById("new-game").addEventListener("click", function () {
    usedHelp = false;
    open("./index.html", "_self");
});

document.getElementById("stop-game").addEventListener("click", function () {
    localStorage.clear();
    usedHelp = false;
    open("./index.html", "_self");
});


// function declarations

function dragEnter(event) {
    if (!event.target.classList.contains("dropped")) {
        event.target.classList.add("droppable-hover");
    }
}

function dragLeave(event) {
    if (!event.target.classList.contains("dropped")) {
        event.target.classList.remove("droppable-hover");
    }
}

function dragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.id);
}

function dragOver(e) {
    e.preventDefault();
}

function initializeShakeListener() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        // iOS 13+
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    shakeDetector.confirmPermissionGranted();
                    shakeDetector.start();
                }
            })
            .catch(console.error);
    } else {
        // devices other than iOS 13+
        shakeDetector.start();
    }
    window.addEventListener(ShakeDetector.SHAKE_EVENT, onShake);
}

function dragAnswer(draggedPiece) {
    if (answerArea.hasChildNodes()) {
        let existingTile = answerArea.firstElementChild;
        draggableDivs.appendChild(existingTile);
        existingTile.style.position = "absolute";
        existingTile.style.width = "45%";
        let existingTileID = Number(existingTile.id.slice(-1));
        if (existingTileID % 2 === 0) {
            existingTile.style.left = "0";
            if (existingTileID < 2) {
                existingTile.style.top = "57%";
            } else {
                existingTile.style.top = "75%";
            }
        } else {
            existingTile.style.right = "0";
            if (existingTileID < 2) {
                existingTile.style.top = "57%";
            } else {
                existingTile.style.top = "75%";
            }
        }
    }
    answerArea.appendChild(draggedPiece);
    draggedPiece.style.width = "98%";
    draggedPiece.style.position = "static";

    answerArea.classList.add("dropped");
}

async function loadSettings(diff, curr) {
    dif = diff;
    cur = curr;
    localStorage.setItem("obtiaznost", curr);
    await loadGame(diff, curr);
}

function loadQuestions() {
    if (localStorage.getItem("otazky") === null || totalPoints === 0) {
        questions = [];
        for (let i = 0; i < q.length; i++) {
            questions.push(q[i]);
        }
        localStorage.setItem("otazky", JSON.stringify(questions));
    } else {
        questions = JSON.parse(localStorage.getItem("otazky"));
    }
}

function loadGame(difficulties, current) {
    let t;
    switch (current) {
        case "lahka":
            currentDiff = 0;
            q = difficulties[0].lahka.questions;
            t = difficulties[0].lahka.timer;
            document.getElementById("difficulty").innerText = "Ľahká";
            break;
        case "stredna":
            currentDiff = 1;
            q = difficulties[1].stredna.questions;
            t = difficulties[1].stredna.timer;
            document.getElementById("difficulty").innerText = "Stredná";
            break;
        case "tazka":
            currentDiff = 2;
            q = difficulties[2].tazka.questions;
            t = difficulties[2].tazka.timer;
            document.getElementById("difficulty").innerText = "Ťažká";
            break;
    }
    loadQuestions();
    if (!resume) {
        localStorage.setItem("max_body", String(questions.length));
    }
    maxPoints = Number(localStorage.getItem("max_body"));

    answerDivs = document.querySelectorAll(".option");

    answerDivs.forEach((element) => {
        element.addEventListener("click", clickCheck);
        element.addEventListener("dragstart", dragStart);
    });

    answerArea.addEventListener("dragover", dragOver);
    answerArea.addEventListener("drop", drop);
    answerArea.addEventListener("dragenter", dragEnter);
    answerArea.addEventListener("dragleave", dragLeave);

    //start game
    handleGame(t);
}

function removeTwoOptions() {
    usedHelp = true;
    const correct = Number(questions[currentQuestionIndex].correct);
    let random1 = Math.floor(Math.random() * 4);
    let random2 = Math.floor(Math.random() * 4);
    while (correct === random1 || correct === random2 || random1 === random2) {
        if (correct === random1) {
            random1 = Math.floor(Math.random() * questions.length);
        }
        if (correct === random2) {
            random2 = Math.floor(Math.random() * questions.length);
        }
        if (random1 === random2) {
            random2 = Math.floor(Math.random() * questions.length);
        }
    }
    let id1 = "answer" + random1;
    let id2 = "answer" + random2;
    document.getElementById(id1).style.visibility = "hidden";
    document.getElementById(id2).style.visibility = "hidden";
}

function displayQuestion(i) {
    clickedElementIndex = null;

    if (answerArea.hasChildNodes()) {
        let existingTile = answerArea.firstChild;
        draggableDivs.appendChild(existingTile)
    }
    answerArea.style.display = "";

    document.getElementById("question").style.color = "black";
    document.getElementById("question").innerText = questions[i].question;

    let answers = ["answer0","answer1","answer2","answer3"]
    for (let ind = 0; ind < answers.length; ind++){
        document.getElementById(answers[ind]).style.backgroundColor = "#FDFDFD";
        document.getElementById(answers[ind]).innerText = questions[i].answers[ind];
        document.getElementById(answers[ind]).draggable = true;
        document.getElementById(answers[ind]).style.pointerEvents = "auto";
    }
}

function checkAnswer() {
    if (clickedElementIndex === questions[currentQuestionIndex].correct) {
        totalPoints++;
        document.getElementById("score").innerText = Number(totalPoints) + "/" + maxPoints;
        if (totalPoints === maxPoints) {
            console.log("win");
            questionText.innerText = "Výhra!!!";
            win.play();
            totalPoints = 0;
            document.getElementById("new-game").style.display = "";
            answerArea.style.display = "none";
            localStorage.clear();
            return;
        }
        questionText.innerText = "Správne";
        document.getElementById("answer" + String(clickedElementIndex)).style.backgroundColor = "lightgreen";
        answerArea.style.backgroundColor = "lightgreen !important";
        answerArea.classList.remove("dropped");
        answerArea.classList.add("correct");


        correct.play();
        questions.splice(currentQuestionIndex, 1);
    } else {
        questionText.innerText = "Nesprávne";
        incorrect.play();
        totalPoints = 0;
        loadQuestions();
        console.log(questions);
        document.getElementById("answer" + String(questions[currentQuestionIndex].correct)).style.backgroundColor = "lightgreen";
        if (clickedElementIndex != null) {
            console.log(clickedElementIndex)
            document.getElementById("answer" + clickedElementIndex).style.backgroundColor = "indianred";
            answerArea.classList.remove("dropped");
            answerArea.classList.add("incorrect");
        }
        document.getElementById("score").innerText = Number(totalPoints) + "/" + maxPoints;
    }
    localStorage.setItem("body", String(totalPoints));
    localStorage.setItem("otazky", JSON.stringify(questions));

    document.getElementById("next").style.display = "";

    let answers = ["answer0","answer1","answer2","answer3"]
    for (let ind = 0; ind < answers.length; ind++){
        document.getElementById(answers[ind]).draggable = false;
        document.getElementById(answers[ind]).style.pointerEvents = "none";
    }
}

function handleGame(timerCount) {
    answerDivs.forEach((element) => {
        element.style.visibility = "visible";
        element.style.position = "absolute";
        element.style.width = "45%";
        let elementID = Number(element.id.slice(-1));
        if (elementID % 2 === 0) {
            element.style.left = "0";
            if (elementID < 2) {
                element.style.top = "57%";
            } else {
                element.style.top = "75%";
            }
        } else {
            element.style.right = "0";
            if (elementID < 2) {
                element.style.top = "57%";
            } else {
                element.style.top = "75%";
            }
        }
    });

    document.getElementById("stop-game").style.display = "";
    document.getElementById("new-game").style.display = "none";
    document.getElementById("next").style.display = "none";
    document.getElementById("repeat").style.display = "none";
    maxTime = timerCount;
    progressBar.style.width = "100%";

    document.getElementById("score").innerText = Number(totalPoints) + "/" + maxPoints;

    currentQuestionIndex = Math.floor(Math.random() * questions.length);
    displayQuestion(currentQuestionIndex);
    // answerArea.classList.remove("dropped");
    answerArea.classList.remove("correct");
    answerArea.classList.remove("incorrect");
    clickedElementIndex = null;
    const countdown = setInterval(() => {
        timerCount--;
        progressBar.style.width = (timerCount / maxTime) * 100 + '%';

        if (timerCount === 0) {
            clearInterval(countdown);
            checkAnswer();
        }
    }, 1000);
}


function displayInstructions(){
    document.getElementById("instructions").style.display = "block";
    document.getElementById("instruction-button").style.display = "none";
}
