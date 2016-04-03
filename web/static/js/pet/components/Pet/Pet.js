import R from 'ramda';
import Rx from 'rx';
import {ul, li, img, div} from '@cycle/dom';

import isolate from '@cycle/isolate';

function model(props$) {
  const showFeedPet$ = props$
          .flatMap(props => props.actions.feedPet$)
          .throttle(900)
          .flatMap(() => {
            const delay = Rx.Observable.empty().delay(900);

            return Rx.Observable.from([true, false])
              .map(v => Rx.Observable.return(v).concat(delay))
              .concatAll();
          })
          .startWith(false)
          .do(v => { console.log('Show feed pet: ' + v); });

  const localState = showFeedPet$.map(showFeedPet => ({
    showFeedPet: showFeedPet
  }));

  return Rx.Observable.combineLatest(props$, localState, (props, localState) => {
    const local = {
      local: localState
    };

    return R.merge(props, local);
  });
}

function renderBackground() {
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

function renderGif(state) {
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
  const petImage = () => {
    if(state.local.showFeedPet) { return "happy"; }
    if(state.pet.happiness > 100) { return "happy"; }
    if(state.pet.happiness > 70) { return "idle"; }
    return "sad";
  };

  const image = 'images/pets/001/' + petImage() + '.gif';

  return img({ style: petGifStyle, src: image });
}

function renderGrid() {
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

function renderFood(state) {
  const petFoodStyle = {
    position: 'absolute',
    top: '30%',
    left: '30%',
    zIndex: '2'
  };

  // Only render if we are feeding
  if(state.local.showFeedPet) {
    return img({ style: petFoodStyle, src: 'images/food.gif' });
  }

  // We need to fully remove the `src` tag when hiding the image to ensure
  // firefox doesn't render a 'broken image' link.
  return img({ /* no src on purpose */ });
}

function view(state$) {
  const petStyle = {
    position: 'relative',
    height: '300px'
  };

  return state$.map(state => {
    return div({ style: petStyle }, [
      renderBackground(),
      renderGif(state),
      renderGrid(),
      renderFood(state)
    ]);
  });
}

function Pet({DOM, props$}) {
  const state$ = model(props$);
  const vtree$ = view(state$);

  return {
    DOM: vtree$
  };
}

export default (sources) => isolate(Pet)(sources);
