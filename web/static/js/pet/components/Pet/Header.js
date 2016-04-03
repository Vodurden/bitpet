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
  const helpPet$ = DOM.select('.help-pet').events('click');
  const mediPet$ = DOM.select('.medi-pet').events('click');
  const feedPet$ = DOM.select('.feed-pet').events('click');
  const talkPet$ = DOM.select('.talk-pet').events('click');

  return {
    helpPet$,
    mediPet$,
    feedPet$,
    talkPet$
  };
}

function view() {
  return Rx.Observable.of(ul({ className: 'button-list tall-button-list' }, [
    li({ className: 'help-pet' }, img({ src: '/images/icons/help.png'})),
    li({ className: 'medi-pet' }, img({ src: '/images/icons/medi.png'})),
    li({ className: 'feed-pet' }, img({ src: '/images/icons/food.png'})),
    li({ className: 'talk-pet' }, img({ src: '/images/icons/talk.png'}))
  ]));
}

function Header({DOM}) {
  const actions = intent(DOM);
  const vtree$ = view();

  return {
    DOM: vtree$,
    actions: actions
  };
}

export default (sources) => isolate(Header)(sources);
