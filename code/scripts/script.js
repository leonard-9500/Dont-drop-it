/* Program: script.js
 * Programmer: Leonard Michel
 * Start Date: 11.08.2021
 * Last Change:
 * End Date: /
 * License: /
 * Version: 0.0.0.0
*/

/**** INITIALIZATION ****/

const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 720;

let canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

ctx.save();

let radians = Math.PI / 180;

/* Audio Object Definitions */
let audioButtonPressed = new Audio("audio/audioButtonPressed.mp3");
let audioButtonPressedIsReady = false;
audioButtonPressed.addEventListener("canplaythrough", function () { audioButtonPressedIsReady = true; });

/* Mouse Input */
let mouseX;
let mouseY;
let mouseLeftPressed = false,
    mouseRightPressed = false;

let mouseLeftPressedBefore = false,
    mouseRightPressedBefore = false;

document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);

function mouseMoveHandler(e)
{
    mouseX = e.clientX;
    mouseY = e.clientY;
}

function mouseDownHandler(e)
{
    //console.log("Mouse pressed.\n");
    if (e.button == 0) { mouseLeftPressed = true; };
    if (e.button == 2) { mouseRightPressed = true; };
}

function mouseUpHandler(e)
{
    //console.log("Mouse released.\n");
    if (e.button == 0) { mouseLeftPressed = false; };
    if (e.button == 2) { mouseRightPressed = false; };
}

/* Key Presses */
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

let wPressed = false,
    aPressed = false,
    sPressed = false,
    dPressed = false,
    jPressed = false,
    kPressed = false,
    lPressed = false;

let wPressedBefore = false,
    aPressedBefore = false,
    sPressedBefore = false,
    dPressedBefore = false,
    jPressedBefore = false,
    kPressedBefore = false,
    lPressedBefore = false;

function keyDownHandler(e)
{
    if (e.code == "KeyW") { wPressed = true; }
    if (e.code == "KeyA") { aPressed = true; }
    if (e.code == "KeyS") { sPressed = true; }
    if (e.code == "KeyD") { dPressed = true; }

    if (e.code == "KeyJ") { jPressed = true; }
    if (e.code == "KeyK") { kPressed = true; }
    if (e.code == "KeyL") { lPressed = true; }
}

function keyUpHandler(e)
{
    if (e.code == "KeyW") { wPressed = false; }
    if (e.code == "KeyA") { aPressed = false; }
    if (e.code == "KeyS") { sPressed = false; }
    if (e.code == "KeyD") { dPressed = false; }

    if (e.code == "KeyJ") { jPressed = false; }
    if (e.code == "KeyK") { kPressed = false; }
    if (e.code == "KeyL") { lPressed = false; }
}

/* Class Definitions */
class Rectangle
{
	constructor(x, y, w, h, color)
	{
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.fillColor = color;
	}

	draw()
	{
		ctx.fillStyle = this.fillColor;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}

class EnemyManager
{
	constructor()
	{
		// An array of all enemy objects.
		this.enemy = [];
		// An array of all KillSurface objects. This will be used for collision detection.
		this.killSurface = new KillSurface(50, SCREEN_HEIGHT-50, SCREEN_WIDTH-100, 50, "#ff0000");
		this.spawnSurface = new SpawnSurface(0, 0, 500, 50, "#4287f5");
		this.spawnInterval = 1000;
		this.spawnTick = Date.now();
		this.maxEnemies = 10;
		this.timerSurface = new TimerSurface();
	}

	update()
	{
		this.spawnSurface.draw();
		this.killSurface.draw();
		this.timerSurface.draw();
		this.timerSurface.update();

		if (tp1 - this.spawnTick >= this.spawnInterval)
		{
			if (this.enemy.length < this.maxEnemies)
			{
				let e = this.spawnSurface.getEnemyInstance();
				if (typeof e != "undefined")
				{
					this.enemy[this.enemy.length] = e;
				};
				console.log(this.enemy);
				this.spawnTick = Date.now();
			}
		}


		for (let i = 0; i < this.enemy.length; i++)
		{
			this.enemy[i].update();
			// Let enemies get faster the lower the timer surface is.
			this.enemy[i].velY = this.timerSurface.tVal;
		}

		this.collisionDetection();
	}

	draw()
	{
	}

	collisionDetection()
	{
		// Enemy to kill surface collisions
		for (let n = 0; n < this.enemy.length; n++)
		{
			// If enemy has collided with kill surface, delete it.
			if (this.enemy[n].x >= this.killSurface.x && this.enemy[n].x+this.enemy[n].width < this.killSurface.x+this.killSurface.width &&
				this.enemy[n].y >= this.killSurface.y && this.enemy[n].y+this.enemy[n].height < this.killSurface.y+this.killSurface.height)
			{
				// The splice function reindexes the array, so we decrease n by 1 in order to not skip the next item which is at the location n.
				this.enemy.splice(n, 1);
				n -= 1;
			}

			// Mouse to enemy collisions
			if (mouseX >= this.enemy[n].x && mouseX < this.enemy[n].x+this.enemy[n].width && mouseY >= this.enemy[n].y && mouseY < this.enemy[n].y+this.enemy[n].height)
			{
				if (mouseLeftPressed)
				{
					if (mouseLeftPressedBefore == false)
					{
						this.enemy.splice(n, 1);
						n -= 1;
						mouseLeftPressedBefore = true;
					}
				}
				if (!mouseLeftPressed)
				{
					mouseLeftPressedBefore = false;
				}
			}
		}
	}
}

class TimerSurface extends Rectangle
{
	constructor(x, y, w, h, color)
	{
		super(x, y, w, h, color);
		this.x = 0;
		this.y = 0;
		this.w = 50;
		this.h = 250;
		this.tMin = 1.0;
		this.tMax = 5.0;
		this.tVal = 1.0;
		this.tIncrementInterval = 500;
		this.tIncrementTick = Date.now();
		this.tIncrementValue = 0.1;
		this.tFillColor = "#000000";
	}

	update()
	{
		if (tp1 - this.tIncrementTick >= this.tIncrementInterval)
		{
			if (this.tVal < this.tMax)
			{
				this.tVal += this.tIncrementValue;
				this.tIncrementTick = Date.now();
			}
		}
	}

	draw()
	{
		ctx.fillStyle = this.tFillColor;
		let yOffset = this.h - (this.tVal/this.tMax * this.h);
		ctx.fillRect(this.x, this.y+yOffset, this.w, (this.tVal/this.tMax) * this.h);
	}
}

class Enemy extends Rectangle
{
	constructor(x, y, w, h, color)
	{
		super(x, y, w, h, color);
		this.velX = 0;
		this.velY = 1;
	}

	update()
	{
		this.x += this.velX;
		this.y += this.velY;
		super.draw();
	}
}

class SpawnSurface extends Rectangle
{
	constructor(x, y, w, h, color)
	{
		super(x, y, w, h, color);
		this.spawnInterval = 500;
		this.spawnTick = Date.now();
		this.spawnMinW = 45;
		this.spawnMinH = 45;
		this.spawnMaxW = 50;
		this.spawnMaxH = 50;
	}

	update()
	{
	}

	draw()
	{
		super.draw();
	}

	getEnemyInstance()
	{
		let x = getRandomIntInclusive(this.x, this.x+this.width);
		let y = getRandomIntInclusive(this.y, this.x+this.height);
		let w = getRandomIntInclusive(this.spawnMinW, this.spawnMaxW);
		let h = getRandomIntInclusive(this.spawnMinH, this.spawnMaxH);
		let c = "#ff8800";
		return new Enemy(x, y, w, h, c);
		this.spawnTick = Date.now();
	}
}

class KillSurface extends Rectangle
{
	constructor(x, y, w, h, color)
	{
		super(x, y, w, h, color);
	}

	update()
	{
	}

	draw()
	{
		super.draw();
	}
}

class Button
{
	constructor()
	{
        this.x = 0;
        this.y = 0;
        this.width = 150;
        this.height = 50;
        // Colors
        this.colEdgeNeutral = "#888888";
        this.colFaceNeutral = "#00000044";
        this.colEdgeHover = "#bbbbbb";
        this.colFaceHover = "#00000088";
        this.colEdgePressed = "#ffffff";
        this.colFacePressed = "#000000bb";
        this.colTextFill = "#000000";
        this.colTextShadow = "#ffffff";
        // Color assignment
        this.edgeColor = this.colEdgeNeutral;
        this.faceColor = this.colFaceNeutral;

        this.text = "Button";
        this.isPressed = false;
        this.isVisible = true;
		this.playSound = true;
        // How often can the user click the button.
        this.clickSpeed = 50;
        this.clickTick = Date.now();
	}

    update()
    {
        this.collisionDetection();
		this.draw();
		this.playAudio();
    }

    collisionDetection()
    {
        // Only let the user click the button if the wait time has been passed
        if (tp1 - this.clickTick >= this.clickSpeed)
        {
            // If mouse is within button bounds.
            if (mouseX >= this.x && mouseX < this.x + this.width && mouseY >= this.y && mouseY < this.y + this.height)
            {
                // If mouse clicked on button
                if (mouseLeftPressed)
                {
                    if (mouseLeftPressedBefore == false)
                    {
                        this.edgeColor = this.colEdgePressed;
                        this.faceColor = this.colFacePressed;

                        this.isPressed = true;
                        mouseLeftPressedBefore = true;
                    }
                }
                // If mouse is hovering on button
                if (!mouseLeftPressed)
                {
                    this.edgeColor = this.colEdgeHover;
                    this.faceColor = this.colFaceHover;

                    this.isPressed = false;
                    mouseLeftPressedBefore = false;
                }
            }
            // If mouse is out of button bounds.
            else
            {
                this.edgeColor = this.colEdgeNeutral;
                this.faceColor = this.colFaceNeutral;

                this.isPressed = false;
            }

            this.clickTick = Date.now();
        }
    }

    draw()
    {
		if (this.isVisible)
		{
			// Draw fill
			ctx.fillStyle = this.faceColor;
			ctx.fillRect(this.x, this.y, this.width, this.height);

			// Draw border
			ctx.strokeStyle = this.edgeColor;
			ctx.strokeRect(this.x, this.y, this.width, this.height);

			// Draw text
			let textPosX = this.x + (this.width / 2),
				textPosY = this.y + (this.height / 1.5),
				textSize = this.height/1.5;

			ctx.textAlign = "center";
			ctx.font = this.height / 2 + "px sans-serif";

			// Text shadow
			ctx.fillStyle = this.colTextShadow;
			ctx.fillText(this.text, textPosX + textSize/128, textPosY + textSize/128);

			// Actual text
			ctx.fillStyle = this.colTextFill;
			ctx.fillText(this.text, textPosX, textPosY);
		}

    }

	playAudio()
	{
		if (this.playSound)
		{
			if (this.isPressed)
			{
				if (audioButtonPressedIsReady) { audioButtonPressed.play(); };
			}
		}
	}
}
/* Function definitions */
function getRandomIntInclusive(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    // The maximum and minimum are inclusive
    return Math.floor(Math.random() * (max - min + 1) + min);
}

let button = new Button;

let enemyManager = new EnemyManager;
// Time variables
let tp1 = Date.now();
let tp2 = Date.now();
let elapsedTime = 0;

// The game loop
window.main = function ()
{
    window.requestAnimationFrame(main);
    // Get elapsed time for last tick.
    tp2 = Date.now();
    elapsedTime = tp2 - tp1;
    //console.log("elapsedTime:" + elapsedTime + "\n");
    tp1 = tp2;

    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	button.update();
	enemyManager.update();
}

// Start the game loop
main();