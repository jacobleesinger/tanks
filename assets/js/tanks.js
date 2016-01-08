


var game = new Phaser.Game(640, 480, Phaser.CANVAS, 'game');
var PhaserGame = function (game) {
    this.tank = null;
    this.turret = null;
    this.flame = null;
    this.bullet = null;
    this.background = null;
    this.targets = null;
    this.power = 300;
    this.powerText = null;
    this.cursors = null;
    this.fireButton = null;
    this.targetsRemaining = 5;
    this.targetText = null;
    this.gameOverText = null;
    this.targetsDestroyed = 0;
    this.playing = false;
    this.startButton = null;
    this.instructionText = null;
    this.resetTimerText = null;
};
PhaserGame.prototype = {
    init: function () {
        this.game.renderer.renderSession.roundPixels = true;
        this.game.world.setBounds(0, 0, 992, 480);
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 200;
    },
    preload: function () {

        this.load.image('tank', 'assets/images/tank.png');
        this.load.image('turret', 'assets/images/turret.png');
        this.load.image('bullet', 'assets/images/bullet.png');
        this.load.image('background', 'assets/images/background.png');
        this.load.image('flame', 'assets/images/flame.png');
        this.load.image('target', 'assets/images/target.png');
        this.load.image('land', 'assets/images/land.png');
        //  Note: Graphics from Amiga Tanx Copyright 1991 Gary Roberts
        this.load.spritesheet('button', 'assets/images/button.png', 120, 40);
    },
    create: function () {

        // this.physics.startSystem(Phaser.Physics.ARCADE);
        //  Simple but pretty background

        this.background = this.add.sprite(0, 0, 'background');
        //  Something to shoot at :)
        this.targets = this.add.group(this.game.world, 'targets', false, true, Phaser.Physics.ARCADE);
        // this.targets.create(350, 310, 'target');
        // this.targets.create(630, 320, 'target');
        // this.targets.create(830, 338, 'target');

        this.targets.create(284, 378, 'target');
        this.targets.create(456, 153, 'target');
        this.targets.create(545, 305, 'target');
        this.targets.create(726, 391, 'target');
        this.targets.create(972, 74, 'target');
        this.physics.arcade.enable(this.targets);
        this.targets.setAll('body.allowGravity', false);

        this.land = this.add.bitmapData(992, 480);
        this.land.draw('land');
        this.land.update();
        this.land.addToWorld();

        this.emitter = this.add.emitter(0, 0, 30);
        this.emitter.makeParticles('flame');
        this.emitter.setXSpeed(-120, 120);
        this.emitter.setYSpeed(-100, -200);
        this.emitter.setRotation();

        this.bullet = this.add.sprite(0, 0, 'bullet');
        this.bullet.exists = false;
        this.physics.arcade.enable(this.bullet);

        this.tank = this.add.sprite(24, 383, 'tank');

        this.turret = this.add.sprite(this.tank.x + 30, this.tank.y + 14, 'turret');

        this.flame = this.add.sprite(0, 0, 'flame');
        this.flame.anchor.set(0.5);
        this.flame.visible = false;

        this.power = 300;
        this.powerText = this.add.text(8, 8, 'Power: 300', { font: "18px Arial", fill: "#ffffff" });
        this.powerText.setShadow(1, 1, 'rgba(0, 0, 0, 0.8)', 1);
        this.powerText.fixedToCamera = true;

        this.timer = 60;
        this.timerText = this.add.text(150, 8, 'Time:60', { font: "18px Arial", fill: "#ffffff" });
        this.timerText.setShadow(1, 1, 'rgba(0, 0, 0, 0.8)', 1);
        this.timerText.fixedToCamera = true;

        this.targetsRemaining = 5;
        this.targetText = this.add.text(250, 8, "Targets Remaining: 8", { font: "18px Arial", fill: "#ffffff" });
        this.targetText.setShadow(1, 1, 'rgba(0, 0, 0, 0.8)', 1);
        this.targetText.fixedToCamera = true;

        this.instructionText = this.add.text(100, 100, "Welcome to Tanks! \n You will have 1 minute. \n Hit as many targets as you can. \n Press Start to begin!")

        this.cursors = this.input.keyboard.createCursorKeys();

        this.fireButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.fireButton.onDown.add(this.fire, this);

        this.startButton = game.add.button(300, 280, 'button', this.startGame, this, 1, 0, 2);
        this.startButton.anchor.set(0.5);
        this.startButton.fixedToCamera = true;

    },

    startGame: function () {

      if(this.instructionText) {

        this.instructionText.destroy();
      }

      if(this.startButton) {

        this.startButton.destroy();
      }

      this.playing = true;
      this.timerEvent = game.time.events.add(Phaser.Timer.SECOND * 60, this.endGame, this);
    },

    resetGame: function () {

      location.reload();
      this.startGame();

    },

    youWin: function () {
      this.time.events.remove(this.timerEvent);
      this.gameOverText = this.add.text(100, 100, "You WIN! You hit all the \n targets in " + (60 - Math.floor(game.time.events.duration / 1000)) +" seconds  \n Press Space to play again.");
      this.gameOverText.fixedToCamera = true;
      this.playing = false;
      this.resetButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.resetButton.onDown.add(this.resetGame, this);
    },



    endGame: function () {
      this.gameOverText = this.add.text(100, 100, "Time's up! You hit " + this.targetsDestroyed + " targets. \n Press Space to play again.");
      this.gameOverText.fixedToCamera = true;
      this.playing = false;
      this.resetButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.resetButton.onDown.add(this.resetGame, this);




    },



    bulletVsLand: function () {
       //  Simple bounds check
       if (this.bullet.x < 0 || this.bullet.x > this.game.world.width || this.bullet.y > this.game.height)
       {
           this.removeBullet();
           return;
       }
       var x = Math.floor(this.bullet.x);
       var y = Math.floor(this.bullet.y);
       var pos = [x, y];
       var rgba = this.land.getPixel(x, y);
       if (rgba.a > 0)
       {
           this.land.blendDestinationOut();
           this.land.circle(x, y, 16, 'rgba(0, 0, 0, 255');
           this.land.blendReset();
           this.land.update();

           this.removeBullet();
       }
   },

    fire: function () {
      if(this.playing) {
        if (this.bullet.exists)
        {
            return;
        }
        //  Re-position the bullet where the turret is
        this.bullet.reset(this.turret.x, this.turret.y);
        //  Now work out where the END of the turret is
        var p = new Phaser.Point(this.turret.x, this.turret.y);
        p.rotate(p.x, p.y, this.turret.rotation, false, 34);
        //  And position the flame sprite there
        this.flame.x = p.x;
        this.flame.y = p.y;
        this.flame.alpha = 1;
        this.flame.visible = true;
        //  Boom
        this.add.tween(this.flame).to( { alpha: 0 }, 100, "Linear", true);
        //  So we can see what's going on when the bullet leaves the screen
        this.camera.follow(this.bullet);
        //  Our launch trajectory is based on the angle of the turret and the power
        this.physics.arcade.velocityFromRotation(this.turret.rotation, this.power, this.bullet.body.velocity);
      }
    },

  //  Called by physics.arcade.overlap if the bullet and a target overlap

     hitTarget: function (bullet, target) {

       this.emitter.at(target);
       this.emitter.explode(2000, 10);

       target.kill();
       this.targetsRemaining -= 1;
       this.targetText.text = "Targets Remaining: " + this.targetsRemaining;
       this.targetsDestroyed += 1;

       this.removeBullet(true);


     },

    removeBullet: function () {
        this.bullet.kill();
        this.camera.follow();
        this.add.tween(this.camera).to( { x: 0 }, 1000, "Quint", true, 1000);
    },

    update: function () {
        if(this.playing) {
          this.timerText.text = "Time: " + Math.floor(game.time.events.duration / 1000);

          if (this.bullet.exists)
          {
             this.physics.arcade.overlap(this.bullet, this.targets, this.hitTarget, null, this);

             this.bulletVsLand();
         }
          else
          {
              if (this.cursors.left.isDown && this.power > 100)
              {
                  this.power -= 2;
              }
              else if (this.cursors.right.isDown && this.power < 600)
              {
                  this.power += 2;
              }
              if (this.cursors.up.isDown && this.turret.angle > -90)
              {
                  this.turret.angle--;
              }
              else if (this.cursors.down.isDown && this.turret.angle < 0)
              {
                  this.turret.angle++;
              }
              this.powerText.text = 'Power: ' + this.power;
          }

          if(this.targetsRemaining === 0) {
            this.youWin();
          }
      }
    }
};
game.state.add('Game', PhaserGame, true);
