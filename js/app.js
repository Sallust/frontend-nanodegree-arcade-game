//global variables
var canvasHeight = 606;
var canvasWidth = 505;
var score = 0;


// Enemies our player must avoid
var Enemy = function() {

    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = 0;
    this.y = 225;
    this.height = 171;
    this.width = 101;
    this.inUse = false;


    this.speed = 70;

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    if (Math.random() > .995) {
        this.spew();
    };
    if (this.x > canvasWidth - this.width || this.x < 0) {
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
        if (this.x < player.magazine.array[i].x + 3  && this.x + this.width  > player.magazine.array[i].x && this.y < player.magazine.array[i].y + 4 && this.y + this.height > player.magazine.array[i].y) {
            this.inUse = false;
            player.magazine.array[i].inUse = false;
            score += 100;
        };
    };
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
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
    if (allEnemies[0].y - 65 < this.y && this.y < allEnemies[0].y + 82 && allEnemies[0].x - 86 < this.x && this.x < allEnemies[0].x + 86) {
        this.start();
    }
    for (var i = 0; i < enemyMagazine.cap; i++) {
        if (this.x < enemyMagazine.array[i].x + 3  && this.x + this.width  > enemyMagazine.array[i].x && this.y < enemyMagazine.array[i].y + 4 && this.y + this.height > enemyMagazine.array[i].y) {
            this.start();
            enemyMagazine.array[i].inUse = false;
        };
    };


    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

};

// Draw the enemy on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(input){
    if (input == 'left' && this.x > 0)
        this.x -= 15;
    if (input == 'right' && this.x < 410)
        this.x +=15;
    if (input == 'up')
        this.y -=15;
    if (input == 'down' && this.y < 430)
        this.y +=15;
    if (input == 'space')
        this.shoot();


}

Player.prototype.start = function(){
    this.x = 202;
    this.y = 435;
}

Player.prototype.shoot = function(){
    this.magazine.get(this.x + 5, this.y) //passes x and y values of player to magazine to bullet
}

var Background = function(){
    this.x = 0;
    this.y = 0;
    this.image = 'images/lame-stars-bg.png';
    this.speed = 140;

}

Background.prototype.render = function() {
    ctx.drawImage(Resources.get(this.image), this.x, this.y);
    ctx.drawImage(Resources.get(this.image), this.x, this.y - canvasHeight);
};

Background.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    this.y += this.speed * dt;
    if (this.y >= canvasHeight)
        this.y = 0;
};

var Pool = function(maxElements){
    this.array = [];
    this.cap = maxElements;
}

Pool.prototype.get = function(x,y){
    if (!this.array[this.cap - 1].inUse) {     //runs when bullet is NOT in use
        this.array[this.cap - 1].spawn(x,y);    //calls bullet.spawn
        this.array.unshift(this.array.pop());         //moves this bullet to the front of the array
    }
};

Pool.prototype.arm = function(){
    for (var i = 0; i < this.cap; i++) {   //for all bullets in magazine
        if (this.array[i].inUse) {   //if bullet IS in use
            this.array[i].render();     //draw the bullet
            this.array[i].checkCollision()
        }
        //else
            //break;
    }
}

var Magazine = function(maxElements){
    Pool.call(this, maxElements);
}

Magazine.prototype = Object.create(Pool.prototype); //Magazine is subClass of Pool
Magazine.prototype.constructor = Magazine;

Magazine.prototype.init = function(){
    for (var i = 0; i < this.cap; i++) {
        var bullet = new TruthBullet();
        this.array[i] = bullet;
    }
};

var EvilArmy = function(maxElements) {
    Pool.call(this, maxElements);
}

EvilArmy.prototype = Object.create(Pool.prototype); //EvilArmy is subClass of Pool
EvilArmy.prototype.constructor = EvilArmy;

EvilArmy.prototype.init = function(){
    for (var i = 0; i < this.cap; i++) {
        var enemy = new Enemy();
        this.array[i] = enemy;
    }
};

var EnemyMagazine = function(maxElements) {
    Pool.call(this, maxElements);
}

EnemyMagazine.prototype = Object.create(Pool.prototype); //EnemyMagazine is subClass of Pool
EnemyMagazine.prototype.constructor = EnemyMagazine;

EnemyMagazine.prototype.init = function(){
    for (var i = 0; i < this.cap; i++) {
        var bullet = new LiesBullet();
        this.array[i] = bullet;
    }
}




var makeArmy = function(enlisted) {
    var x = 0;
    var y = 60;
    for (var i = 0; i < enlisted; i++) {
        evilArmy.get(x,y);
        x += 50;
    };
}







var Bullet = function() {
    this.inUse = false;
    this.speed = 50;
}



Bullet.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

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
    this.sprite = 'images/bullet.png';
}

TruthBullet.prototype = Object.create(Bullet.prototype); //TruthBullet is subClass of Bullet
TruthBullet.prototype.constructor = TruthBullet;

TruthBullet.prototype.update = function(dt){
    this.y -= this.speed * dt;
    if (this.y <= 0) {    //calls bullet.clear when bullet reaches end of screen
        this.clear();
    }
}

TruthBullet.prototype.checkCollision = function() {


}

var LiesBullet = function() {   //type of bullet player shoots
    Bullet.call(this);
    this.sprite = 'images/bullet_enemy.png';
}

LiesBullet.prototype = Object.create(Bullet.prototype); //LiesBullet is subClass of Bullet
LiesBullet.prototype.constructor = LiesBullet;

LiesBullet.prototype.update = function(dt){
    this.y += this.speed * dt;
    if (this.y >= canvasHeight) {    //calls bullet.clear when bullet reaches end of screen
        this.clear();
    }
}

LiesBullet.prototype.checkCollision = function() {


}



//Bullet.prototype.collide = function(){
   // if (this.x < enemy.x + enemy.width  && this.x + this.width  > enemy.x &&
     //   this.y < enemy.y + enemy.height && this.y + this.height > enemy.y) {};
//}

/*Bullet.prototype.checkCollision = function(){
    if (this.collide) {
        /* enemy dies  */ /*
        this.inUse = false;

    };

}*/

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var evilArmy = new EvilArmy(6);
evilArmy.init();
makeArmy(4);

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
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
