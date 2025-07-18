/* Morse Code Game CSS */
/* By Adam Amott */

class MorsePlayer {
    constructor() {
        /************Audio Setup******************/
        this.context = new AudioContext();
        this.oscillator = this.context.createOscillator();
        this.gainNode = this.context.createGain();
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);
        this.oscillator.frequency.value = 600;
        this.gainNode.gain.value = 0; // Start silent
        this.oscillator.start();
        /************Morse Timing*************** */
        this.wpm = 20;
        this.ditSeconds = 60 / (this.wpm * 50);
        this.dashSeconds = this.ditSeconds * 3;
        this.letterSpaceSeconds = this.dashSeconds;
        this.wordSpaceSeconds = this.ditSeconds * 7;
        /************************************* */

        this.letters = {
            'a': ".-",
            'b': "-...",
            'c': "-.-.",
            'd': "-..",
            'e': ".",
            'f': "..-.",
            'g': "--.",
            'h': "....",
            'i': "..",
            'j': ".---",
            'k': "-.-",
            'l': ".-..",
            'm': "--",
            'n': "-.",
            'o': "---",
            'p': ".--.",
            'q': "--.-",
            'r': ".-.",
            's': "...",
            't': "-",
            'u': "..-",
            'v': "...-",
            'w': ".--",
            'x': "-..-",
            'y': "-.--",
            'z': "--..",
            ".": ".--.-.",
            ",": "--..--"
        }

    }

    getLetterDuration(letter) {
        let morseRow = this.letters[letter];
        if (!morseRow) return 0;

        let duration = 0;
        for (let i = 0; i < morseRow.length; i++) {
            let symbol = morseRow[i];
            if (symbol == ".") {
                duration += this.ditSeconds;
            } else if (symbol == "-") {
                duration += this.dashSeconds;
            }
            // add intra-letter space (1 dit) if not the last symbol
            if (i < morseRow.length - 1) {
                duration += this.ditSeconds;
            }
        }
        return duration;
    }

    checkBeeperRunning() {
        if (this.context.state !== 'running') {
            this.context.resume();
        }
    }

    playDot(time) {
        this.gainNode.gain.setValueAtTime(1, time);
        this.gainNode.gain.setValueAtTime(0, time + this.ditSeconds);
    }

    playDash(time) {
        this.gainNode.gain.setValueAtTime(1, time);
        this.gainNode.gain.setValueAtTime(0, time + this.dashSeconds);
    }

    playLetter(letter, startTime = this.context.currentTime + 0.1) { // startTime is an absolute time
        // get morse version of letter
        let morseRow = this.letters[letter];

        // check for bad values
        if (morseRow == null) {
            console.log("invalid letter");
            return;
        }
        console.log("letter in morse:", morseRow);

        //Timing
        let time = startTime;

        // for each morse symbol, test if dot or dash and play it.
        for (let i = 0; i < morseRow.length; i++) {
            let symbol = morseRow[i];

            if (symbol == ".") {
                this.playDot(time);
                time += this.ditSeconds * 2; // dot is 1 dit, space is 1 dit
            } else if (symbol == "-") {
                this.playDash(time);
                time += this.dashSeconds + this.ditSeconds; // dash is 3 dits, space is 1 dit
            } else {
                console.log("ERROR!!! Symbol ", symbol, " Not Recognized!");
            }
        }
    }

    playString(string, startTime = this.context.currentTime + 0.1) {
        let currentStartTime = startTime;

        for (let i = 0; i < string.length; i++) {
            const char = string[i].toLowerCase();

            if (char === ' ') {
                // A word space is 7 dits long. The previous letter already added an inter-letter space of 3 dits.
                // So, we only need to add the difference.
                currentStartTime += this.wordSpaceSeconds - this.letterSpaceSeconds;
            } else if (this.letters[char]) {
                this.playLetter(char, currentStartTime);
                // Add the duration of the letter itself, plus the standard 3-dit space that follows every letter.
                currentStartTime += this.getLetterDuration(char) + this.letterSpaceSeconds;
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
        this.hintBtn = document.getElementById("hintBtn");
        this.currentItem = null;
        this.wordInProgress = [];
        this.currentLetterIndex = 0;
        this.pendingGameTimeout = null; // Track timeout ID for level switching
        this.letters = {
            'a': { points: 0, morse: ".-" },
            'b': { points: 0, morse: "-..." },
            'c': { points: 0, morse: "-.-." },
            'd': { points: 0, morse: "-.." },
            'e': { points: 0, morse: "." },
            'f': { points: 0, morse: "..-." },
            'g': { points: 0, morse: "--." },
            'h': { points: 0, morse: "...." },
            'i': { points: 0, morse: ".." },
            'j': { points: 0, morse: ".---" },
            'k': { points: 0, morse: "-.-" },
            'l': { points: 0, morse: ".-.." },
            'm': { points: 0, morse: "--" },
            'n': { points: 0, morse: "-." },
            'o': { points: 0, morse: "---" },
            'p': { points: 0, morse: ".--." },
            'q': { points: 0, morse: "--.-" },
            'r': { points: 0, morse: ".-." },
            's': { points: 0, morse: "..." },
            't': { points: 0, morse: "-" },
            'u': { points: 0, morse: "..-" },
            'v': { points: 0, morse: "...-" },
            'w': { points: 0, morse: ".--" },
            'x': { points: 0, morse: "-..-" },
            'y': { points: 0, morse: "-.--" },
            'z': { points: 0, morse: "--.." },
            ".": { points: 0, morse: ".--.-." },
            ",": { points: 0, morse: "--..--" }
        }
        this.levels = {
            1: { items: ['e', 't'], message: "" },
            2: { items: ['e', 't', 'a', 'n'], message: "With a few simple letters, you can already start to send messages" },
            3: { items: ['e', 't', 'a', 'n', 'i', 's'], message: "" },
            4: { items: ['e', 't', 'a', 'n', 'i', 's', 'o', 'h'], message: "" },
            5: { items: ['e', 't', 'a', 'n', 'i', 's', 'o', 'h', 'r', 'd'], message: "" },
            6: { items: ['e', 't', 'a', 'n', 'i', 's', 'o', 'h', 'r', 'd', 'l', 'u'], message: "" },
            7: { items: ['e', 't', 'a', 'n', 'i', 's', 'o', 'h', 'r', 'd', 'l', 'u', 'c', 'm'], message: "" },
            8: { items: ['e', 't', 'a', 'n', 'i', 's', 'o', 'h', 'r', 'd', 'l', 'u', 'c', 'm', 'f', 'w'], message: "" },
            9: { items: ['e', 't', 'a', 'n', 'i', 's', 'o', 'h', 'r', 'd', 'l', 'u', 'c', 'm', 'f', 'w', 'y', 'g'], message: "" },
            10: { items: ['e', 't', 'a', 'n', 'i', 's', 'o', 'h', 'r', 'd', 'l', 'u', 'c', 'm', 'f', 'w', 'y', 'g', 'p', 'b'], message: "" },
            11: { items: ['e', 't', 'a', 'n', 'i', 's', 'o', 'h', 'r', 'd', 'l', 'u', 'c', 'm', 'f', 'w', 'y', 'g', 'p', 'b', 'v', 'k'], message: "" },
            12: { items: ['e', 't', 'a', 'n', 'i', 's', 'o', 'h', 'r', 'd', 'l', 'u', 'c', 'm', 'f', 'w', 'y', 'g', 'p', 'b', 'v', 'k', 'q', 'j'], message: "" },
            13: { items: ['e', 't', 'a', 'n', 'i', 's', 'o', 'h', 'r', 'd', 'l', 'u', 'c', 'm', 'f', 'w', 'y', 'g', 'p', 'b', 'v', 'k', 'q', 'j', 'x', 'z'], message: "" },
            14: { items: ['e', 't', 'a', 'n', 'i', 's', 'o', 'h', 'r', 'd', 'l', 'u', 'c', 'm', 'f', 'w', 'y', 'g', 'p', 'b', 'v', 'k', 'q', 'j', 'x', 'z', '.', ','], message: "" },
            15: { items: ["sos", "taco"], message: "'Save Our Ship', is a common acronym. It means, 'Help me!'" },
            16: { items: [], message: "" },
        }

        // Load any previous data
        let cookies = decodeURIComponent(document.cookie);

        if (getCookie("level") != "") {
            this.currentLevel = parseInt(getCookie("level"));
        }

        // Populate the level selector
        for (let level in this.levels) {
            let option = document.createElement("option");
            console.log("Value of level in for loop: ", level);
            option.value = level;
            option.innerText = level;
            this.levelSelector.appendChild(option);
        }

        this.setLevel(this.currentLevel);
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
    playCurrentItem(startTime) {
        if (this.currentItem) {
            if (this.currentItem.length > 1) {
                this.morsePlayer.playString(this.currentItem, startTime);
            } else {
                this.morsePlayer.playLetter(this.currentItem, startTime);
            }
        } else {
            console.log("No item to play")
        }
    }

    playGame() {
        // If the level is complete, do nothing.
        if (this.levelItems.length === 0) {
            this.completeLevel();
            return;
        }

        // 0. set the game as playing
        this.playing = true;
        this.wordInProgress = [];
        this.currentLetterIndex = 0;

        // 1. get the next item from the list.
        // The list is now populated and shuffled in setLevel.
        this.currentItem = this.levelItems[0];
        this.levelSelector.options.selectedIndex = this.currentLevel - 1;

        // 3. display the letter the first time. Then display ' '
        if (this.currentItem.length > 1) {
            this.letterDisplay.textContent = "_ ".repeat(this.currentItem.length);
            this.hintBtn.classList.remove("hide");
        } else if (this.letters[this.currentItem]?.points == 0) {
            this.letterDisplay.textContent = this.currentItem;
            this.hintBtn.classList.add("hide");
        } else {
            this.letterDisplay.textContent = '   ';
            this.hintBtn.classList.add("hide");
        }
        // 3. play letter
        this.playCurrentItem(this.morsePlayer.context.currentTime + 0.1);
    }

    advanceLevel() {
        if (this.currentLevel < Object.keys(this.levels).length) {
            this.currentLevel++;
            this.setLevel(this.currentLevel);
        } else {
            this.letterDisplay.textContent = "You win!";
        }
    }

    giveHint() {
        if (!this.playing || this.currentItem.length <= 1) return;

        const correctLetter = this.currentItem[this.currentLetterIndex];
        this.wordInProgress[this.currentLetterIndex] = correctLetter;
        this.letterDisplay.textContent = this.wordInProgress.join(' ') + ' ' + '_ '.repeat(this.currentItem.length - this.wordInProgress.length);
        this.morsePlayer.playLetter(correctLetter);
    }

    completeLevel() {
        this.letterDisplay.textContent = "Level complete!";
        console.log("Level Complete! To move to level", this.currentLevel, ", click 'Next'");
        this.nextLevelBtn.classList.remove("hide");
        this.playing = false;
    }

    setLevelFromSelector() {
        this.setLevel(this.levelSelector.options.selectedIndex + 1);
    }

    setLevel(level) {
        // Cancel any pending game timeout to prevent race conditions
        if (this.pendingGameTimeout) {
            clearTimeout(this.pendingGameTimeout);
            this.pendingGameTimeout = null;
        }

        // Explicitly reset word-related state variables
        this.wordInProgress = [];
        this.currentLetterIndex = 0;
        this.currentItem = null;

        this.levelSelector.options.selectedIndex = level - 1;
        this.currentLevel = level;
        this.nextLevelBtn.classList.add("hide");

        // Get the items for the level and shuffle them
        this.levelItems = [...this.levels[this.currentLevel].items]; // Create a copy
        this.shuffleList(this.levelItems);

        this.playGame();

        // Fix points (drop all letters below 100% proficiency)
        for (let letter in this.letters) {
            this.addLetterPercent(letter, this.letters[letter].points / 3 * -2);
        };

        // Save Progress
        document.cookie = "level=" + this.currentLevel + "; expires=Thu, 30 Dec 2035 12:00:00 UTC";
    }

    enterLetter(guess) {
        if (!this.playing || !this.letters[guess]) return;

        if (this.currentItem.length > 1) {
            // Word guessing logic
            if (guess === this.currentItem[this.currentLetterIndex]) {
                this.wordInProgress[this.currentLetterIndex] = guess;
                this.letterDisplay.textContent = this.wordInProgress.join(' ') + ' ' + '_ '.repeat(this.currentItem.length - (this.currentLetterIndex + 1));
                this.currentLetterIndex++;

                if (this.currentLetterIndex >= this.currentItem.length) {
                    // Word is complete
                    this.letterDisplay.textContent = "Correct!";
                    this.addPoints(100);
                    this.levelItems.shift();

                    // Reset word state for next word
                    this.currentLetterIndex = 0;
                    this.wordInProgress = [];

                    // Schedule next word/level with proper timeout tracking
                    this.pendingGameTimeout = setTimeout(() => {
                        this.playGame();
                        this.pendingGameTimeout = null;
                    }, 1000);
                }
            } else {
                // Incorrect letter guess
                this.letterDisplay.classList.add('incorrect');
                setTimeout(() => this.letterDisplay.classList.remove('incorrect'), 500);
                this.addPoints(-10);
            }
        } else {
            // Single letter guessing logic
            if (guess == this.currentItem) {
                this.letterDisplay.textContent = "Correct!";
                this.addPoints(100);
                this.addLetterPercent(this.currentItem, 34);
                if (this.letters[this.currentItem]?.points < 100) {
                    this.levelItems.push(this.currentItem);
                }
            } else {
                this.letterDisplay.textContent = "Incorrect 😕";
                this.addPoints(-50);
                this.addLetterPercent(this.currentItem, -34);
                this.levelItems.unshift(this.currentItem);
            }
            this.levelItems.shift();
            if (this.levelItems.length == 0) {
                this.completeLevel();
            } else {
                // Store the timeout ID so it can be canceled if needed
                this.pendingGameTimeout = setTimeout(() => {
                    this.playGame();
                    this.pendingGameTimeout = null;
                }, 1000);
            }
        }
    };

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
        let tempValue;

        for (let currentIndex = list.length - 1; currentIndex > 0; currentIndex--) {
            let randomIndex = Math.floor(Math.random() * (currentIndex + 1));

            tempValue = list[currentIndex];
            list[currentIndex] = list[randomIndex];
            list[randomIndex] = tempValue;
        }
    }
}




/*********** Start the Game *********************************/
let morseLearner = null;
const startGame = () => {
    morseLearner = new MorseLearner();
    window.removeEventListener("click", startGame);
};
window.addEventListener("click", startGame);


/***********General Utilities (add to a file later)*************/
// Adds a sleep function to javascript...kind of. use a .then after sleep to call something back. 
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// obtained from w3Schools.com
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}