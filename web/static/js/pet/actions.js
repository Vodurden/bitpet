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
      .receive('ok', () => {
        console.log('Fed pet.');
        dispatch(feedPetSuccess());
      })
      .receive('error', error => {
        console.log('Error feeding pet', JSON.stringify(error));
        dispatch(feedPetFailure());
      });
  };
}

export function feedPetRequest() {
  return {
    type: FEED_PET_REQUEST
  };
};

export function feedPetSuccess() {
  return {
    type: FEED_PET_SUCCESS
  };
}

export function feedPetFailure() {
  return {
    type: FEED_PET_FAILURE
  };
}
