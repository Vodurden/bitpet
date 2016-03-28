import Rx from 'rx';
import {ul, li, img, div} from '@cycle/dom';

import isolate from '@cycle/isolate';

function renderHeader() {
  return ul({ className: 'button-list tall-button-list' }, [
    li(img({ src: '/images/icons/help.png'})),
    li(img({ src: '/images/icons/medi.png'})),
    li({ className: 'feed-pet'}, img({ src: '/images/icons/food.png'})),
    li(img({ src: '/images/icons/talk.png'}))
  ]);
}

function renderFooter() {
  return ul({ className: 'button-list tall-button-list' }, [
    li(img({ src: '/images/icons/train.png'})),
    li(img({ src: '/images/icons/light.png'})),
    li(img({ src: '/images/icons/play.png'})),
    li(img({ src: '/images/icons/sync.png'}))
  ]);
}

function renderDebugFooter(state) {
  const happiness = state.pet.happiness;

  return ul({ className: 'button-list small-button-list'}, [
    li('Happy ' + happiness)
  ]);
}

function renderPetBackground() {
  const petBackgroundStyle = {
    position: 'absolute',
    top: '0px',
    left: '0px',
    height: '300px',
    width: '100%',
    zIndex: '0'
  };

  return img({ style: petBackgroundStyle, src: '/images/environments/background_00000.png'});
}

function renderPetGif(state) {
  const petGifStyle = {
    position: 'absolute',
    top: '110px',
    left: '0',
    right: '0',
    marginLeft: 'auto',
    marginRight: 'auto',
    zIndex: '1'
  };

  // Our pet image is based on it's mood:
  //
  // Eating                   = happy.gif
  // Happiness > 100          = happy.gif
  // 70 > Hapiness > 100      = idle.gif
  // 0 > Happiness > 70       = sad.gif
  const petImage = (pet) => {
    if(state.showFeedPet) { return "happy"; }
    if(pet.happiness > 100) { return "happy"; }
    if(pet.happiness > 70) { return "idle"; }
    return "sad";
  };

  const image = 'images/pets/001/' + petImage(state.pet) + '.gif';

  return img({ style: petGifStyle, src: image });
}

function renderPetGrid() {
  const petGridStyle = {
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: '100%',
    height: '300px',
    zIndex: '10',
    background: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAH0lEQVQImWNggIKNGzdKMaADFMGNGzdKoWPsKrEJAgAMqhOWw2pceAAAAABJRU5ErkJggg==) repeat'
  };

  return div({ style: petGridStyle });
}

function renderPetFood(state) {
  const petFoodStyle = {
    position: 'absolute',
    top: '30%',
    left: '30%',
    zIndex: '2'
  };

  // Only render if we are feeding
  if(state.showFeedPet) {
    return img({ style: petFoodStyle, src: 'images/food.gif' });
  }

  return img({ style: petFoodStyle, src: '' });
}

/**
 * Accepts our *entire* app state and returns a virtual dom observable.
 */
function view(state$) {
  const petStyle = {
    position: 'relative',
    height: '300px'
  };

  return state$.map(state => {
    return div({ className: 'pet-ui-react' }, [
      renderHeader(),
      div({ style: petStyle }, [
        renderPetBackground(),
        renderPetGif(state),
        renderPetGrid(),
        renderPetFood(state)
      ]),
      renderFooter(),
      renderDebugFooter(state)
    ]);
  });
}

/**
 * Listen to the user.
 *
 * Interpret DOM events as intended user actions
 *
 * Input: DOM driver
 * Output: Action Observables
 */
function intent(DOM) {
  const feedPet$ = DOM.select('.feed-pet').events('click');

  return {
    feedPet$: feedPet$
  };
}

/**
 * Manage our state.
 *
 * Listen to our user actions and websocket streams
 */
function model(actions, syncPet$) {
  const showFeedPet$ = actions.feedPet$
    .throttle(900)
    .flatMap(() => {
      const delay = Rx.Observable.empty().delay(900);

      return Rx.Observable.from([true, false])
        .map(v => Rx.Observable.return(v).concat(delay))
        .concatAll();
    })
    .startWith(false);

  return Rx.Observable.combineLatest(syncPet$, showFeedPet$, (pet, showFeedPet) => {
    return {
      showFeedPet: showFeedPet,
      pet: pet
    };
  });
}

/**
 * Map the users intent to websocket requests to the server.
 */
function outgoing(userAction$) {
  // We always want to do an initial sync request
  const syncPetRequest = { topic: 'sync_pet', data: {} };
  const syncRequest$ = Rx.Observable.just(syncPetRequest);

  // We want to send a feed request if the user has requested feeding.
  const feedPetRequest = { topic: 'feed_pet', data: {} };
  const feedRequest$ = userAction$.feedPet$
    .map(ev => feedPetRequest)
    .startWith(feedPetRequest);


  const wsRequest$ = Rx.Observable.merge(syncRequest$, feedRequest$);

  return wsRequest$;
}

function PetCycle({DOM, WS}) {
  // Deal with streams from the websocket. We mostly care about
  // ensuring we sync our pet state when the server sends us
  // an update.
  const syncPet$ = Rx.Observable.merge(
    WS.events('sync_pet'), WS.events('feed_pet')
  ).startWith({});

  // Deal with any user intents. The user can't intend anything
  // from a websocket so we don't pass it through
  const userAction$ = intent(DOM);

  // Map our User and WebSocket inputs to our pet state.
  // Then map our state to our view.
  const state$ = model(userAction$, syncPet$);
  const vtree$ = view(state$);

  // Map user actions into our outgoing websocket requests.
  const wsRequest$ = outgoing(userAction$);

  // Complete the cycle!
  return {
    DOM: view(state$),
    WS: wsRequest$
  };
}

export default (sources) => isolate(PetCycle)(sources);
