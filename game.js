//
// PacPong
// https://www.kaper.com/pacpong
//
// 40 Years Pacman anniversary - https://en.wikipedia.org/wiki/Pac-Man
//
// Idea taken from www.okimono.nl PacPong T-Shirt by Mart van Zijl
// Original pong source taken from: https://codepen.io/gdube/pen/JybxxZ
// Added block digit style score counters, added animated pacman, added left/right moves for pacman, stop key, and test/cheat keys.
// Added pacman sound from: https://www.classicgaming.cc/classics/pac-man/sounds
// Added bounce count, Added stats, Added eating the ball, Added (random) messages
// Added motion sensor use for phones and tablets
// And some styling from okimono.nl, to better fit in with the shirt/site.
//
// Thijs Kaper, May-July 2020.
//


// some usage stats, no wories, we are not collecting anything special, just some total play counts
function stats(event) {
   try {
      var oReq = new XMLHttpRequest();
      oReq.open("GET", "stats.php?event=" + event + "&bounced=" + Pong.bounced + (Pong.testmode==1?"&testmode=true":""));
      oReq.send();
   } catch(err) {
      // ignore
   }
}


// Global Variables

var chomp = new Audio("pacman_chomp.wav");
var death = new Audio("pacman_death.wav");
var beginning = new Audio("pacman_beginning.wav");
var ghost = new Audio("pacman_eatghost.wav");
var eatfruit = new Audio("pacman_eatfruit.wav");
var intermission = new Audio("pacman_intermission.wav");
var beep1 = new Audio("beep1.wav");
var beep2 = new Audio("beep2.wav");
var beep3 = new Audio("beep3.wav");

var DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

// pacman mouth animation variables
var dir = -8, pctOpen = 50, pacstate = 0;

// in between game message and timer
var messageText = null;
var messageDisplayTimer = 0;
var pausePaddle = false;

var rounds = [5, 5, 3, 3, 2];
var colors = ['#1abc9c', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6'];
var eatText = [ "Lunch Break", "Munch Munch", "Pac Snack", "Nom Nom", "More Food", "Oops, I Ate It...", "Yummy!", "Swallowed", "Burp!", "Waka Waka", "Chomp"];

// We need old-fashioned crude digits, so just drawing them out ;-)
var digit = [];
digit[0] = "###   # ### ### # # ### ### ### ### ###";
digit[1] = "# #   #   #   # # # #   #     # # # # #";
digit[2] = "# #   # ### ### ### ### ###   # ### ###";
digit[3] = "# #   # #     #   #   # # #   # # #   #";
digit[4] = "###   # ### ###   # ### ###   # ### ###";


// Let's stick Pacman animations also in some text arrays
var pac = new Array(13);
for (var i = 0; i < 13; i++) {
    pac[i] = new Array(13);
}

pac[0][0] = "    #####    ";
pac[0][1] = "  #########  ";
pac[0][2] = " ########### ";
pac[0][3] = "   ######### ";
pac[0][4] = "     ########";
pac[0][5] = "       ######";
pac[0][6] = "        #####";
pac[0][7] = "       ######";
pac[0][8] = "     ########";
pac[0][9] = "   ######### ";
pac[0][10] = " ########### ";
pac[0][11] = "  #########  ";
pac[0][12] = "    #####    ";

pac[1][0] = "    #####    ";
pac[1][1] = "  #########  ";
pac[1][2] = " ########### ";
pac[1][3] = " ########### ";
pac[1][4] = "   ##########";
pac[1][5] = "      #######";
pac[1][6] = "        #####";
pac[1][7] = "      #######";
pac[1][8] = "   ##########";
pac[1][9] = " ########### ";
pac[1][10] = " ########### ";
pac[1][11] = "  #########  ";
pac[1][12] = "    #####    ";

pac[2][0] = "    #####    ";
pac[2][1] = "  #########  ";
pac[2][2] = " ########### ";
pac[2][3] = " ########### ";
pac[2][4] = "#############";
pac[2][5] = "   ##########";
pac[2][6] = "       ######";
pac[2][7] = "   ##########";
pac[2][8] = "#############";
pac[2][9] = " ########### ";
pac[2][10] = " ########### ";
pac[2][11] = "  #########  ";
pac[2][12] = "    #####    ";

pac[3][0] = "    #####    ";
pac[3][1] = "  #########  ";
pac[3][2] = " ########### ";
pac[3][3] = " ########### ";
pac[3][4] = "#############";
pac[3][5] = "#############";
pac[3][6] = "      #######";
pac[3][7] = "#############";
pac[3][8] = "#############";
pac[3][9] = " ########### ";
pac[3][10] = " ########### ";
pac[3][11] = "  #########  ";
pac[3][12] = "    #####    ";

pac[4][0] = "    #####    ";
pac[4][1] = "  #########  ";
pac[4][2] = " ########### ";
pac[4][3] = " ########### ";
pac[4][4] = "#############";
pac[4][5] = "#############";
pac[4][6] = "#############";
pac[4][7] = "#############";
pac[4][8] = "#############";
pac[4][9] = " ########### ";
pac[4][10] = " ########### ";
pac[4][11] = "  #########  ";
pac[4][12] = "    #####    ";

// The ball object (The cube that bounces back and forth)
var Ball = {
    new: function (incrementedSpeed) {
        return {
            width: 18,
            height: 18,
            x: (this.canvas.width / 2) - 9,
            y: (this.canvas.height / 2) - 9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: incrementedSpeed || 9,
	    ballEatenTimer: 0
        };
    }
};

// The paddle object (The two lines that move up and down)
var Paddle = {
    new: function (side) {
        return {
            width: 18,
            height: 80,
            x: side === 'left' ? 150 : this.canvas.width - 150,
            y: (this.canvas.height / 2) - 35,
            score: 0,
            move: DIRECTION.IDLE,
            speed: 10
        };
    }
};

window.addEventListener("resize", handleResize);

function handleResize() {
	var screenWidth = window.innerWidth ? (window.innerWidth - 2) : 698;
	var gameWidth = screenWidth > 698 ? 698 : screenWidth;
	var gameHeight = gameWidth * (10/14);

        document.getElementById("header").style.width = gameWidth + 'px';
        document.getElementById("game").style.width = gameWidth + 'px';
        document.getElementById("startMobile").style.width = gameWidth + 'px';
        document.getElementById("safariIOS").style.width = (gameWidth-20) + 'px';
}


var Game = {
    initialize: function () {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');

        this.canvas.width = 1400;
        this.canvas.height = 1000;
	handleResize();

        this.player = Paddle.new.call(this, 'left');
        this.paddle = Paddle.new.call(this, 'right');
        this.ball = Ball.new.call(this);

        this.paddle.speed = 8;
        this.running = this.over = false;
        this.turn = this.paddle;
        this.timer = this.round = 0;
	this.bounced = 0;
	this.testmode = 0;
        this.color = '#2c3e50';
        this.color = '#000000';

        Pong.menu();
        Pong.listen();
    },

    showText: function(text) {
        // Change the canvas font size and color
        Pong.context.font = '50px Rockwell';
        Pong.context.fillStyle = this.color;

        // Draw the rectangle behind the 'Press any key to begin' text.
        Pong.context.fillRect(
            Pong.canvas.width / 2 - 350,
            Pong.canvas.height / 2 - 48,
            700,
            100
        );

        // Change the canvas color;
        Pong.context.fillStyle = '#ffffff';
        Pong.context.textAlign = 'center';

        // Draw the end game menu text ('Game Over' and 'Winner')
        Pong.context.fillText(text,
            Pong.canvas.width / 2,
            Pong.canvas.height / 2 + 15
        );
    },

    endGameMenu: function (text) {
	this.showText(text);
        setTimeout(function () {
            Pong = Object.assign({}, Game);
            Pong.initialize();
        }, 3000);
    },

    menu: function () {
        // Draw all the Pong objects in their current state
        Pong.draw();

        // Change the canvas font size and color
        Pong.context.font = '50px Courier New';
        Pong.context.fillStyle = this.color;

        // Draw the rectangle behind the 'Press any key to begin' text.
        Pong.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );

        // Change the canvas color;
        Pong.context.fillStyle = '#ffffff';
        Pong.context.textAlign = 'center';

        // Draw the 'press any key to begin' text
        Pong.context.fillText('Press any key to begin',
            this.canvas.width / 2,
            this.canvas.height / 2 + 15
        );
    },

    // Update all objects (move the player, paddle, ball, increment the score, etc.)
    update: function () {
        if (!this.over) {
            // If the ball collides with the bound limits - correct the x and y coords.
            if (this.ball.x <= 0) Pong._resetTurn.call(this, this.paddle, this.player);
            if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.paddle);
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

            // Move player if they player.move value was updated by a keyboard event
            if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
            else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;
            if (this.player.move === DIRECTION.LEFT) this.player.x -= this.player.speed;
            else if (this.player.move === DIRECTION.RIGHT) this.player.x += this.player.speed;

            // On new serve (start of each turn) move the ball to the correct side
            // and randomize the direction to add some challenge.
            if (Pong._turnDelayIsOver.call(this) && this.turn) {
                this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
                this.turn = null;
            }

            // If the player collides with the bound limits, update the x and y coords.
            if (this.player.y <= 0) this.player.y = 0;
            else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);
            if (this.player.x <= 0) this.player.x = 0;
            if (this.player.x >= this.paddle.x) this.player.x = this.paddle.x;

            // Move ball in intended direction based on moveY and moveX values
	    if (this.ball.ballEatenTimer == 0 && messageDisplayTimer == 0) {
               if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
               else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
               if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
               else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;
	    }

            // Handle paddle (AI) UP and DOWN movement
	    if (!pausePaddle) {
              if (this.paddle.y > this.ball.y - (this.paddle.height / 2)) {
                  if (this.ball.moveX === DIRECTION.RIGHT) this.paddle.y -= this.paddle.speed / 1.5;
                  else this.paddle.y -= this.paddle.speed / 4;
              }
              if (this.paddle.y < this.ball.y - (this.paddle.height / 2)) {
                  if (this.ball.moveX === DIRECTION.RIGHT) this.paddle.y += this.paddle.speed / 1.5;
                  else this.paddle.y += this.paddle.speed / 4;
              }
	    }

            // Handle paddle (AI) wall collision
            if (this.paddle.y >= this.canvas.height - this.paddle.height) this.paddle.y = this.canvas.height - this.paddle.height;
            else if (this.paddle.y <= 0) this.paddle.y = 0;

	    // Ball eaten?
	    if (this.ball.ballEatenTimer > 0) {
	       // keep ball in front of pacman, and count down eat timer
	       this.ball.x = (this.player.x + this.ball.width) + 1;
	       this.ball.y = this.player.y + (this.player.height/2);
	       this.ball.ballEatenTimer--;
	    }
            // Handle Player-Ball collisions
            if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
                if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
                    this.ball.x = (this.player.x + this.ball.width) + 1;
                    this.ball.moveX = DIRECTION.RIGHT;
		    this.bounced++;
		    if (this.ball.y <= this.player.y + (this.player.height*3/4) && this.ball.y + this.ball.height >= this.player.y + (this.player.height*1/4)) {
			    if (pacstate <= 2) {
				    // mouth open, and ball hit in middle 1/3, eat the ball!
				    this.ball.ballEatenTimer = 100;
				    messageText = eatText[Math.floor(Math.random() * eatText.length)];
				    messageDisplayTimer = 100;
				    ghost.play();
			    } else {
		               chomp.play();
			    }
		    } else {
		       chomp.play();
		    }
                }
            }

            // Handle paddle-ball collision
            if (this.ball.x - this.ball.width <= this.paddle.x && this.ball.x >= this.paddle.x - this.paddle.width) {
                if (this.ball.y <= this.paddle.y + this.paddle.height && this.ball.y + this.ball.height >= this.paddle.y) {
                    this.ball.x = (this.paddle.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
		    this.bounced++;
                    beep1.play();
                }
            }

	    if (messageDisplayTimer > 0) {
	       messageDisplayTimer--;
	    } else if (pausePaddle) {
               pausePaddle = false;
	    }
        }

        // Handle the end of round transition
        // Check to see if the player won the round.
        if (this.player.score === rounds[this.round]) {
            // Check to see if there are any more rounds/levels left and display the victory screen if
            // there are not.
	    stats("pac-win-" + (this.round + 1));
            if (!rounds[this.round + 1]) {
                this.over = true;
                intermission.play();
                setTimeout(function () {
                    Pong.endGameMenu('Pac Is The Winner!');
                }, 1500);
            } else {
                // If there is another round, reset all the values and increment the round number.
                this.color = colors[Pong.round];
                this.player.score = this.paddle.score = 0;
                this.player.speed += 0.5;
                this.paddle.speed += 1;
                this.ball.speed += 1;
                this.round += 1;
                //beep3.play();
                eatfruit.play();

		messageText = "Pac Wins This Round!";
		messageDisplayTimer = 200;
		pausePaddle = true;
            }
        }
        // Check to see if the paddle/AI has won the round.
        else if (this.paddle.score === rounds[this.round]) {
            this.over = true;
            death.play();
            setTimeout(function () {
                Pong.endGameMenu('Pong Has Won - Game Over!');
            }, 1500);
	    stats("pong-win-" + (this.round + 1));
        }
    },

    // Draw the objects to the canvas element
    draw: function () {
        // Clear the Canvas
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        // Set the fill style to black
        this.context.fillStyle = this.color;

        // Draw the background
        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        // Draw the net (Line in the middle)
        this.context.beginPath();
        this.context.setLineDash([7, 15]);
        this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
        this.context.lineTo((this.canvas.width / 2), 140);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();

	// in between message display
        if (messageDisplayTimer > 0) {
           this.showText(messageText);
	}

        // handle pacman animation state
        pctOpen += dir
        if (pctOpen > 100) {
            dir = -dir;
	    pctOpen = 100;
        }
        if (pctOpen < 0) {
            dir = -dir;
	    pctOpen = 0;
        }
        pacstate = Math.round(pctOpen / 20);
        if (pacstate >= 5) {
            pacstate = 4;
        }

        // Draw the Player
        // yellow pacman
        this.context.fillStyle = '#ffff00';
        this.drawpacman(this.player.x, this.player.y, pacstate, Math.round(this.player.height / 13));

        // Set the fill style to white (For the paddle and the ball)
        this.context.fillStyle = '#ffffff';

        // Draw the Paddle
        this.context.fillRect(
            this.paddle.x,
            this.paddle.y,
            this.paddle.width,
            this.paddle.height
        );

        // Draw the Ball
        if (Pong._turnDelayIsOver.call(this) && this.ball.ballEatenTimer == 0 && messageDisplayTimer == 0) {
            this.context.fillRect(
                this.ball.x,
                this.ball.y,
                this.ball.width,
                this.ball.height
            );
        }

	// print scores
        this.printscore(this.player.score, -330, 110);
        this.printscore(this.paddle.score, +270, 110);

        // Change the font size for the center score text
        this.context.font = '30px Rockwell';
        this.context.textAlign = 'center';

        // Draw the winning score (center)
        this.context.fillText(
            'Round ' + (Pong.round + 1) + ' of  5 (score ' + (rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1]) + ' to win)',
            (this.canvas.width / 2),
            35
        );

        // Change the font size for the center score value
        // this.context.font = '40px Rockwell';

        // Draw the current round number
        // this.context.fillText( rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1], (this.canvas.width / 2), 74 );

	// Show bounce count
        this.context.font = '30px Rockwell';
        this.context.fillText( "Bounced " + Pong.bounced + " times", (this.canvas.width / 2), 75 );
    },

    drawpacman: function (x, y, state, size) {
        for (i = 0; i < 13; i++) {
            for (j = 0; j < 13; j++) {
                var pos;
                if (Pong.player.move == DIRECTION.LEFT) {
                    pos = j;
                    line = i;
                }
                if (Pong.player.move == DIRECTION.RIGHT || Pong.player.move == DIRECTION.IDLE) {
                    pos = 12 - j;
                    line = i;
                }
                if (Pong.player.move == DIRECTION.UP) {
                    pos = i;
                    line = j;
                }
                if (Pong.player.move == DIRECTION.DOWN) {
                    pos = 12 - i;
                    line = 12 - j;
                }
                dx = x + (size * j) - (6 * size);
                dy = y + (size * i);
                if (pac[state][line].charAt(pos) == '#') {
                    this.context.fillRect(dx, dy, size, size);
                }
            }
        }
    },

    printscore: function (nr, x, y) {
        // score max 0..5, so don't bother drawing multi character numbers
        for (i = 0; i < 5; i++) {
            for (j = 0; j < 3; j++) {
                dx = (this.canvas.width / 2) + x + (18 * j);
                dy = y + (18 * i);
                if (digit[i].charAt(j + (4 * nr)) == '#') {
                    this.context.fillRect(dx, dy, 18, 18);
                }
            }
        }
    },

    loop: function () {
        Pong.update();
        Pong.draw();

        // If the game is not over, draw the next frame.
        if (!Pong.over) {
            requestAnimationFrame(Pong.loop);
        } else {
            pctOpen = 50;
        }
    },

    listen: function () {
        document.addEventListener('keydown', function (key) {
            // Handle the 'Press any key to begin' function and start the game.
            Pong.checkStart("key");

            // Handle up arrow and w key events
            if (key.keyCode === 38 || key.keyCode === 87) Pong.keyUp();

            // Handle down arrow and s key events
            if (key.keyCode === 40 || key.keyCode === 83) Pong.keyDown();

            // Handle left arrow and a key events
            if (key.keyCode === 37 || key.keyCode === 65) Pong.keyLeft();

            // Handle right arrow and d key events
            if (key.keyCode === 39 || key.keyCode === 68) Pong.keyRight();

            // Handle test key (c) - move pac to ball Y position
            if (key.keyCode === 67) { Pong.testmode = 1; Pong.player.y = Pong.ball.y - (Pong.player.height/2); }

            // Handle test key (C) - skip to next round
            if (key.key === 'C') { Pong.testmode = 1; Pong.player.score = rounds[Pong.round]; }

            // Handle stop key (escape)
            if (key.keyCode === 27) {
		if (Pong.running && !Pong.over) {
		   stats("game-escape");
		}
                death.play();
                Pong.over = true;
                setTimeout(function () {
                    Pong.endGameMenu('Quit!');
                }, 1000);
            }
        });

        // Stop the player from moving when there are no keys being pressed.
        document.addEventListener('keyup', function (key) {
            Pong.player.move = DIRECTION.IDLE;
        });
    },

    onBlur: function () {
	    if (Pong.running && !Pong.over) {
	       stats("game-lost-focus");
	    }
	    Pong.over = true;
	    Pong.endGameMenu('Quit!');
    },

    checkStart: function (how) {
        if (Pong.running === false) {
            Pong.running = true;
            beginning.play();
            window.requestAnimationFrame(Pong.loop);
	    stats("game-start-" + how);
        }
    },

    keyUp: function () {
        Pong.player.move = DIRECTION.UP;
    },

    keyDown: function () {
        Pong.player.move = DIRECTION.DOWN;
    },

    keyLeft: function () {
        Pong.player.move = DIRECTION.LEFT;
    },

    keyRight: function () {
        Pong.player.move = DIRECTION.RIGHT;
    },

    keyIdle: function () {
        Pong.player.move = DIRECTION.IDLE;
    },

    // Reset the ball location, the player turns and set a delay before the next round begins.
    _resetTurn: function (victor, loser) {
        this.ball = Ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();

        victor.score++;
        beep2.play();
    },

    // Wait for a delay to have passed after each turn.
    _turnDelayIsOver: function () {
        return ((new Date()).getTime() - this.timer >= 1000);
    }
}

var Pong = Object.assign({}, Game);
Pong.initialize();


// attempt at controlling game on mobile by using device orientation

var hasDeviceorientation = false;
var motionX = 0, motionY = 0;
var motionZeroX = 0, motionZeroY = 0;
var startedMobile = false;

function handleOrientation(event) {
    if (!hasDeviceorientation) {
        hasDeviceorientation = true;
        // Show motion sensor game start button
        document.getElementById("startMobile").style.display="block";
    }
    motionY = event.beta;
    motionX = event.gamma;

    if (startedMobile) {
        var diffX = motionX - motionZeroX;
        var diffY = motionY - motionZeroY;

        var H = (Pong.canvas.height - Pong.player.height);
        var calcY = Math.round((20 + diffY)* H / 40);
        if (calcY < 0) calcY = 0;
        if (calcY > H) calcY = H;

        Pong.player.y = calcY;
     }
}

window.addEventListener("deviceorientation", handleOrientation, true);

var isSafariIOS = (!!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/)) && (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
if (isSafariIOS) {
	setTimeout(checkSafariIOS, 1000);
} 

function checkSafariIOS() {
	if (!hasDeviceorientation) {
	   document.getElementById("safariIOS").style.display="block";
	}
}

function startMobile() {
    // Hack.Workaround for apple safari, it only allows initialization of playing audio in an onclick
    // So play all of them at the start (but stop and reset quickly)
    chomp.play(); chomp.pause(); chomp.currentTime = 0;
    death.play(); death.pause(); death.currentTime = 0;
    beginning.play(); beginning.pause(); beginning.currentTime = 0;
    intermission.play(); intermission.pause(); intermission.currentTime = 0;
    ghost.play(); ghost.pause(); ghost.currentTime = 0;
    eatfruit.play(); eatfruit.pause(); eatfruit.currentTime = 0;
    beep1.play(); beep1.pause(); beep1.currentTime = 0;
    beep2.play(); beep2.pause(); beep2.currentTime = 0;
    beep3.play(); beep3.pause(); beep3.currentTime = 0;

    // "calibrate" zero point of motion sensor
    motionZeroX = motionX;
    motionZeroY = motionY;
    startedMobile = true;
    Pong.checkStart("mobile");
}

window.addEventListener("blur", Pong.onBlur , true);

stats("pageload");
