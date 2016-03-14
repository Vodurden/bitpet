import socket from '../socket';

export default function(petChannelId) {
  const channelId = 'pets:' + petChannelId;

  console.log('Joining ' + channelId);

  const channel = socket.channel(channelId, {});

  channel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp); })
    .receive("error", resp => { console.log("Unable to join", resp); });

  return channel;
}
