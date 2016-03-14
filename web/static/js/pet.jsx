import React, { Component } from 'react';

import socket from './socket';

export default class Pet extends Component {
  constructor(props) {
    super(props);

    this.state = {
      happiness: "?"
    };
  }

  componentDidMount() {
    const channelId = 'pets:' + this.props.channelId;

    console.log('Joining ' + channelId);

    const channel = socket.channel(channelId, {});

    channel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp); })
      .receive("error", resp => { console.log("Unable to join", resp); });

    channel.on('sync_pet', pet => {
      console.log('sync_pet payload:');
      console.log(pet);

      this.setState(pet);
    });
  }

  render() {
    return (
      <div className="pet-ui-react">
        <ul className="button-list tall-button-list">
          <li>Help</li>
          <li>Vita</li>
          <li>Food</li>
          <li>Talk</li>
        </ul>

        <ul className="button-list small-button-list">
          <li>Happy ({this.state.happiness})</li>
        </ul>

        <div className="pet">
          <span>Pet here</span>
        </div>

        <ul className="button-list tall-button-list">
          <li>Trng</li>
          <li>Lght</li>
          <li>Play</li>
          <li>Sync</li>
        </ul>
      </div>
    );
  }
}
