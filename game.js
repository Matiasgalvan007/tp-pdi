const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

class Tank {
    constructor(x, y, color, keys) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.color = color;
        this.keys = keys;
        this.bullets = [];
        this.reloadTime = 0; 
        this.rotationDirection = 1; 
        this.speed = 3.5; // velocidad de movimiento más rápida
        this.rotationSpeed = 0.04; // velocidad de giro más rápida
    }

    update() {
        // Giro continuo solo si no se mueve
        if (!keys[this.keys.up] && !keys[this.keys.down]) {
            this.angle += this.rotationSpeed * this.rotationDirection;
        }

        if (this.reloadTime > 0) this.reloadTime--;

        // Movimiento vertical según ángulo
        let dx = Math.cos(this.angle) * this.speed;
        let dy = Math.sin(this.angle) * this.speed;

        if (keys[this.keys.up]) {
            if (!this.collides(this.x + dx, this.y + dy)) {
                this.x += dx;
                this.y += dy;
            }
        }
        if (keys[this.keys.down]) {
            if (!this.collides(this.x - dx, this.y - dy)) {
                this.x -= dx;
                this.y -= dy;
            }
        }

        // Disparo
        if (keys[this.keys.shoot] && this.reloadTime === 0) {
            this.fire();
            this.rotationDirection *= -1;
            this.reloadTime = 50;
        }
    }

    collides(nx, ny) {
    // límites del canvas (paredes invisibles)
    if (nx < 20 || nx > canvas.width - 20 ||
        ny < 20 || ny > canvas.height - 20) {
        return true;
    }

    // chequeo contra obstáculos rectangulares
    for (let obs of obstacles) {
        if (nx > obs.x && nx < obs.x + obs.width &&
            ny > obs.y && ny < obs.y + obs.height) {
            return true;
        }
    }
}
    fire() {
        const speed = 5;
        const dx = Math.cos(this.angle) * speed;
        const dy = Math.sin(this.angle) * speed;
        this.bullets.push(new Bullet(this.x, this.y, dx, dy, this));
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // cuerpo
        ctx.fillStyle = this.color;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-20, -15, 40, 30, 8); // cuerpo redondeado
        ctx.fill();
        ctx.stroke();

        // torreta
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fillStyle = "gray";
        ctx.fill();
        ctx.stroke();

        // cañón
        ctx.fillStyle = "gray";
        ctx.fillRect(0, -4, 30, 8);

        ctx.restore();
    }
}


class Bullet {
    constructor(x, y, dx, dy, tank) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.tank = tank;
        this.distanceLeft = 1000; 
        this.radius = 5;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.distanceLeft -= Math.sqrt(this.dx*this.dx + this.dy*this.dy);

        // rebote en paredes
        if (this.x < this.radius || this.x > canvas.width - this.radius) this.dx *= -1;
        if (this.y < this.radius || this.y > canvas.height - this.radius) this.dy *= -1;

        // rebote en obstáculos
        for (let obs of obstacles) {
            if (this.x > obs.x && this.x < obs.x + obs.width &&
                this.y > obs.y && this.y < obs.y + obs.height) {
                if (this.x - this.dx < obs.x || this.x - this.dx > obs.x + obs.width) this.dx *= -1;
                if (this.y - this.dy < obs.y || this.y - this.dy > obs.y + obs.height) this.dy *= -1;
            }
        }
    }

    draw() {
        let gradient = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.radius);
        gradient.addColorStop(0, "yellow");
        gradient.addColorStop(1, "orange");

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
    }

    hits(tank) {
        const dx = this.x - tank.x;
        const dy = this.y - tank.y;
        return Math.sqrt(dx*dx + dy*dy) < 20;
    }
}








// Obstáculos tipo “campo de guerra”
const obstacles = [
    {x: 100, y: 100, width: 100, height: 20},
    {x: 250, y: 150, width: 20, height: 100},
    {x: 400, y: 50, width: 150, height: 20},
    {x: 550, y: 120, width: 20, height: 150},
    {x: 300, y: 300, width: 120, height: 20},
    {x: 500, y: 400, width: 20, height: 120},
    {x: 150, y: 350, width: 100, height: 20},
    {x: 600, y: 250, width: 100, height: 20}
];

function drawObstacles() {
    ctx.fillStyle = "#5a3825"; // marrón de base
    ctx.strokeStyle = "#2d1c12"; // borde más oscuro
    ctx.lineWidth = 2;

    obstacles.forEach(obs => {
        // fondo del bloque
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        // borde
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        // “ladrillos” internos
        ctx.fillStyle = "#6e4631";
        for (let i = obs.x; i < obs.x + obs.width; i += 20) {
            for (let j = obs.y; j < obs.y + obs.height; j += 10) {
                ctx.fillRect(i, j, 18, 8);
            }
        }
        ctx.fillStyle = "#5a3825"; // restaurar color
    });
}

// Control de teclas
const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => {
    // Cuando se suelta la tecla de avance o retroceso
    if (e.key === tank1.keys.up || e.key === tank1.keys.down) {
        tank1.rotationDirection *= -1;
    }
    if (e.key === tank2.keys.up || e.key === tank2.keys.down) {
        tank2.rotationDirection *= -1;
    }
    keys[e.key] = false;
});

// Crear tanques
const tank1 = new Tank(200, 300, 'red', {up: 'w', down: 's', shoot: 'r'});
const tank2 = new Tank(600, 300, 'blue', {up: 'ArrowUp', down: 'ArrowDown', shoot: 'l'});

let gameOver = false; // bandera global

function gameLoop() {
    if (gameOver) return; // si terminó, no seguimos dibujando

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawObstacles();

    tank1.update();
    tank2.update();

    [tank1, tank2].forEach(tank => {
        tank.bullets.forEach((b, i) => {
            b.update();
            b.draw();

            if (b.distanceLeft <= 0) tank.bullets.splice(i,1);

            const target = (tank === tank1) ? tank2 : tank1;
            if (b.hits(target)) {
                gameOver = true; // marcar que terminó
                alert(`${tank.color.toUpperCase()} ganó!`);
                window.location.reload();
            }
        });
        tank.draw();
    });

    requestAnimationFrame(gameLoop);
}


gameLoop();
