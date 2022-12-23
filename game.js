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
let draggableObjects;
let dropPoints;
const startEasy = document.getElementById("start-easy");
const startMedium = document.getElementById("start-medium");
const startHard = document.getElementById("start-hard");
const buttons = [startEasy, startMedium, startHard];
const result = document.getElementById("result");
const controls = document.querySelector(".controls-container");
const dragContainer = document.querySelector(".draggable-objects");
const dropContainer = document.querySelector(".drop-points");


let answerObjects;
let currentDiff;


const data = [
    "belgium",
    "bhutan",
    "brazil",
    "china",
    "cuba",
    "ecuador",
    "georgia",
    "germany",
    "hong-kong",
    "india",
    "iran",
    "myanmar",
    "norway",
    "spain",
    "sri-lanka",
    "sweden",
    "switzerland",
    "united-states",
    "uruguay",
    "wales",
];

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

let count = 0;

//Random value from Array
const randomValueGenerator = () => {
    return data[Math.floor(Math.random() * data.length)];
};

//Win Game Display
const stopGame = () => {
    controls.classList.remove("hide");
    startButton.classList.remove("hide");
};

//Drag & Drop Functions
function dragStart(e) {
    if (isTouchDevice()) {
        initialX = e.touches[0].clientX;
        initialY = e.touches[0].clientY;
        //Start movement for touch
        moveElement = true;
        currentElement = e.target;
    } else {
        //For non touch devices set data to be transfered
        e.dataTransfer.setData("text", e.target.id);
    }
}

//Events fired on the drop target
function dragOver(e) {
    e.preventDefault();
}

//For touchscreen movement
const touchMove = (e) => {
    if (moveElement) {
        e.preventDefault();
        let newX = e.touches[0].clientX;
        let newY = e.touches[0].clientY;
        let currentSelectedElement = document.getElementById(e.target.id);
        currentSelectedElement.parentElement.style.top =
            currentSelectedElement.parentElement.offsetTop - (initialY - newY) + "px";
        currentSelectedElement.parentElement.style.left =
            currentSelectedElement.parentElement.offsetLeft -
            (initialX - newX) +
            "px";
        initialX = newX;
        initialY - newY;
    }
};

const drop = (e) => {
    e.preventDefault();
    //For touch screen
    if (isTouchDevice()) {
        moveElement = false;
        //Select country name div using the custom attribute
        const currentDrop = document.querySelector(`div[data-id='${e.target.id}']`);
        //Get boundaries of div
        const currentDropBound = currentDrop.getBoundingClientRect();
        //if the position of flag falls inside the bounds of the countru name
        if (
            initialX >= currentDropBound.left &&
            initialX <= currentDropBound.right &&
            initialY >= currentDropBound.top &&
            initialY <= currentDropBound.bottom
        ) {
            currentDrop.classList.add("dropped");
            //hide actual image
            currentElement.classList.add("hide");
            currentDrop.innerHTML = ``;
            //Insert new img element
            currentDrop.insertAdjacentHTML(
                "afterbegin",
                `<img src= "${currentElement.id}.png">`
            );
            count += 1;
        }
    } else {
        //Access data
        const draggedElementData = e.dataTransfer.getData("text");
        //Get custom attribute value
        const droppableElementData = e.target.getAttribute("data-id");
        if (draggedElementData === droppableElementData) {
            const draggedElement = document.getElementById(draggedElementData);
            //dropped class
            e.target.classList.add("dropped");
            //hide current img
            draggedElement.classList.add("hide");
            //draggable set to false
            draggedElement.setAttribute("draggable", "false");
            e.target.innerHTML = ``;
            //insert new img
            e.target.insertAdjacentHTML(
                "afterbegin",
                `<img src="${draggedElementData}.png">`
            );
            count += 1;
        }
    }
    //Win
    if (count == 3) {
        result.innerText = `You Won!`;
        stopGame();
    }
};

//Creates flags and countries
// const creator = () => {
//     dragContainer.innerHTML = "";
//     dropContainer.innerHTML = "";
//     let randomData = [];
//     //for string random values in array
//     for (let i = 1; i <= 3; i++) {
//         let randomValue = randomValueGenerator();
//         if (!randomData.includes(randomValue)) {
//             randomData.push(randomValue);
//         } else {
//             //If value already exists then decrement i by 1
//             i -= 1;
//         }
//     }
//     for (let i of randomData) {
//         const flagDiv = document.createElement("div");
//         flagDiv.classList.add("draggable-image");
//         flagDiv.setAttribute("draggable", true);
//         if (isTouchDevice()) {
//             flagDiv.style.position = "absolute";
//         }
//         flagDiv.innerHTML = `<img src="${i}.png" id="${i}">`;
//         dragContainer.appendChild(flagDiv);
//     }
//     //Sort the array randomly before creating country divs
//     randomData = randomData.sort(() => 0.5 - Math.random());
//     for (let i of randomData) {
//         const countryDiv = document.createElement("div");
//         countryDiv.innerHTML = `<div class='countries' data-id='${i}'>
//     ${i.charAt(0).toUpperCase() + i.slice(1).replace("-", " ")}
//     </div>
//     `;
//         dropContainer.appendChild(countryDiv);
//     }
// };

buttons.forEach((element) => {
    element.addEventListener("click", function () {
        currentElement = "";
        document.getElementById("game-container").style.display = "block";
        controls.classList.add("hide");
        element.classList.add("hide");

        //This will wait for creator to create the images and then move forward
        // await creator();

        fetch('./settings.json')
            .then((response) => response.json())
            .then((json) => loadGame(json.difficulty, element.value));
        document.getElementById("info").innerHTML = element.innerText;
        document.getElementById("info").value = element.value;
    })
});

var clickedElementIndex;

const clickCheck = (e) => {
    clickedElementIndex = e.target.id.slice(-1);
    console.log(clickedElementIndex);
}


var questions = [];

async function loadGame(difficulties, current) {
    console.log(current);
    currentDiff = current;
    console.log(currentDiff);
    let q;
    let t;
    switch (current) {
        case "lahka":
            q = difficulties[0].lahka.questions;
            t = difficulties[0].lahka.timer;
            break;
        case "stredna":
            q = difficulties[1].stredna.questions;
            t = difficulties[1].stredna.timer;
            break;
        case "tazka":
            q = difficulties[2].tazka.questions;
            t = difficulties[2].tazka.timer;
            break;
    }
    for (let i = 0; i < q.length; i++) {
        questions.push(q[i]);
    }

    // count = 0;

    answerObjects = document.querySelectorAll(".option");

    // answerObjects.forEach((element) => {
    //     element.addEventListener("click", clickCheck);
    // })

    answerObjects.forEach((element) => {
        element.addEventListener("click", clickCheck);

        // element.addEventListener("dragstart", dragStart);
        // //for touch screen
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

// let timerCount = 60;
//
// // call this questions.length times
// const countdown = setInterval(() => {
//     timerCount--;
//     progressBar.style.width = (timerCount / 60) * 100 + '%';
//
//     if (timerCount === 0) {
//         clearInterval(countdown);
//
//         // check if correct answer
//
//     }
// }, 1000);

function displayQuestion(i) {
    document.getElementById("question").style.color = "black";
    document.getElementById("question").innerText = questions[i].question;
    document.getElementById("answer0").innerText = questions[i].answers[0];
    document.getElementById("answer1").innerText = questions[i].answers[1];
    document.getElementById("answer2").innerText = questions[i].answers[2];
    document.getElementById("answer3").innerText = questions[i].answers[3];
}

function checkAnswer(i) {
    if (clickedElementIndex === questions[i].correct) { //if last char of ID of selected element === questions[i].correct
        console.log("correct");
    } else { //if wrong
        console.log("wrong")
    }
}

function handleGame(timerCount) {
    //generate all Qs from set difficulty also cache, if cached or empty dont generate
    maxTime = timerCount;
    progressBar.style.width = "100%";

    let i = Math.floor(Math.random() * questions.length);
    displayQuestion(i);
    const countdown = setInterval(() => {
        timerCount--;
        progressBar.style.width = (timerCount / maxTime) * 100 + '%';

        if (timerCount === 0) {
            clearInterval(countdown);
            checkAnswer(i);
            // check if correct answer and ++ correct answers

        }
    }, 1000);
    questions.splice(i, 1);

    // setInterval(function () {
    //     console.log(questions)
    //     console.log("setting Qs");
    //     //let i from questions.length() from cached
    //
    //     let i = Math.floor(Math.random() * questions.length);
    //     displayQuestion(i);
    //
    //
    // }, timerCount*1000)
}

//Start Game
// startEasy.addEventListener(
//     "click", startGame
// );
// startMedium.addEventListener(
//     "click", startGame
// );
// startHard.addEventListener(
//     "click", startGame
// );

// startButtons = document.querySelectorAll(".start");
//
// //Events
// startButtons.forEach((element) => {
//     element.addEventListener("click", (startGame = async () => {
//         currentElement = "";
//         controls.classList.add("hide");
//         startButton.classList.add("hide");
//         //This will wait for creator to create the images and then move forward
//         // await creator();
//
//         fetch('./settings.json')
//             .then((response) => response.json())
//             .then((json) => loadGame(json.difficulty,event.srcElement.innerHTML.toLowerCase()));
//
//
//
//         count = 0;
//         dropPoints = document.querySelectorAll(".countries");
//         draggableObjects = document.querySelectorAll(".draggable-image");
//         //Events
//         draggableObjects.forEach((element) => {
//             element.addEventListener("dragstart", dragStart);
//             //for touch screen
//             element.addEventListener("touchstart", dragStart);
//             element.addEventListener("touchend", drop);
//             element.addEventListener("touchmove", touchMove);
//         });
//         dropPoints.forEach((element) => {
//             element.addEventListener("dragover", dragOver);
//             element.addEventListener("drop", drop);
//         });
//     })};



