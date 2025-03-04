let universeAge = 0;
//let bigRip = false;
let planets = [];
let stars = [];
let timeSpeed = 0.5;
let started= false;
let dragging= false;
let planetImages= [];
let wand, wandX, wandY;
let asteroid, asteroidX, asteroidY;
let isDraggingWand = false;
let isDraggingAsteroid = false;
//let drawing = false;
let button, buttonX, buttonY, buttonClicks = 0;
let explosion = false;
let explosionTime = 0;
let end= false


function preload() {
    for (let i = 1; i <= 4; i++) {
        planetImages.push(loadImage(`planet${i}.png`));
    }
    wand = loadImage("wand.png");
    asteroid = loadImage("asteroid.png");
}

document.getElementById("startButton").addEventListener("click", function() {
    document.getElementById("startScreen").style.opacity = "0";
    setTimeout(() => document.getElementById("startScreen").style.display = "none", 1000);
    started = true;
    setTimeout(() => spawnButton(), 10000);
});

function setup() {
    let borderDiv = document.getElementById("border");
    let canvas = createCanvas(borderDiv.clientWidth, borderDiv.clientHeight);
    canvas.parent("border");
    wandX = width - 72;
    wandY = height / 2;
    asteroidX = width / 4;  
    asteroidY = height / 2;
}

function draw() {
    if (end){
        started=false
        document.getElementById("startButton").addEventListener("click", function() {
            document.getElementById("startScreen").style.opacity = "0";
            setTimeout(() => document.getElementById("startScreen").style.display = "none", 1000);
            started = true;
            setTimeout(() => spawnButton(), 10000);
        });


    }
    if (explosion) {
        background(0);
        fill(255, 0, 0);
        textSize(64);
        textAlign(CENTER, CENTER);
        text(`Time: ${nf(explosionTime, 0, 2)}`, width / 2, height / 2);
        if (frameCount % 2 === 0) {
            for (let i = 0; i < 50; i++) {
                stars.push(new Star(random(width), random(height)));
            }
        }

            
        
            for (let i = planets.length - 1; i >= 0; i--) {
                planets[i].update();
                if (planets[i].dead) {
                    planets.splice(i, 1); // Remove dead planets
                } else {
                    planets[i].display();
                }
            }
        }
        
      
    
    universeAge += timeSpeed * 5;
    background(lerpColor(color(10, 10, 30), color(0, 0, 10), frameCount / 500));
    
    for (let i = planets.length - 1; i >= 0; i--) {
        planets[i].update();
        planets[i].display();
    
        
        if (planets[i].age > planets[i].lifespan || planets[i].size > 300) {
            let newType = floor(random(4));  
            planets.push(new Planet(planets[i].x, planets[i].y, newType, true)); 
            planets.splice(i, 1); 
        }
    }
    
    if (frameCount % 2 === 0) {
        stars.push(new Star(random(width), random(height)));
    }

    for (let i = stars.length - 1; i >= 0; i--) {
        stars[i].update();
        stars[i].display();
        if (stars[i].isDead()) {
            stars.splice(i, 1);
        }
    }
    
    if (button) {
        fill(255, 0, 0);
        ellipse(buttonX, buttonY, 50, 50);
    }
    
    imageMode(CENTER);
    image(wand, wandX, wandY, 350, 200);
    image(asteroid, asteroidX, asteroidY, 100, 100);

   
    if (isDraggingWand) {
        for (let planet of planets) {
            let d = dist(wandX, wandY, planet.x, planet.y);
            if (d < 150) {
                planet.accelerate();
            }
        }
    }

    
    for (let i = planets.length - 1; i >= 0; i--) {
        let d = dist(asteroidX, asteroidY, planets[i].x, planets[i].y);
        if (d < 100) {
            planets.splice(i, 1);
        }
    }
}

function mousePressed() {
    if (dist(mouseX, mouseY, wandX, wandY) < 50) {
        isDraggingWand = true;
    } else if (dist(mouseX, mouseY, asteroidX, asteroidY) < 50) {
        isDraggingAsteroid = true;
    } else if (button && dist(mouseX, mouseY, buttonX, buttonY) < 25) {
        buttonClicks++;
        if (buttonClicks < 3) {
            buttonX = random(100, width - 100);
            buttonY = random(100, height - 100);
        } else {
            
            explosion = true;
            button =false;
            explosionTime = universeAge;
            Planet.accelerate();
            end= true;
        }
    } else {
        let type = floor(random(4));
        planets.push(new Planet(mouseX, mouseY, type, false));
    }
}

function mouseDragged() {
    if (isDraggingWand) {
        wandX = mouseX;
        wandY = mouseY;
    } else if (isDraggingAsteroid) {
        asteroidX = mouseX;
        asteroidY = mouseY;
    }
}

function mouseReleased() {
    isDraggingWand = false;
    isDraggingAsteroid = false;
}

function spawnButton() {
    buttonX = random(100, width - 100);
    buttonY = random(100, height - 100);
    button = true;
    
}

function windowResized() {
    let borderDiv = document.getElementById("border");
    resizeCanvas(borderDiv.clientWidth, borderDiv.clientHeight);
}

class Planet {
    constructor(x, y, type, isTiny) {
        this.x = x;
        this.y = y;
        this.size = isTiny ? random(5, 30) : random(30, 80);
        this.age = 0;
        this.lifespan = [1800, 2400, 3000, 5000][type]; 
        this.image = planetImages[type];
        this.orbitSpeed = random(0.001, 0.10);
        this.angle = random(TWO_PI);
        this.growthRate = isTiny ? random(0.01, 0.05) : random(0.02, 0.2);
        this.acceleration = 0.3;
        this.dead = false; 
    }

    update() {
        this.age += timeSpeed * this.acceleration;
        this.angle += this.orbitSpeed;
        this.x += cos(this.angle) * 0.5;
        this.y += sin(this.angle) * 0.5;
        this.size += this.growthRate;

        if (this.age > this.lifespan) {
            this.dead = true;
        }
    }

    display() {
        if (this.dead) return; 
        
        push();
        translate(this.x, this.y);
        rotate(this.age * 0.01);
        imageMode(CENTER);
        if (this.image) {
            image(this.image, 0, 0, this.size, this.size);
        } else {
            fill(255);
            ellipse(0, 0, this.size, this.size);
        }
        pop();
    }

    accelerate() {
        this.acceleration = 50;
    }
}


class Star {
    constructor(x, y) {
        this.x = x + random(-5, 5);
        this.y = y + random(-5, 5);
        this.size = random(2, 6);
        this.alpha = 255;
        this.twinkle = random(0.95, 1.05);
        this.speedX = random(-0.3, 0.3);
        this.speedY = random(-0.3, 0.3);
    }
    update() {
        this.alpha -= 5;
        this.x += this.speedX;
        this.y += this.speedY;
        this.size *= this.twinkle;
    }
    display() {
        noStroke();
        fill(255, this.alpha);
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = color(255, this.alpha);
        ellipse(this.x, this.y, this.size);
    }
    isDead() {
        return this.alpha <= 0;
    }
}
