# I Spy A Ghost

An experimental p2p multiplayer game made in HTML5/Phaser using WebRTC in 48 hours for [Ludum Dare](http://ludumdare.com/compo/ludum-dare-33/?action=preview&uid=11521). Relies on [PeerJS](http://peerjs.com/) for the networking.

This is an asynchronous game. The human player is trying to survive and kill the ghost by shining a light. The ghost player is trying to kill the human by dropping something on him. **Neither player can fully see the other on their screen!** The game is meant to be played in the same room and peeking over shoulders is encouraged. 

# How to Run

* Download this repository
* Get an API key from [peerjs.com](http://peerjs.com/) and add it in src/Global.js
* Run a local web server (the easiest way is with Python)

If you just want to see it run without getting an API key, you can set `debugStart` in src/Global.js to be either 'pc' or 'mobile' to see how those look. (Multiplayer feature won't work then.)

[Here's a version](http://omarshehata.me/html/ludum/) hosted on my personal website. (If it doesn't work, I probably accidentally broke my server somehow..)

# How to Play (Controls)

**Human (Desktop) Player**
* Move with WASD/Arrow keys
* Press Z or K to attack 
* Your goal is to shine the light on the ghost

**Ghost (Mobile) Player**
* Tap anywhere to move 
* Tap on your character to drop an anvil 
* Your goal is to drop something on the player

# Screenshots

![intro_screen](https://raw.githubusercontent.com/OmarShehata/I-Spy-A-Ghost/master/Assets/screenshots/multiplayer_intro.png)

![gameplay](https://raw.githubusercontent.com/OmarShehata/I-Spy-A-Ghost/master/Assets/screenshots/gameplay_1.png)

![ghost_win](https://raw.githubusercontent.com/OmarShehata/I-Spy-A-Ghost/master/Assets/screenshots/ghost_win.png)

![gif](https://raw.githubusercontent.com/OmarShehata/I-Spy-A-Ghost/master/Assets/screenshots/gameplay_2.gif)

# Credits

Programming & Design by Omar Shehata (author of this repo)

Art by Tak (@Takorri)

Music by a fantastic person on Newgrounds whose name/account I unfourtunately have lost. 
