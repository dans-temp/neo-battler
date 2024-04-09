// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Get job data from JSON file
const jobData = JSON.parse(fs.readFileSync('job_data.json', 'utf-8'));

const game_state = {
    characters: []
};

//send the job data thats pulled from the job_data.json
app.get('/api/job_data', (req, res) => {
    res.send(jobData);
});

//get the list of all created characters
app.get('/api/character_list', (req, res) => {
    res.send(game_state.characters);
});

//put to edit character name
app.put('/api/character_name/:old_name', (req, res) => {

    const { old_name } = req.params;
    const { new_name } = req.body;

    if(old_name === new_name)
        return;

    //regex check
    const nameRegex = /^[a-zA-Z_]{4,15}$/;
    if (!nameRegex.test(new_name)) {
        return res.status(400).json({ error: 'Regex validation failed for name change.' });
    }

    //find the character in the game_state
    const characterIndex = game_state.characters.findIndex(char => char.name == old_name);

    //no character found throw error
    if (characterIndex === -1)
        return res.status(404).json({ error: 'Character not found' });

    //make sure name doesnt already exist
    for (const character of game_state.characters)
    {
        if (character.name === new_name)
        {
            return res.status(404).json({ error: 'Character name already exists' });
        }
    }

    game_state.characters[characterIndex].name = new_name;

    res.json(characterIndex);
});


//post to create a new character
app.post('/api/create/:job/:name', (req, res) => {
    const job = req.params.job;
    const name = req.params.name;

    const nameRegex = /^[a-zA-Z_]{4,15}$/;
    if (!nameRegex.test(name)) {
        return res.status(400).json({ error: 'Regex validation failed for name.' });
    }

    const new_character = {
        name: name,
        job: job,
        current_hp: jobData[job].hp,
        max_hp: jobData[job].hp,
        strength: jobData[job].strength,
        dexterity: jobData[job].dexterity,
        intelligence: jobData[job].intelligence
    }

    game_state.characters.push(new_character)

    const res_data = {
        character: new_character,
        message: `Created new ${job} named ${name}!`
    }
    console.log(`Character Created ${new_character.name}!  There are now ${game_state.characters.length} characters`);

    res.send(res_data);
});

//post to start a battle
app.post('/api/battle/:character1/:character2', (req, res) => {
    const character1 = req.params.character1;
    const character2 = req.params.character2;

    //find the character index in the game_state
    const character1_index = game_state.characters.findIndex(char => char.name == character1);
    const character2_index = game_state.characters.findIndex(char => char.name == character2);

    let character1_hp = game_state.characters[character1_index].current_hp;
    let character2_hp = game_state.characters[character2_index].current_hp;
    let logs = [];

    //handle special cases where at least one character is dead before battle
    if (character1_hp === 0 && character2_hp === 0)
    {
        logs = [`Battle between ${character1} (${game_state.characters[character1_index].job}) | ${character1_hp} HP, and ${character2} (${game_state.characters[character1_index].job}) | ${character2_hp} HP BEGINS!\n${character1} and ${character2} are both dead before the battle starts.\nThey lie on the battlefield lifelessly... \nThe battle ends in a draw!`];
    }
    else if (character1_hp === 0)
    {
        logs = [`Battle between ${character1} (${game_state.characters[character1_index].job}) | ${character1_hp} HP, and ${character2} (${game_state.characters[character1_index].job}) | ${character2_hp} HP BEGINS!\n${character1} is dead before the battle starts.\n${character2}'s speed was faster than ${character1}'s speed and will begin this round!\n${character2} pokes the corpse of ${character1}\n${character1} lies on the battlefield lifelessly...\n${character2} wins the battle! ${character2} still has ${character2_hp} HP remaining!`];
    }
    else if (character2_hp === 0)
    {
        logs = [`Battle between ${character1} (${game_state.characters[character1_index].job}) | ${character1_hp} HP, and ${character2} (${game_state.characters[character1_index].job}) | ${character2_hp} HP BEGINS!\n${character2} is dead before the battle starts.\n${character1}'s speed was faster than ${character2}'s speed and will begin this round!\n${character1} pokes the corpse of ${character2}\n${character2} lies on the battlefield lifelessly...\n${character1} wins the battle! ${character1} still has ${character1_hp} HP remaining!`];
    }
    else
        logs = battle(game_state.characters[character1_index], game_state.characters[character2_index]);


    //update HPs since they changed after battle
    character1_hp = game_state.characters[character1_index].current_hp;
    character2_hp = game_state.characters[character2_index].current_hp;

    const res_data = {
        logs: logs,
        character1_hp: character1_hp,
        character2_hp: character2_hp
    }

    res.send(res_data);
});
  

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


function calculateSpeed(character)
{
    let speed;
    //calc speed modifier
    if (character.job === "warrior")
        speed = (character.dexterity *.6) + (character.intelligence *.2);

    else if (character.job === "thief")
        speed = (character.dexterity * .8);

    else if (character.job === "mage")
        speed = (character.dexterity * .4) + (character.strength * .1);

    //return random number between 0 and speed
    return Math.floor(Math.random() * speed);
}

function calculateDamage(character)
{
    let damage;
    //calc damage modifier
    if (character.job === "warrior")
        damage = (character.strength *.8) + (character.dexterity * .2);

    else if (character.job === "thief")
        damage = (character.strength * .25) + (character.dexterity) + (character.intelligence * .25);

    else if (character.job === "mage")
        damage = (character.strength * .2) + (character.dexterity * .2) + (character.intelligence * 1.2);
    
    //return random number between 0 and damage
    return Math.ceil(Math.random() * damage);
}

//called to start the battle between two characters
function battle(character1, character2)
{
    //processes a single attack
    function process_combat(attacker, defender)
    {
        let attacker_atk_damage = calculateDamage(attacker);
        defender.current_hp -= attacker_atk_damage;

        if (defender.current_hp < 0)
        {
            defender.current_hp = 0;
            is_winner = true;
        }
        
        battle_logs.push(`${attacker.name} attacks ${defender.name} for ${attacker_atk_damage}!  ${defender.name} has ${defender.current_hp} HP remaining.`);

        if(is_winner)
            battle_logs.push(`${attacker.name} wins the battle! ${attacker.name} still has ${attacker.current_hp} HP remaining!`);

    }
    const battle_logs = [];
    let is_winner = false;

    battle_logs.push(`Battle between ${character1.name} (${character1.job}) | ${character1.current_hp} HP, and ${character2.name} (${character2.job}) | ${character2.current_hp} HP BEGINS!`);
    while (!is_winner)
    {
        let character1_speed = calculateSpeed(character1);
        let character2_speed = calculateSpeed(character2);

        //keep recalculating speed if they are equal
        while (character1_speed === character2_speed) {
            character1_speed = calculateSpeed(character1);
            character2_speed = calculateSpeed(character2);
        }

        if (character1_speed > character2_speed)
        {
            battle_logs.push(`${character1.name}'s ${character1_speed} speed was faster than ${character2.name}'s ${character2_speed} speed and will begin this round!`);
            process_combat(character1, character2);

            if(!is_winner)
                process_combat(character2, character1);
        }

        else
        {
            battle_logs.push(`${character2.name}'s ${character2_speed} speed was faster than ${character1.name}'s ${character1_speed} speed and will begin this round!`);
            process_combat(character2, character1);
            
            if(!is_winner)
                process_combat(character1, character2);
        }

    }

    return battle_logs;
}