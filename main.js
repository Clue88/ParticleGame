import { Charge } from "./modules/charge.js"

let c = document.getElementById("canvas");
let ctx = c.getContext("2d");
let requestID;

let goButton = document.getElementById("goButton");
let editButton = document.getElementById("editButton");
let particleInfo = document.getElementById("particleInfo");

let charges = [
    new Charge(300, 300, 2, 0, 10, 10, "red", true, true, false, false, true),
    new Charge(300, 500, 2, 0, -10, 10, "blue", false, false, true, false, false)
];

let endX = 20;
let endY = 50;
let endWidth = 50;
let endHeight = 50;

for (let i = 0; i < charges.length; i++) {
    let chargeInfo = document.createElement("div");
    chargeInfo.classList.add("my-4");

    let header = document.createElement("p");
    header.appendChild(document.createTextNode(`Charge ${i + 1}:`));
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

let clear = function () {
    ctx.clearRect(0, 0, c.clientWidth, c.clientHeight);
}

let resetLevel = function () {
    charges = [
        new Charge(300, 300, 2, 0, 10, 10, "red", true, true, false, false, true),
        new Charge(300, 500, 2, 0, -10, 10, "blue", false, false, true, false, false)
    ];
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

        let q = charges[i];
        if (q.x - 15 <= 0) {
            q.x = 15;
            q.vx *= -1;
        }
        if (q.x + 15 >= c.clientWidth) {
            q.x = c.clientWidth - 15;
            q.vx *= -1;
        }
        if (q.y - 15 <= 0) {
            q.y = 15;
            q.vy *= -1;
        }
        if (q.y + 15 >= c.clientHeight) {
            q.y = c.clientHeight - 15;
            q.vy *= -1;
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

    charges.forEach(charge => {
        if (((mouseX - charge.x) ** 2 + (mouseY - charge.y) ** 2) < (15 ** 2)) {
            charge.followMouse = true;
        }
    });
}

let onMouseUp = function (e) {
    charges.forEach(charge => {
        charge.followMouse = false;
    });
}

let onMouseMove = function (e) {
    charges.forEach(charge => {
        if (charge.followMouse && charge.positionEditable) {
            charge.x = e.offsetX;
            charge.y = e.offsetY;
        }
    });
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

    gameLoop();
}

let editGame = function (e) {
    resetLevel();
    c.addEventListener("mousedown", onMouseDown);
    c.addEventListener("mouseup", onMouseUp);
    c.addEventListener("mousemove", onMouseMove);
    particleInfo.style.display = "block";

    editLoop();
}

goButton.addEventListener("click", startGame);
editButton.addEventListener("click", editGame);

editGame();
