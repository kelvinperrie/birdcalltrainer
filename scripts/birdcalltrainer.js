
        function getRandomIntInclusive(min, max) {
          const minCeiled = Math.ceil(min);
          const maxFloored = Math.floor(max);
          return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
        }

        function birdStatistic(label, rightCount, wrongCount) {
          return {
            label: label,
            correct: rightCount,
            incorrect: wrongCount,
            addCorrect() {
              this.correct = this.correct + 1;
            },
            addIncorrect() {
              this.incorrect = this.incorrect + 1;
            }
          }
        }

        function statisticsModel() {
          return {
            birdStatistics : [],
            updateBirdStats(label, rightIncrease, wrongIncrease) {
              let statsToUpdate = this.birdStatistics.find(item => item.label == label);
              if(statsToUpdate) {
                if(rightIncrease > 0) statsToUpdate.addCorrect();
                if(wrongIncrease > 0) statsToUpdate.addIncorrect();
              } else {
                this.birdStatistics.push(new birdStatistic(label, rightIncrease, wrongIncrease));
              }
            }
          }
        }

        function soundModel(soundData) {
          return {
            label: soundData.label,
            file: soundData.file,
            volumne: soundData.initialVolume,
            status: null,                      // if the sound is loading, ready, or playing
            howlerObject: null,
            playSound() {
              if(this.status == null) {
                this.status = "loading";
                this.howlerObject.load();
              } else if(this.status == 'loading') {
                // can't really do much about this!
                // error message her?
                console.log("we can't do nothign!")
              } else if(this.status == 'ready') {
                this.howlerObject.play();
              }
              
            },
            stopSound() {
              this.howlerObject.stop();
              this.status="ready";
            },
            init() {
              let self = this;
              var sound = new Howl({
                src: [this.file],
                loop: true,
                volume: this.volume,
                preload: false,
                onload : function() {
                    // the sound is loaded
                    // so we're going to set the ready flag which indicates we can play it when wanted
                    self.status = "ready";
               //     self.loading(false);
                    // we only load the sound when it has been requested to be played, so now that it is loaded, play it
                    console.log("this sounds is loaded")
                    self.howlerObject.play();
                },
                onstop : function() {
                    //console.log('stopped!');
                },
                onseek: function() {
                    // when seek is called the sound is ready to be played
                    self.howlerObject.play();
                //    self.active(true);
                }
              });
              // store the howler object so we can manipulate the sound later
              this.howlerObject = sound;
            }
          }
        }

        function birdSoundsModel(birdSoundsData) {
          return {
            label: birdSoundsData.label,
            sounds: birdSoundsData.sounds.map(d => new soundModel(d)),
            selected: true,
            markAsCorrectAnswer: false,
            markAsIncorrectAnswer: false,
            lastPlayedIndex: -1,
            getNextSound() {
              // get the next sound based on the last index we played; just cycle through the collection
              this.lastPlayedIndex = this.lastPlayedIndex + 1;
              if(this.lastPlayedIndex >= this.sounds.length) {
                this.lastPlayedIndex = 0;
              }
              return this.sounds[this.lastPlayedIndex];
            },
            toggleSelected() {
              this.selected = !this.selected;
            },
            init() {
              this.sounds.map(s => s.init())
            }
          }
        }

        function pageModel() {
          return {
            
            availableBirdSounds : soundsConfiguration.map(c => new birdSoundsModel(c)),

            birdsToTrainWith : [], //this.availableBirdSounds, //availableBirdSounds.filter((birdSounds) => birdSounds.selected),

            selectedBird : null,

            chosenSound : null,

            readyToStart : function() { return (this.availableBirdSounds.filter((birdSounds) => birdSounds.selected).length > 1) && this.status == "ready" }, // false, // this.birdsToTrainWith.length > 1,

            showAnswerSelections: false,

            playSoundButtonText : "Ok, play me a bird call",

            status : 'ready', // ready | playingSound

            correctChoice: null,
            statistics: new statisticsModel(),

            startTraining() {
              if(this.status != 'ready') {
                console.log("we're not in the ready state, so unable to play a sound ...")
                return;
              }
              // 0. reset everything
              // 1. choose a bird from the selected available birds
              // 2. choose a sound from the given bird
              // 3. play the sound
              this.birdsToTrainWith.map(b => { b.markAsIncorrectAnswer = false; b.markAsCorrectAnswer = false; })
              this.birdsToTrainWith = this.availableBirdSounds.filter((birdSounds) => birdSounds.selected);
              const birdToUseIndex = getRandomIntInclusive(0, this.birdsToTrainWith.length - 1);
              this.selectedBird = this.birdsToTrainWith[birdToUseIndex];
              //console.log(this.selectedBird);
              //const chosenSoundIndex = getRandomIntInclusive(0, this.selectedBird.sounds.length - 1);
              //this.chosenSound = this.selectedBird.sounds[chosenSoundIndex];
              this.chosenSound = this.selectedBird.getNextSound();
              //console.log(this.chosenSound);
              this.chosenSound.playSound();
              this.showAnswerSelections = true;
              this.status = "playingSound";
              this.correctChoice = null;
            },

            makeChoice(userSoundChosen) {
              if(this.status != "playingSound") return;
              // did the selection match the bird sound being played?
              // mark the correct answer with a colour
              // if they clicked the wrong one, then mark that with a colour (to shame them into doing better)
              // stop the sound being played
              this.correctChoice = userSoundChosen.label == this.selectedBird.label;
              this.selectedBird.markAsCorrectAnswer = true;
              if(!this.correctChoice) {
                userSoundChosen.markAsIncorrectAnswer = true;
                this.statistics.updateBirdStats(this.selectedBird.label, 0, 1);
              } else {
                this.statistics.updateBirdStats(this.selectedBird.label, 1, 0);
              }
              this.chosenSound.stopSound();
              this.status = "ready";
              this.playSoundButtonText = "Play me the next bird call!"
            }


          }
        };