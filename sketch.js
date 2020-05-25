let rockets = [];
let borders = [];
let popSize = 500;
let living = popSize;
let winR = 10;
let pendingPoint, start, end;
let deleting = false;
let generation = 1;
let mr = 0.02;
let paths;
let lastGenFrame = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  paths = createGraphics(width, height);
  start = createVector(50, height-50);
  end = createVector(width-50, 50);
  for (let i = 0; i < popSize; i++) {
    rockets.push(new Rocket(start.x, start.y));
  }
}

function draw() {
  if (living <= 0){
    finished();
  }
  background(51);
  image(paths, 0, 0, width, height);
  fill(200, 100, 255);
  noStroke();
  ellipseMode(RADIUS);
  ellipse(end.x, end.y, winR);
  if(pendingPoint){
    let dim = p5.Vector.sub(pendingPoint, createVector(mouseX, mouseY));
    noFill()
    stroke(150, 255, 100);
    rect(pendingPoint.x, pendingPoint.y, -dim.x, -dim.y);
  }
  for (let r of rockets) {
    if (r.draw()) break; 
  }
  for (let b of borders){
    b[2] = p5.Vector.sub(b[1], b[0]);
    fill(100, 170, 250);
    noStroke();
    rect(b[0].x, b[0].y, b[2].x, b[2].y);
  }
}

function mousePressed(){
  if (!deleting){
    if (!pendingPoint){
      pendingPoint = createVector(mouseX, mouseY);
    }else{
      borders.push([createVector(pendingPoint.x, pendingPoint.y), createVector(mouseX, mouseY)]);
      pendingPoint = undefined;
    }
  }else{
    pendingPoint = undefined;
    for (let b of borders){
      if (inside(createVector(mouseX, mouseY), b[0], b[1])) {
        borders=borders.filter(a=>a!=b);
        break;
      }
    }
  }
}

function keyPressed(e){
  if (e.key == '-') deleting = true;
}

function keyReleased(e){
  if (e.key == '-') deleting = false;
}

function finished(){
  rockets = rockets.sort((a, b)=>a.fitness-b.fitness)
  let newRockets = [];
  let fitnessSum = 0;
  let bestF =  0;
  living = popSize;
  generation++;
  paths = createGraphics(width, height);
  for (let r of rockets){
    r.fitness*=r.fitness;
    fitnessSum += r.fitness;
    bestF = (bestF > r.fitness)?bestF:r.fitness;
  }
  for (let r of rockets){
    r.fitness /= fitnessSum;
  }
  while (newRockets.length < popSize){
    let rand = random(1);
    let partner1, partner2;
    for (let r of rockets) {
      rand -= r.fitness;
      if (rand <= 0){
        partner1 = r;
        break;
      }
    }
    rand = random(1);
    for (let r of rockets) {
      rand -= r.fitness;
      if (rand <= 0){
        partner2 = r;
        break;
      }
    }
    newRockets.push(partner1.crossover(partner2));
  }
  console.log(`Best Fitness: ${bestF}\nAvg Fitness: ${round(fitnessSum/popSize*1000)/1000}\nGeneration: ${generation-1}\n`);
  lastGenFrame = frameCount;
  rockets = newRockets;
}

// function windowResized(){
//   resizeCanvas(windowWidth, windowHeight);
// }