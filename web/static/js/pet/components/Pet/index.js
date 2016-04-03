import R from 'ramda';
import Rx from 'rx';
import {ul, li, img, div} from '@cycle/dom';

import isolate from '@cycle/isolate';

import Header from './Header';
import Footer from './Footer';
import DebugFooter from './DebugFooter';
import Pet from './Pet';

/**
 * Accepts our *entire* app state and returns a virtual dom observable.
 */
function view(headerVTree$, petVTree$, footerVTree$, debugFooterVTree$) {
  const petStyle = {
    position: 'relative',
    height: '300px'
  };

  const streams = [headerVTree$, petVTree$, footerVTree$, debugFooterVTree$];
  const handler = (header, pet, footer, debugFooter) => {
    return div({ className: 'pet-ui-react' }, [
      header,
      pet,
      footer,
      debugFooter
    ]);
  };
  return Rx.Observable.combineLatest(streams, handler);
}

/**
 * Map the users intent to websocket requests to the server.
 */
function outgoing(actions) {
  // We always want to do an initial sync request
  const syncPetRequest = { topic: 'sync_pet', data: {} };
  const syncRequest$ = Rx.Observable.just(syncPetRequest);

  // We want to send a feed request if the user has requested feeding.
  const feedPetRequest = { topic: 'feed_pet', data: {} };
  const feedRequest$ = actions.feedPet$
    .throttle(900)
    .map(ev => feedPetRequest)
    .startWith(feedPetRequest);

  const wsRequest$ = Rx.Observable.merge(syncRequest$, feedRequest$);

  return wsRequest$;
}

function PetContainer({DOM, WS}) {
  // We know we will get a `sync_pet` message every game tick.
  // (Usually measured in tens-of-seconds).
  //
  // We also know that the server can choose to respond with the updated
  // pet state immediately when sent a request (such as feed_pet). So we want
  // to capture all messages coming from the server that contain updated
  // pet state.
  //
  // None of our subcomponents are expected to deal with websocket
  // communications so we expect all websocket-aware manipulation of
  // this data to occur in this module.
  const pet$ = Rx.Observable.merge(
    WS.events('sync_pet'), WS.events('feed_pet')
  ).startWith({});

  // Wire all our subcomponents together.
  //
  // In our case our header/footer expose actions
  // that need to be available to the main pet rendering.
  const header = Header({ DOM: DOM });
  const footer = Footer({ DOM: DOM });
  const debugFooter = DebugFooter({ DOM, pet$ });
  const actions = R.merge(header.actions, footer.actions);

  const petProps$ = pet$.map(pet => ({
    actions: actions,
    pet: pet
  }));
  const pet = Pet({ DOM, props$: petProps$ });

  const vtree$ = view(header.DOM, pet.DOM, footer.DOM, debugFooter.DOM);

  // As above we don't expect our subcomponents to know anything
  // about the websocket. As such we map any of their output
  // information to websocket requests if required.
  const wsRequest$ = outgoing(actions);

  // Complete the cycle!
  return {
    DOM: vtree$,
    WS: wsRequest$
  };
}

export default (sources) => isolate(PetContainer)(sources);
