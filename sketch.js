var PLAY = 1;
var END = 0;
var gameState = PLAY;

var trex, trex_running, trex_collided;
var ground, invisibleGround, groundImage;

var cloudsGroup, cloudImage;
var starsGroup;
var obstaclesGroup, obstacle1, obstacle2, obstacle3, obstacle4, obstacle5, obstacle6;


var score=0;
var lastCheckpoint = 0;
var lives = 3;
var invincible = 0;


var gameOver, restart;

var jumpSound, dieSound, checkpointSound;

//localStorage["HighestScore"] = 0;


function preload(){
  trex_running = loadAnimation("trex1.png","trex3.png","trex4.png");
  trex_collided = loadAnimation("trex_collided.png");
  groundImage = loadImage("ground2.png");
  cloudImage = loadImage("cloud.png");
  obstacle1 = loadImage("obstacle1.png");
  obstacle2 = loadImage("obstacle2.png");
  obstacle3 = loadImage("obstacle3.png");
  obstacle4 = loadImage("obstacle4.png");
  obstacle5 = loadImage("obstacle5.png");
  obstacle6 = loadImage("obstacle6.png");
  gameOverImg = loadImage("gameOver.png");
  restartImg = loadImage("restart.png");

  // 🔊 load jump sound
  jumpSound = loadSound("jump.mp3");
  jumpSound.setVolume(0.5);   // 50% of full volume
  dieSound = loadSound("die.mp3");
  dieSound.setVolume(0.2);    // 20% of full volume
  checkpointSound = loadSound("checkpoint.mp3");
  checkpointSound.setVolume(0.2); // 20% of full volume
  lifeLostSound = loadSound("lifeLost.mp3");
  lifeLostSound.setVolume(0.3); // 30% of full volume
  lifeGainedSound = loadSound("lifeGained.mp3");
  lifeGainedSound.setVolume(0.6); // 60% of full volume
}

function setup() {
  createCanvas(600, 200);
  lastCheckpoint = 0;
  
  if (localStorage["HighestScore"] === undefined) {
  localStorage["HighestScore"] = 0;
  }
  starsGroup = new Group();

  trex = createSprite(50,180,20,50);
  
  trex.addAnimation("running", trex_running);
  trex.addAnimation("collided", trex_collided);
  trex.scale = 0.5;
  
  ground = createSprite(200,180,400,20);
  ground.addImage("ground",groundImage);
  ground.x = ground.width /2;
  ground.velocityX = -(6 + 3*score/100);
  
  gameOver = createSprite(300,100);
  gameOver.addImage(gameOverImg);
  
  restart = createSprite(300,140);
  restart.addImage(restartImg);
  
  gameOver.scale = 0.5;
  restart.scale = 0.5;

  gameOver.visible = false;
  restart.visible = false;
  
  invisibleGround = createSprite(200,190,400,10);
  invisibleGround.visible = false;
  
  cloudsGroup = new Group();
  obstaclesGroup = new Group();
  
  score = 0;
}

function draw() {
  background('#060218ff');
  fill('rgba(2, 9, 23, 0.91)');
  noStroke();
  rect(0, 10, width, 90);  
  //trex.debug = true;
  spawnStars();



  textSize(15);   
  fill('#f9fbfbff');   
  stroke('#080000ff');    
  strokeWeight(0);
  textFont('sans-serif');
  textAlign(RIGHT);
  text("00" + Math.floor(score), 560, 50);
  
  text("HI  00" + Math.floor(localStorage["HighestScore"]), 500, 50);

  text("LIVES: " + lives, 390, 50);
  
  if (gameState === PLAY) {
  var baseScoreIncrement = 0.5;
  var maxIncrement = 3;
  var increment = baseScoreIncrement + (score / 2000);
  increment = Math.min(increment, maxIncrement);
  score += increment;

  // Define speed with a cap (e.g., max speed 12)
  var speed = Math.min(12, 6 + 3 * score / 100);
  ground.velocityX = -speed;

  // play checkpoint sound at every 500 points
  if (Math.floor(score / 500) > lastCheckpoint) {
    checkpointSound.play();
    lastCheckpoint = Math.floor(score / 500);

    if (lives < 3) {
      lives++;
      lifeGainedSound.play();
    }
  }
  // die sound
  if (invincible > 0) invincible--;
  
  if (obstaclesGroup.isTouching(trex) && invincible === 0) {
  dieSound.play();
  obstaclesGroup.destroyEach();
  lifeLostSound.play();
  
  lives--;
  invincible = 60;
  
  if (lives <= 0) {
    gameState = END;
  }
}

  // play jump sound
  if (keyDown("space") && trex.y >= 159) {
  trex.velocityY = -11;
  jumpSound.play();
  }

  trex.velocityY += 0.8;

  if (ground.x < 0){
    ground.x = ground.width/2;
  }

  trex.collide(invisibleGround);
  spawnClouds();
  spawnObstacles(speed);
  
  // if(obstaclesGroup.isTouching(trex)){
  //   gameState = END;
  // }
  }

  else if (gameState === END) {
    gameOver.visible = true;
    restart.visible = true;

    starsGroup.setVelocityXEach(0);
    starsGroup.setLifetimeEach(-1);
    
    //set velcity of each game object to 0
    ground.velocityX = 0;
    trex.velocityY = 0;
    obstaclesGroup.setVelocityXEach(0);
    cloudsGroup.setVelocityXEach(0);
    
    //change the trex animation
    trex.changeAnimation("collided",trex_collided);
    
    //set lifetime of the game objects so that they are never destroyed
    obstaclesGroup.setLifetimeEach(-1);
    cloudsGroup.setLifetimeEach(-1);
    
    if(mousePressedOver(restart)) {
      reset();
    }
  }
  
  starsGroup.forEach(function(star) {
      if (star.onUpdate) star.onUpdate();
  });

    // Draw moon on top-left
  noStroke();
  fill(255, 255, 200); // light yellowish color

  // Big circle (moon)
  ellipse(40,40,20,20);

  // Smaller circle (cutout to create crescent)
  fill('#0d0c0cff'); // same as background color to mask
  ellipse(50, 40, 24, 30);

  drawSprites();
}

function spawnClouds() {
  //write code here to spawn the clouds
  if (frameCount % 50 === 0) {
    var cloud = createSprite(600,120,40,10);
    cloud.y = Math.round(random(60,80));
    cloud.addImage(cloudImage);
    cloud.scale = 0.7;
    cloud.velocityX = -5;
    
     //assign lifetime to the variable
    cloud.lifetime = 200;
    
    //adjust the depth
    cloud.depth = trex.depth;
    trex.depth = trex.depth + 1;
    
    //add each cloud to the group
    cloudsGroup.add(cloud);
  }
  
}

function spawnStars() {
  if (gameState !== PLAY) return;

  if (random(1) < 0.05) { 
    var star = createSprite(random(0, width), random(5 , 100), 5,5);

    star.twinkleSpeed = random(0.02, 0.05);
    star.twinkleAlpha = random(100, 255);
    star.fadeOutRate = 255 / 120;

    star.draw = function() {
      noStroke();
      fill(255, 255, 255, this.twinkleAlpha);
      ellipse(0, 0, 4, 4); 
    };

    star.onUpdate = function() {
      this.twinkleAlpha -= this.fadeOutRate;
      if (this.twinkleAlpha <= 0) {
        this.remove(); 
      }
    };
    starsGroup.add(star);
  }
}




function spawnObstacles(speed) {
  if(frameCount % 60 === 0) {
    var obstacle = createSprite(600,165,10,40);
    //obstacle.debug = true;
    var obstacleSpeed = speed || 6; 
    obstacle.velocityX = -obstacleSpeed;    
    //generate random obstacles
    var rand = Math.round(random(1,6));
    switch(rand) {
      case 1: obstacle.addImage(obstacle1);
              break;
      case 2: obstacle.addImage(obstacle2);
              break;
      case 3: obstacle.addImage(obstacle3);
              break;
      case 4: obstacle.addImage(obstacle4);
              break;
      case 5: obstacle.addImage(obstacle5);
              break;
      case 6: obstacle.addImage(obstacle6);
              break;
      default: break;
    }
    
    //assign scale and lifetime to the obstacle           
    obstacle.scale = 0.4;
    obstacle.lifetime = 300;
    obstaclesGroup.add(obstacle);
  }
}

function reset(){
  gameState = PLAY;
  gameOver.visible = false;
  restart.visible = false;
  
  obstaclesGroup.destroyEach();
  cloudsGroup.destroyEach();
  starsGroup.destroyEach();

  
  trex.changeAnimation("running",trex_running);
  
  if(localStorage["HighestScore"]<score){
    localStorage["HighestScore"] = Math.floor(score);
  }
  console.log("High Score: " + localStorage["HighestScore"]);
  
  score = 0;
  lastCheckpoint = 0;
  lives = 3;
  invincible = 0;
}