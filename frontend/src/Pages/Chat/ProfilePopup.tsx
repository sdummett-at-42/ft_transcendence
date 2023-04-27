import React, { useEffect, useCallback } from 'react';
import "./chat.scss"

interface ProfilePopupProps {
  isVisible: Boolean,
  onClose: () => void,
  user : {
      id: number,
      name: string,
      profilePicture: string,
      elo: number,
      matchLost: Number[],
      matchWon: Number[],
  }
}

export default function ProfilePopup(props: ProfilePopupProps) {


  const handleCloseAfterRoomCreated = useCallback((payload) => {
  //  props.onClose()
  }, []);
  useEffect(()=>{
  },[props]);

  return props.isVisible == false? null: (
        <div className="modal-body">
          <div className="modal-content customized_row">
            <div className="customised_column">
                <h2>Nom: {props.user.name}</h2>
                <h2>Niveau: {props.user.elo}</h2>
                <p>Gagné: {props.user.matchWon.length}</p>
                <p>Perdu: {props.user.matchLost.length}</p>
              </div>
              <div className="customised_column">
                <img className="ChatRoom-image" src={props.user.profilePicture} />
                </div>
    </div>
                <button>Plus d'info..</button>
                <button onClick={props.onClose}>Fermer</button>

        </div>
  );
};