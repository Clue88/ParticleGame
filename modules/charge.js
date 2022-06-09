export class Charge {
    constructor(x, y, vx, vy, q, m, color, positionEditable, velocityEditable, chargeEditable, massEditable, isUserParticle) {
        this.econst = 10; // electric constant
        this.bconst = 2; // magnetic constant
        this.vectorConstant = 5000;

        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.q = q;
        this.m = m;
        this.color = color;

        this.ax = 0;
        this.ay = 0;

        // false by default
        this.positionEditable = positionEditable;
        this.velocityEditable = velocityEditable;
        this.chargeEditable = chargeEditable;
        this.massEditable = massEditable;

        this.isUserParticle = isUserParticle;

        this.followMouse = false;
        this.arrowFollowMouse = false;

    }

    applyEField(ctx, charges) {
        charges.forEach(charge => {
            if (charge === this) {
                return;
            }

            let rx = charge.x - this.x;
            let ry = charge.y - this.y;
            let rnorm = Math.sqrt(rx ** 2 + ry ** 2);
            let Fx = -(this.econst * this.q * charge.q * rx) / (rnorm ** 3);
            let Fy = -(this.econst * this.q * charge.q * ry) / (rnorm ** 3);

            // console.log("E", Fx, Fy);

            this.drawVector(ctx, this.x, this.y, this.x + this.vectorConstant * Fx, this.y + this.vectorConstant * Fy, 2, "green");

            this.ax += Fx / this.m;
            this.ay += Fy / this.m;
        });
    }

    applyBField(ctx, charges) {
        charges.forEach(charge => {
            if (charge === this) {
                return;
            }

            let rx = charge.x - this.x;
            let ry = charge.y - this.y;
            let rnorm = Math.sqrt(rx ** 2 + ry ** 2);

            let Bz = (this.bconst * charge.q * (charge.vx * ry - charge.vy * rx)) / (rnorm ** 3);
            let Fx = -this.q * this.vy * Bz;
            let Fy = this.q * this.vx * Bz;

            // console.log("B", Fx, Fy);

            this.drawVector(ctx, this.x, this.y, this.x + this.vectorConstant * Fx, this.y + this.vectorConstant * Fy, 2, "blue");

            this.ax += Fx / this.m;
            this.ay += Fy / this.m;
        })
    }

    drawVector(ctx, fromx, fromy, tox, toy, arrowWidth, color) {
        // from the internet

        // variables to be used when creating the arrow
        let headlen = 10;
        let angle = Math.atan2(toy - fromy, tox - fromx);

        ctx.save();
        ctx.strokeStyle = color;

        // starting path of the arrow from the start square to the end square
        // and drawing the stroke
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.lineWidth = arrowWidth;
        ctx.stroke();

        // starting a new path from the head of the arrow to one of the sides of
        // the point
        ctx.beginPath();
        ctx.moveTo(tox, toy);
        ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7),
            toy - headlen * Math.sin(angle - Math.PI / 7));

        // path from the side point of the arrow, to the other side point
        ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 7),
            toy - headlen * Math.sin(angle + Math.PI / 7));

        // path from the side point back to the tip of the arrow, and then
        // again to the opposite side point
        ctx.lineTo(tox, toy);
        ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7),
            toy - headlen * Math.sin(angle - Math.PI / 7));

        // draws the paths created above
        ctx.stroke();
        ctx.restore();
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, 360);
        ctx.fillStyle = this.color;
        ctx.strokeStyle = "black";
        ctx.fill();
        ctx.stroke();

        this.drawVector(ctx, this.x, this.y, this.x + 50 * this.vx, this.y + 50 * this.vy, 2, "red");
    }

    update() {
        this.vx += this.ax;
        this.vy += this.ay;

        this.x += this.vx;
        this.y += this.vy;

        this.ax = 0;
        this.ay = 0;
    }
}
