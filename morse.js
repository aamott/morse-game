/* Morse Code Game CSS */
/* By Adam Amott */

class MorsePlayer {
    constructor() {
        /************Audio Setup******************/
        this.context = new AudioContext();
        this.o = this.context.createOscillator();
        this.g = this.context.createGain();
        this.o.connect(this.g);
        this.g.connect(this.context.destination);
        this.o.start(0);
        this.g.gain.value = 0;
        /************************************** */
        /************Morse Timing*************** */
        this.wpm = 20;
        this.ditSeconds = 60 / (this.wpm * 50);
        this.dashSeconds = this.ditSeconds * 3;
        this.letterSpaceSeconds = this.dashSeconds;
        this.wordSpaceSeconds = this.ditSeconds * 7;
        /************************************* */

        this.letters = { 
            'a':".-",
            'b':"-...",
            'c':"-.-.",
            'd':"-..",
            'e':".",
            'f':"..-.",
            'g':"--.",
            'h':"....",
            'i':"..",
            'j':".---",
            'k':"-.-",
            'l':".-..",
            'm':"--",
            'n':"-.",
            'o':"---",
            'p':".--.",
            'q':"--.-",
            'r':".-.",
            's':"...",
            't':"-",
            'u':"..-",
            'v':"...-",
            'w':".--",
            'x':"-..-",
            'y':"-.--", 
            'z':"--..", 
            ".":".--.-.",
            ",":"--..--"
            } 
        
    }

    checkBeeperRunning() {
        if (this.context.state !== 'running') {
        this.context.resume();
      }
    }

    playTone(delaySec = 0, startTime = this.context.currentTime) {
        this.g.gain.setValueAtTime(1, startTime + delaySec);    
        // this.g.gain.exponentialRampToValueAtTime(
        //     0.7, 0.04 + startTime + delaySec
        // );
    }

    stopTone(delaySec = 0, stopTime = this.context.currentTime) {
        // keeps exponentialRamp from overcoming tone (1 means stay on until right before the ramp)
        this.g.gain.setValueAtTime(1, stopTime - 0.04 + delaySec ) 
        // Remove pop at the end of a tone
        this.g.gain.exponentialRampToValueAtTime(
            0.000001, stopTime + delaySec
        );
    }

    playDot(delaySec = 0, startTime = this.context.currentTime) {

        //start tone
        this.g.gain.setValueAtTime(1, startTime + delaySec);  

        //stop tone. Based on this.stopTone(delaySec+this.ditSeconds, startTime);

        // keeps exponentialRamp from overcoming tone (1 means stay on until right before the ramp)
        this.g.gain.setValueAtTime(1, startTime + delaySec + this.ditSeconds -0.02) 
        // Remove pop at the end of a tone
        this.g.gain.exponentialRampToValueAtTime(
            0.000001, startTime + delaySec + this.ditSeconds
        );
    }

    playDash(delaySec = 0, startTime = this.context.currentTime) {
        this.playTone(delaySec, startTime);
        // this.g.gain.setValueAtTime(0, startTime + (delaySec + this.dashSeconds) );
        this.stopTone(delaySec+this.dashSeconds, startTime);
    }

    playLetterSpace() {
        setTimeout((() => {1+1;}), this.letterspaceTime);
    }

    playWordSpace() {
        setTimeout((() => {1+1;}), wordSpaceTime);
    }


    playLetter(letter, delaySec = 0) { // delay is in seconds
        // get morse version of letter
        let morseRow = this.letters[letter];

        // check for bad values
        if (morseRow == null) {
            console.log("invalid letter");
            return;
        }
        console.log("letter in morse:", morseRow);

        //Timing
        // let delaySec = 0;
        let startTime = this.context.currentTime; //helps keep all letters on the same timing so they don't sound funny
       
        // for each morse symbol, test if dot or dash and play it.
        for (let i = 0; i < morseRow.length; i++) {
            let symbol = morseRow[i];

            if (symbol == ".") {
                this.playDot(delaySec, startTime + delaySec);
                console.log(".");
                delaySec += this.ditSeconds * 2;
            }
            else if (symbol == "-") {
                this.playDash(delaySec, startTime + delaySec);
                console.log("-");
                delaySec += this.ditSeconds * 2;
            } 
            else {
                console.log("ERROR!!! Symbol ", symbol, " Not Recognized!");
            }
        }
    }
}

/**************Morse Learner*********************/
class MorseLearner {
    constructor(morsePlayer = new MorsePlayer()) {
        this.currentLevel = 1;
        this.points = 0;
        this.morsePlayer = morsePlayer;
        this.letterDisplay = document.getElementById("letter-display");
        this.levelSelector = document.getElementById('level');
        this.nextLevelBtn = document.getElementById("nextBtn");
        this.currentLetter = null;
        this.letters = {
            'a': {points: 0, morse: ".-" },
            'b': {points: 0, morse: "-..."},
            'c': {points: 0, morse: "-.-."},
            'd': {points: 0, morse: "-.."},
            'e': {points: 0, morse: "."},
            'f': {points: 0, morse: "..-."},
            'g': {points: 0, morse: "--."},
            'h': {points: 0, morse: "...."},
            'i': {points: 0, morse: ".."},
            'j': {points: 0, morse: ".---"},
            'k': {points: 0, morse: "-.-"},
            'l': {points: 0, morse: ".-.."},
            'm': {points: 0, morse: "--"},
            'n': {points: 0, morse: "-."},
            'o': {points: 0, morse: "---"},
            'p': {points: 0, morse: ".--."},
            'q': {points: 0, morse: "--.-"},
            'r': {points: 0, morse: ".-."},
            's': {points: 0, morse: "..."},
            't': {points: 0, morse: "-"},
            'u': {points: 0, morse: "..-"},
            'v': {points: 0, morse: "...-"},
            'w': {points: 0, morse: ".--"},
            'x': {points: 0, morse: "-..-"},
            'y': {points: 0, morse: "-.--"}, 
            'z': {points: 0, morse: "--.."}, 
            ".": {points: 0, morse: ".--.-."},
            ",": {points: 0, morse: "--..--"}
        }
        this.levels = {
            1: {items:['e','t'],message:""},
            2: {items:['e','t','a','n'], message:"With a few simple letters, you can already start to send messages"},
            3: {items:['e','t','a','n','i','s'], message:""},
            4: {items:['e','t','a','n','i','s','o','h'], message:""},
            5: {items:['e','t','a','n','i','s','o','h','r','d'], message:""},
            6: {items:['e','t','a','n','i','s','o','h','r','d','l','u'], message:""},
            7: {items:['e','t','a','n','i','s','o','h','r','d','l','u','c','m'], message:""},
            8: {items:['e','t','a','n','i','s','o','h','r','d','l','u','c','m','f','w'], message:""},
            9: {items:['e','t','a','n','i','s','o','h','r','d','l','u','c','m','f','w','y','g'], message:""},
            10: {items:['e','t','a','n','i','s','o','h','r','d','l','u','c','m','f','w','y','g','p','b'], message:""},
            11: {items:['e','t','a','n','i','s','o','h','r','d','l','u','c','m','f','w','y','g','p','b','v','k'], message:""},
            12: {items:['e','t','a','n','i','s','o','h','r','d','l','u','c','m','f','w','y','g','p','b','v','k','q','j'], message:""},
            13: {items:['e','t','a','n','i','s','o','h','r','d','l','u','c','m','f','w','y','g','p','b','v','k','q','j','x','z'], message:""},
            13: {items:['e','t','a','n','i','s','o','h','r','d','l','u','c','m','f','w','y','g','p','b','v','k','q','j','x','z', '.', ','], message:""},
            // 14: {items:["sos"], message:"'Save Our Ship', is a common acronym. It means, 'Help me!'"} // TODO: change playLetter() to playMorse(), which can play letters or phrases
            // 15: {items:[], message:""},
        }

        // Load any previous data
        let cookies = decodeURIComponent(document.cookie);

        if (getCookie("level") != "") {
            this.currentLevel = parseInt(getCookie("level"));
        }

        // Populate the level selector
        for (let level in this.levels ) {
            let option = document.createElement("option");
            console.log("Value of level in for loop: ", level);
            option.value = level;
            option.innerText = level;
            this.levelSelector.appendChild(option);
        }
        
        this.playGame();
    }

    checkBeeperRunning() {
        morsePlayer.checkBeeperRunning();
    }

    /**************Display***************/
    displayNext() {
        document.getElementById("keyboard").classList.add("hide");
        document.getElementById("level-select").classList.remove("hide");
    }

    displayKeyboard() {
        document.getElementById("keyboard").classList.remove("hide");
    }

    /*************Gameplay Functions***************/
    playCurrentLetter(delaySec = 0) {
        if (this.currentLetter) {
            this.morsePlayer.playLetter(this.currentLetter, delaySec);
        } else {
            console.log("No letter to play")
        }
    }

    playGame() {
        // 0. set the game as playing
        this.playing = true;

        // Shorthand for level items referencing
        this.levelItems = this.levels[this.currentLevel].items
        // 1. shuffle level
        this.shuffleList(this.levelItems);

        // 2. get the letter.
        this.currentLetter = this.levelItems[0];
        this.levelSelector.options.selectedIndex = this.currentLevel - 1;
        // 3. display the letter the first time. Then display ' '
        if (this.letters[this.currentLetter].points == 0) {
            this.letterDisplay.textContent = this.currentLetter;
        } else {
            this.letterDisplay.textContent = '   ';
        }
        // 3. play letter
        this.playCurrentLetter();
    }

    advanceLevel() {
        this.playing = true;
        this.setLevel(this.currentLevel + 1);
        this.playGame();
    }

    completeLevel() {
        this.letterDisplay.textContent = "Level complete!"
        console.log("Level Complete! To move to level", this.currentLevel, ", click 'Next'");
        this.nextLevelBtn.classList.remove("hide");
        this.playing = false;
    }

    setLevelFromSelector() {
        this.setLevel(this.levelSelector.options.selectedIndex + 1);
    }

    setLevel(level) {
        this.levelSelector.options.selectedIndex = level - 1;
        this.currentLevel = level;
        this.nextLevelBtn.classList.add("hide");
        this.playGame();

        // Fix points (drop all letters below 100% proficiency)
        for (let letter in this.letters) {
            this.addLetterPercent(letter, this.letters[letter].points / 3 * -2);
        };

        // Save Progress
        document.cookie = "level=" + this.currentLevel + "; expires=Thu, 30 Dec 2035 12:00:00 UTC";
    }

    enterLetter(guess) {
        //check that the guess is actually in our letter list
        if ( this.letters[guess]) {
            //check that the game is being played
            if (this.playing) {
                // check for level completion
                if (this.levelItems.length != 0) { 
                    // 4. validate input.
                    //     a. if good, add points.
                    if (guess == this.currentLetter) { 
                        this.letterDisplay.textContent = "Correct!";

                        this.addPoints(100);
                        this.addLetterPercent(guess, 34);
                        console.log("Correct!")

                        // add the guess back until it's at 100% fluency
                        if (this.letters[guess].points < 100) { 
                            this.levelItems.push(guess);
                        }

                    } else {
                        //     b. if bad, remove points
                        this.letterDisplay.textContent = "Incorrect 😕";

                        this.addPoints(-50);
                        this.addLetterPercent(this.currentLetter, -34);
                        console.log("Wrong guess!");

                        this.levelItems.unshift(this.currentLetter);
                        // if the letter guessed has been learned, push it to the array so they can practice. Otherwise, it was accidental
                        if (this.levelItems.includes(guess)) { 
                            this.levels[this.currentLevel].items.unshift(guess);
                            this.addLetterPercent(guess, -34);
                        }
                    }


                    // 5. move to next item.
                    this.levelItems.shift();
                    // check if the level was completed
                    if (this.levelItems.length == 0) {
                        this.completeLevel();
                    // display next letter. Display ? for letters that have been seen. Wait a moment before moving on.
                    } else { 
                        let delaySec = 1;
                        this.currentLetter = this.levelItems[0]; 
                        
                        // show the letter if its the first time the user sees it. Otherwise, just show an underline
                        if (this.letters[this.currentLetter].points <= 0) {
                            setTimeout(function(ref) { ref.letterDisplay.textContent = ref.currentLetter }, delaySec * 1000, this);
                        } else {
                            setTimeout(function(ref) { ref.letterDisplay.textContent = '   ' }, delaySec * 1000, this);
                        }

                        //play the next letter before exiting
                        this.playCurrentLetter(delaySec - 0.3);   
                    }

                // if the game isn't being played, just play the letter's sound.
                }else { // level complete
                    this.completeLevel();
                }
            } else { // this.playing. game is not being played
                this.morsePlayer.playLetter(guess);
            }
        } else { // check input validity
            console.log("Invalid guess in 'enterLetters():", guess);
        }
    }

    addPoints(points) {
        this.points += points;
        document.getElementById('points').innerText = this.points;
    }

    addLetterPercent(letter, percent) {
        this.letters[letter].points += percent;

        switch (letter) {
            case '.':
                document.querySelector("#period" + " .percent").style.width = this.letters[letter].points + '%';
                return;
            case ',':
                document.querySelector("#comma" + " .percent").style.width = this.letters[letter].points + '%';
                return;
            case '?':
                document.querySelector("#questionMark" + " .percent").style.width = this.letters[letter].points + '%';
                return;
            case '!':
                document.querySelector("#exclamation" + " .percent").style.width = this.letters[letter].points + '%';
                return;
        }

        document.querySelector("#" + letter + " .percent").style.width = this.letters[letter].points + '%'; 
    }

    /***************Utility Functions*******************/
    shuffleList(list) {
        console.log(list);
        
        let tempValue;

        list.forEach((element, currentIndex) => {

            let randomIndex = Math.floor(Math.random() * list.length);

            tempValue = list[currentIndex];
            list[currentIndex] = list[randomIndex];
            list[randomIndex] = tempValue;
        });
        console.log(list);
        
    }
}




/***********General Utilities (add to a file later)*************/
// Adds a sleep function to javascript...kind of. use a .then after sleep to call something back. 
let sleep = function (milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

// obtained from w3Schools.com
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }


/*********** Start the Game *********************************/
morseLearner = null;
startGame = (x) => {
	morseLearner = new MorseLearner();
	window.removeEventListener("click", startGame)
}
window.addEventListener("click", startGame)