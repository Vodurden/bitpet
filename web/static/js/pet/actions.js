import { getOrJoinPetChannel } from './channels';

// Synchronization.
export const SYNC_PET = 'SYNC_PET';
export const SYNC_PET_CONNECT = 'SYNC_PET_CONNECT';
export const SYNC_PET_CONNECT_REQUEST = 'SYNC_PET_CONNECT_REQUEST';
export const SYNC_PET_CONNECT_SUCCESS = 'SYNC_PET_CONNECT_SUCCESS';
export const SYNC_PET_CONNECT_FAILURE = 'SYNC_PET_CONNECT_FAILURE';

export function syncPetConnect(petChannelId) {
  return (dispatch) => {
    dispatch(syncPetConnectRequest(petChannelId));

    const onJoin = (pet) => {
      console.log("Joined successfully", JSON.stringify(pet));

      dispatch(syncPetConnectSuccess(channel));
      dispatch(syncPet(pet));
    };

    const onFail = (error) => {
      console.log("Unable to join", JSON.stringify(error));

      dispatch(syncPetConnectFailure(error));
    };

    const channel = getOrJoinPetChannel(petChannelId, onJoin, onFail);

    // Request an initial sync to trigger an early `sync_pet` payload.
    // We need to do this to ensure our initial data payload is updated
    // in a timely fashion.
    channel.push('sync_pet', {})
      .receive('ok', () => {
        console.log('Initial sync request success!');
      })
      .receive('error', () => {
        console.log('Initial sync request failed!');
      });

    channel.on('sync_pet', pet => {
      console.log('sync_pet payload:');
      console.log(pet);

      dispatch(syncPet(pet));
    });
  };
}

export function syncPetConnectRequest(petChannelId) {
  return {
    type: SYNC_PET_CONNECT_REQUEST,
    petChannelId: petChannelId
  };
}

export function syncPetConnectSuccess(channel) {
  return {
    type: SYNC_PET_CONNECT_SUCCESS,
    channel: channel
  };
}

export function syncPetConnectFailure(error) {
  return {
    type: SYNC_PET_CONNECT_FAILURE,
    error: error
  };
}

export function syncPet(pet) {
  return {
    type: SYNC_PET,
    pet: pet
  };
}


// User Actions.
export const FEED_PET_REQUEST = 'FEED_PET_REQUEST';
export const FEED_PET_SUCCESS = 'FEED_PET_SUCCESS';
export const FEED_PET_FAILURE = 'FEED_PET_FAILURE';

export function feedPet(channelId) {
  return (dispatch) => {
    dispatch(feedPetRequest());

    const channel = getOrJoinPetChannel(channelId);

    channel.push('feed_pet', {})
      .receive('ok', (pet) => {
        console.log('Fed pet.');
        console.log(pet);
        dispatch(feedPetSuccess(pet));
      })
      .receive('error', error => {
        console.log('Error feeding pet', JSON.stringify(error));
        dispatch(feedPetFailure(error));
      });
  };
}

export function feedPetRequest() {
  return {
    type: FEED_PET_REQUEST
  };
};

export function feedPetSuccess(pet) {
  return {
    type: FEED_PET_SUCCESS,
    pet: pet
  };
}

export function feedPetFailure(error) {
  return {
    type: FEED_PET_FAILURE,
    error: error
  };
}
