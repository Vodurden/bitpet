import { SYNC_PET_CONNECT_SUCCESS, SYNC_PET } from './actions';

const initialState = {
  petChannelId: 1,
  pet: {}
};

function petApp(state, action) {
  if(typeof state === 'undefined') {
    return initialState;
  }

  switch(action.type) {
    case SYNC_PET_CONNECT_SUCCESS:
      return Object.assign({}, state, {
        channel: action.channel
      });
    case SYNC_PET:
      return Object.assign({}, state, {
        pet: action.pet
      });
    default: return state;
  }

  return state;
};

export default petApp;
