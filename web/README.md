## Pit Trader Web

Pit Trader Static site video game.

Built on top of [Create React App](https://create-react-app.dev/). Uses [onnx
runtime](https://onnxruntime.ai/) to load [externally trained
classifier](../model) that uses [MediaPipe
libraries](https://github.com/google/mediapipe/blob/master/docs/getting_started/javascript.md)
to recognize open outcry trading pit gestures.

### Quickstart Dev

```

docker-compose up
# visit http://localhost:3000/

# tests, lint
./docker_run_web.sh

npm test
npm run lint


```

### Basic Architecture

* MediaPipe enables webcam and outputs landmark data points (hands, face.)

* There is an implicit "Game Loop" driven by each webcam frame.

* Classifier takes webcam data and infers a class label that maps to a gesture
  value.

* When both a quantity gesture and price gesture are recognized, a
  "GestureDecision" triggers; typically an Order submitted to the Matching
  Engine.


#### Gesture Recognition

* A [`Gesture`](src/lib/gesture/Gesture.ts) is a recognized 'snapshot' of
  MediaPipe landmark data from the [`Classifier`](src/lib/gesture/Classifier.ts).
  * Model is currently Logistic Regression, with a manually tuned probability
    threshold of `0.41`.
* [`CameraGesture.jsx`](src/pages/main/CameraGesture.jsx): `calcGesture()`
  function drives the recognition, and is called each webcam frame.
* Gestures are recognized using a mini state machine, using a small timer
  before locking the input and moving to the next component input.
    * [`NumberSM.ts`](src/lib/gesture/NumberSM.ts): recognize numbers
    * [`ActionSM.ts`](src/lib/gesture/ActionSM.ts): recognizes supplemental gestures (Cancel, Market);
* A [`GestureDecision`](src/lib/gesture/GestureDecision.ts) determines if both
  component gestures (a gesture quantity and gesture price) have been set. If
  they're valid, this triggers creation or update (e.g. cancel) of an Order.

#### Gameplay

* [`MarketLoop`](src/lib/exchange) cycles between
  [`NPCPlayers`](src/lib/player/NPCPlayerManager.ts) who randomly improve bids
  or offers to induce execution.
* [`Events`](src/lib/event) are randomly triggered that force a gesture matching challenge, or
  update parameters (add players, induce action, etc.)
  * Typically displayed (messages) on the [`InfoPanel`](src/pages/main/infopanel).
* [`MatchingEngine`](src/lib/exchange/MatchingEngine.ts) matches player [`Orders`](src/lib/exchange/Order.ts) and execution.
* Increased profit increases levels that enables more risk and reward.

### Contents

Files of import, directories:

| File                   | Description                                                         |
|------------------------|---------------------------------------------------------------------|
| `index.tsx`            | Entry point                                                         |
| `./App.jsx`            | Routes                                                              |
| `/camera/Camera.jsx`   | calls the MediaPipe libraries                                       |
| `/camera/Landmarks.js` | combines raw data into object used for Classification               |
| `/components`          | reusable, contained components, modals, and GameContext (GameState) |
| `/config`              | static config files, messages, levels                               |
| `/lib/event`           | NewsEvent, GestureDecisionEvent                                     |
| `/lib/exchange`        | MatchingEngine, Order, 'exchange' logic                             |
| `/lib/gesture`         | Gesture recognition                                                 |
| `/lib/player`          | Player class                                                        |
| `/pages/home`          | Home page                                                           |
| `/pages/main`          | Main game page (calls most components)                              |
| `/styles`              | css                                                                 |
|                        |                                                                     |



#### Dev Notes

* html5 webcam (`navigator.mediaDevices.getUserMedia`) requires secure context -
  can't access from `192.168.*` ip. `localhost` is ok.


---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
