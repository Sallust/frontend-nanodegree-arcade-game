inherit = function(subClass,superClass) {
   subClass.prototype = Object.create(superClass.prototype); // delegate to prototype
   subClass.prototype.constructor = subClass; // set constructor on prototype
}

//global variables
var Game = function() {
    this.score = 0;
    this.lives = 7;
    this.paused = false;
    this.over = false;
    this.win = false;
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
    evilArmy.makeArmy(7);
    enemyMagazine.init();
    player.start();
    document.getElementById('game-over').style.display = "none";
    document.getElementById('game-win').style.display = "none";
    sounds.background.play();
    this.over = false;
    this.win = false;
}


// Enemies our player must avoid
var Enemy = function() {
    this.x = 500;
    this.y = 0;
    this.height = 100;
    this.width = 100;
    this.inUse = false;
    this.Xspeed = 40 + Math.random() * 40;
    this.Yspeed = 40 + Math.random() * 40;
    this.sprite = 'images/christiespriteboard.png';
    this.justSpewed = false;
    this.spewCounter = 0;
    this.frameIndex = 0;
};

Enemy.prototype.update = function(dt) {
    this.y += this.Yspeed * dt;
    this.x += this.Xspeed * dt;
    if (Math.random() > .995 && this.inUse && !this.justSpewed) {
        this.spew();
        this.justSpewed = true;
        this.spewCounter = 0;

       // this.sprite = 'images/christiemad.jpg';
    }
    if (this.y >= game.CANVAS_HEIGHT - this.height || this.y <= 0) {
        this.Yspeed = -this.Yspeed;
    }
    if (this.x >= game.CANVAS_WIDTH - this.width || this.x < 360 ) {
        this.Xspeed = -this.Xspeed;
    }

    if (this.justSpewed) {
        this.spewCounter += 40 * dt ;

    }
    if (this.spewCounter >= 10) {
       // this.sprite = 'images/christie.jpg';
        this.justSpewed = false;
    }

}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
     if (this.frameIndex >= 4) {
            this.frameIndex = 0;
        };
    ctx.drawImage(Resources.get(this.sprite), 0, Math.floor(this.frameIndex) * 102, 100, 102, this.x, this.y, 100, 102);
    this.frameIndex += 0.2;

}

Enemy.prototype.spawn = function(x,y) {
    this.x = x;
    this.y = y;
    this.inUse = true;
}

Enemy.prototype.clear = function() {
    this.x = game.CANVAS_WIDTH;
    this.y = 0;
    this.inUse = false;
}

Enemy.prototype.spew = function() {
    enemyMagazine.get(this.x + 20, this.y + 5, this.y - player.y) //passes x and y values of enemy to enemyMagazine to bullet
}

Enemy.prototype.checkCollision = function() {
    for (var i = 0; i < player.magazine.cap; i++) {
        if (this.isColliding(player.magazine.array,i)) {
            fancyExplosion(this.x + 50, this.y + 50);
            this.clear();
            player.magazine.array[i].clear();
            game.score += 100;

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
    this.height = 140;
    this.width = 250;
    this.sprite = 'images/trumpspriteboard.png';
    this.lifeSprite = 'images/trumpbutton.png';
    this.magazine = new Magazine(20);   //max bullets set to 5 here
    this.magazine.init();
    this.frameIndex = 0;
}

Player.prototype.update = function(dt) {
    //collisions with margins accounted
    //if (allEnemies[0].y - 65 < this.y && this.y < allEnemies[0].y + 82 && allEnemies[0].x - 86 < this.x && this.x < allEnemies[0].x + 86) {
       // this.start();
    //}
    for (var i = 0; i < enemyMagazine.cap; i++) {  //for all enemy bullets
        if (this.isColliding(enemyMagazine.array,i)) {
            fancyExplosion(this.x + 180,this.y + 75);
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
    if (this.frameIndex >= 4) {
            this.frameIndex = 0;
        };
    ctx.drawImage(Resources.get(this.sprite), 0, Math.floor(this.frameIndex) * 140, 256, 140, this.x, this.y, 256, 140);
    this.frameIndex += 1/2;
    for (var i = 0; i < game.lives; i++) {
        ctx.drawImage(Resources.get(this.lifeSprite), 5 + i * 55 , game.CANVAS_HEIGHT - 55, 50, 50)
    }


};

Player.prototype.handleInput = function(input){
    if (input == 'left' && this.x > 0)
        this.x -= 15;
    if (input == 'right' && this.x < game.CANVAS_WIDTH - this.width)
        this.x +=15;
    if (input == 'up' && this.y > 0)
        this.y -=15;
    if (input == 'down' && this.y < game.CANVAS_HEIGHT - this.height)
        this.y +=15;
    if (input == 'space')
        this.shoot();
}

Player.prototype.start = function(){
    this.x = 10;
    this.y = 280
}

Player.prototype.shoot = function(){
    this.magazine.get(this.x + 232, this.y + 128) //passes x and y values of player to magazine to bullet
    sounds.laserPool.get();
}

var Background = function(imgSrc,speed,width,height){ //previous speed was 50
    this.x = 0;
    this.y = 0;
    this.image = imgSrc;
    this.speed = speed;
    this.width = width;
    this.height = height;
}

Background.prototype.render = function() {
    ctx.drawImage(Resources.get(this.image), this.x, game.CANVAS_HEIGHT - this.height);
    ctx.drawImage(Resources.get(this.image), this.x + this.width, game.CANVAS_HEIGHT - this.height);
};

Background.prototype.update = function(dt) {
    this.x -= this.speed * dt;
    if (this.x <= -this.width) {
        this.x = 0;
    }
}



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
        y += 75;
       // for (var j = 0; j < 2; j++) {
          //  evilArmy.get(x,y);
          //  x += 100;
       // }
    };
}

EvilArmy.prototype.poolStatus = function() {
    function isInUse (element, index, array) {
        return !element.inUse
    }
    return this.array.every(isInUse)
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
    this.speed = 75;
    this.rotation = 0;
    this.yspeed = 0;
}

Bullet.prototype.render = function() {
    ctx.save();
    ctx.translate(this.x,this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(Resources.get(this.sprite), -8, -8);
    ctx.restore();
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

    if (this.x >= game.CANVAS_WIDTH) {    //calls bullet.clear when bullet reaches end of screen
        this.clear();
    }
}

var LiesBullet = function() {   //type of bullet player shoots
    Bullet.call(this);
    this.sprite = 'images/redstar.png';
}

inherit(LiesBullet,Bullet); //LiesBullet is subClass of Bullet

LiesBullet.prototype.update = function(dt){
    this.x -= this.speed * dt;
    this.y -= (this.y - player.y) * dt * 0.25
    this.rotation -= 15 * dt;
    if (this.x <= 0) {    //calls bullet.clear when bullet reaches end of screen
        this.clear();
    }
}

LiesBullet.prototype.spawn = function(x,y,yspeed){
    this.x = x;
    this.y = y;
    //this.yspeed = yspeed;
    this.inUse = true;
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

var cloudsBackground = new Background('images/clouds2.png', 100, 700, 560);
var monumentsBackground = new Background('images/dcmonuments.png',200, 2100, 560);
var grassBackground = new Background('images/grass.png', 400, 700, 100);




var game = new Game();
var sounds = new Sounds();

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var evilArmy = new EvilArmy(7);
evilArmy.init();
evilArmy.makeArmy(3);

var enemyMagazine = new EnemyMagazine(5);
enemyMagazine.init();

var allEnemies = evilArmy.array;

var player = new Player();

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
