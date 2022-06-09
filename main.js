import { Charge } from "./modules/charge.js";
import { Level } from "./modules/level.js";

let c = document.getElementById("canvas");
let ctx = c.getContext("2d");
let requestID;

let goButton = document.getElementById("goButton");
let editButton = document.getElementById("editButton");
let resetButton = document.getElementById("resetButton");
let particleInfo = document.getElementById("particleInfo");

let levels = [
    new Level([
        new Charge(200, 350, 5, 0, 10, 10, "green", false, true, true, true, true),
    ], 800, 0, 100, 700),
    new Level([
        new Charge(200, 350, 1, 0, 10, 10, "green", false, false, false, false, true),
        new Charge(450, 350, 0, 0, 30, 10, "black", true, false, false, false, false),
    ], 800, 0, 100, 700),
    new Level([
        new Charge(200, 350, 2, 0, 20, 10, "green", false, false, false, false, true),
        new Charge(300, 500, -2, 0, -20, 10, "black", true, false, false, false, false),
    ], 0, 0, 900, 50),
    new Level([
        new Charge(100, 450, 2, 0, 10, 10, "green", false, true, false, false, true),
        new Charge(300, 400, 0, 0, -10, 100000, "black", false, false, false, false, false),
        new Charge(330, 400, 0, 0, -10, 100000, "black", false, false, false, false, false),
        new Charge(360, 400, 0, 0, -10, 100000, "black", false, false, false, false, false),
        new Charge(390, 400, 0, 0, -10, 100000, "black", false, false, false, false, false),
        new Charge(420, 400, 0, 0, -10, 100000, "black", false, false, false, false, false),
        new Charge(450, 400, 0, 0, -10, 100000, "black", false, false, false, false, false),
        new Charge(480, 400, 0, 0, -10, 100000, "black", false, false, false, false, false),
        new Charge(300, 500, 0, 0, 10, 100000, "black", false, false, false, false, false),
        new Charge(330, 500, 0, 0, 10, 100000, "black", false, false, false, false, false),
        new Charge(360, 500, 0, 0, 10, 100000, "black", false, false, false, false, false),
        new Charge(390, 500, 0, 0, 10, 100000, "black", false, false, false, false, false),
        new Charge(420, 500, 0, 0, 10, 100000, "black", false, false, false, false, false),
        new Charge(450, 500, 0, 0, 10, 100000, "black", false, false, false, false, false),
        new Charge(480, 500, 0, 0, 10, 100000, "black", false, false, false, false, false),
    ], 850, 0, 50, 700),
    new Level([
        new Charge(100, 600, 2, 0, 10, 10, "green", false, false, false, false, true),
        new Charge(300, 500, 0, 0, -10, 100000, "black", true, false, true, false, false),
        new Charge(300, 550, -2, 0, -10, 10, "black", true, false, true, false, false)
    ], 0, 0, 500, 50),
    new Level([
        new Charge(450, 450, 2, 0, 10, 10, "green", false, false, false, false, true),
        new Charge(450, 350, 0, 0, -40, 1000000000, "black", false, false, false, false, false),
        new Charge(600, 600, 0, 0, 5, 10, "black", true, true, false, false, false),
    ], 0, 0, 900, 50),
    new Level([
        new Charge(450, 350, 0, 0, 10, 10, "green", false, false, false, false, true),
        new Charge(300, 350, 0, 0, 10, 10, "black", false, true, true, true, false),
        new Charge(600, 350, 0, 0, 10, 10, "black", false, true, true, true, false),
        new Charge(450, 200, 0, 0, 10, 10, "black", false, true, true, true, false),
    ], 400, 0, 100, 50),
];
let currentLevel = 0;

let charges;
let endX;
let endY;
let endWidth;
let endHeight;

let savedCharges

let clear = function () {
    ctx.clearRect(0, 0, c.clientWidth, c.clientHeight);
}

let saveConfig = function () {
    savedCharges = charges.map(charge => {
        return Object.assign(Object.create(Object.getPrototypeOf(charge)), charge);
    });
}

let resetLevel = function () {
    charges = levels[currentLevel].charges.map(charge => {
        return Object.assign(Object.create(Object.getPrototypeOf(charge)), charge);
    });
    saveConfig();

    endX = levels[currentLevel].endX;
    endY = levels[currentLevel].endY;
    endWidth = levels[currentLevel].endWidth;
    endHeight = levels[currentLevel].endHeight;

    while (particleInfo.firstChild) {
        particleInfo.removeChild(particleInfo.firstChild);
    }
    for (let i = 0; i < charges.length; i++) {
        let chargeInfo = document.createElement("div");
        chargeInfo.classList.add("my-4");
        chargeInfo.id = `charge-info${i}`;

        let header = document.createElement("p");
        let status = charges[i].positionEditable ? "Moveable" : "Stationary";
        header.appendChild(document.createTextNode(`Charge ${i + 1} (${status}):`));
        header.setAttribute("style", "font-weight: bold");
        chargeInfo.appendChild(header);

        let veloXGroup = document.createElement("fieldset");
        veloXGroup.disabled = !charges[i].velocityEditable;
        veloXGroup.classList.add("form-group");
        veloXGroup.innerHTML = `Velocity X: <input type="number" id="velox${i}" class="form-control" value=${charges[i].vx}>`;
        chargeInfo.appendChild(veloXGroup);

        let veloYGroup = document.createElement("fieldset");
        veloYGroup.disabled = !charges[i].velocityEditable;
        veloYGroup.classList.add("form-group");
        veloYGroup.innerHTML = `Velocity Y: <input type="number" id="veloy${i}" class="form-control" value=${charges[i].vy}>`;
        chargeInfo.appendChild(veloYGroup);

        let chargeGroup = document.createElement("fieldset");
        chargeGroup.disabled = !charges[i].chargeEditable;
        chargeGroup.classList.add("form-group");
        chargeGroup.innerHTML = `Charge: <input type="number" id="charge${i}" class="form-control" value=${charges[i].q}>`;
        chargeInfo.appendChild(chargeGroup);

        let massGroup = document.createElement("fieldset");
        massGroup.disabled = !charges[i].massEditable;
        massGroup.classList.add("form-group");
        massGroup.innerHTML = `Mass: <input type="number" id="mass${i}" class="form-control" value=${charges[i].m}>`;
        chargeInfo.appendChild(massGroup);

        particleInfo.appendChild(chargeInfo);
    }
    console.log(charges)
}

let checkWin = function (charge) {
    let xClosest = Math.max(endX, Math.min(charge.x, endX + endWidth));
    let yClosest = Math.max(endY, Math.min(charge.y, endY + endHeight));

    let distX = xClosest - charge.x;
    let distY = yClosest - charge.y;
    return (distX ** 2 + distY ** 2) <= 15 ** 2;
}

let gameLoop = function () {
    window.cancelAnimationFrame(requestID);
    clear();

    ctx.fillStyle = "green";
    ctx.fillRect(endX, endY, endWidth, endHeight);

    for (let i = 0; i < charges.length; i++) {
        for (let j = i + 1; j < charges.length; j++) {
            let q1 = charges[i];
            let q2 = charges[j];

            let r = Math.sqrt((q1.x - q2.x) ** 2 + (q1.y - q2.y) ** 2);
            if (r > 30) {
                continue;
            }

            let scale1 = (2 * q2.m * ((q1.vx - q2.vx) * (q1.x - q2.x) + (q1.vy - q2.vy) * (q1.y - q2.y))) / ((q1.m + q2.m) * r ** 2);
            let scale2 = (2 * q1.m * ((q2.vx - q1.vx) * (q2.x - q1.x) + (q2.vy - q1.vy) * (q2.y - q1.y))) / ((q2.m + q1.m) * r ** 2);

            q1.vx = q1.vx - scale1 * (q1.x - q2.x);
            q1.vy = q1.vy - scale1 * (q1.y - q2.y);
            q2.vx = q2.vx - scale2 * (q2.x - q1.x);
            q2.vy = q2.vy - scale2 * (q2.y - q1.y);

            let adj = (31 - r) / (2 * r); // adjustment to prevent overlap
            q1.x += (q1.x - q2.x) * adj;
            q1.y += (q1.y - q2.y) * adj;
            q2.x += (q2.x - q1.x) * adj;
            q2.y += (q2.y - q1.y) * adj;

        }
    }

    charges.forEach(charge => {
        charge.applyEField(ctx, charges);
        charge.applyBField(ctx, charges);
    });

    charges.forEach(charge => {
        charge.update();
        charge.draw(ctx);
    });

    for (let i = 0; i < charges.length; i++) {
        if (charges[i].isUserParticle && checkWin(charges[i])) {
            window.cancelAnimationFrame(requestID);
            currentLevel++;
            if (currentLevel >= levels.length) {
                swal({
                    title: "You beat the game!",
                    icon: "success",
                    button: "YAY",
                });
                return;
            }
            resetLevel();
            swal({
                title: `You beat level ${currentLevel}!`,
                text: "Press Next to continue.",
                icon: "success",
                button: "Next",
            });
            editGame();
            return;
        }
    }

    requestID = window.requestAnimationFrame(gameLoop);
}

let editLoop = function () {
    window.cancelAnimationFrame(requestID);
    clear();

    ctx.fillStyle = "green";
    ctx.fillRect(endX, endY, endWidth, endHeight);

    charges.forEach(charge => {
        charge.draw(ctx);
    });

    requestID = window.requestAnimationFrame(editLoop);
}

let onMouseDown = function (e) {
    let mouseX = e.offsetX;
    let mouseY = e.offsetY;

    let foundCharge = false;
    for (let i = 0; i < charges.length; i++) {
        let charge = charges[i];
        if (((mouseX - charge.x) ** 2 + (mouseY - charge.y) ** 2) < (15 ** 2)) {
            console.log("found particle")
            charge.followMouse = true;
            document.getElementById(`charge-info${i}`).style.display = "block";
            foundCharge = true;
        } else {
            document.getElementById(`charge-info${i}`).style.display = "none";
        }

        if(((mouseX - (charge.x + charge.vx * 50)) ** 2 + (mouseY - (charge.y + charge.vy * 50)) ** 2) < (10 ** 2)){
            console.log("found vector")
            charge.arrowFollowMouse = true;
        }
    }
    if (!foundCharge) {
        for (let i = 0; i < charges.length; i++) {
            document.getElementById(`charge-info${i}`).style.display = "block";
        }
    }
}

let onMouseUp = function (e) {
    charges.forEach(charge => {
        charge.followMouse = false;
        charge.arrowFollowMouse = false
    });
}

let onMouseMove = function (e) {

    for(let i = 0; i < charges.length; i++){
        let charge = charges[i];
        if (charge.followMouse && charge.positionEditable) {
            charge.x = e.offsetX;
            charge.y = e.offsetY;
        }

        if(charge.arrowFollowMouse && charge.velocityEditable){
            charge.vx = (e.offsetX - charge.x) / 50;
            charge.vy = (e.offsetY - charge.y) / 50;

            document.getElementById(`velox${i}`).value = charge.vx
            document.getElementById(`veloy${i}`).value = charge.vy
        }
    }
}

let startGame = function (e) {
    c.removeEventListener("mousedown", onMouseDown);
    c.removeEventListener("mouseup", onMouseUp);
    c.removeEventListener("mousemove", onMouseMove);
    particleInfo.style.display = "none";

    for (let i = 0; i < charges.length; i++) {
        charges[i].vx = parseInt(document.getElementById(`velox${i}`).value);
        charges[i].vy = parseInt(document.getElementById(`veloy${i}`).value);
        charges[i].q = parseInt(document.getElementById(`charge${i}`).value);
        charges[i].m = parseInt(document.getElementById(`mass${i}`).value);
    }

    saveConfig();
    gameLoop();
}

let editGame = function (e) {
    charges = savedCharges;
    c.addEventListener("mousedown", onMouseDown);
    c.addEventListener("mouseup", onMouseUp);
    c.addEventListener("mousemove", onMouseMove);
    particleInfo.style.display = "block";

    for (let i = 0; i < charges.length; i++) {
        document.getElementById(`charge-info${i}`).style.display = "block";
    }

    editLoop();
}

let resetGame = function (e) {
    resetLevel();
    editGame(e);
}

goButton.addEventListener("click", startGame);
editButton.addEventListener("click", editGame);
resetButton.addEventListener("click", resetGame);

resetLevel();
saveConfig();
editGame();
// swal({
//     title: `Welcome to ParticleGame!`,
//     text: "[Instructions]",
//     button: "Let's go!",
// });
