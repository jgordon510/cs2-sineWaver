//  The Google WebFont Loader will look for this object, so create it before loading the script.
WebFontConfig = {
    //  'active' means all requested fonts have finished loading
    //  We set a 1 second delay before calling 'createText'.
    //  For some reason if we don't the browser cannot render the text the first time it's created.
    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
        families: ['Inconsolata']
    }
};

var States = {};

//*****************************************************************************************
//FONT LOAD STATE
//This is a 1 second state used to load the google webfont script
//It then loads the menu state
States.LoadFonts = function() {};
States.LoadFonts.prototype = {
    preload: function() {
        //load the font script
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    },

    create: function() {
        game.stage.backgroundColor = '#333333';
        // place the assets and elements in their initial positions, create the state 
        game.time.events.add(Phaser.Timer.SECOND, startGame, this)

        function startGame() {
            game.state.start('GameState');
        }
    },
    update: function() {}
};

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'gameDiv', States.LoadFonts);

// *****************************************************************************************
// Main Game State
// These preload, create, and update functions are run during the main part of the game

States.GameState = function() {};
States.GameState.prototype = {
    preload: function() {
        //this controls the radius of the circle
        game.sideLength = 100;
        game.rotationSpeed = 3; //5 seconds to rotate
        //make a graphics object to contain a simple circle
        var graphics = game.add.graphics(0, 0);
        graphics.beginFill(0xFFFFFF); //white
        graphics.drawCircle(0, 0, 10); //radius 10px
        game.circleTexture = graphics.generateTexture();
        graphics.destroy(); //get rid of it

        //make a graphics object to contain a simple dot
        graphics = game.add.graphics(0, 0);
        graphics.beginFill(0xFFFFFF);
        graphics.drawCircle(0, 0, 2); //smaller radius
        game.dotTexture = graphics.generateTexture();
        graphics.destroy();

        //this one has nothing in it
        game.blankTexture = graphics.generateTexture();

    },
    create: function() {
        //a group to contain the trail dots
        game.trail = game.add.group();

        //a circle to sit left-center, around which the other rotates
        game.originPoint = game.add.sprite(game.sideLength + 50, game.height / 2, game.circleTexture);
        game.originPoint.anchor.setTo(0.5, 0.5);

        //a blank side to which we'll apply another circle at one end
        game.side = game.add.sprite(game.sideLength + 50, game.height / 2, game.blankTexture);
        //make a circle sideLength to the right and apply it to the side
        //like a lolipop
        game.side.endPoint = game.add.sprite(game.sideLength, 0, game.circleTexture);
        game.side.endPoint.anchor.setTo(0.5, 0.5);
        game.side.addChild(game.side.endPoint);

        //this other point sits to the right of the circle and tracks 
        //the elevation
        game.elevationPoint = game.add.sprite(game.sideLength * 2 + 200, game.height / 2, game.circleTexture);
        game.elevationPoint.anchor.setTo(0.5, 0.5);

        //make cursor keys to control the speed/amplitude
        game.cursors = game.input.keyboard.createCursorKeys();
        //make a geometry line
        game.line = new Phaser.Line(game.side.endPoint.x, game.side.endPoint.y, game.elevationPoint.x, game.elevationPoint.y);
        //make a geometry circle
        game.circle = new Phaser.Circle(game.originPoint.x, game.originPoint.y, game.sideLength * 2);

    },
    update: function() {
        //set the elevationPoint's y to the same as the endPoint's
        //we have to use endPoint.world.y, because it's a child, and 
        //it's x/y are relative to it's parent
        game.elevationPoint.y = game.side.endPoint.world.y;
        //shift the trail to the right
        game.trail.x++;
        //add a dot at the elevationPoint.y
        //compensating for how far we've shifted the trail
        var trailDot = game.add.sprite(game.elevationPoint.x - game.trail.x, game.elevationPoint.y, game.dotTexture);
        //add the trailDot to the group so it shifts along with the others
        game.trail.add(trailDot);

        //adjust the sideLength based on kepPress
        if (game.cursors.up.isDown) {
            game.sideLength++;
        }
        else if (game.cursors.down.isDown) {
            game.sideLength--;
        }
        //reflect the change in sideLength
        game.side.endPoint.x = game.sideLength;
        game.circle.setTo(game.originPoint.x, game.originPoint.y, game.sideLength * 2)
            //adjust the rotationSpeed based on kepPress
        if (game.cursors.right.isDown) {
            game.rotationSpeed += 0.1;
        }
        else if (game.cursors.left.isDown) {
            game.rotationSpeed -= 0.1;
        }
        //rotate the side
        game.side.angle += game.rotationSpeed;
        //set the line's new endpoints
        game.line.fromSprite({
            x: game.side.endPoint.world.x,
            y: game.side.endPoint.world.y
        }, game.elevationPoint, false);
        
        //delete the first child if it's off-screen
        if (game.trail.children[0].world.x > game.width) game.trail.children[0].destroy();
    },
    render: function() { //this function runs with update
        //draw the line and circle
        game.debug.geom(game.line);
        game.debug.geom(game.circle);
        //add the debug text
        game.debug.text("length: " + game.sideLength, 32, 32);
        game.debug.text("speed: " + game.rotationSpeed.toFixed(1), 32, 50);
    }
};
game.state.add('GameState', States.GameState);
