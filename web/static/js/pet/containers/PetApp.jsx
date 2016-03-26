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

    const petStyle = {
      position: 'relative',
      height: '300px'
    };

    const petBackgroundStyle = {
      position: 'absolute',
      top: '0px',
      left: '0px',
      height: '300px',
      width: '100%',
      zIndex: '0'
    };

    const petGifStyle = {
      position: 'absolute',
      top: '110px',
      left: '0',
      right: '0',
      marginLeft: 'auto',
      marginRight: 'auto',
      zIndex: '1'
    };

    const petFoodStyle = {
      position: 'absolute',
      top: '0',
      left: '0',
      zIndex: '2'
    };

    const petGridStyle = {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '100%',
      height: '300px',
      zIndex: '10',
      background: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAH0lEQVQImWNggIKNGzdKMaADFMGNGzdKoWPsKrEJAgAMqhOWw2pceAAAAABJRU5ErkJggg==) repeat'
    };


    // Our pet image is based on it's mood:
    //
    // Happiness > 100          = happy.gif
    // 70 > Hapiness > 100      = idle.gif
    // 0 > Happiness > 70       = sad.gif
    const petImage = (pet) => {
      if(pet.happiness > 100) { return "happy"; }
      if(pet.happiness > 70) { return "idle"; }
      return "sad";
    };

    const image = '/images/pets/001/' + petImage(this.props.pet) + '.gif';

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

        <div style={petStyle}>
          <img style={petBackgroundStyle} src="/images/environments/background_00000.png"></img>
          <img style={petGifStyle} src={image}></img>
          <div style={petGridStyle}></div>
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
