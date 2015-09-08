# Artsy-history
This is an attempt to make an Art History flashcard study game using [Artsy's](https://developers.artsy.net/) API.

### How it works
The app is using [Superagent](https://visionmedia.github.io/superagent/) and [Traverson](https://github.com/basti1302/traverson) (along with the JSON-HAL plugin) to communicate with artsy's API and to pull artist's data for the flashcards.

The plan is to keep it in the front-end domain for as long as possible -- so browserify/watchify is being used to load the node library stuff into the browser. If this app gets big enough to add different users, then this will probably be moved a framework like Meteor.

#Status
### What's working
- Got the JSON-HAL stuff working in my favor and now I can pull data
- That's about it

### What's left to do
- Data structures for the API data
- Game logic for the flashcards
- Mock-up for webpage
- Color palette and design for the webpage
