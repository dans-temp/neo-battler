// BattleModal.js
import React, { useState, useEffect } from 'react';
import './BattleModal.css';
import axios from 'axios';

const BattleModal = ({ characterList, onClose }) => {
  const [textField, setTextField] = useState('');
  const [selectedCharacter1, setSelectedCharacter1] = useState('');
  const [selectedCharacter2, setSelectedCharacter2] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Set default selections for drop-downs
    if (characterList.length >= 2) {
      setSelectedCharacter1(characterList[0].name);
      setSelectedCharacter2(characterList[1].name);
    }
  }, [characterList]);

  const handleFightClick =  async () => {
    if (selectedCharacter1 === selectedCharacter2)
    {
        setErrorMessage('A character cannot fight themselves.  Pick 2 unique characters.');
        return;
    }
    setErrorMessage('');    

    try 
    {
        const character1_index = characterList.findIndex(char => char.name == selectedCharacter1);
        const character2_index = characterList.findIndex(char => char.name == selectedCharacter2);
        const response = await axios.post(`http://localhost:5000/api/battle/${selectedCharacter1}/${selectedCharacter2}`);
        //update HP values
        characterList[character1_index].current_hp = response.data.character1_hp;
        characterList[character2_index].current_hp = response.data.character2_hp;
        //display battle logs
        setTextField(response.data.logs.join('\n'));
    } catch (error) {
        console.error('Error updating character name:', error);
    }
  };

  return (
    <div className="battle-modal-background" onClick={onClose}>
      <div className="battle-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2></h2>
          <button className="close-button" onClick={onClose}>x</button>
        </div>
        <div className="modal-title">Battle Menu</div>
        {characterList.length < 2 ? (
          <div className="not-enough-characters">
            <p>Not enough characters to battle. You must have at least 2 characters to battle. Create more characters.</p>
          </div>
        ) : (
          <div>
            <div className="character-columns">
              <div className="select-column">
                <h3>Character 1 :</h3>
                <select
                  value={selectedCharacter1}
                  onChange={(e) => setSelectedCharacter1(e.target.value)}
                  className="custom-select"
                >
                  {characterList.map((character, index) => (
                    <option key={index} value={character.name}>{character.name}</option>
                  ))}
                </select>
              </div>
              <div className="select-column">
                <h3>Character 2 :</h3>
                <select
                  value={selectedCharacter2}
                  onChange={(e) => setSelectedCharacter2(e.target.value)}
                  className="custom-select"
                >
                  {characterList.map((character, index) => (
                    <option key={index} value={character.name}>{character.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="fight-button">
              <button onClick={handleFightClick}>Fight</button>
            </div>
            {errorMessage && <p className="error">{errorMessage}</p>}
            <div className="text-field">
              <textarea readOnly value={textField} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleModal;
