// Main JavaScript File for Flappy Bird

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
	const backgroundMusic = document.getElementById('backgroundMusic');
	
	const pipeImage = new Image();
	pipeImage.src = 'assets/images/pipe.png';
	

    // Constants
    const GRAVITY = 0.25;
    const JUMP_STRENGTH = -6;
    const PIPE_WIDTH = 50;
    const PIPE_GAP = 150;
    const PIPE_SPEED = 2;

    // Game state
    let score = 0;
    let isGameOver = false;

    // Audio files
    const jumpSound = new Audio('assets/audio/jump.mp3');
    const collisionSound = new Audio('assets/audio/collision.mp3');
    const scoreSound = new Audio('assets/audio/score.mp3');
	
	// Background image
	const backgroundImg = new Image();
	backgroundImg.src = 'assets/images/background.png';
	
	// Variables for scrolling background
	let bgX = 0;
	const bgSpeed = 1;  // Adjust the speed of background scroll
	
	
    // Bird object definition
    class Bird {
        constructor() {
            this.x = 100;
            this.y = canvas.height / 2;
            this.velocity = 0;
            this.width = 30;
            this.height = 30;
            this.sprite = new Image();
            this.sprite.src = 'assets/images/bird.png';
            this.frame = 0;
            this.frameCount = 3;
            this.frameInterval = 100;
            this.lastFrameTime = 0;
        }

        update(deltaTime) {
            this.velocity += GRAVITY;
            this.y += this.velocity;

            if (this.y + this.height > canvas.height) {
                this.y = canvas.height - this.height;
                this.velocity = 0;
                isGameOver = true; // Bird hit the ground
                collisionSound.play(); // Play collision sound
            }

            if (this.y < 0) {
                this.y = 0;
                this.velocity = 0;
            }

            this.animate(deltaTime);
        }

        jump() {
            this.velocity = JUMP_STRENGTH;
            jumpSound.play(); // Play jump sound when bird jumps
        }

        animate(deltaTime) {
            this.lastFrameTime += deltaTime;
            if (this.lastFrameTime > this.frameInterval) {
                this.frame = (this.frame + 1) % this.frameCount;
                this.lastFrameTime = 0;
            }
        }

        draw(ctx) {
            ctx.drawImage(
                this.sprite, 
                this.frame * this.width, 0, this.width, this.height, 
                this.x, this.y, this.width, this.height
            );
        }
    }

    // Pipe object definition
    class Pipe {
		constructor() {
			this.x = canvas.width;
			this.width = PIPE_WIDTH;
			this.gapY = Math.random() * (canvas.height - PIPE_GAP - 50) + 25;  // Random gap position
			this.scored = false;
		}

		// Update the position of the pipes
		update() {
			this.x -= PIPE_SPEED;
		}

		// Collision detection logic for the pipes and bird
		collides(bird) {
			if (bird.x + bird.width > this.x && bird.x < this.x + this.width) {
				if (bird.y < this.gapY || bird.y + bird.height > this.gapY + PIPE_GAP) {
					collisionSound.play();  // Play collision sound
					return true;
				}
			}
			return false;
		}

		// Draw the pipes using the pipe image
		draw(ctx) {
			// Draw the top pipe (flipped upside-down)
			ctx.save();  // Save the canvas state
			ctx.translate(this.x, this.gapY);  // Move to the gapY position
			ctx.scale(1, -1);  // Flip vertically to draw the top pipe upside-down
			ctx.drawImage(pipeImage, 0, 0, this.width, this.gapY);  // Draw the top pipe starting from the top
			ctx.restore();  // Restore the canvas state

			// Draw the bottom pipe
			ctx.drawImage(pipeImage, this.x, this.gapY + PIPE_GAP, this.width, canvas.height - (this.gapY + PIPE_GAP));  // Bottom pipe
		}
	}

    // Initialize the bird
    const bird = new Bird();

    // Pipes array
    let pipes = [];
    const PIPE_INTERVAL = 2000;
    let pipeTimer = 0;

    // Game loop state
    let lastTime = 0;

    function gameLoop(timestamp) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        if (!isGameOver) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackground();

            bird.update(deltaTime);
            bird.draw(ctx);

            pipeTimer += deltaTime;
            if (pipeTimer > PIPE_INTERVAL) {
                pipes.push(new Pipe());
                pipeTimer = 0;
            }

            pipes.forEach((pipe, index) => {
                pipe.update();
                pipe.draw(ctx);

                if (pipe.collides(bird)) {
                    isGameOver = true;
                }

                // Score: Check if bird passes the pipe (score increases)
                if (!pipe.scored && bird.x > pipe.x + pipe.width) {
                    score += 1;
                    pipe.scored = true;
                    scoreSound.play(); // Play score sound
                }

                if (pipe.x + pipe.width < 0) {
                    pipes.splice(index, 1);
                }
            });

            drawScore(ctx);

            requestAnimationFrame(gameLoop);
        } else {
            drawGameOver(ctx);
        }
    }

    // Start the game loop
    requestAnimationFrame(gameLoop);

    // Listen for jump input
    document.addEventListener('keydown', () => {
        if (!isGameOver) {
            bird.jump();
        } else {
            resetGame(); // Restart on game over
        }
    });

    canvas.addEventListener('click', () => {
        if (!isGameOver) {
            bird.jump();
        } else {
            resetGame(); // Restart on game over
        }
    });
	
	function startBackgroundMusic() {
		backgroundMusic.volume = 0.5;  // Set volume (0.0 to 1.0)
		backgroundMusic.play();        // Start playing the music
}

	function drawBackground() {
		// Draw two instances of the background for continuous scrolling
		ctx.drawImage(backgroundImg, bgX, 0, canvas.width, canvas.height);
		ctx.drawImage(backgroundImg, bgX + canvas.width, 0, canvas.width, canvas.height);

		// Move the background to the left
		bgX -= bgSpeed;

		// Reset the background when it has fully scrolled off-screen
		if (bgX <= -canvas.width) {
			bgX = 0;
		}
	}

    //function drawBackground(ctx) {
    //    ctx.fillStyle = "#70c5ce";
    //    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //}

    function drawScore(ctx) {
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`Score: ${score}`, 20, 50);
    }

    function drawGameOver(ctx) {
        ctx.font = '50px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2 - 50);

        ctx.font = '25px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('Press any key or click to restart', canvas.width / 2 - 150, canvas.height / 2 + 20);
    }

    function resetGame() {
        score = 0;
        isGameOver = false;
        pipes = [];
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        requestAnimationFrame(gameLoop);
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
	
	
	
});
