//These are variables and functions that should be accessable everywhere

var PeerJSKey = 'ADD-YOUR-KEY-HERE'; //This is the key used to connect to the PeerCloud server
//Either sign up for a free one at http://peerjs.com/ or set up your own PeerCloud server
var PeerObject;//the main PeerJS instance we use to connect
var ConnObject;//once we connect succesfully, we use ConnObject to send and receive messages
var messageQ = [];//Keeps a list of messages received 

var numberColor = '#7C5E3F';//To keep the color of numbers/text consistent 
var music;// keeps a reference to the music (so it can be muted from any state)
var musicPlaying = true;
var musicPressed = false;
function MusicUpdate(game){
    console.log(musicPlaying)
    if(!game.input.keyboard.isDown(Phaser.Keyboard.M)) musicPressed = false;
    if(game.input.keyboard.isDown(Phaser.Keyboard.M) && !musicPressed){
        musicPressed = true;
        if(musicPlaying){
            music.fadeOut(1000)
        } else {
            music.fadeIn(1000)
        }
        musicPlaying = !musicPlaying
    }

}

var playerType;//Whether the player is pc or mobile
var debugStart = "";//Set to blank by default. If you want to force a player to start as either pc or mobile
//then do debugStart = "pc" or debugStart = "mobile"
var winner = '';//defines who won this round