var PLAY = 1;
var END = 0;
var gameState = PLAY;
var inicio = 5;

var trex, trex_running, trex_collided;
var ground, invisibleGround, groundImage;

var cloudsGroup, cloudImage, badsImg;
var obstaclesGroup, badsGroup, obstacle1, obstacle2, obstacle3, obstacle4, obstacle5, obstacle6;
var JumpSound, DieSound, sound100;

var score=0;
var hight=0;

var gameOver, restart;

var database;
var Position;



function preload(){
  trex_running =   loadAnimation("trex1.png","trex3.png","trex4.png");
  trex_collided = loadAnimation("trex_collided.png");
  
  groundImage = loadImage("ground2.png");
  
  cloudImage = loadImage("cloud.png");
  
  obstacle1 = loadImage("obstacle1.png");
  obstacle2 = loadImage("obstacle2.png");
  obstacle3 = loadImage("obstacle3.png");
  obstacle4 = loadImage("obstacle4.png");
  obstacle5 = loadImage("obstacle5.png");
  obstacle6 = loadImage("obstacle6.png");
  JumpSound = loadSound("jump.mp3");
  DieSound = loadSound("die.mp3");
  sound100 = loadSound("checkPoint.mp3");
  badsImg = loadImage("descarga.png");


  
  gameOverImg = loadImage("gameOver.png");
  restartImg = loadImage("restart.png");
}

function setup() {
  database = firebase.database();
  createCanvas(windowWidth, windowHeight);
  
  gameState = inicio;
  
  trex = createSprite(50,height/2,20,50);
  trex.debug=false;
  trex.setCollider("circle",-10,-5,35);
  var trexPosition = database.ref('t-rex/position');
  trexPosition.on("value",readPosition,showError);

  trex.addAnimation("running", trex_running);
  trex.addAnimation("collided", trex_collided);
  trex.scale = 0.5;
  
  
  
  ground = createSprite(width/2,height/2+10,width,20);
  ground.addImage("ground",groundImage);
  ground.x = ground.width /2;

  
  gameOver = createSprite(width/2,height/2-100);
  gameOver.addImage(gameOverImg);
  
  restart = createSprite(width/2,height/2-50);
  restart.addImage(restartImg);
  
  gameOver.scale = 0.5;
  restart.scale = 0.5;

  gameOver.visible = false;
  restart.visible = false;
  
  invisibleGround = createSprite(width/2,height/2+20,width,10);
  invisibleGround.visible = false;
  
  cloudsGroup = new Group();
  obstaclesGroup = new Group();
  badsGroup = new Group();
  
  
 
  
  
  score = 0;
}

function draw() {
  //trex.debug = true;
  background(255);
  textSize(20);
  fill("black")
  text("Puntuación: "+ score, width-200,50);
  text("HI: "+ hight,width-350,50)


  if (gameState===inicio){
    if (keyDown("SPACE")){
      gameState = PLAY;
      
    }
    
    textSize(width/40);
     fill("black")
  text("Presiona la tecla espacio o toca la pantalla para empezar",width/4-50,height/2-50)
    
    if (touches.length > 0){
      gameState = PLAY;
      
    }
  }
  
  if (gameState===PLAY){
    score = score + Math.round(getFrameRate()/60);
    ground.velocityX = -(10 + 3*score/100);
    writePosition();

  
   if((touches.length > 0 && trex.y  >= height/2-10)) {
     trex.velocityY = -20;
      JumpSound.play();
       touches = [];
    }
    
    if (keyDown("SPACE") && trex.y  >= height/2-10) {
     trex.velocityY = -20;
      JumpSound.play();
      writePosition();

    }
    
    
    if (keyDown("o")){
      trex.velocityY=-2.1;
    }
    if (keyDown("Down")){
      trex.velocityY = trex.velocityY + 3;
    }

    if (score > 700 && score < 1000){
      background(0);
  
    }
    
    if (score > 1700 && score < 2000){
      background(0);
  
    }
    
    if (score > 2700 && score < 3000){
      background(0);
  
    }
    
  
    
    
  //><
  //  trex.velocityY = trex.velocityY + 1.5;
    trex.velocityY = trex.velocityY + 2.1;
  
    if (ground.x < 0){
      ground.x = ground.width/2;
    }
  
    trex.collide(invisibleGround);
    spawnClouds();
    spawnObstacles();
    bads();
    
    if(badsGroup.isTouching(trex)){
        gameState = END;
      DieSound.play();
    }
  
    if(obstaclesGroup.isTouching(trex)){
        gameState = END;
      DieSound.play();
    }
  }
  else if (gameState === END) {
    gameOver.visible = true;
    restart.visible = true;
    
    
    
    if (score>hight){
      
          hight=score;

    }
    
    //establece velocidad a caba objeto del juego en 0
    ground.velocityX = 0;
    trex.velocityY = 0;
    obstaclesGroup.setVelocityXEach(0);
    cloudsGroup.setVelocityXEach(0);
    badsGroup.setVelocityXEach(0);

    
    //cambia la animación de Trex
    trex.changeAnimation("collided",trex_collided);
    
    //establece ciclo de vida a los obsjetos del juego para que nunca se destruyan
    obstaclesGroup.setLifetimeEach(-1);
    cloudsGroup.setLifetimeEach(-1);
    badsGroup.setLifetimeEach(-1);
    
    if(touches.length>0 || mousePressedOver(restart)) {      
      reset();
      touches = []
    }
  }
  
 //  bads.depth = trex.deph;
 //  trex.depth = trex.depth + 1;
  
  
  
  drawSprites();
}

function spawnClouds() {
  //escribe aquí el código para apareer las nubes
  if (frameCount % 60 === 0) {
    var cloud = createSprite(width+20,height,40,10);
    cloud.y = Math.round(random(80,height/2-50));
    cloud.addImage(cloudImage);
    cloud.scale = 0.5;
    cloud.velocityX = -3;
    
     //asigna ciclo de vida a la variable
    cloud.lifetime = width+5;
    
    //ajusta la profundidad
    cloud.depth = trex.depth;
    trex.depth = trex.depth + 1;
    
    //agrega cada nube al grupo
    cloudsGroup.add(cloud);
  }
  
}

function spawnObstacles(){ 
if (frameCount % 50 === 0) {
 
    var obstacle = createSprite(width,height/2-1,10,40);
    obstacle.x = Math.round(random(width+2,width+500));

    //obstacle.debug = true;
     obstacle.velocityX = -(11 + 3*score/100);
  
    // trex.depth = obstaclesGroup.depth;
     //trex.depth = trex.depth - 1;
    
    //genera obst'aculos al azar
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
    
    //asigna escala y ciclo de vida al obstáculo           
    obstacle.scale = 0.5;
    obstacle.lifetime = width+5;
    //agrega cada obstáculo al grupo
    obstaclesGroup.add(obstacle);
  
  
  
    
  
  }
}

function bads(){
  if (frameCount % 250 === 0) {
    var bads = createSprite(width+20,height/2-45,40,10);
    bads.x = Math.round(random(width+5,width+1000));
    bads.debug = false; 
    bads.setCollider("rectangle",0,0,240,100);
 

    bads.addImage(badsImg);
    bads.scale = 0.2;
    bads.velocityX = -(10.5 + 3*score/100);
    

    bads.lifetime = width+25;
    

   
    badsGroup.add(bads);
    
    restart.depth = bads.depth;
    restart.depth = restart.depth + 1;
    
    bads.depth = trex.depth;
    bads.depth = bads.depth - 1;
    
   
    
    
  }
}

function reset(){
  gameState = PLAY;
  gameOver.visible = false;
  restart.visible = false;
  
  obstaclesGroup.destroyEach();
  cloudsGroup.destroyEach();
  badsGroup.destroyEach();
  
  trex.changeAnimation("running",trex_running);
  
 
  
  score = 0;
    
}

function writePosition(){
  database.ref('t-rex/position').set({
      'x':trex.x ,
      'y':trex.y
      
  })
}

function readPosition(data){
  Position = data.val();
  console.log(Position.x);
  trex.x = Position.x;
  trex.y = Position.y;
}

function showError(){
  console.log("error en escribir la base de datos");
}

