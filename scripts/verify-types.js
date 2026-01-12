const fs = require('fs');
const path = require('path');

const projectDataPath = path.join(__dirname, '../data/type-data.json');
const projectData = JSON.parse(fs.readFileSync(projectDataPath, 'utf8'));
const myEffectiveness = projectData.effectiveness;

const smogonPath = path.join(__dirname, 'smogon_typechart.ts');
const smogonContent = fs.readFileSync(smogonPath, 'utf8');

// Parse Smogon data manually line-by-line to build a map
const smogonMap = {};
let currentType = null;
let insideDamageTaken = false;

const lines = smogonContent.split('\n');

lines.forEach(line => {
    const trimmed = line.trim();
    
    // Detect type start: "bug: {"
    const typeStart = trimmed.match(/^([a-z]+):\s*{/);
    if (typeStart) {
        currentType = typeStart[1]; // "bug"
        smogonMap[currentType] = {};
        insideDamageTaken = false;
        return;
    }

    // Detect damageTaken start: "damageTaken: {"
    if (trimmed.startsWith('damageTaken: {')) {
        insideDamageTaken = true;
        return;
    }

    // Detect end of block "},"
    if (trimmed.startsWith('},')) {
        if (insideDamageTaken) {
            insideDamageTaken = false;
        } else {
            currentType = null;
        }
        return;
    }

    // Parse damage values: "Bug: 1,"
    if (currentType && insideDamageTaken) {
        const damageMatch = trimmed.match(/^([a-zA-Z0-9]+):\s*([0-9]),/);
        if (damageMatch) {
            const typeName = damageMatch[1]; // "Bug"
            const value = parseInt(damageMatch[2]); // 1
            smogonMap[currentType][typeName] = value;
        }
    }
});

// Compare
const types = [
    "Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", 
    "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Steel", 
    "Fairy", "Dark"
];

let errors = [];
console.log("Checking types against Smogon standard...");

types.forEach(attacker => {
    types.forEach(defender => {
        // My Data: Attacker -> Defender
        let myMult = 1;
        if (myEffectiveness[attacker] && myEffectiveness[attacker][defender] !== undefined) {
            myMult = myEffectiveness[attacker][defender];
        }

        // Smogon Data: Defender receives from Attacker
        // Defender key is lowercase in smogonMap
        const defenderKey = defender.toLowerCase();
        
        if (!smogonMap[defenderKey]) {
            console.error(`Could not find Smogon data for defender: ${defender}`);
            return;
        }

        // Smogon uses "prankster" key sometimes, ignore it. They use Capitalized keys inside damageTaken
        const smogonCode = smogonMap[defenderKey][attacker];
        
        if (smogonCode === undefined) {
             // In gen 9 some interactions might be missing if they are standard? No, Smogon usually lists all.
             // But let's assume 0 if missing (neutral)
             // Actually, let's verify if 'attacker' key exists.
             // Special case: "Stellar" type exists in new smogon data, ignore it if not in our list.
             if (attacker === 'Stellar') return;
        }

        const code = smogonCode !== undefined ? smogonCode : 0;

        // Convert Smogon code to Multiplier
        // 0: 1x (Normal)
        // 1: 2x (Weakness) -> Super Effective
        // 2: 0.5x (Resistance) -> Not Very Effective
        // 3: 0x (Immunity) -> No Effect
        
        let expectedMult = 1;
        if (code === 1) expectedMult = 2;
        if (code === 2) expectedMult = 0.5;
        if (code === 3) expectedMult = 0;

        // Check for mismatch
        if (myMult !== expectedMult) {
            errors.push({
                attacker,
                defender,
                myValue: myMult,
                smogonValue: expectedMult,
                smogonCode: code
            });
        }
    });
});

if (errors.length > 0) {
    console.log(`\nFound ${errors.length} discrepancies:`);
    errors.forEach(e => {
        console.log(`❌ ${e.attacker} (Atk) vs ${e.defender} (Def): Yours=${e.myValue}x, Smogon expects=${e.smogonValue}x (Code ${e.smogonCode})`);
    });
} else {
    console.log("\n✅ All type interactions match Smogon standards exactly!");
}