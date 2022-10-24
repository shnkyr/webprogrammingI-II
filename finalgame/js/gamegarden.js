var game;
var gameOptions = {
  gameWidth: 800,
  bannerStart: 1 / 8 * 5,
  bannerGap: 250,
  playerGravity: 10000,
  playerSpeed: 450,
  climbSpeed: 450,
  playerJump: 1800,
  pointappleRatio: 2,
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
    game.load.image("banner", "images/banner.png");
    game.load.image("santa", "images/santa.png");
    game.load.image("santatree", "images/santatree.png");
    game.load.image("pointapple", "images/pointapple.png");
    game.load.image("pointappleparticle", "images/pointappleparticle.png");
    game.load.image("spike", "images/enemy.png");
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
    this.reachedbanner = 0;
    this.collectedpointapples = 0;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.canJump = true;
    this.isClimbing = false;
    this.defineGroups();
    this.emitter = game.add.emitter(0, 0, 80);
    this.emitter.makeParticles("pointappleparticle");
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
    var highScoreText = game.add.bitmapText(game.width - 2, game.height - 300, "font", "Highest Point: " + this.savedData.score.toString(), 30);
    highScoreText.anchor.set(1, 1);
    this.overlayGroup.add(highScoreText);
    this.scoreText = game.add.bitmapText(10, game.height - 300, "font", "Yours Point: 0", 30);
    this.scoreText.anchor.set(0, 1);
    this.overlayGroup.add(this.scoreText);
  },

   createMenu: function () {
    var tap = game.add.sprite(game.width / 3, game.height - 300, "tap");
    tap.anchor.set(9.5);
    this.menuGroup.add(tap);
    tapTween = game.add.tween(tap).to({
      alpha: 0
    }, 200, Phaser.Easing.Cubic.InOut, true, 0, -1, true);
    var tapText = game.add.bitmapText(game.width / 2, tap.y - 120, "font", "Click on Game Screen to Start", 45);
    tapText.anchor.set(0.5);
    this.menuGroup.add(tapText);
    
  }, 

  drawLevel: function () {
    this.currentbanner = 0;
    this.highestbannerY = game.height * gameOptions.bannerStart;
    this.bannersBeforeDisappear = Math.ceil((game.height - game.height * (gameOptions.bannerStart)) / gameOptions.bannerGap) + 1;
    this.bannerPool = [];
    this.santatreePool = [];
    this.pointapplePool = [];
    this.spikePool = [];
    while (this.highestbannerY > -2 * gameOptions.bannerGap) {
      this.addbanner();
      if (this.currentbanner > 0) {
        this.addsantatree();
        this.addpointapple();
        this.addSpike();
      }
      this.highestbannerY -= gameOptions.bannerGap;
      this.currentbanner++;
    }
    this.highestbannerY += gameOptions.bannerGap;
    this.currentbanner = 0;
    this.addsanta();
  },
  addbanner: function () {
    if (this.bannerPool.length > 0) {
      var banner = this.bannerPool.pop();
      banner.y = this.highestbannerY;
      banner.revive();
    } else {
      var banner = game.add.sprite(0, this.highestbannerY, "banner");
      this.bannerGroup.add(banner);
      game.physics.enable(banner, Phaser.Physics.ARCADE);
      banner.body.immovable = true;
      banner.body.checkCollision.down = false;
    }
  },
  addsantatree: function () {
    var santatreeXPosition = game.rnd.integerInRange(50, game.width - 50);
    if (this.santatreePool.length > 0) {
      var santatree = this.santatreePool.pop();
      santatree.x = santatreeXPosition;
      santatree.y = this.highestbannerY;
      santatree.revive();
    } else {
      var santatree = game.add.sprite(santatreeXPosition, this.highestbannerY, "santatree");
      this.santatreeGroup.add(santatree);
      santatree.anchor.set(0.5, 0);
      game.physics.enable(santatree, Phaser.Physics.ARCADE);
      santatree.body.immovable = true;
    }
    this.safeZone = [];
    this.safeZone.length = 0;
    this.safeZone.push({
      start: santatreeXPosition - gameOptions.safeRadius,
      end: santatreeXPosition + gameOptions.safeRadius
    });
  },
  addpointapple: function () {
    if (game.rnd.integerInRange(0, gameOptions.pointappleRatio) != 0) {
      var pointappleX = game.rnd.integerInRange(50, game.width - 50);
      if (this.pointapplePool.length > 0) {
        var pointapple = this.pointapplePool.pop();
        pointapple.x = pointappleX;
        pointapple.y = this.highestbannerY - gameOptions.bannerGap / 2;
        pointapple.revive();
      } else {
        var pointapple = game.add.sprite(pointappleX, this.highestbannerY - gameOptions.bannerGap / 2, "pointapple");
        pointapple.anchor.set(0.5);
        game.physics.enable(pointapple, Phaser.Physics.ARCADE);
        pointapple.body.immovable = true;
        this.pointappleGroup.add(pointapple);
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
          spike.y = this.highestbannerY - 20;
          spike.revive();
        } else {
          var spike = game.add.sprite(spikeXPosition, this.highestbannerY - 20, "spike");
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
  addsanta: function () {
    this.santa = game.add.sprite(game.width / 2, game.height * gameOptions.bannerStart - 40, "santa");
    this.gameGroup.add(this.santa)
    this.santa.anchor.set(0.5, 0);
    game.physics.enable(this.santa, Phaser.Physics.ARCADE);
    this.santa.body.collideWorldBounds = true;
    this.santa.body.gravity.y = gameOptions.playerGravity;
    this.santa.body.velocity.x = gameOptions.playerSpeed;
    this.santa.body.onWorldBounds = new Phaser.Signal();
    this.santa.body.onWorldBounds.add(function (sprite, up, down, left, right) {
      if (left) {
        this.santa.body.velocity.x = gameOptions.playerSpeed;
        this.santa.scale.x = 1;
      }
      if (right) {
        this.santa.body.velocity.x = -gameOptions.playerSpeed;
        this.santa.scale.x = -1;
      }
      if (down) {
        var score = this.reachedbanner * this.collectedpointapples;
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
      y: gameOptions.bannerGap
    }, 500, Phaser.Easing.Cubic.Out);
    this.scrollTween.onComplete.add(function () {
      this.gameGroup.y = 0;
      this.gameGroup.forEach(function (item) {
        if (item.length > 0) {
          item.forEach(function (subItem) {
            subItem.y += gameOptions.bannerGap;
            if (subItem.y > game.height) {
              switch (subItem.key) {
                case "banner":
                  this.killbanner(subItem);
                  break;
                case "santatree":
                  this.killsantatree(subItem);
                  break;
                case "pointapple":
                  this.killpointapple(subItem);
                  break;
                case "spike":
                  this.killSpike(subItem);
                  break;
              }
            }
          }, this);
        } else {
          item.y += gameOptions.bannerGap;
        }
      }, this);
      this.addbanner();
      this.addsantatree();
      this.addpointapple();
      this.addSpike();
      if (this.tweensToGo > 0) {
        this.tweensToGo--;
        this.scrollTween.start();
      }
    }, this);
  },
  defineGroups: function () {
    this.gameGroup = game.add.group();
    this.bannerGroup = game.add.group();
    this.santatreeGroup = game.add.group();
    this.pointappleGroup = game.add.group();
    this.spikeGroup = game.add.group();
    this.overlayGroup = game.add.group();
    this.menuGroup = game.add.group();
    this.gameGroup.add(this.bannerGroup);
    this.gameGroup.add(this.santatreeGroup);
    this.gameGroup.add(this.pointappleGroup);
    this.gameGroup.add(this.spikeGroup);
  },
  handleTap: function (pointer, doubleTap) {
    if (this.menuGroup != null) {
      this.menuGroup.destroy();
    }
    if (this.canJump && !this.isClimbing && !this.gameOver) {
      this.santa.body.velocity.y = -gameOptions.playerJump;
      this.canJump = false;
    }
  },
  update: function () {
    if (!this.gameOver) {
      this.checkbannerCollision();
      this.checksantatreeCollision();
      this.checkpointappleCollision();
      this.checkSpikeCollision();
    }
  },
  checkbannerCollision: function () {
    game.physics.arcade.collide(this.santa, this.bannerGroup, function () {
      this.canJump = true;
    }, null, this);
  },
  checksantatreeCollision: function () {
    if (!this.isClimbing) {
      game.physics.arcade.overlap(this.santa, this.santatreeGroup, function (player, santatree) {
        if (Math.abs(player.x - santatree.x) < 10) {
          this.santatreeToClimb = santatree;
          this.santa.body.velocity.x = 0;
          this.santa.body.velocity.y = -gameOptions.climbSpeed;
          this.santa.body.gravity.y = 0;
          this.isClimbing = true;
          if (this.scrollTween.isRunning) {
            this.tweensToGo++;
          } else {
            this.scrollTween.start();
          }
        }
      }, null, this);
    } else {
      if (this.santa.y < this.santatreeToClimb.y - 40) {
        this.santa.body.gravity.y = gameOptions.playerGravity;
        this.santa.body.velocity.x = gameOptions.playerSpeed * this.santa.scale.x;
        this.santa.body.velocity.y = 0;
        this.isClimbing = false;
        this.reachedbanner++;
        this.scoreText.text = (this.collectedpointapples * this.reachedbanner).toString();
      }
    }
  },
  checkpointappleCollision: function () {
    game.physics.arcade.overlap(this.santa, this.pointappleGroup, function (player, pointapple) {
      this.emitter.x = pointapple.x;
      this.emitter.y = pointapple.y;
      this.emitter.start(true, 1000, null, 20);
      this.collectedpointapples++;
      this.scoreText.text = (this.collectedpointapples * this.reachedbanner).toString();
      this.killpointapple(pointapple);
    }, null, this);
  },
  checkSpikeCollision: function () {
    game.physics.arcade.overlap(this.santa, this.spikeGroup, function () {
      this.gameOver = true;
      this.santa.body.velocity.x = game.rnd.integerInRange(-20, 20);
      this.santa.body.velocity.y = -gameOptions.playerJump;
      this.santa.body.gravity.y = gameOptions.playerGravity;
    }, null, this);
  },
  killbanner: function (banner) {
    banner.kill();
    this.bannerPool.push(banner);
  },
  killsantatree: function (santatree) {
    santatree.kill();
    this.santatreePool.push(santatree);
  },
  killpointapple: function (pointapple) {
    pointapple.kill();
    this.pointapplePool.push(pointapple);
  },
  killSpike: function (spike) {
    spike.kill();
    this.spikePool.push(spike);
  },
}