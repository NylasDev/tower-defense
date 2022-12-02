"use strict";

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1280;
canvas.height = 768;

c.fillStyle = "white";
c.fillRect(0, 0, canvas.width, canvas.height);

const buildTiles2D = [];
for (let i = 0; i < buildTiles.length; i += 20) {
  buildTiles2D.push(buildTiles.slice(i, i + 20));
}

const placementTiles = [];

buildTiles2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 14) {
      //add building placement tile here
      placementTiles.push(
        new PlacementTile({
          position: {
            x: x * 64,
            y: y * 64,
          },
        })
      );
    }
  });
});

//map draw
const image = new Image();
image.onload = () => {};
image.src = "img/gameMap.png";

const enemies = [];
for (let i = 1; i < 10; i++) {
  const xOffset = i * 150;
  enemies.push(
    new Enemy({
      position: { x: waypoints[0].x - xOffset, y: waypoints[0].y },
    })
  );
}

const buildings = [];
let activeTile = undefined;

function animate() {
  requestAnimationFrame(animate);

  c.drawImage(image, 0, 0);

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update();
  }

  placementTiles.forEach((tile) => {
    tile.update(mouse);
  });

  buildings.forEach((building) => {
    building.update();
    building.target = null;
    const validEnemies = enemies.filter((enemy) => {
      const xDiffrence = enemy.center.x - building.center.x;
      const yDiffrence = enemy.center.y - building.center.y;
      const distance = Math.hypot(xDiffrence, yDiffrence);

      return distance < enemy.radius + building.radius;
    });
    building.target = validEnemies[0];

    for (let i = building.projectiles.length - 1; i >= 0; i--) {
      const projectile = building.projectiles[i];
      projectile.update();

      const xDiffrence = projectile.enemy.center.x - projectile.position.x;
      const yDiffrence = projectile.enemy.center.y - projectile.position.y;
      const distance = Math.hypot(xDiffrence, yDiffrence);

      //projectile hits
      if (distance < projectile.enemy.radius + projectile.radius) {
        projectile.enemy.health -= 20;
        if (projectile.enemy.health <= 0) {
          const enemyIndex = enemies.findIndex((enemy) => {
            return projectile.enemy === enemy;
          });
          if (enemyIndex > -1) {
            enemies.splice(enemyIndex, 1);
          }
        }
        console.log(projectile.enemy.health);
        building.projectiles.splice(i, 1);
      }
      // console.log(xDiffrence);
    }
  });
}

const mouse = {
  x: undefined,
  y: undefined,
};

canvas.addEventListener("click", (e) => {
  if (activeTile && !activeTile.isOccupied) {
    buildings.push(
      new Building({
        position: {
          x: activeTile.position.x,
          y: activeTile.position.y,
        },
      })
    );
    activeTile.isOccupied = true;
  }
});

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  activeTile = null;
  for (let i = 0; i < placementTiles.length; i++) {
    const tile = placementTiles[i];
    if (
      mouse.x > tile.position.x &&
      mouse.x < tile.position.x + tile.size &&
      mouse.y > tile.position.y &&
      mouse.y < tile.position.y + tile.size
    ) {
      activeTile = tile;
      break;
    }
  }
});
animate();
