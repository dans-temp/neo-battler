import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import InfoModal from './components/InfoModal';
import BattleModal from './components/BattleModal';

function App() {
  const [message, setMessage] = useState('');
  const [characterList, setCharacterList] = useState([]);
  const [nameInput, setNameInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedJob, setSelectedJob] = useState('warrior');
  const [jobData, setJobData] = useState(null); 
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showBattleModal, setShowBattleModal] = useState(false);

  //get job_data on mount
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/job_data');
        setJobData(response.data);
      } catch (error) {
        console.error('Error fetching job data:', error);
      }
    };

    fetchJobData();
  }, []); 

  //keep list of all characters updated
  useEffect(() => {
    const fetchCharacterList = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/character_list');
        setCharacterList(response.data);
      } catch (error) {
        console.error('Error fetching character list:', error);
      }
    };

    fetchCharacterList();
  }, []); 

  const handleInputChange = (event) => {
    setNameInput(event.target.value);
    setErrorMessage('');
  };

  const handleCardSelect = (jobType) => {
    setSelectedJob(jobType);
  };

  const createCharacter = async () => {
    // Regex for validating the name
    const nameRegex = /^[a-zA-Z_]{4,15}$/;
    if (!nameRegex.test(nameInput)) {
      setErrorMessage('Name must be between 4 and 15 characters long and contain only letters or underscore');
      setMessage('');
      return;
    }
    // Check that name doesn't already exist
    for (const character of characterList) {
      if (nameInput === character.name) {
        setErrorMessage('That character name already exists. Please choose a unique name');
        setMessage('');
        return;
      }
    }
    // Call the server to create the character
    try {
      const response = await axios.post(`http://localhost:5000/api/create/${selectedJob}/${nameInput}`);
      setMessage(response.data.message);
      characterList.push(response.data.character);
      setNameInput('');
    } catch (error) {
      console.error('Error creating character:', error);
    }
  };


    // Handle character info modal 
    const openInfoModal = (character) => {
      setSelectedCharacter(character);
    };

    const closeInfoModal = () => {
      setSelectedCharacter(null);
    };

    // Handle BattleModal
    const openBattleModal = () => {
      setShowBattleModal(true);
    };

    const closeBattleModal = () => {
      setShowBattleModal(false);
    };

  return (
    <div>
      <div>
        <h1>Neo Battler</h1>
        <h1>Create Character:</h1>

        <div>
          <h1>Select Job:</h1>
          <div className="job-cards">
            {jobData && Object.keys(jobData).map((jobType, index) => (
              <Card
                key={index}
                title={jobType.charAt(0).toUpperCase() + jobType.slice(1)} // Capitalize the job title
                selected={selectedJob === jobType}
                onClick={() => handleCardSelect(jobType)}
                stats={jobData[jobType]}
              />
            ))}
          </div>
        </div>

        <div>
          <input
            type="text"
            placeholder="Enter name"
            value={nameInput}
            onChange={handleInputChange}
          />
          <button onClick={createCharacter}>Create</button>
        </div>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <p>{message}</p>
      </div>

      <div>
        <h1>Character List:</h1>
        <table className="character-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Job</th>
              <th>HP</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {characterList.reverse().map((character, index) => (
              <tr key={index} onClick={() => openInfoModal(character)}>
                <td>{character.name}</td>
                <td>{character.job}</td>
                <td>{character.current_hp} / {character.max_hp}</td>
                <td>{character.current_hp > 0 ? 'Alive' : 'Dead'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div>
        <button onClick={openBattleModal}>Battle Menu</button>
      </div>

      {showBattleModal && <BattleModal characterList={characterList} onClose={closeBattleModal} />}

      {selectedCharacter && <InfoModal character={selectedCharacter} characterList={characterList} onClose={closeInfoModal} />}

    </div>
  );
}

//card component
const Card = ({ title, selected, stats, onClick }) => {
  return (
    <div
      className={`card ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <h3>{title}</h3>
      <div className="stats">
        <p>HP: {stats.hp}</p>
        <p>Strength: {stats.strength}</p>
        <p>Dexterity: {stats.dexterity}</p>
        <p>Intelligence: {stats.intelligence}</p>
      </div>
    </div>
  );
};

export default App;
