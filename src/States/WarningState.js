//		Warning State
//=======================================
//This state just displays the screen telling you that this game 
// needs multiplayer and 2 devices
//It also initializes the Peer object we use for the p2p communication
//Once it finishes, it starts MenuState
(function(exports) {
	//Private variables
    var game; //keeps a reference to the game object
    var warningScreen;//The screen object
    var txtboxScreen;//The text box object
    var warningText;//The text itself

    //Generate a random id for the peers to connect
    //(If we don't make one, PeerJS will automatically create one for us.)
    //(I'm creating one to make them shorter and easier to remember, since I'm assuming not many people will playing the game at the same time)
    function makeid(){
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 6; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

	//Define our state's methods. 
	//Get a reference to the game object
	exports.setGame = function(g){
		game = g;
	}

	//These methods correspond to Phaser.State methods
	exports.create = function() {
		warningScreen = game.add.sprite(game.world.centerX,game.world.centerY,"multiplayer")
        warningScreen.anchor.setTo(0.5,0.5)
        warningScreen.y -= 60;
        warningScreen.alpha = 0;
        warningScreen.state = "fadein"
        warningScreen.counter = 0;

        txtboxScreen = game.add.sprite(game.world.centerX,game.world.centerY,"textbox_large")
        txtboxScreen.y += txtboxScreen.width/2 - 70;
        txtboxScreen.anchor.setTo(0.5,0.5)
        txtboxScreen.alpha = 0;

        var style = { font: "18px patagoniaregular", fill: numberColor, align: "center" };
        warningText = game.add.text(0,0, "", style);
        warningText.x = txtboxScreen.x - txtboxScreen.width/2 + 70;
        warningText.y = txtboxScreen.y - txtboxScreen.height/2 + 17;
        warningText.text = "This game is a multiplayer experience.\nand is best played with a mobile device\nand a computer with a big screen."

        //Initialize peer 
        PeerObject = new Peer(makeid(),{key: PeerJSKey});
	}

	exports.update = function() {
		if(warningScreen.state == "fadein"){
            if(warningScreen.alpha < 1) warningScreen.alpha += 0.02;
            warningScreen.counter ++;
            if(warningScreen.counter > 60 * 5){
                warningScreen.state = "fadeout"
            }
        }
        if(warningScreen.state == "fadeout"){
            if(warningScreen.alpha > 0) warningScreen.alpha -=0.02;
            if(warningScreen.alpha <= 0){
                game.state.start("Menu")
            }
        }
        txtboxScreen.alpha = warningScreen.alpha;
        warningText.alpha = warningScreen.alpha;

        if(game.input.mousePointer.isDown || game.input.pointer1.active){
            game.state.start("Menu")
        }
	}
	exports.shutdown = function() {
		warningScreen.destroy()
        txtboxScreen.destroy()
        warningText.destroy()
	}
})(this.WarningState = {});