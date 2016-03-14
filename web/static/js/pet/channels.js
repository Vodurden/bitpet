import socket from '../socket';

const existingPetConnections = {};

export function getOrJoinPetChannel(petChannelId, onJoin, onFail) {
  const channelId = 'pets:' + petChannelId;
  if(!existingPetConnections[channelId]) {
    console.log('Joining ' + channelId);

    const channel = socket.channel(channelId);

    channel.join().receive("ok", onJoin).receive("error", onFail);

    existingPetConnections[channelId] = channel;
  }

  return existingPetConnections[channelId];

}
