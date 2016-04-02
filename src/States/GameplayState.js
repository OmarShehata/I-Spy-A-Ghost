//		Gameplay State
//=======================================
//This is the main chunk of our game
//This is where the logic is for: 
//	-Platformer/movement/attacking for the human
//	-Floating/attacking for ghost
//	-Makeshift animation system
//	-Syncing movements and platforms between players over the network
//	-Generating the never-ending platforms 
(function(exports) {
	//Private variables
    var game; //keeps a reference to the game object

    var roomArray = []//An array of all the floating room pieces
    var gameScale = 0.5;//An easy way to scale up and down the game
    var worldMoveSpeed = -1;//How fast the level moves
    var decorationOffset = {}//This holds the values for how much to offset the decorations when displaying them
    decorationOffset['Attic_deco_7'] = -50;
    decorationOffset['Middle_deco_3'] = -50;
    decorationOffset['Middle_deco_11'] = -50;
    decorationOffset['Middle_deco_10'] = -50;
    decorationOffset['Middle_deco_9'] = -50;
    decorationOffset['Middle_deco_8'] = -50;
    decorationOffset['Middle_deco_2'] = -20;
    decorationOffset['Middle_deco_5'] = -20;
    decorationOffset['Basement_deco_3'] = -20;

    var player;
    var ghost;
    var lanternIcon;
    var lanternStatus;
    //Level definitions
    var roomWidth = 220;
    var roomHeight = 200;

    var levelHeights = []//the heights at which to place the rooms
    levelHeights[0] = 200;
    levelHeights[1] = roomHeight + levelHeights[0] + 20;
    levelHeights[2] = roomHeight * 2 + levelHeights[0] + 20 *2;
    levelHeights[3] = roomHeight * 3 + levelHeights[0] + 20 *3;

    var dropArray = []//An array of the objects that the ghost drops

    //Variables for the initial countdown
    var blackness;
    var readyCounter = 60 * 3;
    var creditText;
    var iSPY;
    var iTitle;
    var countdownGraphic;

    //////////////Helper functions 
    function roundRandom(min,max){//returns a random integer
            return Math.round(Math.random() * (max-min)) + min
        }

    function checkOverlap(spriteA, spriteB) {//returns whether two sprites are touching

        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();

        return Phaser.Rectangle.intersects(boundsA, boundsB);

    }
    function CreateDrop(X,Y,assetName){//Create the objects that hte ghost drops
        var assets = ['Anvil','Crate','Safe']
        if(assetName == null){
            assetName = assets[Math.floor(Math.random() * assets.length)]
        }

        var drop = game.add.sprite(X,Y,assetName);
        drop.asset = assetName
        drop.speedY = 0;
        drop.anchor.setTo(0.5,0.5);
        drop.z = 200;
        dropArray.push(drop)

        return drop;
    }
    function CreateRoom(X,Y,width,level,forceDecoArray){//Creates a random "room piece" and decorates it
        //level can be: Attic,Middle or Basement
        var room = {};
        room.pieces = []
        room.floor = []
        room.deco = []
        var originalWidth = width;


        if(width == 0){
            room.pieces.push(game.add.sprite(X,Y,"Wall_" + level + "_Single"));

        } else {
            width = width - 1;
            room.pieces.push(game.add.sprite(X,Y,"Wall_" + level + "_Left"));
            for(var i=1;i<width+1;i++){
                room.pieces.push(game.add.sprite(X+i*room.pieces[0].width,Y,"Wall_" + level + "_Center"))
            }
            room.pieces.push(game.add.sprite(X+room.pieces[0].width*(width+1) ,Y,"Wall_" + level + "_Right"));
        }

        for(var i=0;i<room.pieces.length;i++){
            var p = room.pieces[i]
            p.z = -10;
            p.anchor.setTo(0.5, 0.5);
            var floor = game.add.sprite(p.x,p.y+(p.height/2)-5,"Floor_Center")
            floor.z = 99000;
            room.floor.push(floor);
            floor.anchor.setTo(0.5, 0.5);
            //Create decorations
            if(forceDecoArray == null && Math.random() < 0.5){
                var maxNum = {}
                maxNum['Attic'] = 7;
                maxNum['Middle'] = 11;
                maxNum['Basement'] = 4;

                var itemName = level + "_deco_" + roundRandom(1,maxNum[level]);
                var deco = game.add.sprite(p.x,p.y,itemName);
                deco.anchor.setTo(0.5,0.5)
                room.deco.push(deco)
                deco.y += (floor.y) - (deco.y+deco.height/2)
                deco.z = -5;
                deco.asset = itemName;
                if(decorationOffset[itemName]){
                    deco.y += decorationOffset[itemName]
                }
                //Special case window
                if(itemName == "Middle_deco_2"){
                    deco.scale.setTo(0.8,0.8)
                }
            }
            
        }

        if(forceDecoArray){
            for(var i=0;i<forceDecoArray.length;i++){
                var d = forceDecoArray[i];
                var deco = game.add.sprite(d.x,d.y,d.asset);
                deco.z = -5;
                deco.scale.setTo(d.scale.x,d.scale.y)
                deco.anchor.setTo(0.5,0.5)
                room.deco.push(deco)
            }
        }
     
        roomArray.push(room);

        if(playerType == "pc"){
            //Send room creation data
            if(ConnObject){
                //Get decoration data
                var decoArray = []
                for(var i=0;i<room.deco.length;i++){
                    var newDeco = {}
                    newDeco.x = room.deco[i].x;
                    newDeco.y = room.deco[i].y;
                    newDeco.asset = room.deco[i].asset;
                    newDeco.scale = {x:room.deco[i].scale.x,y:room.deco[i].scale.y}
                    decoArray.push(newDeco)
                }
                ConnObject.send({meta:"p_room",x:X,y:Y,width:originalWidth,level:level,decoArray:decoArray,is_p_room:true})
            }
        }

    }
    //Handle making the player not fall through the floor
    function FloorCollision(obj){
        for(var i=0;i<roomArray.length;i++){
            var room = roomArray[i];
            for(var j=0;j<room.floor.length;j++){
                var floor = room.floor[j];
                var dx = floor.x - player.x;
                if(Math.abs(dx) < floor.width/2 && player.speedY > 0){
                    var dy = floor.y - player.y + player.height/2;
                    while(dy > 110 && dy < 130){
                        player.y--;
                        dy = floor.y - player.y + player.height/2;
                        player.speedY = 0;
                        if(player.state == "jumping") player.state = "idle"
                    }
                }
            }
        }
    } 

	//Define our state's methods. 
	//Get a reference to the game object
	exports.setGame = function(g){
		game = g;
	}

	//These methods correspond to Phaser.State methods
	exports.create = function() {
		readyCounter = 60 * 3

        //Ghost appears in both game modes
        ghost = game.add.sprite(game.world.centerX,game.world.centerY,'ghost_float1');
        ghost.frameNum = 1;
        ghost.counter = 0;
        ghost.z = 10;
        
        ghost.anchor.setTo(0.5,0.5);

        //Player appears in all game modes
        player = game.add.sprite(game.world.centerX,0,'kid_idle');
        player.speedY = 0;
        player.speedX = 0;
        player.state = "idle"
        player.slip = 0;
        player.broadcastCount = 0;
        player.broadcastTime = 90;//in frames
        player.frameNum = 1;
        player.frameTitle = "idle"
        player.frameCounts = {}
        player.frameCounts['idle'] = 1;
        player.frameCounts['run'] = 8;
        player.counter = 0;
        player.lanternCount = 0;
        player.attachedLantern = game.add.sprite(0,0,"lantern_active")
        player.attachedLantern.alpha = 0;
        player.attachedLantern.anchor.setTo(0.5,0.5)
        player.glow = game.add.sprite(0,0,"lantern_glow")
        player.glow.alpha = 0;
        player.glow.anchor.setTo(0.5,0.5)
        player.glow.z = 500000;
        player.glow.blendMode = Phaser.blendModes.SCREEN;


        blackness = game.add.sprite(game.world.centerX,game.world.centerY,'black')
        blackness.anchor.setTo(0.5,0.5)
        blackness.alpha = 0.5;
        blackness.scale.setTo(3,3)
        blackness.z = 9999999;


        var style = { font: "35px Arial", fill: "#ffffff", align: "center" };
        creditText = game.add.text(0,0,"Created by Omar Shehata (@Omar4ur) & tak (@takorii)",style)
        creditText.x = game.world.centerX * (1/gameScale) - creditText.width/2;
        creditText.y = game.world.centerY * (1/gameScale) * 2 - creditText.height - 50;
        creditText.z = blackness.z + 1;

        iSPY = game.add.sprite(0,0,"title_ispy");
        iSPY.x = game.world.centerX * (1/gameScale) - iSPY.width/2;
        iSPY.y = game.world.centerY;
        iSPY.z = creditText.z;

        countdownGraphic = game.add.sprite(iSPY.x,iSPY.y,"countdown_3")
        countdownGraphic.anchor.setTo(0.5,0.5)
        countdownGraphic.z = creditText.z;
        countdownGraphic.y += countdownGraphic.height + iSPY.height *2;
        countdownGraphic.x += iSPY.width/2;


        player.z = 10;
        player.anchor.setTo(0.5, 0.5);

        if(playerType == "mobile"){
           player.alpha = 0;
           ghost.glowCount = 0;
           ghost.x = Math.random() * (1/gameScale) * game.world._width;
           ghost.y = Math.random() * (1/gameScale) * game.world._height;

            iTitle = game.add.sprite(0,0,"title_thief");
            iTitle.x = iSPY.x
            iTitle.y = iSPY.y + iTitle.height + 30;
            iTitle.z = creditText.z;
        }

        if(playerType == "pc"){

            iTitle = game.add.sprite(0,0,"title_ghost");
            iTitle.x = iSPY.x
            iTitle.y = iSPY.y + iTitle.height + 30;
            iTitle.z = creditText.z;

            lanternIcon = game.add.sprite(100,100,"lantern_active");
            lanternIcon.anchor.setTo(0.5,0.5)
            lanternIcon.scale.setTo(2,2)
            lanternIcon.z = 1000;
            lanternIcon.state = "ready"
            lanternIcon.counter = 0;

            var style = { font: "45px patagoniaregular", fill: "#ffffff", align: "center" };
            lanternStatus = game.add.text(0,0,"Ready!",style)
            lanternStatus.x = lanternIcon.x + lanternIcon.width/2 + lanternStatus.width/2 - 50;
            lanternStatus.y = lanternIcon.y - 20;
            lanternStatus.z = 1000;

            ghost.alpha = 0;
        }

        
        //Randomly initialize room
        var startX = 100;
        
        if(playerType == "pc"){
            //Top
            CreateRoom(100 + roundRandom(0,2) * roomWidth,levelHeights[0],roundRandom(0,3),"Attic") 
            //Middle upper
            CreateRoom(100 + roundRandom(0,3) * roomWidth,levelHeights[1],roundRandom(3,4),"Middle") 
            //Middle lower
            CreateRoom(100 + roundRandom(0,3) * roomWidth,levelHeights[2],roundRandom(3,4),"Middle") 
            //Bottom
            CreateRoom(100 + roundRandom(1,4) * roomWidth,levelHeights[3],roundRandom(0,2),"Basement") 

            player.x = roomArray[0].pieces[0].x;
            player.y = roomArray[0].pieces[0].y - 100;
        }

        game.world.scale.setTo(gameScale, gameScale);
	}

	exports.update = function() {
        MusicUpdate(game)//This function is defined in Global.js
        
		//Ready counter
        readyCounter --;
        if(readyCounter > 0){
            //console.log("countdown_" + String(Math.round(readyCounter/60)))
            countdownGraphic.loadTexture("countdown_" + String(Math.round(readyCounter/60)))
        }
        if(readyCounter < 0){
            blackness.alpha = 0;
            creditText.alpha = 0;
            countdownGraphic.alpha = 0;
            iTitle.alpha = 0;
            iSPY.alpha = 0;

        }

         //Activate sorting
        game.world.sort('z')

        if(playerType == "pc"){
            //Player update
            player.speedY ++;
            player.y += player.speedY;
            if(player.speedY > 10) player.speedY = 10;

            //Bottom of screen collision (debugging)
            // while(player.y + player.height/2 > game.world._height * (1/gameScale)){
            //     player.y--;
            //     player.speedY =0;
            //     if(player.state == "jumping") player.state = "idle"
            // }

            //Kill player if falls down
            if(player.y > game.world._height * (1/gameScale) + player.height){
                //Game over
                winner = 'Ghost'
                console.log("Death 1")
                if(ConnObject) ConnObject.send({meta:'win',isWin:true,winner:winner})//Tell the other player they won
                game.state.start("GameOver");
            }
            //Or gets left behind too much

            if(player.x < -Math.abs(player.width) *2){
                winner = 'Ghost'
                console.log("Death 2")
                if(ConnObject) ConnObject.send({meta:'win',isWin:true,winner:winner})//Tell the other player they won
                game.state.start("GameOver");
            }

            //Move with keyboard
            var leftOrRight = false;

            if(player.state != "attacking"){
                if(game.input.keyboard.isDown(Phaser.Keyboard.A) || game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
                    player.speedX --
                    if(player.state == "idle") player.state = "walking"
                    player.scale.x = -1;

                    leftOrRight = true;
                }
                if(game.input.keyboard.isDown(Phaser.Keyboard.D) || game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){
                    player.speedX ++
                    if(player.state == "idle") player.state = "walking"
                    player.scale.x = 1;

                    leftOrRight = true;
                }
                if(game.input.keyboard.isDown(Phaser.Keyboard.S) || game.input.keyboard.isDown(Phaser.Keyboard.DOWN)){
                    if(player.state != "jumping"){
                        player.state = "jumping"
                        player.slip = 20;
                    }
                }
                if(game.input.keyboard.isDown(Phaser.Keyboard.W) || game.input.keyboard.isDown(Phaser.Keyboard.UP)){
                    if(player.state != "jumping"){
                        player.state = "jumping"
                        player.speedY = -22;
                    }
                }
            }

            //Player attack
            if(game.input.keyboard.isDown(Phaser.Keyboard.Z) || game.input.keyboard.isDown(Phaser.Keyboard.K)){
                if(lanternIcon.state == "ready"){
                    lanternIcon.state = "cooling"
                    lanternIcon.loadTexture("lantern_spent");
                    lanternStatus.text = "Cooling"
                    player.state = "attacking"
                    player.lanternCount = 0
                }   
            }
            //Lantern update
            if(lanternIcon.state == "cooling"){
                lanternIcon.counter ++
                if(lanternIcon.counter > 60 * 5){
                    lanternIcon.counter = 0;
                    lanternIcon.state = "ready"
                    lanternIcon.loadTexture("lantern_active");
                    lanternStatus.text = "Ready!"
                }
            }

            if(player.state =="walking"){
               
                if(player.frameTitle != "run"){
                    player.frameTitle = "run"
                    player.frameNum = 1;
                }
                 player.loadTexture("kid_run" + player.frameNum)
                
                if(!leftOrRight){
                    player.state = "idle"
                }
            }
            if(player.state == "idle" && player.frameTitle != "idle"){
                player.loadTexture("kid_idle")
                player.frameTitle = "idle"
                player.frameNum = 1;
            }

            if(player.state == "jumping"){
                if(player.speedY < 0){
                    player.loadTexture("kid_air_jump")
                    player.frameTitle = "air_jump"
                } else {
                    player.loadTexture("kid_air_fall")
                    player.frameTitle = "air_fall"
                }
            }
            if(player.state == "attacking"){
                player.frameNum =  1;
                player.frameTitle = "lantern"
                player.loadTexture("kid_lantern");
                player.lanternCount ++;
                player.attachedLantern.alpha = 1;
                player.glow.alpha = 1;
                player.glow.x = player.x;
                player.glow.y = player.y;
                player.attachedLantern.x = player.x;
                player.attachedLantern.y = player.y - player.height/2 - player.attachedLantern.height/2;
                if(ConnObject) ConnObject.send({isLight:true,x:player.x,y:player.y,r:player.glow.width/2})
                if(player.lanternCount > 60){
                    player.state = "idle"
                    player.attachedLantern.alpha = 0;
                    player.glow.alpha = 0;
                }
            }

            //Animation
            player.counter ++
            if(player.counter > 3){
                player.counter = 0;
                player.frameNum ++;
                if(player.frameNum > player.frameCounts[player.frameTitle]){
                    player.frameNum = 1;
                }
            }
            

        
            player.x += player.speedX;
            player.speedX *= 0.86;


            if(player.slip < 0) FloorCollision(player)
            player.slip --;
            player.x+=worldMoveSpeed;

            //Send location to ghost
            player.broadcastCount ++;

            if(player.broadcastCount > player.broadcastTime){
                player.broadcastCount = 0;

                if(ConnObject) ConnObject.send({meta:"p_xy",x:player.x,y:player.y})
            }

            //Check for messages
            for(var i=messageQ.length-1;i>=0;i--){
                var message = messageQ[i];
                var valid = false;
                if(message.meta == "g_mv"){
                    //Make ghost appear for a second
                    ghost.x = message.x;
                    ghost.y = message.y;
                    ghost.target = {x:message.tx,y:message.ty}
                    ghost.alpha = 1;
                    valid = true;
                }
                if(message.meta == "g_dp"){
                    //Drop object
                    CreateDrop(message.x,message.y,message.asset)
                    valid = true;
                }
                if(message.isWin){
                    winner = message.winner
                    game.state.start("GameOver")
                    valid = true;
                }

                if(valid){
                     messageQ.splice(i,1);
                }
            }

            //Ghost update
            if(ghost.alpha > 0){
                ghost.alpha -= 0.1;
            }
        }

        //Ghost update
        if(playerType == "mobile"){
            //unshine player
            if(ghost.glowCount <= 0){
                player.attachedLantern.alpha = 0;
                player.glow.alpha = 0;
                player.loadTexture("kid_idle")
            }
            ghost.glowCount --;
            

            //Check for messages
            for(var i=messageQ.length-1;i>=0;i--){
                var message = messageQ[i];
                var valid = false;

                if(message.isWin){
                    winner = message.winner
                    game.state.start("GameOver")
                    valid = true;
                }

                if(message.meta == "p_xy"){
                    player.x = message.x; 
                    player.y = message.y;
                    player.alpha = 1;

                    valid = true;
                }

                if(message.isLight){
                    var dx = ghost.x - message.x;
                    var dy = ghost.y - message.y; 
                    var radius = message.r; 
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    player.alpha = 1;
                    player.x = message.x; 
                    player.y = message.y;
                    //Make player shine
                    player.attachedLantern.alpha = 1;
                    player.glow.alpha = 1;
                    player.glow.x = player.x;
                    player.glow.y = player.y;
                    player.loadTexture("kid_lantern")
                    player.attachedLantern.x = player.x;
                    player.attachedLantern.y = player.y - player.height/2 - player.attachedLantern.height/2;
                    if(dist <= radius){
                        //Ghost loses!
                        winner = "Player"
                        game.state.start("GameOver")
                        
                    }
                    ghost.glowCount = 20;
                    valid = true;
                }

                if(message.is_p_room){
                    console.log("ROOM MESSAGE")
                    console.log(message)
                    CreateRoom(message.x,message.y,message.width,message.level,message.decoArray)

                    valid = true;
                }

                if(valid){
                     messageQ.splice(i,1);
                }
            }

            if(player.alpha > 0){
                player.alpha -= 1/30;
            }


            //Tap or click to move 
            function SendTargetData(X,Y){
                //Check if clicked ON the ghost, if so, drop an anchor or something
                var dx = X - ghost.x;
                var dy = Y - ghost.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                ghost.scale.x = Math.abs(dx) / dx;
                if(dist < 75){
                    var drop = CreateDrop(ghost.x,ghost.y);
                    if(ConnObject) ConnObject.send({meta:'g_dp',x:ghost.x,y:ghost.y,asset:drop.asset})
                } else {
                    ghost.target = {x:X,y:Y};
                    if(ConnObject) ConnObject.send({meta:'g_mv',tx:X,ty:Y,x:ghost.x,y:ghost.y})
                }

                
            }

             if(game.input.mousePointer.isDown && ghost.pressed != true){
                 var X = game.input.mousePointer.x * (1/gameScale); 
                 var Y = game.input.mousePointer.y * (1/gameScale);
                 ghost.pressed = true;
                 SendTargetData(X,Y)
             }
           
             if(game.input.pointer1.active && ghost.pressed != true){
                 var X = game.input.pointer1.x * (1/gameScale); 
                 var Y = game.input.pointer1.y * (1/gameScale);
                  ghost.pressed = true;
                 SendTargetData(X,Y)
             }

             if(ghost.pressed && !game.input.pointer1.active && !game.input.mousePointer.isDown){
                ghost.pressed = false;
             }
        }

        //Universal drop update
        for(var i=0;i<dropArray.length;i++){
            var drop = dropArray[i];
            drop.speedY ++;
            if(drop.speedY > 20) drop.speedY = 20;
             drop.y += drop.speedY;

            if(playerType == "pc" && checkOverlap(drop,player)){
                //Player loses! Ghost wins!
                winner = 'Ghost'
                console.log("Death 3")
                if(ConnObject) ConnObject.send({meta:'win',isWin:true,winner:winner})//Tell the other player they won
                game.state.start("GameOver");
            }
        }

        //Universal ghost update
        ghost.counter++
        if(ghost.counter > 3){
            ghost.counter = 0;
            ghost.frameNum ++
            if(ghost.frameNum > 8) ghost.frameNum = 1;
            ghost.loadTexture("ghost_float" + ghost.frameNum)
        }
        if(ghost.target){
            ghost.x += (ghost.target.x - ghost.x) / 16;
            ghost.y += (ghost.target.y - ghost.y) / 16;
            var dx = ghost.target.x - ghost.x;
            var dy = ghost.target.y - ghost.y;
            var dist = Math.sqrt(dx*dx+dy*dy);
            if(dist < 10){
                ghost.target = null;
            }

            
         }

        //Room generation rules
        //Gaps can be up to 3 at the top and bottom
        //Gaps can only be 1 in the two middle
        //Length is 3 or 4 in the middle
        //Length is 0, 1 or 2 at the top and bottom
        //Whenever a room's left side enters the screen, create next part
        //Whenever a room's right part leaves the screen, destroy it
        if(playerType == "pc"){
            for(var i=0;i<roomArray.length;i++){
                var room = roomArray[i];
                var roomLeftX = room.floor[0].x - room.floor[0].width/2;
                var roomRightX =room.floor[room.floor.length-1].x + room.floor[room.floor.length-1].width;
                if(!room.nextCreated && roomLeftX < game.world._width * (1/gameScale)){
                    room.nextCreated = true;
                    //Create next piece
                    var roomType = ""
                    var minSpace = 1;
                    var maxSpace = 3;
                    var minSize = 0;
                    var maxSize = 4;
                    if(room.pieces[0].y == levelHeights[0]){
                        roomType = "Attic"
                        minSize = 0;
                        maxSize = 2;
                    }
                    if(room.pieces[0].y == levelHeights[1] || room.pieces[0].y == levelHeights[2]){
                        roomType = "Middle"
                        minSpace = 1;
                        maxSpace = 2;
                        minSize = 3;
                        maxSize = 4;
                    }
                    if(room.pieces[0].y == levelHeights[3]){
                        roomType = "Basement"
                        minSize = 1;
                        maxSize = 2;
                    }


                    var Y = room.pieces[0].y;
                    CreateRoom(roomRightX + roomWidth * roundRandom(minSpace,maxSpace),Y,roundRandom(minSize,maxSize),roomType) 

                }
            }
        }

        //Move everything
        for(var i=roomArray.length-1;i>=0;i--){
            var room = roomArray[i];
            for(j=0;j<room.floor.length;j++) room.floor[j].x += worldMoveSpeed;
            for(j=0;j<room.pieces.length;j++) room.pieces[j].x += worldMoveSpeed;
            for(j=0;j<room.deco.length;j++) room.deco[j].x += worldMoveSpeed;

            //If the rightmost piece has exited the screen, destroy the room
            var lastPiece = room.floor[room.floor.length-1];
            var width = lastPiece.width * room.floor.length;
            if(lastPiece.x + lastPiece.width/2 < -100){
                for(j=0;j<room.floor.length;j++) room.floor[j].destroy()
                for(j=0;j<room.pieces.length;j++) room.pieces[j].destroy()
                for(j=0;j<room.deco.length;j++) room.deco[j].destroy()
                roomArray.splice(i,1);
            }
        }
	}
	exports.shutdown = function() {
		//Destroy player 
        if(player) player.destroy();
        if(ghost) ghost.destroy();
        //destroy all rooms
        for(var i=0;i<roomArray.length;i++){
            var room = roomArray[i];
            for(j=0;j<room.floor.length;j++) room.floor[j].destroy();
            for(j=0;j<room.pieces.length;j++) room.pieces[j].destroy();
        }
        roomArray = []
        //Destroy drop objects
        for(var i=0;i<dropArray.length;i++){
            var drop = dropArray[i];
            drop.destroy()
        }
        dropArray = []

        //Clear messages
        messageQ = [];

        //Reset scale
        game.world.scale.setTo(1, 1);

        //Destroy lantern
        if(lanternIcon) lanternIcon.destroy()
        if(lanternStatus) lanternStatus.destroy()

        if(blackness) blackness.destroy()
        if(creditText) creditText.destroy()
        if(iSPY) iSPY.destroy()
        if(countdownGraphic) countdownGraphic.destroy()
        if(iTitle) iTitle.destroy()
	}
})(this.GameplayState = {});