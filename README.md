# Artsy-history
This is an attempt to make an Art History flashcard study game using [Artsy's](https://developers.artsy.net/) API. Try out the game by going [HERE](http://dvrico.github.io/artsy-history/). Mind you that, at the moment, the game is still very new, so you're likely to find a few bugs.

### How it works
The app is using [Superagent](https://visionmedia.github.io/superagent/) and [Traverson](https://github.com/basti1302/traverson) (along with the JSON-HAL plugin) to communicate with artsy's API and to pull artist's data for the flashcards.

This data (in the form of a blob of promises) is then displayed to the user using Angular.js.

#Status
### What's working
- One Game mode is working...for the most part (bugs abound!)

### What's left to do
- Need to figure out a way to pull more artist data from the API.
- Need more game modes
- Need more categories

#Contributing
Feel free to open up an issue to discuss what you would like to work on. This project is pretty ambitious for me at the moment, so any kind of collaborating is appreciated.
