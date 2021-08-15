const SERVER_URL_QUIZZES = "https://mock-api.bootcamp.respondeai.com.br/api/v3/buzzquizz/quizzes";

const main = document.querySelector(".quizz-list");
const page = document.querySelector(".quizz-page");
const creation = document.querySelector(".quizz-creation");
const loadingPage = document.querySelector(".loading-page");

let userQuizzes = [];
let quizzToDeletePosition;
let quizzToDeleteId;
let quizzToDeleteKey;
let userQuizzesIds = [];
let serverQuizzesIds = [];
let userQuizzesIdsNotInServer = [];
let quizz = {
	title: "",
	image: "",
	questions: [],
    levels: []
}

function loadUserQuizzes() {
    const storagedQuizzes = localStorage.getItem("list");
    const userQuizzesForPrinting = JSON.parse(storagedQuizzes);
    if (userQuizzesForPrinting === null) {
        return;
    }
    userQuizzes = userQuizzesForPrinting;

    for (let i = 0; i < userQuizzes.length; i++) {
        userQuizzesIds.push(userQuizzes[i].data.id);
    }
    console.log(userQuizzes);
    console.log("Os Ids dos seus quizzes são: " + userQuizzesIds);
    isMyQuizzStillInServer();
}

function isMyQuizzStillInServer () {

    let allQuizzes = axios.get(SERVER_URL_QUIZZES);
    loadingPage.classList.remove("hide");
    allQuizzes.then(compareQuizzesToServer);
    allQuizzes.catch(function (error) {console.log(error)});
}

function compareQuizzesToServer (response) {
    loadingPage.classList.add("hide");
    for (let i = 0; i < response.data.length; i++) {
        serverQuizzesIds.push(response.data[i].id);
    }

    for (let i = 0; i < userQuizzesIds.length; i++) {
        if (serverQuizzesIds.includes(userQuizzesIds[i])) {
            continue;
        } else {
            console.log(userQuizzesIds[i] + " não está no servidor");
            userQuizzesIdsNotInServer.push(userQuizzesIds[i]);
        }   
    }
    
    renderUserQuizzes(userQuizzes);
}

let details = document.querySelector(".quizzes-not-in-server ul");

function confirmDelete(selectedQuizz) {
    quizzToDeleteId = Number(selectedQuizz.id);
    console.log(quizzToDeleteId);
    console.log(SERVER_URL_QUIZZES + `/${quizzToDeleteId}`);
    console.log(userQuizzes[1].data.key);
    for (let i=0 ; i<userQuizzes.length ; i++) {
        if (quizzToDeleteId === userQuizzes[i].data.id) {
            quizzToDeleteKey = userQuizzes[i].data.key;
            quizzToDeletePosition = i;
            console.log("tchau");
        }
    }
    console.log(quizzToDeletePosition)
    console.log(userQuizzes[2].data.key);
    if (confirm("Você realmente deseja remover o quizz selecionado?")) {
        console.log("foi");
        requireQuizzRemoval();
    }
    else {
        location.reload();
    }
}

function requireQuizzRemoval() {
    let promise = axios.delete(SERVER_URL_QUIZZES + `/${quizzToDeleteId}`, {headers:{ "Secret-Key": quizzToDeleteKey}});
    promise.then(deleteQuizz);
    promise.catch(function (error) {console.log(error)});
}

function deleteQuizz(response) {
    alert("Seu quizz foi deletado!");
    location.reload();
}

function renderUserQuizzes (userQuizzes) {
    
    for (let i = 0; i < userQuizzes.length; i++) {
        if(userQuizzesIdsNotInServer.includes(userQuizzes[i].data.id)) {
            let dateOfCreation = userQuizzes[i].data.createdAt.split("T")[0];
            let timeOfCreation = userQuizzes[i].data.createdAt.split("T")[1].split(".")[0];
            details.innerHTML += `<li>Nome: " <strong>${userQuizzes[i].data.title}</strong> "<br>Data de criação: ${dateOfCreation}<br> Horário de criação: ${timeOfCreation}</li>`;
            continue;
        }
        else {
            document.querySelector(".quizz-list .quizzes-title-box.my-quizzes").classList.remove("hide");
            document.querySelector(".quizz-list .quizz-create").classList.add("hide");
            let userQuizzesList = document.querySelector(".quizz-list .quizzes-container.my-quizzes");
            userQuizzesList.innerHTML += 
            `<div id="${userQuizzes[i].data.id}" class="quizz-layout quizz-box" onclick="startingQuizz(this)">
                <img class="img-background" src="${userQuizzes[i].data.image}">
                <div class="gradient-container">
                </div>
                <p class="description">${userQuizzes[i].data.title}</p>
                <div class="buttons-holder">
                <ion-icon name="create-outline"></ion-icon>
                <ion-icon id="${userQuizzes[i].data.id}" onclick="confirmDelete(this)" name="trash-outline"></ion-icon>
                </div>
            </div>`;
        }
    }
}

loadPage();
function coco() {
    console.log("coco");
}
function loadPage () {
    loadUserQuizzes();
    getAllQuizzes();
}

function getAllQuizzes () {
    let allQuizzes = axios.get(SERVER_URL_QUIZZES);
    loadingPage.classList.remove("hide");
    allQuizzes.then(renderAllQuizzes);
    allQuizzes.catch(function (error) {console.log(error)});
}

function renderAllQuizzes (response) {
    loadingPage.classList.add("hide");
    console.log(response);
    for (let i = 0; i < response.data.length; i++) {  
        if (userQuizzesIds.includes(response.data[i].id)) {
            continue;
        } else {
            let allQuizzesContainer = document.querySelector(".quizz-list .all-quizzes");
            allQuizzesContainer.innerHTML += 
            `<div id="${response.data[i].id}" class="quizz-layout quizz-box" onclick="startingQuizz(this)">
                <img class="img-background" src="${response.data[i].image}">
                <div class="gradient-container">
                </div>
                <p class="description">${response.data[i].title}</p>
            </div>`;
        }
    }
}

function startingQuizz (element) {
    getQuizz(element);
    changePages(element);
    renderBanner(element);
}

function changePages (element) {
    if (element.classList.contains("quizz-box")) {
        main.classList.add("hide");
        page.classList.remove("hide");
    } 
    if (element.parentElement.classList.contains("quizz-create") || element.id === "add-icon") {
        main.classList.add("hide");
        creation.classList.remove("hide");
    }
    if (element.classList.contains("restart-button")) {
        restartingQuizz();
    }
    if (element.classList.contains("test-created")) {
        page.classList.remove("hide");
        creation.classList.add("hide");
    }
    window.scrollTo(0,0);
}

const removeClass = (element, className) => {
    if (element.classList.contains(className)){
        element.classList.remove(className);
    }
}

const restartingQuizz = () => {
    let resetingAnswersAndResult = document.querySelectorAll(".reset, .color-green, .color-red, .blurred-background, .answers-box");

    resetingAnswersAndResult.forEach(element => {
        if (element.classList.contains("reset")) {
            element.remove();
        }
        if (element.classList.contains("answers-box")) {
            shuffleDivs(element);
        }
        removeClass(element, "color-green");
        removeClass(element, "color-red");
        removeClass(element, "blurred-background");
    });

    questionsAnswered = totalQuestions;
    numOfHits = 0;

}

function refreshPage () {
    location.reload();
}

// QUIZZ PAGE

let banner;

function renderBanner (element) {
    banner = element.innerHTML;
    document.querySelector(".quizz-page .banner").innerHTML = banner;
}

let selectedQuizzId;

function getQuizz (element) {
    selectedQuizzId = Number(element.id);
    console.log(element.id);

    let allQuizzes = axios.get(SERVER_URL_QUIZZES);
    loadingPage.classList.remove("hide");
    allQuizzes.then(renderQuizzQuestions);
    allQuizzes.catch(function (error) {console.log(error)});
}

let questionsAnswered = 0;
let totalQuestions = 0;

function renderQuizzQuestions (response) {
    loadingPage.classList.add("hide");
    console.log(response.data);
    for (let i = 0; i < response.data.length; i++) {
        if (selectedQuizzId === response.data[i].id) {
            console.log(response.data[i].levels);
            for (let j = 0; j < response.data[i].questions.length; j++) {

                let questionBoxColor = response.data[i].questions[j].color;
                if (isTooLightYIQ(questionBoxColor.replace("#",""))) {
                    page.innerHTML +=
                    `<div class="question-container" id="q${j}">
                        <div class="question-box" style="background-color: ${response.data[i].questions[j].color};">
                            <span class="question" style="color: #000000;">${response.data[i].questions[j].title}</span>
                        </div>
                        <div class="answers-box">
                        </div>
                    </div>`;
                } else {
                    page.innerHTML +=
                    `<div class="question-container" id="q${j}">
                        <div class="question-box" style="background-color: ${response.data[i].questions[j].color};">
                            <span class="question">${response.data[i].questions[j].title}</span>
                        </div>
                        <div class="answers-box">
                        </div>
                    </div>`;
                }
                
                for (let k = 0; k < response.data[i].questions[j].answers.length; k++) {
                    let questionPrinted = document.getElementById(`q${j}`);
                    questionPrinted.lastElementChild.innerHTML += 
                        `<div class="answer-option" onclick="selectOption(this)" id="${response.data[i].questions[j].answers[k].isCorrectAnswer}">
                            <img src="${response.data[i].questions[j].answers[k].image}">
                            <span class="legend">${response.data[i].questions[j].answers[k].text}</span>
                        </div>`;
                }

                let answersBox = document.getElementById(`q${j}`).lastElementChild;
                shuffleDivs(answersBox);
                
            questionsAnswered ++;
            totalQuestions++;
            }      
        }    
    }
}

function isTooLightYIQ(hexcolor){
    let r = parseInt(hexcolor.substr(0,2),16);
    let g = parseInt(hexcolor.substr(2,2),16);
    let b = parseInt(hexcolor.substr(4,2),16);
    let yiq = ((r*299)+(g*587)+(b*114))/1000;
    return yiq >= 128;
}

const shuffleDivs = parent => {
    let divs = parent.children;
    let frag = document.createDocumentFragment();
    while (divs.length) {
        frag.appendChild(divs[Math.floor(Math.random() * divs.length)]);
    }
    parent.appendChild(frag);
}

let siblings;
let numOfHits = 0;
function getSiblings (element) {

    siblings = []; 
    let sibling  = element.parentNode.firstChild;
    while (sibling) {
        if (sibling.nodeType === 1 && sibling !== element) {
            siblings.push(sibling);
        }
        sibling = sibling.nextSibling;
    }
    return siblings;
};

function selectOption (element) {
    if (element.lastElementChild.classList.contains("color-green") || element.lastElementChild.classList.contains("color-red")) {
        return;
    }

    getSiblings(element);

    for (let i = 0; i < siblings.length; i++) {
        siblings[i].classList.add("blurred-background");
        if (siblings[i].id === "true") {
            siblings[i].lastElementChild.classList.add("color-green");
        } else {
            siblings[i].lastElementChild.classList.add("color-red");
        }
    }

    if (element.id === "true") {
        element.lastElementChild.classList.add("color-green");
        numOfHits++;
    } else {
        element.lastElementChild.classList.add("color-red");
    }
    
    questionsAnswered--;

    console.log(numOfHits);

    isFinished(questionsAnswered);

    setTimeout(scrollToNext, 2000, element);   

}

function isFinished (remainingQuestions) {

    console.log(remainingQuestions);

    if (remainingQuestions === 0) {

        let allQuizzes = axios.get(SERVER_URL_QUIZZES);
        loadingPage.classList.remove("hide");
        allQuizzes.then(renderResult);
        allQuizzes.catch(function (error) {console.log(error)});       
    }

}

function renderResult(response) {
    loadingPage.classList.add("hide");
    let listOfLevels = [];
    let resultValue;
    let result;

    for (let i = 0; i < response.data.length; i++) {
        if (selectedQuizzId === response.data[i].id){

            for (let j = 0; j < response.data[i].levels.length; j++) {
                listOfLevels.push(response.data[i].levels[j].minValue);
            }
            listOfLevels.sort();

            for (let j = 0; j < listOfLevels.length; j++) {
                if (Math.round((numOfHits/totalQuestions)*100) >= listOfLevels[j]) {
                    resultValue = listOfLevels[j];
                }
            }

            for (let j = 0; j < response.data[i].levels.length; j++) {
                if (response.data[i].levels[j].minValue === resultValue) {
                    result = 
                        `<div class="quizz-result question-container reset">
                            <div class="question-box">
                                <span class="question">${response.data[i].levels[j].title}</span>
                            </div>
                            <div class="answer-option">
                                <img src="${response.data[i].levels[j].image}">
                                <span class="legend">${response.data[i].levels[j].text}</span>
                            </div>
                        </div>
                        <button class="restart-button reset" onclick="changePages(this)">Reiniciar Quizz</button>
                        <button class="home-button reset" onclick="refreshPage()">Voltar para home</button>`; 
                }                          
            }
            console.log(result);
            page.innerHTML += result;        
        }
    }
}

function scrollToNext (element) {
    let scrollNextOne = element.parentElement.parentElement.nextElementSibling;
    let scrollResult = document.querySelector(".quizz-result");
    if (scrollNextOne !== null) {
        scrollNextOne.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    } else {
        scrollResult.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    }
}