import React, { useState } from 'react';
import './InfoModal.css';
import axios from 'axios';

import CharacterStats from '../components/CharacterStats';

const InfoModal = ({ character, characterList, onClose}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState(character.name);

  const handleEditName = () => {
    setEditName(true);
  };

  const handleSaveName = async () => {
    //if new name == old name
    if(newName === character.name)
    {
        setEditName(false);
        return;
    }
    // check regex
    const nameRegex = /^[a-zA-Z_]{4,15}$/;
    if (!nameRegex.test(newName)) {
      setErrorMessage('Name must be between 4 and 15 characters long and contain only letters or underscore');
      return;
    }
    // Check that name doesn't already exist
    for (const char of characterList) {
        if (newName === char.name) {
            setErrorMessage('That character name already exists. Please choose a unique name');
            return;
        }
    }
    try 
    {
        const response = await axios.put(`http://localhost:5000/api/character_name/${character.name}`, { new_name: newName });
        onClose(characterList[response.data].name = newName);
        setEditName(false);
    } catch (error) {
        console.error('Error updating character name:', error);
    }
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  return (
    <div className="modal-background" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h1>CHARACTER INFO</h1>      
        {editName ? (
          <div className="name-input">
            <input
              type="text"
              value={newName}
              onChange={handleNameChange}
            />
            <button onClick={handleSaveName}>Save</button>
            <div className="error-text">
              {errorMessage && <p className="error">{errorMessage}</p>}
            </div>
          </div>
        ) : (
          <div>
            <h2>{character.name}</h2>
            <button onClick={handleEditName}>Edit Name</button>
          </div>
        )}
        <CharacterStats character={character}/>
      </div>
    </div>
  );
};

export default InfoModal;
