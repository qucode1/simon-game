import React, { Component, Fragment } from "react"

import sound1 from "./sounds/simonSound1.mp3"
import sound2 from "./sounds/simonSound2.mp3"
import sound3 from "./sounds/simonSound3.mp3"
import sound4 from "./sounds/simonSound4.mp3"

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      inGame: false,
      gameOver: false,
      strictMode: false,
      waitingForInput: false,
      currentRound: 1,
      currentStep: 0,
      isInputCorrect: null,
      playSoundSequence: null,
      addRandomSound: null
    }
    this.sounds = [
      React.createRef(),
      React.createRef(),
      React.createRef(),
      React.createRef()
    ]
    this.soundSources = [sound1, sound2, sound3, sound4]
    this.toggleStrictMode = this.toggleStrictMode.bind(this)
    this.generateSoundSequence = this.generateSoundSequence.bind(this)
    this.prepareSoundSequence = this.prepareSoundSequence.bind(this)
    this.prepareFirstRound = this.prepareFirstRound.bind(this)
    this.prepareNextRound = this.prepareNextRound.bind(this)
    this.startGame = this.startGame.bind(this)
    this.handlePlayerInput = this.handlePlayerInput.bind(this)
  }

  toggleStrictMode(e) {
    console.log("toggleStrictMode")
    this.setState({
      strictMode: !this.state.strictMode
    })
  }

  generateSoundSequence(steps) {
    console.log("generateSoundSequence", steps)
    //returns an array of numbers between 0 and 3 with the length of steps
    const soundSequence = []
    for (let step = 0; step < steps; step++) {
      soundSequence.push(randomInt(0, 3))
    }
    return soundSequence
  }

  prepareNextRound() {
    if (this.state.currentRound <= 20) {
      console.log("prepareNextRound")
      this.state.addRandomSound()
      this.state
        .playSoundSequence()
        .then(() => console.log("soundSequence finished"))
        .then(
          this.setState({
            waitingForInput: true
          })
        )
    } else {
      this.setState({
        gameOver: "gameWon"
      })
    }
  }

  prepareFirstRound() {
    console.log("prepareFirstRound")
    const {
      isInputCorrect,
      playSoundSequence,
      addRandomSound,
      getSoundSequence
    } = this.prepareSoundSequence()
    this.setState(
      state => ({
        isInputCorrect: isInputCorrect,
        playSoundSequence: playSoundSequence,
        addRandomSound: addRandomSound,
        getSoundSequence: getSoundSequence
      }),
      () =>
        this.state
          .playSoundSequence()
          .then(() => console.log("soundSequence finished"))
          .then(
            this.setState({
              waitingForInput: true
            })
          )
    )
  }

  handlePlayerInput(e) {
    console.log("handlePlayerInput")
    console.log("inGame", this.state.inGame)
    console.log("waitingForInput", this.state.waitingForInput)
    if (this.state.inGame && this.state.waitingForInput) {
      console.log("inGame && waitingForInput")
      console.log("currentStep", this.state.currentStep)
      if (
        this.state.isInputCorrect(
          e.target.dataset.sound,
          this.state.currentStep
        )
      ) {
        console.log("correct Input")
        if (this.state.currentStep < this.state.currentRound - 1) {
          console.log("go to next step")
          this.setState(state => ({
            currenctStep: state.currentStep++
          }))
        } else {
          console.log("last step, go to next round")
          this.setState(
            state => ({
              currentRound: ++state.currentRound,
              currentStep: 0,
              waitingForInput: false
            }),
            this.prepareNextRound
          )
        }
      } else {
        console.log("wrongInput")
        this.setState(
          state => ({
            waitingForInput: false,
            currentStep: 0
          }),
          () => {
            this.state.playSoundSequence().then(
              this.setState(state => ({
                waitingForInput: true
              }))
            )
          }
        )
      }
    } else {
      console.log("not inGame || not waitingForInput")
    }
  }

  prepareSoundSequence() {
    console.log("prepareSoundSequence start")
    const soundSequence = []
    soundSequence.push(randomInt(0, 3))
    // this.generateSoundSequence(this.state.currentRound)
    const isInputCorrect = (input, step) => {
      return soundSequence[step] === Number(input)
    }
    const playSoundSequence = async () => {
      const playSound = sound => {
        return new Promise((resolve, reject) => {
          var audio = new Audio()
          audio.preload = "auto"
          audio.autoplay = true
          audio.onerror = reject
          audio.onended = resolve
          audio.src = sound
        })
      }
      for (const sound of soundSequence) {
        await playSound(this.soundSources[sound]).catch(err => {
          console.error(err)
        })
      }
      return Promise.resolve
    }
    const addRandomSound = () => {
      soundSequence.push(randomInt(0, 3))
    }
    const getSoundSequence = () => soundSequence

    console.log("soundSequence", soundSequence)
    return {
      isInputCorrect,
      playSoundSequence,
      addRandomSound,
      getSoundSequence
    }
  }
  startGame() {
    console.log("startGame")
    this.setState(state => ({
      inGame: true
    }))
    this.prepareFirstRound()
  }
  render() {
    return (
      <Fragment>
        <h1>App</h1>
        <button onClick={this.startGame}>Start Game</button>
        <input
          checked={!this.state.strictMode}
          type="checkbox"
          onChange={this.toggleStrictMode}
        />
        <label>Stict Mode</label>
        <hr />
        <button onClick={this.handlePlayerInput} data-sound="0">
          Sound 1
        </button>
        <button onClick={this.handlePlayerInput} data-sound="1">
          Sound 2
        </button>
        <button onClick={this.handlePlayerInput} data-sound="2">
          Sound 3
        </button>
        <button onClick={this.handlePlayerInput} data-sound="3">
          Sound 4
        </button>
        <hr />
        <audio controls ref={this.sounds[0]}>
          <source src={sound1} />
        </audio>
        <audio controls ref={this.sounds[1]}>
          <source src={sound2} />
        </audio>
        <audio controls ref={this.sounds[2]}>
          <source src={sound3} />
        </audio>
        <audio controls ref={this.sounds[3]}>
          <source src={sound4} />
        </audio>
        <hr />
        {this.state.inGame &&
          (this.state.waitingForInput ? (
            <h4>Your turn</h4>
          ) : (
            <h4>Pay attention</h4>
          ))}
        {this.state.gameOver === "gameWon" && <h3>You Won!</h3>}
        {this.state.gameOver === "gameLost" && <h3>You Lost!</h3>}
      </Fragment>
    )
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export default App
