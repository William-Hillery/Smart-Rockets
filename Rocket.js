class Rocket {
  constructor(x, y, DNA = [], c = color(random(255), random(255), random(255))) {
    this.pos = createVector(x, y);
    this.vel = createVector();
    this.acc = createVector();
    this.seed = random(100000);
    this.won = false;

    this.maxVel = 3;
    this.speed = 1;
    this.handling = (10) * PI / 180; //degree of max Turn

    this.color = c;

    this.dna = DNA;
    this.angle = 3 * TAU / 4;
    this.alive = true;
    this.oldPos = p5.Vector.sub(this.pos, 0);
  }

  draw() {
    paths.stroke(this.color);
    paths.strokeWeight(.2);
    paths.line(this.oldPos.x, this.oldPos.y, this.pos.x, this.pos.y);
    noStroke();
    fill(this.won?color(100, 150, 255, 100):(!this.alive?color(255, 100, 100, 100):color(255, 100)));
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    triangle(-10, 5, -10, -5, 10, 0);
    pop();

    if (this.alive && !this.won) return this.update();
  }
  update() {
    while (this.dna.length <= frameCount-lastGenFrame){
      this.dna.push(random(-this.handling, this.handling));
    }
    if (this.dna[frameCount-lastGenFrame] == undefined) console.log('oops');
    this.turn(this.dna[frameCount-lastGenFrame]);
    this.applyF(p5.Vector.fromAngle(this.angle).setMag(this.speed));

    this.oldPos = p5.Vector.sub(this.pos, 0);
    this.vel.add(this.acc);
    this.vel.limit(this.maxVel);
    this.pos.add(this.vel);
    this.acc.mult(0);
    for (let b of borders) {
      if (this.collide(b[0], b[1])) this.kill();
    }
    this.fitness = map(dist(this.pos.x, this.pos.y, end.x, end.y), winR, dist(start.x, start.y, end.x, end.y), dist(start.x, start.y, end.x, end.y), winR);
    if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) this.kill();
    if (dist(this.pos.x, this.pos.y, end.x, end.y) <= winR){
      this.fitness*=10;
      this.won = true;
      living--;
      return true;
    }
    return false;
  }

  applyF(f) {
    this.acc.add(f);
  }

  turn(a) {
    this.angle += a;
  }

  collide(p1, p2) {
    return inside(this.pos, p1, p2);
  }

  kill(){
    this.fintess/=10;
    if(this.alive) living--;
    this.alive = false;
  }

  crossover(r2){
    let newDNA = [];
    let largest = (this.dna.length > r2.dna.length)?this.dna:r2.dna;
    let sizeMargin = abs(this.dna.length - r2.dna.length);
    for (let i = 0; newDNA.length < largest.length-sizeMargin; i++){
      if (random(1) < .5) {
        newDNA.push(this.dna[i])
        
      }else{
        newDNA.push(r2.dna[i]);
      }
      if (random(1) < mr){
        newDNA[i] = random(-this.handling, this.handling);
      }
    }
    for (let i = largest.length-sizeMargin; newDNA.length < largest.length; i++){
        newDNA.push(largest[i])
      if (random(1) < mr){
        newDNA[i] = random(-this.handling, this.handling);
      }
    }
    let c = random([this, r2]).color;
    if (random(1) < mr) c = color(random(255), random(255), random(255));

    return new Rocket(start.x, start.y, newDNA, c);
  }
}

function inside(p, p1, p2){
  return abs(p.x - p1.x)+abs(p.x - p2.x) <= abs(p1.x-p2.x) && abs(p.y - p1.y)+abs(p.y - p2.y) <= abs(p1.y-p2.y);
}