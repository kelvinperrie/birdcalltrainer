
        function getRandomIntInclusive(min, max) {
          const minCeiled = Math.ceil(min);
          const maxFloored = Math.floor(max);
          return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
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
            selected: false,
            markAsCorrectAnswer: false,
            markAsIncorrectAnswer: false,
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

            readyToStart : false, // this.birdsToTrainWith.length > 1,

            showAnswerSelections: false,

            playSoundButtonText : "Ok, play me a sound",

            status : 'ready', // ready | playingSound

            checkIfCanStart() {
              this.readyToStart = (this.availableBirdSounds.filter((birdSounds) => birdSounds.selected).length > 1) && this.status == "ready";
            },

            startTraining() {
              if(this.status != 'ready') {
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
              console.log(this.selectedBird);
              const chosenSoundIndex = getRandomIntInclusive(0, this.selectedBird.sounds.length - 1);
              this.chosenSound = this.selectedBird.sounds[chosenSoundIndex];
              console.log(this.chosenSound);
              this.chosenSound.playSound();
              this.showAnswerSelections = true;
              this.status = "playingSound";
              this.checkIfCanStart();
            },

            makeChoice(userSoundChosen) {
              // did the selection match the bird sound being played?
              // mark the correct answer with a colour
              // if they clicked the wrong one, then mark that with a colour (to shame them into doing better)
              // stop the sound being played
              const correctChoice = userSoundChosen.label == this.selectedBird.label;
              this.selectedBird.markAsCorrectAnswer = true;
              if(!correctChoice) {
                userSoundChosen.markAsIncorrectAnswer = true;
              }
              this.chosenSound.stopSound();
              this.status = "ready";
              this.checkIfCanStart();
              this.playSoundButtonText = "Play me a different sound!"
            }


          }
        };