var game;
var gameOptions = {
  gameWidth: 800,
  landStart: 1 / 8 * 5,
  landGap: 250,
  playerGravity: 10000,
  playerSpeed: 450,
  climbSpeed: 450,
  playerJump: 1800,
  earthRatio: 2,
  doubleSpikeRatio: 1,
  skyColor: 0xaaeaff,
  safeRadius: 180,
  localStorageName: "climbgame",
  versionNumber: "1.0"
}
window.onload = function () {
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  if (windowWidth > windowHeight) {
    windowHeight = windowWidth * 1.8
  }
  game = new Phaser.Game(gameOptions.gameWidth, windowHeight * gameOptions.gameWidth / windowWidth);
  game.state.add("PreloadGame", preloadGame);
  game.state.add("PlayGame", playGame);
  game.state.start("PreloadGame");
}
var preloadGame = function (game) {}
preloadGame.prototype = {
  preload: function () {
    game.stage.backgroundColor = gameOptions.skyColor;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.disableVisibilityChange = true;
    game.load.image("land", "images/land.png");
    game.load.image("actor", "images/actor.png");
    game.load.image("rocket", "images/rocket.png");
    game.load.image("earth", "images/earth.png");
    game.load.image("earthparticle", "images/earthparticle.png");
    game.load.image("spike", "images/alien.png");
    game.load.image("sky", "images/sky.png");
    game.load.bitmapFont("font", "images/font.png", "images/font.fnt");
  },
  create: function () {
    game.state.start("PlayGame");
  }
}
var playGame = function (game) {}
playGame.prototype = {
  create: function () {
    this.savedData = localStorage.getItem(gameOptions.localStorageName) == null ? {
      score: 0
    } : JSON.parse(localStorage.getItem(gameOptions.localStorageName));
    this.gameOver = false;
    this.reachedland = 0;
    this.collectedearths = 0;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.canJump = true;
    this.isClimbing = false;
    this.defineGroups();
    this.emitter = game.add.emitter(0, 0, 80);
    this.emitter.makeParticles("earthparticle");
    this.emitter.setAlpha(0.4, 0.6);
    this.emitter.setScale(0.4, 0.6, 0.4, 0.6);
    this.gameGroup.add(this.emitter);
    this.drawLevel();
    this.defineTweens();
    this.createMenu();
    this.createOverlay();
    game.input.onTap.add(this.handleTap, this);
  },
  createOverlay: function () {
    var sky = game.add.sprite(0, game.height, "sky");
    sky.anchor.set(0, 1);
    sky.tint = gameOptions.skyColor;
    this.overlayGroup.add(sky);
    var highScoreText = game.add.bitmapText(game.width - 10, game.height - 10, "font", "Highest Point: " + this.savedData.score.toString(), 30);
    highScoreText.anchor.set(1, 1);
    this.overlayGroup.add(highScoreText);
    this.scoreText = game.add.bitmapText(10, game.height - 10, "font", "Your Point: 0", 30);
    this.scoreText.anchor.set(0, 1);
    this.overlayGroup.add(this.scoreText);
  },
  createMenu: function () {
    var tap = game.add.sprite(game.width / 2, game.height - 150, "tap");
    tap.anchor.set(0.5);
    this.menuGroup.add(tap);
    tapTween = game.add.tween(tap).to({
      alpha: 0
    }, 200, Phaser.Easing.Cubic.InOut, true, 0, -1, true);
    //var tapText = game.add.bitmapText(game.width / 2, tap.y - 120, "font", "Tap & Climb the Rocket", 45);
    //tapText.anchor.set(0.5);
    //this.menuGroup.add(tapText);
    //var welcomeText = game.add.bitmapText(game.width / 2, tap.y - 200, "font", "SKqY HUNTER", 90);
    //welcomeText.anchor.set(0.5);
    //this.menuGroup.add(welcomeText);
  },
  drawLevel: function () {
    this.currentland = 0;
    this.highestlandY = game.height * gameOptions.landStart;
    this.landsBeforeDisappear = Math.ceil((game.height - game.height * (gameOptions.landStart)) / gameOptions.landGap) + 1;
    this.landPool = [];
    this.rocketPool = [];
    this.earthPool = [];
    this.spikePool = [];
    while (this.highestlandY > -2 * gameOptions.landGap) {
      this.addland();
      if (this.currentland > 0) {
        this.addrocket();
        this.addearth();
        this.addSpike();
      }
      this.highestlandY -= gameOptions.landGap;
      this.currentland++;
    }
    this.highestlandY += gameOptions.landGap;
    this.currentland = 0;
    this.addactor();
  },
  addland: function () {
    if (this.landPool.length > 0) {
      var land = this.landPool.pop();
      land.y = this.highestlandY;
      land.revive();
    } else {
      var land = game.add.sprite(0, this.highestlandY, "land");
      this.landGroup.add(land);
      game.physics.enable(land, Phaser.Physics.ARCADE);
      land.body.immovable = true;
      land.body.checkCollision.down = false;
    }
  },
  addrocket: function () {
    var rocketXPosition = game.rnd.integerInRange(50, game.width - 50);
    if (this.rocketPool.length > 0) {
      var rocket = this.rocketPool.pop();
      rocket.x = rocketXPosition;
      rocket.y = this.highestlandY;
      rocket.revive();
    } else {
      var rocket = game.add.sprite(rocketXPosition, this.highestlandY, "rocket");
      this.rocketGroup.add(rocket);
      rocket.anchor.set(0.5, 0);
      game.physics.enable(rocket, Phaser.Physics.ARCADE);
      rocket.body.immovable = true;
    }
    this.safeZone = [];
    this.safeZone.length = 0;
    this.safeZone.push({
      start: rocketXPosition - gameOptions.safeRadius,
      end: rocketXPosition + gameOptions.safeRadius
    });
  },
  addearth: function () {
    if (game.rnd.integerInRange(0, gameOptions.earthRatio) != 0) {
      var earthX = game.rnd.integerInRange(50, game.width - 50);
      if (this.earthPool.length > 0) {
        var earth = this.earthPool.pop();
        earth.x = earthX;
        earth.y = this.highestlandY - gameOptions.landGap / 2;
        earth.revive();
      } else {
        var earth = game.add.sprite(earthX, this.highestlandY - gameOptions.landGap / 2, "earth");
        earth.anchor.set(0.5);
        game.physics.enable(earth, Phaser.Physics.ARCADE);
        earth.body.immovable = true;
        this.earthGroup.add(earth);
      }
    }
  },
  addSpike: function () {
    var spikes = 1;
    if (game.rnd.integerInRange(0, gameOptions.doubleSpikeRatio) == 0) {
      spikes = 2;
    }
    for (var i = 1; i <= spikes; i++) {
      var spikeXPosition = this.findSpikePosition();
      if (spikeXPosition) {
        if (this.spikePool.length > 0) {
          var spike = this.spikePool.pop();
          spike.x = spikeXPosition;
          spike.y = this.highestlandY - 20;
          spike.revive();
        } else {
          var spike = game.add.sprite(spikeXPosition, this.highestlandY - 20, "spike");
          spike.anchor.set(0.5, 0);
          game.physics.enable(spike, Phaser.Physics.ARCADE);
          spike.body.immovable = true;
          this.spikeGroup.add(spike);
        }
      }
    }
  },
  findSpikePosition: function () {
    var attempts = 0;
    do {
      attempts++;
      var posX = game.rnd.integerInRange(150, game.width - 150)
    } while (!this.isSafe(posX) && attempts < 10);
    if (this.isSafe(posX)) {
      this.safeZone.push({
        start: posX - gameOptions.safeRadius,
        end: posX + gameOptions.safeRadius
      })
      return posX;
    }
    return false;
  },
  isSafe: function (n) {
    for (var i = 0; i < this.safeZone.length; i++) {
      if (n > this.safeZone[i].start && n < this.safeZone[i].end) {
        return false;
      }
    }
    return true;
  },
  addactor: function () {
    this.actor = game.add.sprite(game.width / 2, game.height * gameOptions.landStart - 40, "actor");
    this.gameGroup.add(this.actor)
    this.actor.anchor.set(0.5, 0);
    game.physics.enable(this.actor, Phaser.Physics.ARCADE);
    this.actor.body.collideWorldBounds = true;
    this.actor.body.gravity.y = gameOptions.playerGravity;
    this.actor.body.velocity.x = gameOptions.playerSpeed;
    this.actor.body.onWorldBounds = new Phaser.Signal();
    this.actor.body.onWorldBounds.add(function (sprite, up, down, left, right) {
      if (left) {
        this.actor.body.velocity.x = gameOptions.playerSpeed;
        this.actor.scale.x = 1;
      }
      if (right) {
        this.actor.body.velocity.x = -gameOptions.playerSpeed;
        this.actor.scale.x = -1;
      }
      if (down) {
        var score = this.reachedland * this.collectedearths;
        localStorage.setItem(gameOptions.localStorageName, JSON.stringify({
          score: Math.max(score, this.savedData.score)
        }));
        game.state.start("PlayGame");
      }
    }, this)
  },
  defineTweens: function () {
    this.tweensToGo = 0;
    this.scrollTween = game.add.tween(this.gameGroup);
    this.scrollTween.to({
      y: gameOptions.landGap
    }, 500, Phaser.Easing.Cubic.Out);
    this.scrollTween.onComplete.add(function () {
      this.gameGroup.y = 0;
      this.gameGroup.forEach(function (item) {
        if (item.length > 0) {
          item.forEach(function (subItem) {
            subItem.y += gameOptions.landGap;
            if (subItem.y > game.height) {
              switch (subItem.key) {
                case "land":
                  this.killland(subItem);
                  break;
                case "rocket":
                  this.killrocket(subItem);
                  break;
                case "earth":
                  this.killearth(subItem);
                  break;
                case "spike":
                  this.killSpike(subItem);
                  break;
              }
            }
          }, this);
        } else {
          item.y += gameOptions.landGap;
        }
      }, this);
      this.addland();
      this.addrocket();
      this.addearth();
      this.addSpike();
      if (this.tweensToGo > 0) {
        this.tweensToGo--;
        this.scrollTween.start();
      }
    }, this);
  },
  defineGroups: function () {
    this.gameGroup = game.add.group();
    this.landGroup = game.add.group();
    this.rocketGroup = game.add.group();
    this.earthGroup = game.add.group();
    this.spikeGroup = game.add.group();
    this.overlayGroup = game.add.group();
    this.menuGroup = game.add.group();
    this.gameGroup.add(this.landGroup);
    this.gameGroup.add(this.rocketGroup);
    this.gameGroup.add(this.earthGroup);
    this.gameGroup.add(this.spikeGroup);
  },
  handleTap: function (pointer, doubleTap) {
    if (this.menuGroup != null) {
      this.menuGroup.destroy();
    }
    if (this.canJump && !this.isClimbing && !this.gameOver) {
      this.actor.body.velocity.y = -gameOptions.playerJump;
      this.canJump = false;
    }
  },
  update: function () {
    if (!this.gameOver) {
      this.checklandCollision();
      this.checkrocketCollision();
      this.checkearthCollision();
      this.checkSpikeCollision();
    }
  },
  checklandCollision: function () {
    game.physics.arcade.collide(this.actor, this.landGroup, function () {
      this.canJump = true;
    }, null, this);
  },
  checkrocketCollision: function () {
    if (!this.isClimbing) {
      game.physics.arcade.overlap(this.actor, this.rocketGroup, function (player, rocket) {
        if (Math.abs(player.x - rocket.x) < 10) {
          this.rocketToClimb = rocket;
          this.actor.body.velocity.x = 0;
          this.actor.body.velocity.y = -gameOptions.climbSpeed;
          this.actor.body.gravity.y = 0;
          this.isClimbing = true;
          if (this.scrollTween.isRunning) {
            this.tweensToGo++;
          } else {
            this.scrollTween.start();
          }
        }
      }, null, this);
    } else {
      if (this.actor.y < this.rocketToClimb.y - 40) {
        this.actor.body.gravity.y = gameOptions.playerGravity;
        this.actor.body.velocity.x = gameOptions.playerSpeed * this.actor.scale.x;
        this.actor.body.velocity.y = 0;
        this.isClimbing = false;
        this.reachedland++;
        this.scoreText.text = (this.collectedearths * this.reachedland).toString();
      }
    }
  },
  checkearthCollision: function () {
    game.physics.arcade.overlap(this.actor, this.earthGroup, function (player, earth) {
      this.emitter.x = earth.x;
      this.emitter.y = earth.y;
      this.emitter.start(true, 1000, null, 20);
      this.collectedearths++;
      this.scoreText.text = (this.collectedearths * this.reachedland).toString();
      this.killearth(earth);
    }, null, this);
  },
  checkSpikeCollision: function () {
    game.physics.arcade.overlap(this.actor, this.spikeGroup, function () {
      this.gameOver = true;
      this.actor.body.velocity.x = game.rnd.integerInRange(-20, 20);
      this.actor.body.velocity.y = -gameOptions.playerJump;
      this.actor.body.gravity.y = gameOptions.playerGravity;
    }, null, this);
  },
  killland: function (land) {
    land.kill();
    this.landPool.push(land);
  },
  killrocket: function (rocket) {
    rocket.kill();
    this.rocketPool.push(rocket);
  },
  killearth: function (earth) {
    earth.kill();
    this.earthPool.push(earth);
  },
  killSpike: function (spike) {
    spike.kill();
    this.spikePool.push(spike);
  },
}