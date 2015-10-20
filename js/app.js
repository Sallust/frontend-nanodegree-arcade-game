inherit = function(subClass,superClass) {
   subClass.prototype = Object.create(superClass.prototype); // delegate to prototype
   subClass.prototype.constructor = subClass; // set constructor on prototype
}

//global variables
var Game = function() {
    this.score = 0;
    this.lives = 5;
    this.paused = false;
    this.over = false;
}

Game.prototype.handleInput = function(input){
    if (input == 'pause' && this.paused === false) {
        this.paused = true;
        sounds.background.pause();
    } else if (input == 'pause' && this.paused) {
        this.paused = false;
        sounds.background.play();
    } if (input == 'new' && this.over)
        this.restart();
}

Game.prototype.restart = function(){
    this.score = 0;
    this.lives = 5;
    evilArmy.init();
    evilArmy.makeArmy(4);
    enemyMagazine.init();
    player.start();
    document.getElementById('game-over').style.display = "none";
    sounds.background.play();
    this.over = false;
}

// Enemies our player must avoid
var Enemy = function() {
    this.x = 500;
    this.y = 0;
    this.height = 50;
    this.width = 50;
    this.inUse = false;
    this.speed = 70;
    this.sprite = 'images/christie.jpg';
};

Enemy.prototype.update = function(dt) {
    this.y += this.speed * dt;
    if (Math.random() > .995 && this.inUse) {
        this.spew();
    }
    if (this.y >= game.canvasHeight - this.height || this.y <= 0) {
        this.speed = -this.speed;
    }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Enemy.prototype.spawn = function(x,y) {
    this.x = x;
    this.y = y;
    this.inUse = true;
}

Enemy.prototype.spew = function() {
    enemyMagazine.get(this.x + 5, this.y) //passes x and y values of enemy to enemyMagazine to bullet
}

Enemy.prototype.checkCollision = function() {
    for (var i = 0; i < player.magazine.cap; i++) {
        if (this.isColliding(player.magazine.array,i)) {
            this.inUse = false;
            player.magazine.array[i].clear();
            game.score += 100;
            fancyExplosion(this.x, this.y);
            sounds.explosionPool.get();
        };
    };
}

Enemy.prototype.isColliding = function(array,i) {
        if (this.x < array[i].x + 3  && this.x + this.width  > array[i].x && this.y < array[i].y + 4 && this.y + this.height > array[i].y) {
            return true;
        };

}

var Player = function(){
    this.start();
    this.height = 171;
    this.width = 101;
    this.sprite = 'images/char-boy.png';
    this.magazine = new Magazine(5);   //max bullets set to 5 here
    this.magazine.init();
}

Player.prototype.update = function(dt) {
    //collisions with margins accounted
    //if (allEnemies[0].y - 65 < this.y && this.y < allEnemies[0].y + 82 && allEnemies[0].x - 86 < this.x && this.x < allEnemies[0].x + 86) {
       // this.start();
    //}
    for (var i = 0; i < enemyMagazine.cap; i++) {  //for all enemy bullets
        if (this.isColliding(enemyMagazine.array,i)) {
            fancyExplosion(this.x,this.y);
            this.start();
            enemyMagazine.array[i].clear(); //collided bullet gets cleared
            game.lives -= 1;
            if (game.lives == 0) {
                game.over = true;
            };
        };
    };
};

Player.prototype.isColliding = function(array,i) {
    if (this.x < array[i].x + 3  && this.x + this.width  > array[i].x && this.y <array[i].y + 4 && this.y + this.height > array[i].y) {
        return true;
    }
};


// Draw the enemy on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(input){
    if (input == 'left' && this.x > 0)
        this.x -= 15;
    if (input == 'right' && this.x < game.canvasWidth - this.width)
        this.x +=15;
    if (input == 'up' && this.y > 0)
        this.y -=15;
    if (input == 'down' && this.y < game.canvasHeight - this.height)
        this.y +=15;
    if (input == 'space')
        this.shoot();
}

Player.prototype.start = function(){
    this.x = 10;
    this.y = 280
}

Player.prototype.shoot = function(){
    this.magazine.get(this.x + 5, this.y) //passes x and y values of player to magazine to bullet
    sounds.laserPool.get();
}

var Background = function(){
    this.x = 0;
    this.y = 0;
    this.image = 'images/july606.jpg';
    this.speed = 50;
}

Background.prototype.render = function() {
    ctx.drawImage(Resources.get(this.image), this.x, this.y);
    ctx.drawImage(Resources.get(this.image), this.x, this.y - game.canvasHeight);
};

Background.prototype.update = function(dt) {
    this.y += this.speed * dt;
    if (this.y >= game.canvasHeight) {
        this.y = 0;
    }
};

var Pool = function(maxElements) {
    this.array = [];
    this.cap = maxElements;
}

Pool.prototype.get = function(x,y,angle){
    if (!this.array[this.cap - 1].inUse) {     //runs when bullet is NOT in use
        this.array[this.cap - 1].spawn(x,y,angle);    //calls bullet.spawn
        this.array.unshift(this.array.pop());         //moves this bullet to the front of the array
    }
}

Pool.prototype.arm = function(){
    for (var i = 0; i < this.cap; i++) {   //for all bullets in magazine
        if (this.array[i].inUse) {   //if bullet IS in use
            this.array[i].render();     //draw the bullet
        }
    }
}

var Magazine = function(maxElements){
    Pool.call(this, maxElements);
}

inherit(Magazine,Pool);  //Magazine, a pool of TruthBullets is subClass of Pool

Magazine.prototype.init = function(){
    for (var i = 0; i < this.cap; i++) {
        var bullet = new TruthBullet();
        this.array[i] = bullet;
    }
}

var EvilArmy = function(maxElements) {
    Pool.call(this, maxElements);
}

inherit(EvilArmy,Pool);  //EvilArmy, a pool of Enemies, is subClass of Pool

EvilArmy.prototype.init = function(){
    for (var i = 0; i < this.cap; i++) {
        var enemy = new Enemy();
        this.array[i] = enemy;
    };
}

EvilArmy.prototype.makeArmy = function(enlisted){
    var x = 500;
    var y = 0;
    for (var i = 0; i < enlisted; i++) {
        evilArmy.get(x,y);
        y += 50;
    };
}

var EnemyMagazine = function(maxElements) {
    Pool.call(this, maxElements);
}

inherit(EnemyMagazine,Pool);  //EnemyMagazine, a pool of LiesBullets is subClass of Pool

EnemyMagazine.prototype.init = function(){
    for (var i = 0; i < this.cap; i++) {
        var bullet = new LiesBullet();
        this.array[i] = bullet;
    }
}

var Bullet = function() {
    this.inUse = false;
    this.speed = 50;
}

Bullet.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Bullet.prototype.spawn = function(x,y){
    this.x = x;
    this.y = y;
    this.inUse = true;
}

Bullet.prototype.clear = function(){
    this.x = 0;
    this.y = 0;
    this.inUse = false;
}

var TruthBullet = function() {   //type of bullet player shoots
    Bullet.call(this);
    this.sprite = 'images/briefcase.png';
}

inherit(TruthBullet,Bullet);  //TruthBullet is subClass of Bullet

TruthBullet.prototype.update = function(dt){
    this.x += this.speed * dt;
    if (this.x >= game.canvasWidth) {    //calls bullet.clear when bullet reaches end of screen
        this.clear();
    }
}

var LiesBullet = function() {   //type of bullet player shoots
    Bullet.call(this);
    this.sprite = 'images/star_small.png';
}

inherit(LiesBullet,Bullet); //LiesBullet is subClass of Bullet

LiesBullet.prototype.update = function(dt){
    this.x -= this.speed * dt;
    if (this.x <= 0) {    //calls bullet.clear when bullet reaches end of screen
        this.clear();
    }
}

var Sounds = function() { //not really a superclass but organized code logically
    this.laserPool = new SoundPool(10)      //number of laser sounds
    this.laserPool.initLaser();

    this.explosionPool = new SoundPool(15)   //# of explosion sounds
    this.explosionPool.initExplosion();

    this.background = new Audio('sounds/kick_shock.wav');
    this.background.volume = .09;
    this.background.loop = true;
    this.background.load();
}

var SoundPool = function(maxElements){
    Pool.call(this, maxElements);
    this.selected = 0; //selected = index value of currently playing sound
}

inherit(SoundPool,Pool); //SoundPool, a pool of sounds, is subClass of Pool

SoundPool.prototype.initLaser = function(){
    for (var i = 0; i < this.cap; i++) {
        var laser = new Audio('sounds/laser.wav');
        laser.load();
        this.array[i] = laser;
    }
}

SoundPool.prototype.initExplosion = function(){
    for (var i = 0; i < this.cap; i++) {
        var explosion = new Audio("sounds/explosion.wav");
        explosion.load();
        this.array[i] = explosion;
    }
}

SoundPool.prototype.get = function() {
    if (this.array[this.selected].currentTime == 0 || this.array[this.selected].ended) {
        this.array[this.selected].play();
        this.selected = (this.selected + 1) % this.cap //loops through sound index
    }
}

var Particle = function() {
    this.scale = 1;
    this.x = 0;
    this.y = 0;
    this.radius = 20;
    this.radius2 = this.radius * 2.4; //good ratio for flag-like star
    this.velocityX = 0;
    this.velocityY = 0;
    this.scaleSpeed = 0.5;
    this.inUse = false;
    this.color = this.pickColor();
    this.blinking = Math.random();
}

Particle.prototype.spawn = function(x,y,angle){
    this.inUse = true;
    this.radius = 10 + Math.random() * 20;
    this.speed = 60 + Math.random() * 150;
    this.scale = 1;
    this.scaleSpeed = 1 + Math.random() * 3;
    this.x = x;
    this.y = y;
    this.angle = angle;

    //velocity is rotated by angle
    this.velocityX = this.speed * Math.cos(angle * Math.PI / 180);
    this.velocityY = this.speed * Math.sin(angle * Math.PI / 180);
}
Particle.prototype.pickColor = function() {
    if (Math.random() < 0.33) {
        return '#E0162B'; //old Glory Red
    } else if (Math.random() < 0.66) {
        return '#FFF';
    } else
        return '#0052A5'; //Old Glory Blue
}

Particle.prototype.update = function(dt) {
    if (this.inUse) {
        this.scale -= this.scaleSpeed * dt;
        this.x += this.velocityX * dt;
        this.y += this.velocityY * dt;
    }
    if (this.scale <= 0) {
        this.scale = 0;
        this.inUse = false;
    };
}

Particle.prototype.render = function() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    var x,y;

    ctx.fillStyle = this.blinking < 0.2 ? this.pickColor() : this.color; //fillStyle set to rotate through colors (blinking) or set to solid given color
    ctx.beginPath();
    for (var rot = Math.PI/2*3; rot < 11; rot += Math.PI/5) { //rot < 11 since 11 roughly equals 7pi/2
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
}

var fancyExplosion = function(x,y) {
    for (var angle = 0; angle<360; angle += 10) {
        particlesPool.get (x, y, angle);
    }
}

var ParticlesPool = function(maxElements){
    Pool.call(this, maxElements);
}

inherit(ParticlesPool,Pool); //ParticlesPool, a pool of particles, is subClass of Pool

ParticlesPool.prototype.init = function(){
    for (var i = 0; i < this.cap; i++) {
        var particle = new Particle();
        this.array[i] = particle;
    }
}

var particlesPool = new ParticlesPool(100);
particlesPool.init();




var game = new Game();
var sounds = new Sounds();

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var evilArmy = new EvilArmy(6);
evilArmy.init();
evilArmy.makeArmy(4);

var enemyMagazine = new EnemyMagazine(8);
enemyMagazine.init();

var allEnemies = evilArmy.array;

var player = new Player();

var background = new Background();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
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
