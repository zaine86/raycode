let walls = [];
let particle;
let rayCount = 1;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // First wall line
  walls.push(new Boundary(0, 0, width, height));
  walls[0].stretchToScreen();

  // Second symmetrical wall line
  walls.push(new Boundary(width, 0, 0, height));
  walls[1].stretchToScreen();

  // Screen edges
  walls.push(new Boundary(-1, -1, width, -1));
  walls.push(new Boundary(width, -1, width, height));
  walls.push(new Boundary(width, height, -1, height));
  walls.push(new Boundary(-1, height, -1, -1));

  particle = new Particle();
  noCursor();
}

function draw() {
  background(0);

  for (let wall of walls) {
    wall.show();
  }

  let sectionColor = getSectionColor(particle.pos);
  particle.update(mouseX, mouseY);
  particle.show(sectionColor);
  particle.look(walls, sectionColor);
}

function getSectionColor(pos) {
  if (pos.x < width / 2 && pos.y < height / 2) return color(255, 0, 0);
  if (pos.x >= width / 2 && pos.y < height / 2) return color(0, 255, 0);
  if (pos.x < width / 2 && pos.y >= height / 2) return color(0, 0, 255);
  return color(255, 255, 0);
}

class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  stretchToScreen() {
    let dir = p5.Vector.sub(this.b, this.a).normalize();
    this.a = this.extendPoint(this.a, dir, -width * 2);
    this.b = this.extendPoint(this.b, dir, width * 2);
  }

  extendPoint(pt, dir, dist) {
    let extended = p5.Vector.add(pt, p5.Vector.mult(dir, dist));
    extended.x = constrain(extended.x, 0, width);
    extended.y = constrain(extended.y, 0, height);
    return extended;
  }

  show() {
    stroke(255);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

class Ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  lookAt(x, y) {
    this.dir.set(x - this.pos.x, y - this.pos.y).normalize();
  }

  show(col) {
    stroke(col);
    push();
    translate(this.pos.x, this.pos.y);
    line(0, 0, this.dir.x * 10, this.dir.y * 10);
    pop();
  }

  cast(wall) {
    const { x: x1, y: y1 } = wall.a;
    const { x: x2, y: y2 } = wall.b;
    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) return;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      return createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    }
  }
}

class Particle {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.rays = [];
    for (let a = 0; a < 360; a += rayCount) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }
  }

  update(x, y) {
    this.pos.set(x, y);
  }

  look(walls, col) {
    for (let ray of this.rays) {
      let closest = null;
      let record = Infinity;

      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }

      if (closest) {
        stroke(col);
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
  }

  show(col) {
    fill(200);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 4);
    for (let ray of this.rays) {
      ray.show(col);
    }
  }
}

