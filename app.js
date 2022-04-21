const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const score = document.getElementById("score");
const healthBar = document.getElementById("health");

canvas.width = innerWidth;
canvas.height = innerHeight;
let distance = 0;
let frames = 0;
let health = 100;
let scoreBox = 0;
let gameOver = false;
healthBar.textContent = health;
score.textContent = scoreBox;

let randomInterval = Math.floor(Math.random() * 500) + 500;
class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };

    this.rotation = 0;

    const image = new Image();
    image.src = "images/spaceship.png";
    image.onload = () => {
      this.image = image;
      this.width = image.width;
      this.height = image.height;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - 120,
      };
    };
  }

  draw() {
    ctx.save();

    ctx.translate(
      player.position.x + player.width / 2,
      player.position.y + player.height / 2
    );
    ctx.rotate(this.rotation);
    ctx.translate(
      -player.position.x - player.width / 2,
      -player.position.y - player.height / 2
    );

    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    ctx.restore();
  }

  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
      if (player.position.x < 0) {
        player.position.x = 0;
        player.velocity.x = 0;
      }
      if (player.position.x + player.width >= canvas.width) {
        player.position.x = canvas.width - player.width;
        player.velocity.x = 0;
      }
    }
  }
}

class Projectiles {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 3;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Particle {
  constructor({ position, velocity, radius, color }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.color = color;
    this.opacity = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.opacity -= 0.01;
  }
}

class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.width = 3;
    this.height = 10;
  }

  draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Invader {
  constructor({ position }) {
    this.velocity = {
      x: 0,
      y: 0,
    };

    const image = new Image();
    image.src = "images/enemy.png";
    image.onload = () => {
      const scale = 0.15;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update({ velocity }) {
    if (this.image) {
      this.draw();
      this.position.x += velocity.x;
      this.position.y += velocity.y;
    }
  }

  shoot(InvaderProjectiles) {
    InvaderProjectiles.push(
      new InvaderProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: {
          x: 0,
          y: 2.5,
        },
      })
    );
  }
}

class Grid {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    };
    this.velocity = {
      x: 1,
      y: 0,
    };
    this.invaders = [];

    const columns = Math.floor(Math.random() * 5) + 9;
    const rows = Math.floor(Math.random() * 5) + 3;
    this.width = 27 * columns;
    this.height = 27 * rows;

    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        this.invaders.push(
          new Invader({
            position: {
              x: i * 27,
              y: j * 27,
            },
          })
        );
      }
    }
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.y = 0;
    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y += 27;
    }
  }
}

const player = new Player();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];

const keys = {
  left: false,
  right: false,
  shoot: false,
};

function createParticles({ object, color }) {
  for (let i = 0; i < 15; i++) {
    particles.push(
      new Particle({
        position: {
          x: object.position.x + object.height / 2,
          y: object.position.y + object.width / 2,
        },
        velocity: {
          x: Math.random() - 0.5,
          y: Math.random() - 0.5,
        },
        radius: Math.random() * 3 + 1,
        color: color || "yellow",
      })
    );
  }
}

function animate() {
  if (gameOver) return;
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  requestAnimationFrame(animate);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();

  particles.forEach((particle) => {
    if (particle.opacity <= 0) {
      particles.splice(particles.indexOf(particle), 1);
    } else particle.update();
  });

  invaderProjectiles.forEach((InvaderProjectile) => {
    InvaderProjectile.update();
    if (
      InvaderProjectile.position.y + InvaderProjectile.height >=
        player.position.y &&
      InvaderProjectile.position.y <= player.position.y + player.height &&
      InvaderProjectile.position.x + InvaderProjectile.width >=
        player.position.x &&
      InvaderProjectile.position.x <= player.position.x + player.width
    ) {
      createParticles({ object: player, color: "red" });
    }
    if (
      InvaderProjectile.position.y + InvaderProjectile.height >=
        player.position.y + 90 &&
      InvaderProjectile.position.y <= player.position.y + player.height &&
      InvaderProjectile.position.x + InvaderProjectile.width >=
        player.position.x &&
      InvaderProjectile.position.x <= player.position.x + player.width
    ) {
      console.log(health);
      healthBar.textContent = health;
      if (health <= 0) {
        const p = document.createElement("p");
        const childP = document.createElement("p");
        childP.innerHTML = "click to play again";
        p.innerHTML = "GAME OVER";
        p.style.position = "absolute";

        p.style.top = "50%";
        p.style.left = "50%";
        p.style.transform = "translate(-50%,-50%)";
        p.style.fontSize = "50px";
        childP.style.fontSize = "20px";
        p.style.color = "white";
        p.appendChild(childP);
        document.body.appendChild(p);

        gameOver = true;
        document.addEventListener("click", (e) => {
          location.reload();
        });
      }
      health--;
    }
  });

  grids.forEach((grid) => {
    grid.update();
    if (grid.position.y + grid.height >= player.position.y) {
      createParticles({ object: player, color: "red" });
      const p = document.createElement("p");
      const childP = document.createElement("p");
      childP.innerHTML = "click to play again";
      p.innerHTML = "GAME OVER";
      p.style.position = "absolute";

      p.style.top = "50%";
      p.style.left = "50%";
      p.style.transform = "translate(-50%,-50%)";
      p.style.fontSize = "50px";
      childP.style.fontSize = "20px";
      p.style.color = "white";
      p.appendChild(childP);
      document.body.appendChild(p);

      gameOver = true;
      document.addEventListener("click", (e) => {
        location.reload();
      });
    }
    if (frames % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
        invaderProjectiles
      );
    }

    grid.invaders.forEach((invader) => {
      invader.update({ velocity: grid.velocity });

      projectiles.forEach((projectile) => {
        if (
          projectile.position.x > invader.position.x &&
          projectile.position.x < invader.position.x + invader.width &&
          projectile.position.y > invader.position.y &&
          projectile.position.y < invader.position.y + invader.height
        ) {
          scoreBox += 100;
          score.textContent = scoreBox;
          for (let i = 0; i < 15; i++) {
            particles.push(
              new Particle({
                position: {
                  x: invader.position.x + invader.width / 2,
                  y: invader.position.y + invader.height / 2,
                },
                velocity: {
                  x: Math.random() - 0.5,
                  y: Math.random() - 0.5,
                },
                radius: Math.random() * 3 + 1,
                color: "blue",
              })
            );
          }
          grid.invaders.splice(grid.invaders.indexOf(invader), 1);
          projectiles.splice(projectiles.indexOf(projectile), 1);
        }

        if (grid.invaders.length > 0) {
          const firstInvader = grid.invaders[0];
          const lastInvader = grid.invaders[grid.invaders.length - 1];
          grid.width =
            lastInvader.position.x +
            lastInvader.width -
            firstInvader.position.x;
        }else if(grid.invaders.length == 0){
          grids.splice(grid.indexOf(grid), 1);          
        }
      });
    });
  });

  projectiles.forEach((projectile, index) => {
    if (projectile.position.y + projectile.radius <= 0) {
      projectiles.splice(index, 1);
    } else {
      projectile.update();
    }
  });

  if (keys.left) {
    player.velocity.x = -5;
    player.rotation = -0.45;
  } else if (keys.right) {
    player.velocity.x = 5;
    player.rotation = 0.45;
  } else {
    player.velocity.x = 0;
    player.rotation = 0;
  }

  if (frames % randomInterval === 0) {
    grids.push(new Grid());
    randomInterval = Math.floor(Math.random() * 500) + 1500;
    frames = 0;
    console.log(randomInterval);
  }
  frames++;
}

animate();

addEventListener("keydown", ({ key }) => {
  if (key === "a" || key === "ArrowLeft" || key == "A") {
    keys.left = true;
  }
  if (key === "d" || key === "ArrowRight" || key == "D") {
    keys.right = true;
  }
});

addEventListener("keyup", ({ key }) => {
  if (key === "a" || key === "ArrowLeft" || key == "A") {
    keys.left = false;
  } else if (key === "d" || key === "ArrowRight" || key == "D") {
    keys.right = false;
  }
});

addEventListener("keydown", ({ key }) => {
  if (key === " " || key === "w" || key === "ArrowUp") {
    projectiles.push(
      new Projectiles({
        position: {
          x: player.position.x + player.width / 2,
          y: player.position.y,
        },
        velocity: {
          x: 0,
          y: -5,
        },
      })
    );
  }
});
