var Engine = (function(global) {
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;
    canvas.width = game.CANVAS_WIDTH = 700; //also set game attributes in these 2 lines
    canvas.height = game.CANVAS_HEIGHT = 560;
    doc.body.appendChild(canvas);

    doc.getElementById('play').onclick = init; //init game onclick (after load)

    function main() {
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        if (evilArmy.poolStatus()) { //checks when all enemies are killed
            game.win = true;
        }

        if (game.over) {
            gameOver();
        }

        if (game.win) {
            gameWin();
        }

        if (!game.paused) {
            update(dt);
            render();
        }
        lastTime = now;
        win.requestAnimationFrame(main);
    }

    function init() {
        reset();
        lastTime = Date.now();
        main();
        sounds.background.play();
        doc.getElementById('opening').style.display = "none";
        doc.getElementById('score-div').style.display = "block";
    }

    function update(dt) {
        updateEntities(dt);
        updateBackground(dt);
        updateBullets(dt);
        player.checkCollision();
        updateExplosion(dt);
    }

    function updateEntities(dt) {
        evilArmy.array.forEach(function(enemy) {
            enemy.update(dt);
            enemy.checkCollision();
            enemy.checkPlayerCollision();
        });
        player.update();
    }

    //calls instantiated background objects
    function updateBackground(dt) {
        cloudsBackground.update(dt);
        monumentsBackground.update(dt);
        grassBackground.update(dt);
    }

    //updates enemy and player bullets
    function updateBullets(dt) {
        player.magazine.array.forEach(function(bullet) {
            bullet.update(dt);
        });
        enemyMagazine.array.forEach(function(bullet) {
            bullet.update(dt);
        });
    }

    function updateExplosion(dt) {
        particlesPool.array.forEach(function(particle) {
            particle.update(dt);
        });
    }

    function render() {
        renderBackground();
        renderEntities();
        renderBullets();
        renderExplosion();
        doc.getElementById('score').innerHTML = game.score;
    }

    function renderEntities() {
        renderEnemies();
        player.render();
        player.renderLifeStatus();
        if (game.over) {
            player.renderGameOver();
        }
    }

    function renderBackground() {
        cloudsBackground.render();
        monumentsBackground.render();
        grassBackground.render();
    }

    function renderBullets() {  //A Call to arms ;)
        player.magazine.arm();
        enemyMagazine.arm();
    }

    function renderEnemies() {
        evilArmy.arm();
    }

    function renderExplosion() {
        particlesPool.arm();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    function gameOver() {
        sounds.background.pause();
        sounds.gameOver.play();
        doc.getElementById('game-over').style.display = "block";
    }

    //upon win, runs explosions across screen and plays win sound
    function gameWin() {
        sounds.background.pause();
        sounds.gameWin.play();
        doc.getElementById('game-win').style.display = "block";
        for (var i = 0; i < 11; i ++) {
            fancyExplosion(Math.random() * game.CANVAS_WIDTH, Math.random() * game.CANVAS_HEIGHT);
        }
    }

    Resources.load([
        'images/bullet.png',
        'images/trumpspriteboard.png',
        'images/briefcase.png',
        'images/redstar.png',
        'images/christiespriteboard.png',
        'images/clouds2.png',
        'images/grass.png',
        'images/trumpbutton.png',
        'images/dcmonuments.png'
    ]);

    //Resources.onReady(init)
    //init call onclick of play instead
    global.ctx = ctx;
})(this);
