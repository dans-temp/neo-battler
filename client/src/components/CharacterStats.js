//import icons
import hpIcon from '../assets/icons/hp.png';
import strengthIcon from '../assets/icons/strength.png';
import dexterityIcon from '../assets/icons/dexterity.png';
import intelligenceIcon from '../assets/icons/intelligence.png';
import attackIcon from '../assets/icons/attack.png';
import speedIcon from '../assets/icons/speed.png';

const CharacterStats = ({character}) => {
    return (
      <div className="stats">
        {character.hp ? (
            <p>
                <img src={hpIcon} alt="HP Icon" className="pixel-icon" />
                HP: {character.hp}
            </p>
            ) : (
            <p>
                <img src={hpIcon} alt="HP Icon" className="pixel-icon" />
                HP: {character.current_hp} / {character.max_hp}
            </p>
            )}
        <p><img src={strengthIcon} alt="Strength Icon" className="pixel-icon"/>Strength: {character.strength}</p>
        <p><img src={dexterityIcon} alt="Dexterity Icon" className="pixel-icon"/>Dexterity: {character.dexterity}</p>
        <p><img src={intelligenceIcon} alt="Intelligence Icon" className="pixel-icon"/>Intelligence: {character.intelligence}</p>
        <p><img src={attackIcon} alt="Attack Icon" className="pixel-icon"/>Attack: {Number(character.damage.toFixed(1))}</p>
        <p><img src={speedIcon} alt="Speed Icon" className="pixel-icon"/>Speed: {Number(character.speed.toFixed(1))}</p>
      </div>
    );
}

export default CharacterStats;