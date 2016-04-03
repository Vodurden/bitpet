import Rx from 'rx';
import {ul, li, img, div} from '@cycle/dom';

import isolate from '@cycle/isolate';

function view(pet$) {
  return pet$.map(pet => {
    return ul({ className: 'button-list small-button-list'}, [
      li('Happy ' + pet.happiness)
    ]);
  });
}

function DebugFooter({DOM, pet$}) {
  const vtree$ = view(pet$);

  return {
    DOM: vtree$
  };
}

export default (sources) => isolate(DebugFooter)(sources);
