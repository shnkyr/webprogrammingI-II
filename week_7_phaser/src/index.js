const config = {
    type: Phaser.AUTO,
    parent: 'phasergame',
    width: 900,
    height: 700,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        preload,
        create,
        update,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: false,
        }
    }
};

const phasergame = new Phaser.Game(config);
let players, ballicon, clickd;
const keys = {};
let gameStarted = false;
let welcomeText, playersawin, playersbwin;

function preload() {
    this.load.image('balliconicon', 'images/ballicon.png');
    this.load.image('bar', 'images/bar.png');
}

function create() {
    ballicon = this.physics.add.sprite(
        this.physics.world.bounds.width / 2, 
        this.physics.world.bounds.height / 2, 
        'bar' 
    );
    ballicon.setVisible(false);    
    playersa = this.physics.add.sprite(
        this.physics.world.bounds.width - (ballicon.body.width / 2 + 1), 
        this.physics.world.bounds.height / 2, 
        'bar', 
    );

    playersb = this.physics.add.sprite(
        (ballicon.body.width / 2 + 1), 
        this.physics.world.bounds.height / 2, 
        'bar',
    );

    clickd = this.input.keyboard.createCursorKeys();
    keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keys.z = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    playersa.setCollideWorldBounds(true);
    playersb.setCollideWorldBounds(true);
    ballicon.setCollideWorldBounds(true);
    ballicon.setBounce(1, 1);
    playersa.setImmovable(true);
    playersb.setImmovable(true);
    this.physics.add.collider(ballicon, playersa, null, null, this);
    this.physics.add.collider(ballicon, playersb, null, null, this);

    welcomeText = this.add.text(
        this.physics.world.bounds.width / 2,
        this.physics.world.bounds.height / 2,
        'Press the Spacebar to Start Game :) Donot let ball hit the wall' ,   // Welcome screen text displaying here.
        {
            fontFamily: 'verdana',
            fontSize: '30px',
            fill: 'red'
        }
    );
    
    welcomeText.setOrigin(0.5);

    // Create players 1 victory text
    playersawin = this.add.text(
        this.physics.world.bounds.width / 2,
        this.physics.world.bounds.height / 2,
        'Players 1 Wins !',            // After if Player 2 lose the ball
        {
            fontFamily: 'verdana',
            fontSize: '35px',
            fill: 'red'
        }
    );

    playersawin.setOrigin(0.5);
    playersawin.setVisible(false);       // this will hide the win text until game is over.
    playersbwin = this.add.text(
        this.physics.world.bounds.width / 2,
        this.physics.world.bounds.height / 2,
        'Plyers 2 Wins !',                     // After if Player 1 lose the ball
        {
            fontFamily: 'verdana',
            fontSize: '35px',
            fill: 'red'
        }
    );

    playersbwin.setOrigin(0.5);
    playersbwin.setVisible(false);       // this will hide the win text until game is over.
}

function update() {
    if (isplayersaPoint()) {
        playersawin.setVisible(true);
        ballicon.disableBody(true, true);
        return;
    }
    if (isplayersbPoint()) {
        playersbwin.setVisible(true);
        ballicon.disableBody(true, true);
        return;
    }
             
        
    playersa.body.setVelocityY(0);
    playersb.body.setVelocityY(0);
    if (clickd.up.isDown) {
        playersa.body.setVelocityY(-350);
    } else if (clickd.down.isDown) {
        playersa.body.setVelocityY(350);
    }
    if (keys.a.isDown) {
        playersb.body.setVelocityY(-350);
    } else if (keys.z.isDown) {
        playersb.body.setVelocityY(350);
    }

    if (!gameStarted) {
        if (clickd.space.isDown) {
            ballicon.setVisible(true);
            gameStarted = true;
            const initialXSpeed = Math.random() * 200 + 50;
            const initialYSpeed = Math.random() * 200 + 50;
            ballicon.setVelocityX(initialXSpeed);
            ballicon.setVelocityY(initialYSpeed);
            welcomeText.setVisible(false);
        }
    }
}
function isplayersaPoint() {                                 
    return ballicon.body.x < playersb.body.x;
}

function isplayersbPoint() {
    return ballicon.body.x > playersa.body.x;
}
         // after this i will insert scorboard also in comming update in my github account (github.com/shnkyr)
