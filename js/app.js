function inherit(subClass,superClass) {
   subClass.prototype = Object.create(superClass.prototype);
   subClass.prototype.constructor = subClass;
}

//game attributes variables
var Game = function() {
    this.score = 0;
    this.lives = 3;
    this.paused = false;
    this.over = false;
    this.win = false;
};

//input handler for pause and new game; checks game.paused state and alters it
Game.prototype.handleInput = function(input){
    if (input == 'pause' && this.paused === false) {
        this.paused = true;
        sounds.background.pause();
    } else if (input == 'pause' && this.paused) {
        this.paused = false;
        sounds.background.play();
    } if (input == 'new' && this.over)
        this.restart();
};

//called by player onscreen click during game.over or game.win; most game variables
Game.prototype.restart = function(){
    this.score = 0;
    this.lives = 5;
    evilArmy.init(Enemy);
    evilArmy.makeArmy(7);
    enemyMagazine.init(LiesBullet);
    player.start();
    document.getElementById('game-over').style.display = "none";
    document.getElementById('game-win').style.display = "none";
    sounds.background.play();
    sounds.gameOver.pause();
    sounds.gameWin.pause();
    this.over = false;
    this.win = false;
};

// Enemy attributes assigned including random X & Y speed between 40 and 80
var Enemy = function() {
    this.x = 500;
    this.y = 0;
    this.height = 66;
    this.width = 68;
    this.inUse = false;
    this.Xspeed = 40 + Math.random() * 40;
    this.Yspeed = 40 + Math.random() * 40;
    this.sprite = 'images/christiespriteboard.png';
    this.frameIndex = 0;
};

/*
*updates enemy position;
*spews bullet when Math.Random() happens to be less than .005;
*X & Y speed reversed at respective borders
*/
Enemy.prototype.update = function(dt) {
    this.y += this.Yspeed * dt;
    this.x += this.Xspeed * dt;
    if (Math.random() < 0.005 && this.inUse) {
        this.spew();
    }
    if (this.y >= game.CANVAS_HEIGHT - this.height || this.y <= 0) {
        this.Yspeed = -this.Yspeed;
    }
    if (this.x >= game.CANVAS_WIDTH - this.width || this.x < 360 ) {
        this.Xspeed = -this.Xspeed;
    }
};

//cycles through 4 images on spritesheet
//Math.floor() and small increments acheive desired cycle speed
Enemy.prototype.render = function() {
     if (this.frameIndex >= 4) {
            this.frameIndex = 0;
        }
    ctx.drawImage(Resources.get(this.sprite), 0, Math.floor(this.frameIndex) * 102, 100, 102, this.x, this.y, 66, 68);
    this.frameIndex += 0.2;
};

Enemy.prototype.spawn = function(x,y) {
    this.x = x;
    this.y = y;
    this.inUse = true;
};

//Enemy stopped & moved to position off screen (away from possible collisions)
Enemy.prototype.clear = function() {
    this.x = game.CANVAS_WIDTH;
    this.y = -100;
    this.inUse = false;
    this.Xspeed = 0;
    this.Yspeed = 0;
};

//Enemy spews bullet passing its own x & y to bullet
Enemy.prototype.spew = function() {
    enemyMagazine.get(this.x + 20, this.y + 5, this.y - player.y);
};

/*for all player's bullets
*checks if bullet is colliding:
*explosion, enemy reset, bullet reset, score increases, sound fires
*called by Engine update
*/
Enemy.prototype.checkCollision = function() {
    for (var i = 0; i < player.magazine.cap; i++) {
        if (this.isColliding(player.magazine.array,i)) {
            fancyExplosion(this.x + 50, this.y + 50);
            this.clear();
            player.magazine.array[i].clear();
            game.score += 100;
            sounds.terminationPool.get();
        }
    }
};

//defines collision: slightly modified bounding box method
Enemy.prototype.isColliding = function(array,i) {
        if (this.x < array[i].x + 8  && this.x + this.width  > array[i].x && this.y < array[i].y + 8 && this.y + this.height > array[i].y) {
            return true;
        }
};

Enemy.prototype.checkPlayerCollision = function() {
    if (this.x <player.x + player.width  && this.x + this.width  > player.x && this.y < player.y + player.height && this.y + this.height > player.y) {
        this.clear();
        fancyExplosion(this.x + 180,this.y + 75);
        sounds.explosionPool.get();
        game.lives -= 1;
        player.start();
    }
};

//player position set; player's bullet magazine instantiated here
var Player = function(){
    this.start();
    this.height = 84;
    this.width = 150;
    this.sprite = 'images/trumpspriteboard.png';
    this.lifeSprite = 'images/trumpbutton.png';
    this.magazine = new Pool(20);
    this.magazine.init(BriefcaseBullet);
    this.frameIndex = 0;
    this.rotation = 0;
};

//checks for game.over, player movement disabled
Player.prototype.update = function(dt) {
    if (game.lives <= 0) {
            game.over = true;
    }
    if (game.over) {
        this.x = 150;
        this.y = game.CANVAS_HEIGHT/2;
    }
};

/*for all enemy bullets,
* if colliding:
* explosion, bullet cleared, lives reduced
*/
Player.prototype.checkCollision = function() {
    for (var i = 0; i < enemyMagazine.cap; i++) {
        if (this.isColliding(enemyMagazine.array,i)) {
            fancyExplosion(this.x + 180,this.y + 75);
            sounds.explosionPool.get();
            enemyMagazine.array[i].clear();
            game.lives -= 1;
        }
    }
};

//checks collision of player vs. enemy magazine
Player.prototype.isColliding = function(array,i) {
    if (this.x < array[i].x + 4  && this.x + this.width  > array[i].x && this.y <array[i].y + 4 && this.y + this.height > array[i].y) {
        return true;
    }
};

/*loop through 4 images on sprite sheet
*Use Math.Floor for discrete increases to actual frame index
* increase frameIndex of 0.5 achieves good loop rate
*/
Player.prototype.render = function() {
    if (this.frameIndex >= 4) {
        this.frameIndex = 0;
    }
    if (!game.over) {
        ctx.drawImage(Resources.get(this.sprite), 0, Math.floor(this.frameIndex) * 84, 150, 84, this.x, this.y, 150, 84);
    this.frameIndex += 0.5;
    }
};

//renders buttons representing lives at bottom of screen for number of lives
Player.prototype.renderLifeStatus = function () {
    for (var i = 0; i < game.lives; i++) {
        ctx.drawImage(Resources.get(this.lifeSprite), 5 + i * 55 , game.CANVAS_HEIGHT - 55, 50, 50);
    }
};

//spins player crazily when game.over
Player.prototype.renderGameOver= function () {
    ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.rotation);
        this.rotation -= 0.05;
        ctx.drawImage(Resources.get(this.sprite), 0, 0, 150, 84, -140/2, -84/2, 140, 84);
        ctx.restore();
        for (var i = 0; i < 7; i ++) {
            fancyExplosion(200 * Math.random(), 150 + 200 * Math.random());
        }
};

Player.prototype.handleInput = function(input){
    if (input == 'left' && this.x > 0)
        this.x -= 30;
    if (input == 'right' && this.x < game.CANVAS_WIDTH - this.width)
        this.x +=30;
    if (input == 'up' && this.y > 0)
        this.y -=30;
    if (input == 'down' && this.y < game.CANVAS_HEIGHT - this.height)
        this.y +=30;
    if (input == 'space' && !game.paused)
        this.shoot();
};

//starting player position
Player.prototype.start = function(){
    this.x = 10;
    this.y = 280;
};

//passes player x & y values to bullet (140,77) so shot starts near gun
//sound
Player.prototype.shoot = function(){
    this.magazine.get(this.x + 140, this.y + 77);
    sounds.laserPool.get();
};

/* Background class to create parallax scroll
*different parameters to accommodate different background sizes, speed
*such as grass which only covers bottom
*/
var Background = function(imgSrc,speed,width,height){
    this.x = 0;
    this.y = 0;
    this.image = imgSrc;
    this.speed = speed;
    this.width = width;
    this.height = height;
};

//background moves left by reducing x value and redrawing
//same image starting at end of previous one
Background.prototype.render = function() {
    ctx.drawImage(Resources.get(this.image), this.x, game.CANVAS_HEIGHT - this.height);
    ctx.drawImage(Resources.get(this.image), this.x + this.width, game.CANVAS_HEIGHT - this.height);
};

Background.prototype.update = function(dt) {
    this.x -= this.speed * dt;
    if (this.x <= -this.width) {
        this.x = 0;
    }
};

/*Pool organizes arrays of objects
*creates a finite number of bullets, particles, enemies
*rather than calling potentially infinite numbers of them
*/
var Pool = function(maxElements) {
    this.array = [];
    this.cap = maxElements;
};

//creates array of objects: enemies, bullets, particles for explosions
Pool.prototype.init = function(constructorFunc){
    for (var i = 0; i < this.cap; i++) {
        var element = new constructorFunc();
        this.array[i] = element;
    }
};

//checks last element free and spawns it, moves it to front of array
Pool.prototype.get = function(x,y,angle){
    if (!this.array[this.cap - 1].inUse) {
        this.array[this.cap - 1].spawn(x,y,angle);
        this.array.unshift(this.array.pop());
    }
};

//called by render functions
//renders only objects in use
Pool.prototype.arm = function(){
    for (var i = 0; i < this.cap; i++) {
        if (this.array[i].inUse) {
            this.array[i].render();
        }
    }
};

//Evil Army, a specific subclass of pool with special methods
var EvilArmy = function(maxElements) {
    Pool.call(this, maxElements);
};

inherit(EvilArmy,Pool);

//passes initial x & y values to array of enemies and spawns them
EvilArmy.prototype.makeArmy = function(enlisted){
    var x = 500;
    var y = 0;
    for (var i = 0; i < enlisted; i++) {
        evilArmy.get(x,y);
        y += 75;
    }
};

//checks if all enemies have been killed
//needed to declare game.win state
EvilArmy.prototype.poolStatus = function() {
    function isInUse (element) {
        return !element.inUse;
    }
    return this.array.every(isInUse);
};

var Bullet = function() {
    this.inUse = false;
    this.speed = 75;
    this.rotation = 0;
    this.yspeed = 0;
};

//Bullets rotate by translating axis, rotating, and drawing at center
Bullet.prototype.render = function() {
    ctx.save();
    ctx.translate(this.x,this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(Resources.get(this.sprite), -8, -8);
    ctx.restore();
};

Bullet.prototype.spawn = function(x,y){
    this.x = x;
    this.y = y;
    this.inUse = true;
};

Bullet.prototype.clear = function(){
    this.x = 0;
    this.y = 0;
    this.inUse = false;
};

//subclass of bullets player uses
var BriefcaseBullet = function() {
    Bullet.call(this);
    this.sprite = 'images/briefcase.png';
    this.speed = 100;
};

inherit(BriefcaseBullet,Bullet);  //BriefcaseBullet is subClass of Bullet

//bullet cleared when reaches end of screen;
BriefcaseBullet.prototype.update = function(dt){
    this.x += this.speed * dt;
    if (this.x >= game.CANVAS_WIDTH || game.win || game.over) {
        this.clear();
    }
};

//Enemy Bullet class
var LiesBullet = function() {
    Bullet.call(this);
    this.sprite = 'images/redstar.png';
};

inherit(LiesBullet,Bullet); //LiesBullet is subClass of Bullet

//Bullet rotates and is cleared at end of screen or game win or game over
LiesBullet.prototype.update = function(dt){
    this.x -= this.speed * dt;
    this.y -= (this.y - player.y) * dt * 0.25; //bullet hones in on player position
    this.rotation -= 15 * dt;
    if (this.x <= 0 || game.win || game.over) {
        this.clear();
    }
};

/*SoundPool a pool of sounds; similar in concept to Pool, but not a subclass
*this.selected is index value of current playing sound
*max, src and volume set in constructor call
*/
var SoundPool = function(maxElements, soundSrc, volume){
    this.array = [];
    this.selected = 0;
    for (var i = 0; i < maxElements; i++) {
        var sound = new Audio(soundSrc);
        sound.load();
        sound.volume = volume;
        this.array[i] = sound;
    }
};

//loops through pool and plays first available
SoundPool.prototype.get = function() {
    if (this.array[this.selected].currentTime === 0 || this.array[this.selected].ended) {
        this.array[this.selected].play();
        this.selected = (this.selected + 1) % this.array.length;
    }
};

//instantiate soundpools and all remaining sound
var Sounds = function() {
    this.laserPool = new SoundPool(10,'sounds/laser.wav', 0.5);
    this.explosionPool = new SoundPool(15, 'sounds/explosion.wav', 0.2);
    this.terminationPool = new SoundPool(8, 'sounds/youre_fired.wav',1);

    this.gameOver = new Audio('sounds/disaster.wav');
    this.gameOver.volume = 0.6;
    this.gameWin = new Audio('sounds/americagreat.wav');
    this.gameWin.volume = 1;
    this.background = new Audio('sounds/apprenticetheme.mp3');
    this.background.volume = 0.1;
    this.background.loop = true;
    this.background.load();
};

/*class of objects (stars) for use in explosions
*/
var Particle = function() {
    this.x = 0;
    this.y = 0;
    this.radius = 20;
    this.radius2 = this.radius * 2.4; //most flag-like ratio
    this.scale = 1;
    this.velocityX = 0;
    this.velocityY = 0;
    this.scaleSpeed = 0.5; //rate at which particles vanish
    this.inUse = false;
    this.color = this.pickColor(); //red, white or blue
    this.blinking = Math.random(); //determines if particle blinks
};

/*assigns random variables within ranges for non-repetitive effect
* angle will be passed at time of call in intervals of 10
* velocities rotate given these intervals
*/
Particle.prototype.spawn = function(x,y,angle){
    this.inUse = true;
    this.radius = 10 + Math.random() * 20;
    this.speed = 60 + Math.random() * 150;
    this.scale = 1;
    this.scaleSpeed = 1 + Math.random() * 3;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.velocityX = this.speed * Math.cos(angle * Math.PI / 180);
    this.velocityY = this.speed * Math.sin(angle * Math.PI / 180);
};

//particle is color red, white, or blue
Particle.prototype.pickColor = function() {
    if (Math.random() < 0.33) {
        return '#E0162B'; //old Glory Red
    } else if (Math.random() < 0.66) {
        return '#FFF';
    } else
        return '#0052A5'; //Old Glory Blue
};

//active particles scale decreased so appear to be vanishing
//when finally 0, particle is no longer inUse and can be used in new explosion
Particle.prototype.update = function(dt) {
    if (this.inUse) {
        this.scale -= this.scaleSpeed * dt;
        this.x += this.velocityX * dt;
        this.y += this.velocityY * dt;
    }
    if (this.scale <= 0) {
        this.scale = 0;
        this.inUse = false;
    }
};

/*Drawing individual particles
*80% of particles maintain initial red white or blue color
*20% will rotate through the colors and "blink"
*star is drawn in relation to initial x,y w/o altering those var
*/
Particle.prototype.render = function() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    var x,y;
    ctx.fillStyle = this.blinking < 0.2 ? this.pickColor() : this.color;
    ctx.beginPath();
    for (var rot = Math.PI/2*3; rot < 11; rot += Math.PI/5) { //rot < 11 since 11 roughly equals 7pi/2, needed for full star
        x = Math.cos(rot) * this.radius;
        y = Math.sin(rot) * this.radius;
        ctx.lineTo(x, y);
        rot += Math.PI/5;
        x = Math.cos(rot) * this.radius2;
        y = Math.sin(rot) * this.radius2;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(0, -this.radius);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
};

//Explosion by getting particles from ParticlesPool and passing x,y values
var fancyExplosion = function(x,y) {
    for (var angle = 0; angle<360; angle += 10) {
        particlesPool.get (x, y, angle);
    }
};

//instantiate ParticlesPool
var particlesPool = new Pool(100);
particlesPool.init(Particle);

//instantiate Backgrounds
var cloudsBackground = new Background('images/clouds2.png', 100, 700, 560);
var monumentsBackground = new Background('images/dcmonuments.png',200, 2100, 560);
var grassBackground = new Background('images/grass.png', 400, 700, 100);

var game = new Game();
var sounds = new Sounds();

var evilArmy = new EvilArmy(7);
evilArmy.init(Enemy);
evilArmy.makeArmy(7);

//There can only be 5 enemy bullets on the screen at any given time
var enemyMagazine = new Pool(5);
enemyMagazine.init(LiesBullet);

var player = new Player();

document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        80: 'pause',
        78: 'new'
    };
    player.handleInput(allowedKeys[e.keyCode]);
    game.handleInput(allowedKeys[e.keyCode]);
});

//disable space & up down scroll
window.onkeydown = function(e) {
    if(e.keyCode == 32 || e.keyCode == 38 || e.keyCode == 40) {
        e.preventDefault();
    }
};
