//global variables
var canvasHeight = 606;


// Enemies our player must avoid
var Enemy = function() {

    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = 0;
    this.y = 225;
    this.inUse = false;


    this.speed = 3;

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
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.spawn = function(x,y) {
    this.x = x;
    this.y = y;
    this.inUse = true;
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(){
    this.start();
    this.sprite = 'images/char-boy.png';
    this.magazine = new Magazine(5);   //max bullets set to 5 here
    this.magazine.init();
}

Player.prototype.update = function(dt) {
    //collisions with margins accounted
    if (allEnemies[0].y - 65 < this.y && this.y < allEnemies[0].y + 82 && allEnemies[0].x - 86 < this.x && this.x < allEnemies[0].x + 86) {
        this.start();
    }


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
            //this.array[i].checkCollision()
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
        var bullet = new Bullet();
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
    this.sprite = 'images/bullet.png';
}

Bullet.prototype.update = function(dt){
    this.y -= this.speed * dt;
    if (this.y <= 0) {    //calls bullet.clear when bullet reaches end of screen
        this.clear();
    }
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
evilArmy = new EvilArmy(6);
evilArmy.init();
makeArmy(4);

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
