/**
 * Entrypoint for injecting '.pet-ui' into the application.
 *
 * Provides a UI over the backend simulation of the given pet.
 */
import socket from '../socket';

import * as R from 'ramda';

import React from 'react'; // react-brunch compiles JSX to React.createComponent(...) so we need this!
import { render } from 'react-dom';

import { compose, createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';

import PetApp from './containers/PetApp';

import reducers from './reducers';

const store = createStore(reducers, applyMiddleware(
  thunkMiddleware
));

// Inject into our pet ui tags.
//
// TODO: Source `channelId` from something useful.
R.forEach(petUi => {
  const app = (
    <Provider store={store}>
      <PetApp />
    </Provider>
  );

  render(app, petUi);
}, document.getElementsByClassName('pet-ui'));
