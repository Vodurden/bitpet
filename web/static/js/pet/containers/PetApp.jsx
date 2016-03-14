import React, { Component } from 'react';

import Redux from 'redux';
import { connect } from 'react-redux';

import { syncPetConnect, feedPet } from '../actions';

class PetApp extends Component {
  componentDidMount() {
    // Dispatch a connect message to our store.
    const { onMount, petChannelId } = this.props;

    onMount(petChannelId);
  }

  render() {
    console.log(this.props);

    return (
      <div className="pet-ui-react">
        <ul className="button-list tall-button-list">
          <li>Help</li>
          <li>Vita</li>
          <li onClick={() => this.props.onFeedClick(this.props.petChannelId)}>Food</li>
          <li>Talk</li>
        </ul>

        <ul className="button-list small-button-list">
          <li>Happy ({this.props.pet.happiness})</li>
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

const mapStateToProps = (state) => {
  return {
    petChannelId: state.petChannelId,
    pet: state.pet
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onMount: (petChannelId) => dispatch(syncPetConnect(petChannelId)),
    onFeedClick: (petChannelId) => dispatch(feedPet(petChannelId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PetApp);
