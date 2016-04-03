import Rx from 'rx';
import {ul, li, img, div} from '@cycle/dom';

import isolate from '@cycle/isolate';

/**
 * Listen to the user.
 *
 * Interpret DOM events as intended user actions
 *
 * Input: DOM driver
 * Output: Action Observables
 */
function intent(DOM) {
  const trainPet$ = DOM.select('.train-pet').events('click');
  const lightPet$ = DOM.select('.light-pet').events('click');
  const playPet$ = DOM.select('.play-pet').events('click');
  const syncPet$ = DOM.select('.sync-pet').events('click');

  return {
    trainPet$,
    lightPet$,
    playPet$,
    syncPet$
  };
}

function view() {
  return Rx.Observable.of(ul({ className: 'button-list tall-button-list' }, [
    li({ className: 'train-pet' }, img({ src: '/images/icons/train.png'})),
    li({ className: 'light-pet' }, img({ src: '/images/icons/light.png'})),
    li({ className: 'play-pet' }, img({ src: '/images/icons/play.png'})),
    li({ className: 'sync-pet' }, img({ src: '/images/icons/sync.png'}))
  ]));
}

function Footer({DOM}) {
  const actions = intent(DOM);
  const vtree$ = view();

  return {
    DOM: vtree$,
    actions: actions
  };
}

export default (sources) => isolate(Footer)(sources);
