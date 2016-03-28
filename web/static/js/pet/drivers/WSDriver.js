import Rx from 'rx';

import socket from '../../socket';

/**
 * Bidirectional websocket driver between Cycle.JS <-> Phoenix Websockets
 */
export function makeWSDriver(channelId) {
  console.log('Connecting to channelId: ' + channelId);

  const channel = socket.channel(channelId);
  channel.join().receive('error', err => {
    console.log('Error joining');
  });

  const WSDriver = function(outgoing$) {
    // Send outgoing messages to our channel.
    outgoing$.subscribe(outgoing => {
      const { topic, data } = outgoing;

      channel.push(topic, data)
        .receive('ok', () => {
          console.log('Sync request success');
        })
        .receive('error', (err) => {
          console.log('Sync request err: ' + err);
        });
    });

    return {
      events: function(event) {
        return Rx.Observable.create(function(obs) {
          channel.onError(obs.onError.bind(obs));

          channel.on(event, payload => {
            obs.onNext(payload);
          });
        });
      }
    };
  };

  return WSDriver;
}
