//		Menu State
//=======================================
//This state asks the user which device their using 
// and handles connecting the two users
// it sets playerType (whether mobile/pc). That is also whether you are the ghost or the human
// once the connection is succesful, it starts GameplayState
(function(exports) {
	//Private variables
    var game; //keeps a reference to the game object
    var idInput;//The input box for the other player's id to connect to
    var mobileDevice;//The mobile button
    var computerDevice;//The computer button
    var mobileIDScreen;//The box around the input
    var idText;
    var miscText;
    var buttonArray = [];
    var questionText;

    function RecieveData(data){
        console.log("Got Data!")
        console.log(data)
        

        messageQ.push(data);
    }

    //Button helper functions
    function CheckButton(btn){
        return btn.input.checkPointerDown(game.input.mousePointer) || (btn.input.checkPointerDown(game.input.pointer1)  && game.input.pointer1.active);
    }

    function SetAsButton(btn){
        buttonArray.push(btn);
        btn.inputEnabled = true; 
        btn.input.useHandCursor = true;
    }

    function ButtonLogic(){
        for(var i=0;i<buttonArray.length;i++){
            var button = buttonArray[i];
            if(!button){
                buttonArray.splice(i,1);
                break;
            } else {
                 if(CheckButton(button) && !button.pressed){
                    button.pressed = true;
                    if(button.callbackClick) button.callbackClick();

                }
                if(!CheckButton(button)){
                    button.pressed = false;
                }
            }
        }
    }

    function keyPress(key){
        //Make enter connect
        var keyCode = key.charCodeAt(0);
        console.log(key,keyCode)

        //Enter is 13 on chrome, and 0 on firefox

        if(keyCode != 13 && keyCode != 8 && keyCode != 0){
            idInput.text += key;
        } 
        if(keyCode == 13 || keyCode == 0) ConnectClick()
    }

	function ConnectClick(){//When you press enter to connect
        ConnObject = PeerObject.connect(idInput.text);
        //Initialize the connection
        ConnObject.on('open', function(){
            console.log("Sending Connect")
            ConnObject.send('connect');
            //All good!
            

            playerType = "pc"
            
            ConnObject.on('data',RecieveData);
            game.state.start('Gameplay')

        });
    }

    function YesClick(){///What happens when you click on mobile
        //Just display the ID
        questionText.style.font = "40px patagoniaregular"
        questionText.text = "Your ID"
        questionText.z = 100;

        questionText.y = game.world.centerY - 140;

        mobileIDScreen = game.add.sprite(0,0,"textbox_code_mobile");
        mobileIDScreen.anchor.setTo(0.5,0.5)
        mobileIDScreen.x = game.world.centerX;
        mobileIDScreen.y = game.world.centerY - 70;

        questionText.x = mobileIDScreen.x - questionText.width/2;

        var style = { font: "70px patagoniaregular", fill: '#ffffff', align: "center" };
        idText = game.add.text(0,0, String(PeerObject.id), style);
        idText.x = mobileIDScreen.x - idText.width/2;
        idText.y = mobileIDScreen.y - idText.height/2 + 30;

        style = { font: "20px patagoniaregular", fill: numberColor, align: "center" };
        miscText = game.add.text(0,0, "Waiting on other player..", style);
        miscText.fill = numberColor
        miscText.x = txtboxScreen.x - miscText.width/2;
        miscText.y = txtboxScreen.y - miscText.height/2;

        mobileDevice.x = -1000;
        computerDevice.x = -1000;

        //Wait for connection
        PeerObject.on('connection',function(conn){
            ConnObject = conn;
            ConnObject.on('data',RecieveData);
            //All good!

            playerType = "mobile"
            game.state.start('Gameplay')
        })
    }
    

    function NoClick(){//What happens when you click on computer
        mobileDevice.x = -1000;
        computerDevice.x = -1000;

        questionText.text = "Press enter to connect!"
        txtboxScreen.y = game.world.centerY - 130;
        questionText.x = txtboxScreen.x - questionText.width/2;
        questionText.y = txtboxScreen.y - questionText.height/2;

        mobileIDScreen = game.add.sprite(0,0,"textbox_code_computer");
        mobileIDScreen.anchor.setTo(0.5,0.5)
        mobileIDScreen.x = game.world.centerX;
        mobileIDScreen.y = game.world.centerY + 50;

        var style = { font: "70px patagoniaregular", fill: "#ffffff", align: "center" };
        idInput = game.add.text(0,0, "", style);
        idInput.x = mobileIDScreen.x - 120;
        idInput.y = mobileIDScreen.y -10;

        var style = { font: "25px patagoniaregular", fill: numberColor, align: "center" };
        miscText = game.add.text(0,0, "Type your partner's ID", style);
        miscText.x = mobileIDScreen.x - miscText.width/2;
        miscText.y = mobileIDScreen.y - miscText.height/2 - 60;


        game.input.keyboard.addCallbacks(this, null, null, keyPress);
    }


	//Define our state's methods. 
	//Get a reference to the game object
	exports.setGame = function(g){
		game = g;
		//Prevent backspace from going back (so users can type and delete without going back in the browser)
	    //from: http://stackoverflow.com/a/11112169/1278023
	    $(document).on("keydown", function (e) {
	        if (e.which === 8 && !$(e.target).is("input, textarea")) {
	            if(idInput.text.length > 0) idInput.text = idInput.text.substring(0, idInput.text.length - 1);
	            e.preventDefault();
	        }
	    });
	}

	//These methods correspond to Phaser.State methods
	exports.create = function() {
		music = game.add.audio("loop2")//music is a global variable
        music.play()
        music.loop = true;

        mobileDevice = game.add.sprite(0,0,"using_mobile");
        mobileDevice.x = game.world.centerX - 200;
        mobileDevice.y = game.world.centerY - 50;
        mobileDevice.anchor.setTo(0.5,0.5)

        computerDevice = game.add.sprite(0,0,"using_computer");
        computerDevice.x = game.world.centerX + 200;
        computerDevice.y = game.world.centerY - 50;
        computerDevice.anchor.setTo(0.5,0.5)

        txtboxScreen = game.add.sprite(game.world.centerX,game.world.centerY,"textbox_small")
        txtboxScreen.x = game.world.centerX;
        txtboxScreen.y = game.world.centerY + 130;
        txtboxScreen.anchor.setTo(0.5,0.5)

        var style = { font: "20px patagoniaregular", fill: numberColor, align: "center" };
        questionText = game.add.text(0,0, "Which device are you using?", style);
        questionText.x = txtboxScreen.x - questionText.width/2;
        questionText.y = txtboxScreen.y - questionText.height/2;

        SetAsButton(mobileDevice); mobileDevice.callbackClick = YesClick;
        SetAsButton(computerDevice); computerDevice.callbackClick = NoClick;

        //Debug. See Global.js for how this works
        if(debugStart == "pc" || debugStart == "mobile"){
            playerType = debugStart
            game.state.start('Gameplay')
        }

        game.stage.disableVisibilityChange = true;
	}

	exports.update = function() {
		game.world.sort('z')
        ButtonLogic()

        MusicUpdate(game)//This function is defined in Global.js
	}
	exports.shutdown = function() {
		if(mobileDevice) mobileDevice.destroy()
        if(mobileIDScreen) mobileIDScreen.destroy()
        if(computerDevice) computerDevice.destroy()
        if(idText) idText.destroy()
        if(miscText) miscText.destroy()

        if(questionText) questionText.destroy();
        if(idInput) idInput.destroy();
	}
})(this.MenuState = {});