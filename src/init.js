window.onload = function() {
    //We first initialize the phaser game object
    var WINDOW_WIDTH = 750;
    var WINDOW_HEIGHT = 500;
    var game = new Phaser.Game(WINDOW_WIDTH, WINDOW_HEIGHT, Phaser.AUTO, '');
    //Then we pass this game object to all of our states and tell phaser about them
    this.LoadingState.setGame(game); game.state.add("Loading",this.LoadingState);
    this.WarningState.setGame(game); game.state.add("Warning",this.WarningState);
    this.MenuState.setGame(game); game.state.add("Menu",this.MenuState);
    this.GameplayState.setGame(game); game.state.add("Gameplay",this.GameplayState);
    this.GameOverState.setGame(game); game.state.add("GameOver",this.GameOverState);

    //Now we can start with the loading state!
    game.state.start("Loading");


};