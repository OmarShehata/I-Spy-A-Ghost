//		Loading State
//=======================================
//This game state is responsible for loading all the assets and 
// displaying what percentage has loaded. It terminates when
// everything has finished loading and calls WarningState
(function(exports) {
	//Private variables
	var game; //keeps a reference to the game object
    var loadingText;
    var startedLoading = 0;
   


	function LoadAllAssets(){//Keep all of our assets wrapped up in one function
	    //Music
		game.load.audio('loop2', "sounds/gameloop2.ogg");

	    //Screens
	    game.load.image("multiplayer","Assets/intro_screens/multiplayer.png");
	    game.load.image("textbox_code_computer","Assets/intro_screens/textbox_code_computer.png");
	    game.load.image("textbox_code_mobile","Assets/intro_screens/textbox_code_mobile.png");
	    game.load.image("textbox_credits","Assets/intro_screens/textbox_credits.png");
	    game.load.image("textbox_large","Assets/intro_screens/textbox_large.png");
	    game.load.image("textbox_small","Assets/intro_screens/textbox_small.png");
	    game.load.image("textbox_title","Assets/intro_screens/textbox_title.png");
	    game.load.image("title_ghost","Assets/intro_screens/title_ghost.png");
	    game.load.image("title_ispy","Assets/intro_screens/title_ispy.png");
	    game.load.image("title_thief","Assets/intro_screens/title_thief.png");
	    game.load.image("using_computer","Assets/intro_screens/using_computer.png");
	    game.load.image("using_mobile","Assets/intro_screens/using_mobile.png");

	    game.load.image("black","Assets/sprites/black.png")

	    game.load.image("countdown_0","Assets/sprites/countdown_0.png")
	    game.load.image("countdown_3","Assets/sprites/countdown_3.png")
	    game.load.image("countdown_2","Assets/sprites/countdown_2.png")
	    game.load.image("countdown_1","Assets/sprites/countdown_1.png")

	    game.load.image('ghost_winner',"Assets/sprites/winner_is_ghost.png");
	    game.load.image('thief_winner',"Assets/sprites/winner_is_thief.png");

	     //Load decoratiosn
	        //Attic
	    game.load.image("Attic_deco_1","Assets/sprites/attic_mystery.png");
	    game.load.image("Attic_deco_2","Assets/sprites/attic_boxes.png")
	    game.load.image("Attic_deco_3","Assets/sprites/attic_bike.png")
	    game.load.image("Attic_deco_4","Assets/sprites/attic_trunk.png")
	    game.load.image("Attic_deco_5","Assets/sprites/attic_bookstack.png")
	    game.load.image("Attic_deco_6","Assets/sprites/attic_armchair.png")
	    game.load.image("Attic_deco_7","Assets/sprites/attic_window.png")
	        //Middle
	    game.load.image("Middle_deco_1","Assets/sprites/middle_piano.png");
	    game.load.image("Middle_deco_2","Assets/sprites/middle_window.png");
	    game.load.image("Middle_deco_3","Assets/sprites/middle_deerhead.png");
	    game.load.image("Middle_deco_4","Assets/sprites/middle_armoire.png");
	    game.load.image("Middle_deco_5","Assets/sprites/middle_powerpoint.png");
	    game.load.image("Middle_deco_6","Assets/sprites/middle_shelf.png");
	    game.load.image("Middle_deco_7","Assets/sprites/middle_bookcase.png");
	    game.load.image("Middle_deco_8","Assets/sprites/middle_portrait4.png");
	    game.load.image("Middle_deco_9","Assets/sprites/middle_portrait1.png");
	    game.load.image("Middle_deco_10","Assets/sprites/middle_portrait2.png");
	    game.load.image("Middle_deco_11","Assets/sprites/middle_portrait3.png");
	        //Basement
	    game.load.image("Basement_deco_1","Assets/sprites/basement_shelf.png");
	    game.load.image("Basement_deco_2","Assets/sprites/basement_winerack.png");
	    game.load.image("Basement_deco_3","Assets/sprites/basement_vent.png");
	    game.load.image("Basement_deco_4","Assets/sprites/basement_boiler.png");

	    game.load.image("Anvil","Assets/sprites/drop_anvil.png")
	    game.load.image("Crate","Assets/sprites/drop_crate.png")
	    game.load.image("Safe","Assets/sprites/drop_safe.png")

	    game.load.image('Player','Assets/sprites/tmp_kid.png');
	    game.load.image('Ghost','Assets/sprites/tmp_ghost.png');
	    //Ghost animation
	    game.load.image("ghost_float1",'Assets/sprites/ghost_float1.png');
	    game.load.image("ghost_float2",'Assets/sprites/ghost_float2.png');
	    game.load.image("ghost_float3",'Assets/sprites/ghost_float3.png');
	    game.load.image("ghost_float4",'Assets/sprites/ghost_float4.png');
	    game.load.image("ghost_float5",'Assets/sprites/ghost_float5.png');
	    game.load.image("ghost_float6",'Assets/sprites/ghost_float6.png');
	    game.load.image("ghost_float7",'Assets/sprites/ghost_float7.png');
	    game.load.image("ghost_float8",'Assets/sprites/ghost_float8.png');
	    //kid animation
	        //Run
	    game.load.image("kid_run1",'Assets/sprites/kid_run1.png');
	    game.load.image("kid_run2",'Assets/sprites/kid_run2.png');
	    game.load.image("kid_run3",'Assets/sprites/kid_run3.png');
	    game.load.image("kid_run4",'Assets/sprites/kid_run4.png');
	    game.load.image("kid_run5",'Assets/sprites/kid_run5.png');
	    game.load.image("kid_run6",'Assets/sprites/kid_run6.png');
	    game.load.image("kid_run7",'Assets/sprites/kid_run7.png');
	    game.load.image("kid_run8",'Assets/sprites/kid_run8.png');
	        //Idle
	    game.load.image("kid_idle",'Assets/sprites/kid_idle.png')
	        //Attack
	    game.load.image("kid_lantern","Assets/sprites/kid_lantern.png")
	        //Jump
	    game.load.image("kid_air_jump","Assets/sprites/kid_air_jump.png");
	    game.load.image("kid_air_fall","Assets/sprites/kid_air_fall.png");

	    game.load.image('Wall_Attic_Center','Assets/sprites/wall_attic_center.png');
	    game.load.image('Wall_Attic_Left','Assets/sprites/wall_attic_left.png');
	    game.load.image('Wall_Attic_Right','Assets/sprites/wall_attic_right.png');
	    game.load.image('Wall_Attic_Single','Assets/sprites/wall_attic_single.png');
	    game.load.image('Wall_Basement_Center','Assets/sprites/wall_basement_center.png');
	    game.load.image('Wall_Basement_Left','Assets/sprites/wall_basement_left.png');
	    game.load.image('Wall_Basement_Right','Assets/sprites/wall_basement_right.png');
	    game.load.image('Wall_Basement_Single','Assets/sprites/wall_basement_single.png');
	    game.load.image('Wall_Middle_Center','Assets/sprites/wall_middle_center.png');
	    game.load.image('Wall_Middle_Left','Assets/sprites/wall_middle_left.png');
	    game.load.image('Wall_Middle_Right','Assets/sprites/wall_middle_right.png');
	    game.load.image('Wall_Middle_Single','Assets/sprites/wall_middle_single.png');

	    game.load.image('Floor_Center','Assets/sprites/floor_center.png');

	    //Lantern
	    game.load.image("lantern_active","Assets/sprites/lantern_active.png");
	    game.load.image("lantern_spent","Assets/sprites/lantern_spent.png");
	    game.load.image("lantern_glow","Assets/sprites/lantern_glow.png");
	    game.load.image("lantern_glow_alpha","Assets/sprites/lantern_glow_alpha.png");
	}
	//Callbacks for our loading process
	function fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {
        loadingText.text = String(progress) + " % loaded"
        loadingText.x = game.world.centerX - loadingText.width/2;
    }
    function loadComplete(){
        loadingText.text = "Done!"
        loadingText.x = game.world.centerX - loadingText.width/2;
        game.state.start("Warning")//Exit this state and switch to the warning state!
    }

	//Define our state's methods. 
	//Get a reference to the game object
	exports.setGame = function(g){
		game = g;
	}

	//These methods correspond to Phaser.State methods
	exports.create = function() {
		//Set the game's background color
		game.stage.backgroundColor = '#120E1C'
		//Create the loading text object
        var style = { font: "25px patagoniaregular", fill: numberColor, align: "center" };
        loadingText = game.add.text(game.world.centerX, game.world.centerY - 50, "Loading...", style);
        loadingText.x = game.world.centerX - loadingText.width/2;
        //Set the callbacks for loading
        game.load.onFileComplete.add(fileComplete, this);
        game.load.onLoadComplete.add(loadComplete, this);
	}
	exports.preload = function() {
		//  Then we tell Phaser that we want it to scale up to whatever the browser can handle, but to do it proportionally
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.setGameSize(game.width,game.height);
	}
	exports.update = function() {
		//startedLoading delays the loading by one second
		//This was to avoid an issue where the font would take a second to load, so as to avoid a little flicker
		if(startedLoading != null) startedLoading ++;
        if(startedLoading > 60){
            startedLoading = null;
            LoadAllAssets()
            game.load.start();
        }
	}
	exports.shutdown = function() {
		//The only object we created in this state was the loading text, so we just destroy that
		loadingText.destroy();
	}
})(this.LoadingState = {});