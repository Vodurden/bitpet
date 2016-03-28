/**
 * Entrypoint for injecting '.pet-ui' into the application.
 *
 * Provides a UI over the backend simulation of the given pet.
 */
import Rx from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver, h1, div, input, p} from '@cycle/dom';

import PetApp from './components/PetApp';

import { makeWSDriver } from './drivers/WSDriver';

function main(sources) {
  const props$ = Rx.Observable.of({});
  const childSources = {
    DOM: sources.DOM,
    WS: sources.WS,
    props$: props$
  };

  const petApp = PetApp(childSources);
  const petVTree$ = petApp.DOM;
  const petWS$ = petApp.WS;

  return {
    DOM: petVTree$,
    WS: petWS$
  };
}

const drivers = {
  DOM: makeDOMDriver('.pet-ui'),
  WS: makeWSDriver('pets:1')
};

Cycle.run(main, drivers);
