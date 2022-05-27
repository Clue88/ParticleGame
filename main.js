import { Charge } from "./modules/charge.js"

let c = document.getElementById("canvas");
let ctx = c.getContext("2d");
let requestID;

let goButton = document.getElementById("goButton");

let charges = [
    new Charge(300, 300, 2, 0, 10, 10, "red"),
    new Charge(300, 500, 2, 0, -10, 10, "blue")
];

let clear = function () {
    ctx.clearRect(0, 0, c.clientWidth, c.clientHeight);
}

let gameLoop = function () {
    window.cancelAnimationFrame(requestID);
    clear();

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
            q.yx *= -1;
        }
        if (q.y + 15 >= c.clientHeight) {
            q.y = c.clientHeight - 15;
            q.yx *= -1;
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

    requestID = window.requestAnimationFrame(gameLoop);
}

let editLoop = function () {
    window.cancelAnimationFrame(requestID);
    clear();

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
        if (charge.followMouse) {
            charge.x = e.offsetX;
            charge.y = e.offsetY;
        }
    });
}

c.addEventListener("mousedown", onMouseDown);
c.addEventListener("mouseup", onMouseUp);
c.addEventListener("mousemove", onMouseMove);
goButton.addEventListener("click", gameLoop);
