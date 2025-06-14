const POKEMON_LIST = [
  {
    "name": "Bulbasaur",
    "types": [
      "Grass",
      "Poison"
    ]
  },
  {
    "name": "Ivysaur",
    "types": [
      "Grass",
      "Poison"
    ]
  },
  {
    "name": "Venusaur",
    "types": [
      "Grass",
      "Poison"
    ]
  },
  {
    "name": "Charmander",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Charmeleon",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Charizard",
    "types": [
      "Fire",
      "Flying"
    ]
  },
  {
    "name": "Squirtle",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Wartortle",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Blastoise",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Caterpie",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Metapod",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Butterfree",
    "types": [
      "Bug",
      "Flying"
    ]
  },
  {
    "name": "Weedle",
    "types": [
      "Bug",
      "Poison"
    ]
  },
  {
    "name": "Kakuna",
    "types": [
      "Bug",
      "Poison"
    ]
  },
  {
    "name": "Beedrill",
    "types": [
      "Bug",
      "Poison"
    ]
  },
  {
    "name": "Pidgey",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Pidgeotto",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Pidgeot",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Rattata",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Raticate",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Spearow",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Fearow",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Ekans",
    "types": [
      "Poison"
    ]
  },
  {
    "name": "Arbok",
    "types": [
      "Poison"
    ]
  },
  {
    "name": "Pikachu",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Raichu",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Sandshrew",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Sandslash",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Nidoran-f",
    "types": [
      "Poison"
    ]
  },
  {
    "name": "Nidorina",
    "types": [
      "Poison"
    ]
  },
  {
    "name": "Nidoqueen",
    "types": [
      "Poison",
      "Ground"
    ]
  },
  {
    "name": "Nidoran-m",
    "types": [
      "Poison"
    ]
  },
  {
    "name": "Nidorino",
    "types": [
      "Poison"
    ]
  },
  {
    "name": "Nidoking",
    "types": [
      "Poison",
      "Ground"
    ]
  },
  {
    "name": "Clefairy",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Clefable",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Vulpix",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Ninetales",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Jigglypuff",
    "types": [
      "Normal",
      "Fairy"
    ]
  },
  {
    "name": "Wigglytuff",
    "types": [
      "Normal",
      "Fairy"
    ]
  },
  {
    "name": "Zubat",
    "types": [
      "Poison",
      "Flying"
    ]
  },
  {
    "name": "Golbat",
    "types": [
      "Poison",
      "Flying"
    ]
  },
  {
    "name": "Oddish",
    "types": [
      "Grass",
      "Poison"
    ]
  },
  {
    "name": "Gloom",
    "types": [
      "Grass",
      "Poison"
    ]
  },
  {
    "name": "Vileplume",
    "types": [
      "Grass",
      "Poison"
    ]
  },
  {
    "name": "Paras",
    "types": [
      "Bug",
      "Grass"
    ]
  },
  {
    "name": "Parasect",
    "types": [
      "Bug",
      "Grass"
    ]
  },
  {
    "name": "Venonat",
    "types": [
      "Bug",
      "Poison"
    ]
  },
  {
    "name": "Venomoth",
    "types": [
      "Bug",
      "Poison"
    ]
  },
  {
    "name": "Diglett",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Dugtrio",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Meowth",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Persian",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Psyduck",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Golduck",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Mankey",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Primeape",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Growlithe",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Arcanine",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Poliwag",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Poliwhirl",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Poliwrath",
    "types": [
      "Water",
      "Fighting"
    ]
  },
  {
    "name": "Abra",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Kadabra",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Alakazam",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Machop",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Machoke",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Machamp",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Bellsprout",
    "types": [
      "Grass",
      "Poison"
    ]
  },
  {
    "name": "Weepinbell",
    "types": [
      "Grass",
      "Poison"
    ]
  },
  {
    "name": "Victreebel",
    "types": [
      "Grass",
      "Poison"
    ]
  },
  {
    "name": "Tentacool",
    "types": [
      "Water",
      "Poison"
    ]
  },
  {
    "name": "Tentacruel",
    "types": [
      "Water",
      "Poison"
    ]
  },
  {
    "name": "Geodude",
    "types": [
      "Rock",
      "Ground"
    ]
  },
  {
    "name": "Graveler",
    "types": [
      "Rock",
      "Ground"
    ]
  },
  {
    "name": "Golem",
    "types": [
      "Rock",
      "Ground"
    ]
  },
  {
    "name": "Ponyta",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Rapidash",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Slowpoke",
    "types": [
      "Water",
      "Psychic"
    ]
  },
  {
    "name": "Slowbro",
    "types": [
      "Water",
      "Psychic"
    ]
  },
  {
    "name": "Magnemite",
    "types": [
      "Electric",
      "Steel"
    ]
  },
  {
    "name": "Magneton",
    "types": [
      "Electric",
      "Steel"
    ]
  },
  {
    "name": "Farfetchd",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Doduo",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Dodrio",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Seel",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Dewgong",
    "types": [
      "Water",
      "Ice"
    ]
  },
  {
    "name": "Grimer",
    "types": [
      "Poison"
    ]
  },
  {
    "name": "Muk",
    "types": [
      "Poison"
    ]
  },
  {
    "name": "Shellder",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Cloyster",
    "types": [
      "Water",
      "Ice"
    ]
  },
  {
    "name": "Gastly",
    "types": [
      "Ghost",
      "Poison"
    ]
  },
  {
    "name": "Haunter",
    "types": [
      "Ghost",
      "Poison"
    ]
  },
  {
    "name": "Gengar",
    "types": [
      "Ghost",
      "Poison"
    ]
  },
  {
    "name": "Onix",
    "types": [
      "Rock",
      "Ground"
    ]
  },
  {
    "name": "Drowzee",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Hypno",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Krabby",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Kingler",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Voltorb",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Electrode",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Exeggcute",
    "types": [
      "Grass",
      "Psychic"
    ]
  },
  {
    "name": "Exeggutor",
    "types": [
      "Grass",
      "Psychic"
    ]
  },
  {
    "name": "Cubone",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Marowak",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Hitmonlee",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Hitmonchan",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Lickitung",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Koffing",
    "types": [
      "Poison"
    ]
  },
  {
    "name": "Weezing",
    "types": [
      "Poison"
    ]
  },
  {
    "name": "Rhyhorn",
    "types": [
      "Ground",
      "Rock"
    ]
  },
  {
    "name": "Rhydon",
    "types": [
      "Ground",
      "Rock"
    ]
  },
  {
    "name": "Chansey",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Tangela",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Kangaskhan",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Horsea",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Seadra",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Goldeen",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Seaking",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Staryu",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Starmie",
    "types": [
      "Water",
      "Psychic"
    ]
  },
  {
    "name": "Mr-mime",
    "types": [
      "Psychic",
      "Fairy"
    ]
  },
  {
    "name": "Scyther",
    "types": [
      "Bug",
      "Flying"
    ]
  },
  {
    "name": "Jynx",
    "types": [
      "Ice",
      "Psychic"
    ]
  },
  {
    "name": "Electabuzz",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Magmar",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Pinsir",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Tauros",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Magikarp",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Gyarados",
    "types": [
      "Water",
      "Flying"
    ]
  },
  {
    "name": "Lapras",
    "types": [
      "Water",
      "Ice"
    ]
  },
  {
    "name": "Ditto",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Eevee",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Vaporeon",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Jolteon",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Flareon",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Porygon",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Omanyte",
    "types": [
      "Rock",
      "Water"
    ]
  },
  {
    "name": "Omastar",
    "types": [
      "Rock",
      "Water"
    ]
  },
  {
    "name": "Kabuto",
    "types": [
      "Rock",
      "Water"
    ]
  },
  {
    "name": "Kabutops",
    "types": [
      "Rock",
      "Water"
    ]
  },
  {
    "name": "Aerodactyl",
    "types": [
      "Rock",
      "Flying"
    ]
  },
  {
    "name": "Snorlax",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Articuno",
    "types": [
      "Ice",
      "Flying"
    ]
  },
  {
    "name": "Zapdos",
    "types": [
      "Electric",
      "Flying"
    ]
  },
  {
    "name": "Moltres",
    "types": [
      "Fire",
      "Flying"
    ]
  },
  {
    "name": "Dratini",
    "types": [
      "Dragon"
    ]
  },
  {
    "name": "Dragonair",
    "types": [
      "Dragon"
    ]
  },
  {
    "name": "Dragonite",
    "types": [
      "Dragon",
      "Flying"
    ]
  },
  {
    "name": "Mewtwo",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Mew",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Chikorita",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Bayleef",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Meganium",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Cyndaquil",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Quilava",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Typhlosion",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Totodile",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Croconaw",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Feraligatr",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Sentret",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Furret",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Hoothoot",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Noctowl",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Ledyba",
    "types": [
      "Bug",
      "Flying"
    ]
  },
  {
    "name": "Ledian",
    "types": [
      "Bug",
      "Flying"
    ]
  },
  {
    "name": "Spinarak",
    "types": [
      "Bug",
      "Poison"
    ]
  },
  {
    "name": "Ariados",
    "types": [
      "Bug",
      "Poison"
    ]
  },
  {
    "name": "Crobat",
    "types": [
      "Poison",
      "Flying"
    ]
  },
  {
    "name": "Chinchou",
    "types": [
      "Water",
      "Electric"
    ]
  },
  {
    "name": "Lanturn",
    "types": [
      "Water",
      "Electric"
    ]
  },
  {
    "name": "Pichu",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Cleffa",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Igglybuff",
    "types": [
      "Normal",
      "Fairy"
    ]
  },
  {
    "name": "Togepi",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Togetic",
    "types": [
      "Fairy",
      "Flying"
    ]
  },
  {
    "name": "Natu",
    "types": [
      "Psychic",
      "Flying"
    ]
  },
  {
    "name": "Xatu",
    "types": [
      "Psychic",
      "Flying"
    ]
  },
  {
    "name": "Mareep",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Flaaffy",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Ampharos",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Bellossom",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Marill",
    "types": [
      "Water",
      "Fairy"
    ]
  },
  {
    "name": "Azumarill",
    "types": [
      "Water",
      "Fairy"
    ]
  },
  {
    "name": "Sudowoodo",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Politoed",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Hoppip",
    "types": [
      "Grass",
      "Flying"
    ]
  },
  {
    "name": "Skiploom",
    "types": [
      "Grass",
      "Flying"
    ]
  },
  {
    "name": "Jumpluff",
    "types": [
      "Grass",
      "Flying"
    ]
  },
  {
    "name": "Aipom",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Sunkern",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Sunflora",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Yanma",
    "types": [
      "Bug",
      "Flying"
    ]
  },
  {
    "name": "Wooper",
    "types": [
      "Water",
      "Ground"
    ]
  },
  {
    "name": "Quagsire",
    "types": [
      "Water",
      "Ground"
    ]
  },
  {
    "name": "Espeon",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Umbreon",
    "types": [
      "Dark"
    ]
  },
  {
    "name": "Murkrow",
    "types": [
      "Dark",
      "Flying"
    ]
  },
  {
    "name": "Slowking",
    "types": [
      "Water",
      "Psychic"
    ]
  },
  {
    "name": "Misdreavus",
    "types": [
      "Ghost"
    ]
  },
  {
    "name": "Unown",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Wobbuffet",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Girafarig",
    "types": [
      "Normal",
      "Psychic"
    ]
  },
  {
    "name": "Pineco",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Forretress",
    "types": [
      "Bug",
      "Steel"
    ]
  },
  {
    "name": "Dunsparce",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Gligar",
    "types": [
      "Ground",
      "Flying"
    ]
  },
  {
    "name": "Steelix",
    "types": [
      "Steel",
      "Ground"
    ]
  },
  {
    "name": "Snubbull",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Granbull",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Qwilfish",
    "types": [
      "Water",
      "Poison"
    ]
  },
  {
    "name": "Scizor",
    "types": [
      "Bug",
      "Steel"
    ]
  },
  {
    "name": "Shuckle",
    "types": [
      "Bug",
      "Rock"
    ]
  },
  {
    "name": "Heracross",
    "types": [
      "Bug",
      "Fighting"
    ]
  },
  {
    "name": "Sneasel",
    "types": [
      "Dark",
      "Ice"
    ]
  },
  {
    "name": "Teddiursa",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Ursaring",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Slugma",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Magcargo",
    "types": [
      "Fire",
      "Rock"
    ]
  },
  {
    "name": "Swinub",
    "types": [
      "Ice",
      "Ground"
    ]
  },
  {
    "name": "Piloswine",
    "types": [
      "Ice",
      "Ground"
    ]
  },
  {
    "name": "Corsola",
    "types": [
      "Water",
      "Rock"
    ]
  },
  {
    "name": "Remoraid",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Octillery",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Delibird",
    "types": [
      "Ice",
      "Flying"
    ]
  },
  {
    "name": "Mantine",
    "types": [
      "Water",
      "Flying"
    ]
  },
  {
    "name": "Skarmory",
    "types": [
      "Steel",
      "Flying"
    ]
  },
  {
    "name": "Houndour",
    "types": [
      "Dark",
      "Fire"
    ]
  },
  {
    "name": "Houndoom",
    "types": [
      "Dark",
      "Fire"
    ]
  },
  {
    "name": "Kingdra",
    "types": [
      "Water",
      "Dragon"
    ]
  },
  {
    "name": "Phanpy",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Donphan",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Porygon2",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Stantler",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Smeargle",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Tyrogue",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Hitmontop",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Smoochum",
    "types": [
      "Ice",
      "Psychic"
    ]
  },
  {
    "name": "Elekid",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Magby",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Miltank",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Blissey",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Raikou",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Entei",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Suicune",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Larvitar",
    "types": [
      "Rock",
      "Ground"
    ]
  },
  {
    "name": "Pupitar",
    "types": [
      "Rock",
      "Ground"
    ]
  },
  {
    "name": "Tyranitar",
    "types": [
      "Rock",
      "Dark"
    ]
  },
  {
    "name": "Lugia",
    "types": [
      "Psychic",
      "Flying"
    ]
  },
  {
    "name": "Ho-oh",
    "types": [
      "Fire",
      "Flying"
    ]
  },
  {
    "name": "Celebi",
    "types": [
      "Psychic",
      "Grass"
    ]
  },
  {
    "name": "Treecko",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Grovyle",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Sceptile",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Torchic",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Combusken",
    "types": [
      "Fire",
      "Fighting"
    ]
  },
  {
    "name": "Blaziken",
    "types": [
      "Fire",
      "Fighting"
    ]
  },
  {
    "name": "Mudkip",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Marshtomp",
    "types": [
      "Water",
      "Ground"
    ]
  },
  {
    "name": "Swampert",
    "types": [
      "Water",
      "Ground"
    ]
  },
  {
    "name": "Poochyena",
    "types": [
      "Dark"
    ]
  },
  {
    "name": "Mightyena",
    "types": [
      "Dark"
    ]
  },
  {
    "name": "Zigzagoon",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Linoone",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Wurmple",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Silcoon",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Beautifly",
    "types": [
      "Bug",
      "Flying"
    ]
  },
  {
    "name": "Cascoon",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Dustox",
    "types": [
      "Bug",
      "Poison"
    ]
  },
  {
    "name": "Lotad",
    "types": [
      "Water",
      "Grass"
    ]
  },
  {
    "name": "Lombre",
    "types": [
      "Water",
      "Grass"
    ]
  },
  {
    "name": "Ludicolo",
    "types": [
      "Water",
      "Grass"
    ]
  },
  {
    "name": "Seedot",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Nuzleaf",
    "types": [
      "Grass",
      "Dark"
    ]
  },
  {
    "name": "Shiftry",
    "types": [
      "Grass",
      "Dark"
    ]
  },
  {
    "name": "Taillow",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Swellow",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Wingull",
    "types": [
      "Water",
      "Flying"
    ]
  },
  {
    "name": "Pelipper",
    "types": [
      "Water",
      "Flying"
    ]
  },
  {
    "name": "Ralts",
    "types": [
      "Psychic",
      "Fairy"
    ]
  },
  {
    "name": "Kirlia",
    "types": [
      "Psychic",
      "Fairy"
    ]
  },
  {
    "name": "Gardevoir",
    "types": [
      "Psychic",
      "Fairy"
    ]
  },
  {
    "name": "Surskit",
    "types": [
      "Bug",
      "Water"
    ]
  },
  {
    "name": "Masquerain",
    "types": [
      "Bug",
      "Flying"
    ]
  },
  {
    "name": "Shroomish",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Breloom",
    "types": [
      "Grass",
      "Fighting"
    ]
  },
  {
    "name": "Slakoth",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Vigoroth",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Slaking",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Nincada",
    "types": [
      "Bug",
      "Ground"
    ]
  },
  {
    "name": "Ninjask",
    "types": [
      "Bug",
      "Flying"
    ]
  },
  {
    "name": "Shedinja",
    "types": [
      "Bug",
      "Ghost"
    ]
  },
  {
    "name": "Whismur",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Loudred",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Exploud",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Makuhita",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Hariyama",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Azurill",
    "types": [
      "Normal",
      "Fairy"
    ]
  },
  {
    "name": "Nosepass",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Skitty",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Delcatty",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Sableye",
    "types": [
      "Dark",
      "Ghost"
    ]
  },
  {
    "name": "Mawile",
    "types": [
      "Steel",
      "Fairy"
    ]
  },
  {
    "name": "Aron",
    "types": [
      "Steel",
      "Rock"
    ]
  },
  {
    "name": "Lairon",
    "types": [
      "Steel",
      "Rock"
    ]
  },
  {
    "name": "Aggron",
    "types": [
      "Steel",
      "Rock"
    ]
  },
  {
    "name": "Meditite",
    "types": [
      "Fighting",
      "Psychic"
    ]
  },
  {
    "name": "Medicham",
    "types": [
      "Fighting",
      "Psychic"
    ]
  },
  {
    "name": "Electrike",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Manectric",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Plusle",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Minun",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Volbeat",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Illumise",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Roselia",
    "types": [
      "Grass",
      "Poison"
    ]
  },
  {
    "name": "Gulpin",
    "types": [
      "Poison"
    ]
  },
  {
    "name": "Swalot",
    "types": [
      "Poison"
    ]
  },
  {
    "name": "Carvanha",
    "types": [
      "Water",
      "Dark"
    ]
  },
  {
    "name": "Sharpedo",
    "types": [
      "Water",
      "Dark"
    ]
  },
  {
    "name": "Wailmer",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Wailord",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Numel",
    "types": [
      "Fire",
      "Ground"
    ]
  },
  {
    "name": "Camerupt",
    "types": [
      "Fire",
      "Ground"
    ]
  },
  {
    "name": "Torkoal",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Spoink",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Grumpig",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Spinda",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Trapinch",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Vibrava",
    "types": [
      "Ground",
      "Dragon"
    ]
  },
  {
    "name": "Flygon",
    "types": [
      "Ground",
      "Dragon"
    ]
  },
  {
    "name": "Cacnea",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Cacturne",
    "types": [
      "Grass",
      "Dark"
    ]
  },
  {
    "name": "Swablu",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Altaria",
    "types": [
      "Dragon",
      "Flying"
    ]
  },
  {
    "name": "Zangoose",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Seviper",
    "types": [
      "Poison"
    ]
  },
  {
    "name": "Lunatone",
    "types": [
      "Rock",
      "Psychic"
    ]
  },
  {
    "name": "Solrock",
    "types": [
      "Rock",
      "Psychic"
    ]
  },
  {
    "name": "Barboach",
    "types": [
      "Water",
      "Ground"
    ]
  },
  {
    "name": "Whiscash",
    "types": [
      "Water",
      "Ground"
    ]
  },
  {
    "name": "Corphish",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Crawdaunt",
    "types": [
      "Water",
      "Dark"
    ]
  },
  {
    "name": "Baltoy",
    "types": [
      "Ground",
      "Psychic"
    ]
  },
  {
    "name": "Claydol",
    "types": [
      "Ground",
      "Psychic"
    ]
  },
  {
    "name": "Lileep",
    "types": [
      "Rock",
      "Grass"
    ]
  },
  {
    "name": "Cradily",
    "types": [
      "Rock",
      "Grass"
    ]
  },
  {
    "name": "Anorith",
    "types": [
      "Rock",
      "Bug"
    ]
  },
  {
    "name": "Armaldo",
    "types": [
      "Rock",
      "Bug"
    ]
  },
  {
    "name": "Feebas",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Milotic",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Castform",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Kecleon",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Shuppet",
    "types": [
      "Ghost"
    ]
  },
  {
    "name": "Banette",
    "types": [
      "Ghost"
    ]
  },
  {
    "name": "Duskull",
    "types": [
      "Ghost"
    ]
  },
  {
    "name": "Dusclops",
    "types": [
      "Ghost"
    ]
  },
  {
    "name": "Tropius",
    "types": [
      "Grass",
      "Flying"
    ]
  },
  {
    "name": "Chimecho",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Absol",
    "types": [
      "Dark"
    ]
  },
  {
    "name": "Wynaut",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Snorunt",
    "types": [
      "Ice"
    ]
  },
  {
    "name": "Glalie",
    "types": [
      "Ice"
    ]
  },
  {
    "name": "Spheal",
    "types": [
      "Ice",
      "Water"
    ]
  },
  {
    "name": "Sealeo",
    "types": [
      "Ice",
      "Water"
    ]
  },
  {
    "name": "Walrein",
    "types": [
      "Ice",
      "Water"
    ]
  },
  {
    "name": "Clamperl",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Huntail",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Gorebyss",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Relicanth",
    "types": [
      "Water",
      "Rock"
    ]
  },
  {
    "name": "Luvdisc",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Bagon",
    "types": [
      "Dragon"
    ]
  },
  {
    "name": "Shelgon",
    "types": [
      "Dragon"
    ]
  },
  {
    "name": "Salamence",
    "types": [
      "Dragon",
      "Flying"
    ]
  },
  {
    "name": "Beldum",
    "types": [
      "Steel",
      "Psychic"
    ]
  },
  {
    "name": "Metang",
    "types": [
      "Steel",
      "Psychic"
    ]
  },
  {
    "name": "Metagross",
    "types": [
      "Steel",
      "Psychic"
    ]
  },
  {
    "name": "Regirock",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Regice",
    "types": [
      "Ice"
    ]
  },
  {
    "name": "Registeel",
    "types": [
      "Steel"
    ]
  },
  {
    "name": "Latias",
    "types": [
      "Dragon",
      "Psychic"
    ]
  },
  {
    "name": "Latios",
    "types": [
      "Dragon",
      "Psychic"
    ]
  },
  {
    "name": "Kyogre",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Groudon",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Rayquaza",
    "types": [
      "Dragon",
      "Flying"
    ]
  },
  {
    "name": "Jirachi",
    "types": [
      "Steel",
      "Psychic"
    ]
  },
  {
    "name": "Deoxys-normal",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Turtwig",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Grotle",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Torterra",
    "types": [
      "Grass",
      "Ground"
    ]
  },
  {
    "name": "Chimchar",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Monferno",
    "types": [
      "Fire",
      "Fighting"
    ]
  },
  {
    "name": "Infernape",
    "types": [
      "Fire",
      "Fighting"
    ]
  },
  {
    "name": "Piplup",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Prinplup",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Empoleon",
    "types": [
      "Water",
      "Steel"
    ]
  },
  {
    "name": "Starly",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Staravia",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Staraptor",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Bidoof",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Bibarel",
    "types": [
      "Normal",
      "Water"
    ]
  },
  {
    "name": "Kricketot",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Kricketune",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Shinx",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Luxio",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Luxray",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Budew",
    "types": [
      "Grass",
      "Poison"
    ]
  },
  {
    "name": "Roserade",
    "types": [
      "Grass",
      "Poison"
    ]
  },
  {
    "name": "Cranidos",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Rampardos",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Shieldon",
    "types": [
      "Rock",
      "Steel"
    ]
  },
  {
    "name": "Bastiodon",
    "types": [
      "Rock",
      "Steel"
    ]
  },
  {
    "name": "Burmy",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Wormadam-plant",
    "types": [
      "Bug",
      "Grass"
    ]
  },
  {
    "name": "Mothim",
    "types": [
      "Bug",
      "Flying"
    ]
  },
  {
    "name": "Combee",
    "types": [
      "Bug",
      "Flying"
    ]
  },
  {
    "name": "Vespiquen",
    "types": [
      "Bug",
      "Flying"
    ]
  },
  {
    "name": "Pachirisu",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Buizel",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Floatzel",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Cherubi",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Cherrim",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Shellos",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Gastrodon",
    "types": [
      "Water",
      "Ground"
    ]
  },
  {
    "name": "Ambipom",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Drifloon",
    "types": [
      "Ghost",
      "Flying"
    ]
  },
  {
    "name": "Drifblim",
    "types": [
      "Ghost",
      "Flying"
    ]
  },
  {
    "name": "Buneary",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Lopunny",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Mismagius",
    "types": [
      "Ghost"
    ]
  },
  {
    "name": "Honchkrow",
    "types": [
      "Dark",
      "Flying"
    ]
  },
  {
    "name": "Glameow",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Purugly",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Chingling",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Stunky",
    "types": [
      "Poison",
      "Dark"
    ]
  },
  {
    "name": "Skuntank",
    "types": [
      "Poison",
      "Dark"
    ]
  },
  {
    "name": "Bronzor",
    "types": [
      "Steel",
      "Psychic"
    ]
  },
  {
    "name": "Bronzong",
    "types": [
      "Steel",
      "Psychic"
    ]
  },
  {
    "name": "Bonsly",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Mime-jr",
    "types": [
      "Psychic",
      "Fairy"
    ]
  },
  {
    "name": "Happiny",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Chatot",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Spiritomb",
    "types": [
      "Ghost",
      "Dark"
    ]
  },
  {
    "name": "Gible",
    "types": [
      "Dragon",
      "Ground"
    ]
  },
  {
    "name": "Gabite",
    "types": [
      "Dragon",
      "Ground"
    ]
  },
  {
    "name": "Garchomp",
    "types": [
      "Dragon",
      "Ground"
    ]
  },
  {
    "name": "Munchlax",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Riolu",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Lucario",
    "types": [
      "Fighting",
      "Steel"
    ]
  },
  {
    "name": "Hippopotas",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Hippowdon",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Skorupi",
    "types": [
      "Poison",
      "Bug"
    ]
  },
  {
    "name": "Drapion",
    "types": [
      "Poison",
      "Dark"
    ]
  },
  {
    "name": "Croagunk",
    "types": [
      "Poison",
      "Fighting"
    ]
  },
  {
    "name": "Toxicroak",
    "types": [
      "Poison",
      "Fighting"
    ]
  },
  {
    "name": "Carnivine",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Finneon",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Lumineon",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Mantyke",
    "types": [
      "Water",
      "Flying"
    ]
  },
  {
    "name": "Snover",
    "types": [
      "Grass",
      "Ice"
    ]
  },
  {
    "name": "Abomasnow",
    "types": [
      "Grass",
      "Ice"
    ]
  },
  {
    "name": "Weavile",
    "types": [
      "Dark",
      "Ice"
    ]
  },
  {
    "name": "Magnezone",
    "types": [
      "Electric",
      "Steel"
    ]
  },
  {
    "name": "Lickilicky",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Rhyperior",
    "types": [
      "Ground",
      "Rock"
    ]
  },
  {
    "name": "Tangrowth",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Electivire",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Magmortar",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Togekiss",
    "types": [
      "Fairy",
      "Flying"
    ]
  },
  {
    "name": "Yanmega",
    "types": [
      "Bug",
      "Flying"
    ]
  },
  {
    "name": "Leafeon",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Glaceon",
    "types": [
      "Ice"
    ]
  },
  {
    "name": "Gliscor",
    "types": [
      "Ground",
      "Flying"
    ]
  },
  {
    "name": "Mamoswine",
    "types": [
      "Ice",
      "Ground"
    ]
  },
  {
    "name": "Porygon-z",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Gallade",
    "types": [
      "Psychic",
      "Fighting"
    ]
  },
  {
    "name": "Probopass",
    "types": [
      "Rock",
      "Steel"
    ]
  },
  {
    "name": "Dusknoir",
    "types": [
      "Ghost"
    ]
  },
  {
    "name": "Froslass",
    "types": [
      "Ice",
      "Ghost"
    ]
  },
  {
    "name": "Rotom",
    "types": [
      "Electric",
      "Ghost"
    ]
  },
  {
    "name": "Uxie",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Mesprit",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Azelf",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Dialga",
    "types": [
      "Steel",
      "Dragon"
    ]
  },
  {
    "name": "Palkia",
    "types": [
      "Water",
      "Dragon"
    ]
  },
  {
    "name": "Heatran",
    "types": [
      "Fire",
      "Steel"
    ]
  },
  {
    "name": "Regigigas",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Giratina-altered",
    "types": [
      "Ghost",
      "Dragon"
    ]
  },
  {
    "name": "Cresselia",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Phione",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Manaphy",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Darkrai",
    "types": [
      "Dark"
    ]
  },
  {
    "name": "Shaymin-land",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Arceus",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Victini",
    "types": [
      "Psychic",
      "Fire"
    ]
  },
  {
    "name": "Snivy",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Servine",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Serperior",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Tepig",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Pignite",
    "types": [
      "Fire",
      "Fighting"
    ]
  },
  {
    "name": "Emboar",
    "types": [
      "Fire",
      "Fighting"
    ]
  },
  {
    "name": "Oshawott",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Dewott",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Samurott",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Patrat",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Watchog",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Lillipup",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Herdier",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Stoutland",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Purrloin",
    "types": [
      "Dark"
    ]
  },
  {
    "name": "Liepard",
    "types": [
      "Dark"
    ]
  },
  {
    "name": "Pansage",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Simisage",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Pansear",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Simisear",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Panpour",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Simipour",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Munna",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Musharna",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Pidove",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Tranquill",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Unfezant",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Blitzle",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Zebstrika",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Roggenrola",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Boldore",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Gigalith",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Woobat",
    "types": [
      "Psychic",
      "Flying"
    ]
  },
  {
    "name": "Swoobat",
    "types": [
      "Psychic",
      "Flying"
    ]
  },
  {
    "name": "Drilbur",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Excadrill",
    "types": [
      "Ground",
      "Steel"
    ]
  },
  {
    "name": "Audino",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Timburr",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Gurdurr",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Conkeldurr",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Tympole",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Palpitoad",
    "types": [
      "Water",
      "Ground"
    ]
  },
  {
    "name": "Seismitoad",
    "types": [
      "Water",
      "Ground"
    ]
  },
  {
    "name": "Throh",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Sawk",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Sewaddle",
    "types": [
      "Bug",
      "Grass"
    ]
  },
  {
    "name": "Swadloon",
    "types": [
      "Bug",
      "Grass"
    ]
  },
  {
    "name": "Leavanny",
    "types": [
      "Bug",
      "Grass"
    ]
  },
  {
    "name": "Venipede",
    "types": [
      "Bug",
      "Poison"
    ]
  },
  {
    "name": "Whirlipede",
    "types": [
      "Bug",
      "Poison"
    ]
  },
  {
    "name": "Scolipede",
    "types": [
      "Bug",
      "Poison"
    ]
  },
  {
    "name": "Cottonee",
    "types": [
      "Grass",
      "Fairy"
    ]
  },
  {
    "name": "Whimsicott",
    "types": [
      "Grass",
      "Fairy"
    ]
  },
  {
    "name": "Petilil",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Lilligant",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Basculin-red-striped",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Sandile",
    "types": [
      "Ground",
      "Dark"
    ]
  },
  {
    "name": "Krokorok",
    "types": [
      "Ground",
      "Dark"
    ]
  },
  {
    "name": "Krookodile",
    "types": [
      "Ground",
      "Dark"
    ]
  },
  {
    "name": "Darumaka",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Darmanitan-standard",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Maractus",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Dwebble",
    "types": [
      "Bug",
      "Rock"
    ]
  },
  {
    "name": "Crustle",
    "types": [
      "Bug",
      "Rock"
    ]
  },
  {
    "name": "Scraggy",
    "types": [
      "Dark",
      "Fighting"
    ]
  },
  {
    "name": "Scrafty",
    "types": [
      "Dark",
      "Fighting"
    ]
  },
  {
    "name": "Sigilyph",
    "types": [
      "Psychic",
      "Flying"
    ]
  },
  {
    "name": "Yamask",
    "types": [
      "Ghost"
    ]
  },
  {
    "name": "Cofagrigus",
    "types": [
      "Ghost"
    ]
  },
  {
    "name": "Tirtouga",
    "types": [
      "Water",
      "Rock"
    ]
  },
  {
    "name": "Carracosta",
    "types": [
      "Water",
      "Rock"
    ]
  },
  {
    "name": "Archen",
    "types": [
      "Rock",
      "Flying"
    ]
  },
  {
    "name": "Archeops",
    "types": [
      "Rock",
      "Flying"
    ]
  },
  {
    "name": "Trubbish",
    "types": [
      "Poison"
    ]
  },
  {
    "name": "Garbodor",
    "types": [
      "Poison"
    ]
  },
  {
    "name": "Zorua",
    "types": [
      "Dark"
    ]
  },
  {
    "name": "Zoroark",
    "types": [
      "Dark"
    ]
  },
  {
    "name": "Minccino",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Cinccino",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Gothita",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Gothorita",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Gothitelle",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Solosis",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Duosion",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Reuniclus",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Ducklett",
    "types": [
      "Water",
      "Flying"
    ]
  },
  {
    "name": "Swanna",
    "types": [
      "Water",
      "Flying"
    ]
  },
  {
    "name": "Vanillite",
    "types": [
      "Ice"
    ]
  },
  {
    "name": "Vanillish",
    "types": [
      "Ice"
    ]
  },
  {
    "name": "Vanilluxe",
    "types": [
      "Ice"
    ]
  },
  {
    "name": "Deerling",
    "types": [
      "Normal",
      "Grass"
    ]
  },
  {
    "name": "Sawsbuck",
    "types": [
      "Normal",
      "Grass"
    ]
  },
  {
    "name": "Emolga",
    "types": [
      "Electric",
      "Flying"
    ]
  },
  {
    "name": "Karrablast",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Escavalier",
    "types": [
      "Bug",
      "Steel"
    ]
  },
  {
    "name": "Foongus",
    "types": [
      "Grass",
      "Poison"
    ]
  },
  {
    "name": "Amoonguss",
    "types": [
      "Grass",
      "Poison"
    ]
  },
  {
    "name": "Frillish",
    "types": [
      "Water",
      "Ghost"
    ]
  },
  {
    "name": "Jellicent",
    "types": [
      "Water",
      "Ghost"
    ]
  },
  {
    "name": "Alomomola",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Joltik",
    "types": [
      "Bug",
      "Electric"
    ]
  },
  {
    "name": "Galvantula",
    "types": [
      "Bug",
      "Electric"
    ]
  },
  {
    "name": "Ferroseed",
    "types": [
      "Grass",
      "Steel"
    ]
  },
  {
    "name": "Ferrothorn",
    "types": [
      "Grass",
      "Steel"
    ]
  },
  {
    "name": "Klink",
    "types": [
      "Steel"
    ]
  },
  {
    "name": "Klang",
    "types": [
      "Steel"
    ]
  },
  {
    "name": "Klinklang",
    "types": [
      "Steel"
    ]
  },
  {
    "name": "Tynamo",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Eelektrik",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Eelektross",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Elgyem",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Beheeyem",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Litwick",
    "types": [
      "Ghost",
      "Fire"
    ]
  },
  {
    "name": "Lampent",
    "types": [
      "Ghost",
      "Fire"
    ]
  },
  {
    "name": "Chandelure",
    "types": [
      "Ghost",
      "Fire"
    ]
  },
  {
    "name": "Axew",
    "types": [
      "Dragon"
    ]
  },
  {
    "name": "Fraxure",
    "types": [
      "Dragon"
    ]
  },
  {
    "name": "Haxorus",
    "types": [
      "Dragon"
    ]
  },
  {
    "name": "Cubchoo",
    "types": [
      "Ice"
    ]
  },
  {
    "name": "Beartic",
    "types": [
      "Ice"
    ]
  },
  {
    "name": "Cryogonal",
    "types": [
      "Ice"
    ]
  },
  {
    "name": "Shelmet",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Accelgor",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Stunfisk",
    "types": [
      "Ground",
      "Electric"
    ]
  },
  {
    "name": "Mienfoo",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Mienshao",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Druddigon",
    "types": [
      "Dragon"
    ]
  },
  {
    "name": "Golett",
    "types": [
      "Ground",
      "Ghost"
    ]
  },
  {
    "name": "Golurk",
    "types": [
      "Ground",
      "Ghost"
    ]
  },
  {
    "name": "Pawniard",
    "types": [
      "Dark",
      "Steel"
    ]
  },
  {
    "name": "Bisharp",
    "types": [
      "Dark",
      "Steel"
    ]
  },
  {
    "name": "Bouffalant",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Rufflet",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Braviary",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Vullaby",
    "types": [
      "Dark",
      "Flying"
    ]
  },
  {
    "name": "Mandibuzz",
    "types": [
      "Dark",
      "Flying"
    ]
  },
  {
    "name": "Heatmor",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Durant",
    "types": [
      "Bug",
      "Steel"
    ]
  },
  {
    "name": "Deino",
    "types": [
      "Dark",
      "Dragon"
    ]
  },
  {
    "name": "Zweilous",
    "types": [
      "Dark",
      "Dragon"
    ]
  },
  {
    "name": "Hydreigon",
    "types": [
      "Dark",
      "Dragon"
    ]
  },
  {
    "name": "Larvesta",
    "types": [
      "Bug",
      "Fire"
    ]
  },
  {
    "name": "Volcarona",
    "types": [
      "Bug",
      "Fire"
    ]
  },
  {
    "name": "Cobalion",
    "types": [
      "Steel",
      "Fighting"
    ]
  },
  {
    "name": "Terrakion",
    "types": [
      "Rock",
      "Fighting"
    ]
  },
  {
    "name": "Virizion",
    "types": [
      "Grass",
      "Fighting"
    ]
  },
  {
    "name": "Tornadus-incarnate",
    "types": [
      "Flying"
    ]
  },
  {
    "name": "Thundurus-incarnate",
    "types": [
      "Electric",
      "Flying"
    ]
  },
  {
    "name": "Reshiram",
    "types": [
      "Dragon",
      "Fire"
    ]
  },
  {
    "name": "Zekrom",
    "types": [
      "Dragon",
      "Electric"
    ]
  },
  {
    "name": "Landorus-incarnate",
    "types": [
      "Ground",
      "Flying"
    ]
  },
  {
    "name": "Kyurem",
    "types": [
      "Dragon",
      "Ice"
    ]
  },
  {
    "name": "Keldeo-ordinary",
    "types": [
      "Water",
      "Fighting"
    ]
  },
  {
    "name": "Meloetta-aria",
    "types": [
      "Normal",
      "Psychic"
    ]
  },
  {
    "name": "Genesect",
    "types": [
      "Bug",
      "Steel"
    ]
  },
  {
    "name": "Chespin",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Quilladin",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Chesnaught",
    "types": [
      "Grass",
      "Fighting"
    ]
  },
  {
    "name": "Fennekin",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Braixen",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Delphox",
    "types": [
      "Fire",
      "Psychic"
    ]
  },
  {
    "name": "Froakie",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Frogadier",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Greninja",
    "types": [
      "Water",
      "Dark"
    ]
  },
  {
    "name": "Bunnelby",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Diggersby",
    "types": [
      "Normal",
      "Ground"
    ]
  },
  {
    "name": "Fletchling",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Fletchinder",
    "types": [
      "Fire",
      "Flying"
    ]
  },
  {
    "name": "Talonflame",
    "types": [
      "Fire",
      "Flying"
    ]
  },
  {
    "name": "Scatterbug",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Spewpa",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Vivillon",
    "types": [
      "Bug",
      "Flying"
    ]
  },
  {
    "name": "Litleo",
    "types": [
      "Fire",
      "Normal"
    ]
  },
  {
    "name": "Pyroar",
    "types": [
      "Fire",
      "Normal"
    ]
  },
  {
    "name": "Flabebe",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Floette",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Florges",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Skiddo",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Gogoat",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Pancham",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Pangoro",
    "types": [
      "Fighting",
      "Dark"
    ]
  },
  {
    "name": "Furfrou",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Espurr",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Meowstic-male",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Honedge",
    "types": [
      "Steel",
      "Ghost"
    ]
  },
  {
    "name": "Doublade",
    "types": [
      "Steel",
      "Ghost"
    ]
  },
  {
    "name": "Aegislash-shield",
    "types": [
      "Steel",
      "Ghost"
    ]
  },
  {
    "name": "Spritzee",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Aromatisse",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Swirlix",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Slurpuff",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Inkay",
    "types": [
      "Dark",
      "Psychic"
    ]
  },
  {
    "name": "Malamar",
    "types": [
      "Dark",
      "Psychic"
    ]
  },
  {
    "name": "Binacle",
    "types": [
      "Rock",
      "Water"
    ]
  },
  {
    "name": "Barbaracle",
    "types": [
      "Rock",
      "Water"
    ]
  },
  {
    "name": "Skrelp",
    "types": [
      "Poison",
      "Water"
    ]
  },
  {
    "name": "Dragalge",
    "types": [
      "Poison",
      "Dragon"
    ]
  },
  {
    "name": "Clauncher",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Clawitzer",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Helioptile",
    "types": [
      "Electric",
      "Normal"
    ]
  },
  {
    "name": "Heliolisk",
    "types": [
      "Electric",
      "Normal"
    ]
  },
  {
    "name": "Tyrunt",
    "types": [
      "Rock",
      "Dragon"
    ]
  },
  {
    "name": "Tyrantrum",
    "types": [
      "Rock",
      "Dragon"
    ]
  },
  {
    "name": "Amaura",
    "types": [
      "Rock",
      "Ice"
    ]
  },
  {
    "name": "Aurorus",
    "types": [
      "Rock",
      "Ice"
    ]
  },
  {
    "name": "Sylveon",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Hawlucha",
    "types": [
      "Fighting",
      "Flying"
    ]
  },
  {
    "name": "Dedenne",
    "types": [
      "Electric",
      "Fairy"
    ]
  },
  {
    "name": "Carbink",
    "types": [
      "Rock",
      "Fairy"
    ]
  },
  {
    "name": "Goomy",
    "types": [
      "Dragon"
    ]
  },
  {
    "name": "Sliggoo",
    "types": [
      "Dragon"
    ]
  },
  {
    "name": "Goodra",
    "types": [
      "Dragon"
    ]
  },
  {
    "name": "Klefki",
    "types": [
      "Steel",
      "Fairy"
    ]
  },
  {
    "name": "Phantump",
    "types": [
      "Ghost",
      "Grass"
    ]
  },
  {
    "name": "Trevenant",
    "types": [
      "Ghost",
      "Grass"
    ]
  },
  {
    "name": "Pumpkaboo-average",
    "types": [
      "Ghost",
      "Grass"
    ]
  },
  {
    "name": "Gourgeist-average",
    "types": [
      "Ghost",
      "Grass"
    ]
  },
  {
    "name": "Bergmite",
    "types": [
      "Ice"
    ]
  },
  {
    "name": "Avalugg",
    "types": [
      "Ice"
    ]
  },
  {
    "name": "Noibat",
    "types": [
      "Flying",
      "Dragon"
    ]
  },
  {
    "name": "Noivern",
    "types": [
      "Flying",
      "Dragon"
    ]
  },
  {
    "name": "Xerneas",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Yveltal",
    "types": [
      "Dark",
      "Flying"
    ]
  },
  {
    "name": "Zygarde-50",
    "types": [
      "Dragon",
      "Ground"
    ]
  },
  {
    "name": "Diancie",
    "types": [
      "Rock",
      "Fairy"
    ]
  },
  {
    "name": "Hoopa",
    "types": [
      "Psychic",
      "Ghost"
    ]
  },
  {
    "name": "Volcanion",
    "types": [
      "Fire",
      "Water"
    ]
  },
  {
    "name": "Rowlet",
    "types": [
      "Grass",
      "Flying"
    ]
  },
  {
    "name": "Dartrix",
    "types": [
      "Grass",
      "Flying"
    ]
  },
  {
    "name": "Decidueye",
    "types": [
      "Grass",
      "Ghost"
    ]
  },
  {
    "name": "Litten",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Torracat",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Incineroar",
    "types": [
      "Fire",
      "Dark"
    ]
  },
  {
    "name": "Popplio",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Brionne",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Primarina",
    "types": [
      "Water",
      "Fairy"
    ]
  },
  {
    "name": "Pikipek",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Trumbeak",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Toucannon",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Yungoos",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Gumshoos",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Grubbin",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Charjabug",
    "types": [
      "Bug",
      "Electric"
    ]
  },
  {
    "name": "Vikavolt",
    "types": [
      "Bug",
      "Electric"
    ]
  },
  {
    "name": "Crabrawler",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Crabominable",
    "types": [
      "Fighting",
      "Ice"
    ]
  },
  {
    "name": "Oricorio-baile",
    "types": [
      "Fire",
      "Flying"
    ]
  },
  {
    "name": "Cutiefly",
    "types": [
      "Bug",
      "Fairy"
    ]
  },
  {
    "name": "Ribombee",
    "types": [
      "Bug",
      "Fairy"
    ]
  },
  {
    "name": "Rockruff",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Lycanroc-midday",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Wishiwashi-solo",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Mareanie",
    "types": [
      "Poison",
      "Water"
    ]
  },
  {
    "name": "Toxapex",
    "types": [
      "Poison",
      "Water"
    ]
  },
  {
    "name": "Mudbray",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Mudsdale",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Dewpider",
    "types": [
      "Water",
      "Bug"
    ]
  },
  {
    "name": "Araquanid",
    "types": [
      "Water",
      "Bug"
    ]
  },
  {
    "name": "Fomantis",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Lurantis",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Morelull",
    "types": [
      "Grass",
      "Fairy"
    ]
  },
  {
    "name": "Shiinotic",
    "types": [
      "Grass",
      "Fairy"
    ]
  },
  {
    "name": "Salandit",
    "types": [
      "Poison",
      "Fire"
    ]
  },
  {
    "name": "Salazzle",
    "types": [
      "Poison",
      "Fire"
    ]
  },
  {
    "name": "Stufful",
    "types": [
      "Normal",
      "Fighting"
    ]
  },
  {
    "name": "Bewear",
    "types": [
      "Normal",
      "Fighting"
    ]
  },
  {
    "name": "Bounsweet",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Steenee",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Tsareena",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Comfey",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Oranguru",
    "types": [
      "Normal",
      "Psychic"
    ]
  },
  {
    "name": "Passimian",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Wimpod",
    "types": [
      "Bug",
      "Water"
    ]
  },
  {
    "name": "Golisopod",
    "types": [
      "Bug",
      "Water"
    ]
  },
  {
    "name": "Sandygast",
    "types": [
      "Ghost",
      "Ground"
    ]
  },
  {
    "name": "Palossand",
    "types": [
      "Ghost",
      "Ground"
    ]
  },
  {
    "name": "Pyukumuku",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Type-null",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Silvally",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Minior-red-meteor",
    "types": [
      "Rock",
      "Flying"
    ]
  },
  {
    "name": "Komala",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Turtonator",
    "types": [
      "Fire",
      "Dragon"
    ]
  },
  {
    "name": "Togedemaru",
    "types": [
      "Electric",
      "Steel"
    ]
  },
  {
    "name": "Mimikyu-disguised",
    "types": [
      "Ghost",
      "Fairy"
    ]
  },
  {
    "name": "Bruxish",
    "types": [
      "Water",
      "Psychic"
    ]
  },
  {
    "name": "Drampa",
    "types": [
      "Normal",
      "Dragon"
    ]
  },
  {
    "name": "Dhelmise",
    "types": [
      "Ghost",
      "Grass"
    ]
  },
  {
    "name": "Jangmo-o",
    "types": [
      "Dragon"
    ]
  },
  {
    "name": "Hakamo-o",
    "types": [
      "Dragon",
      "Fighting"
    ]
  },
  {
    "name": "Kommo-o",
    "types": [
      "Dragon",
      "Fighting"
    ]
  },
  {
    "name": "Tapu-koko",
    "types": [
      "Electric",
      "Fairy"
    ]
  },
  {
    "name": "Tapu-lele",
    "types": [
      "Psychic",
      "Fairy"
    ]
  },
  {
    "name": "Tapu-bulu",
    "types": [
      "Grass",
      "Fairy"
    ]
  },
  {
    "name": "Tapu-fini",
    "types": [
      "Water",
      "Fairy"
    ]
  },
  {
    "name": "Cosmog",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Cosmoem",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Solgaleo",
    "types": [
      "Psychic",
      "Steel"
    ]
  },
  {
    "name": "Lunala",
    "types": [
      "Psychic",
      "Ghost"
    ]
  },
  {
    "name": "Nihilego",
    "types": [
      "Rock",
      "Poison"
    ]
  },
  {
    "name": "Buzzwole",
    "types": [
      "Bug",
      "Fighting"
    ]
  },
  {
    "name": "Pheromosa",
    "types": [
      "Bug",
      "Fighting"
    ]
  },
  {
    "name": "Xurkitree",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Celesteela",
    "types": [
      "Steel",
      "Flying"
    ]
  },
  {
    "name": "Kartana",
    "types": [
      "Grass",
      "Steel"
    ]
  },
  {
    "name": "Guzzlord",
    "types": [
      "Dark",
      "Dragon"
    ]
  },
  {
    "name": "Necrozma",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Magearna",
    "types": [
      "Steel",
      "Fairy"
    ]
  },
  {
    "name": "Marshadow",
    "types": [
      "Fighting",
      "Ghost"
    ]
  },
  {
    "name": "Poipole",
    "types": [
      "Poison"
    ]
  },
  {
    "name": "Naganadel",
    "types": [
      "Poison",
      "Dragon"
    ]
  },
  {
    "name": "Stakataka",
    "types": [
      "Rock",
      "Steel"
    ]
  },
  {
    "name": "Blacephalon",
    "types": [
      "Fire",
      "Ghost"
    ]
  },
  {
    "name": "Zeraora",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Meltan",
    "types": [
      "Steel"
    ]
  },
  {
    "name": "Melmetal",
    "types": [
      "Steel"
    ]
  },
  {
    "name": "Grookey",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Thwackey",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Rillaboom",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Scorbunny",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Raboot",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Cinderace",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Sobble",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Drizzile",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Inteleon",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Skwovet",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Greedent",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Rookidee",
    "types": [
      "Flying"
    ]
  },
  {
    "name": "Corvisquire",
    "types": [
      "Flying"
    ]
  },
  {
    "name": "Corviknight",
    "types": [
      "Flying",
      "Steel"
    ]
  },
  {
    "name": "Blipbug",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Dottler",
    "types": [
      "Bug",
      "Psychic"
    ]
  },
  {
    "name": "Orbeetle",
    "types": [
      "Bug",
      "Psychic"
    ]
  },
  {
    "name": "Nickit",
    "types": [
      "Dark"
    ]
  },
  {
    "name": "Thievul",
    "types": [
      "Dark"
    ]
  },
  {
    "name": "Gossifleur",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Eldegoss",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Wooloo",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Dubwool",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Chewtle",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Drednaw",
    "types": [
      "Water",
      "Rock"
    ]
  },
  {
    "name": "Yamper",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Boltund",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Rolycoly",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Carkol",
    "types": [
      "Rock",
      "Fire"
    ]
  },
  {
    "name": "Coalossal",
    "types": [
      "Rock",
      "Fire"
    ]
  },
  {
    "name": "Applin",
    "types": [
      "Grass",
      "Dragon"
    ]
  },
  {
    "name": "Flapple",
    "types": [
      "Grass",
      "Dragon"
    ]
  },
  {
    "name": "Appletun",
    "types": [
      "Grass",
      "Dragon"
    ]
  },
  {
    "name": "Silicobra",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Sandaconda",
    "types": [
      "Ground"
    ]
  },
  {
    "name": "Cramorant",
    "types": [
      "Flying",
      "Water"
    ]
  },
  {
    "name": "Arrokuda",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Barraskewda",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Toxel",
    "types": [
      "Electric",
      "Poison"
    ]
  },
  {
    "name": "Toxtricity-amped",
    "types": [
      "Electric",
      "Poison"
    ]
  },
  {
    "name": "Sizzlipede",
    "types": [
      "Fire",
      "Bug"
    ]
  },
  {
    "name": "Centiskorch",
    "types": [
      "Fire",
      "Bug"
    ]
  },
  {
    "name": "Clobbopus",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Grapploct",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Sinistea",
    "types": [
      "Ghost"
    ]
  },
  {
    "name": "Polteageist",
    "types": [
      "Ghost"
    ]
  },
  {
    "name": "Hatenna",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Hattrem",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Hatterene",
    "types": [
      "Psychic",
      "Fairy"
    ]
  },
  {
    "name": "Impidimp",
    "types": [
      "Dark",
      "Fairy"
    ]
  },
  {
    "name": "Morgrem",
    "types": [
      "Dark",
      "Fairy"
    ]
  },
  {
    "name": "Grimmsnarl",
    "types": [
      "Dark",
      "Fairy"
    ]
  },
  {
    "name": "Obstagoon",
    "types": [
      "Dark",
      "Normal"
    ]
  },
  {
    "name": "Perrserker",
    "types": [
      "Steel"
    ]
  },
  {
    "name": "Cursola",
    "types": [
      "Ghost"
    ]
  },
  {
    "name": "Sirfetchd",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Mr-rime",
    "types": [
      "Ice",
      "Psychic"
    ]
  },
  {
    "name": "Runerigus",
    "types": [
      "Ground",
      "Ghost"
    ]
  },
  {
    "name": "Milcery",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Alcremie",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Falinks",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Pincurchin",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Snom",
    "types": [
      "Ice",
      "Bug"
    ]
  },
  {
    "name": "Frosmoth",
    "types": [
      "Ice",
      "Bug"
    ]
  },
  {
    "name": "Stonjourner",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Eiscue-ice",
    "types": [
      "Ice"
    ]
  },
  {
    "name": "Indeedee-male",
    "types": [
      "Psychic",
      "Normal"
    ]
  },
  {
    "name": "Morpeko-full-belly",
    "types": [
      "Electric",
      "Dark"
    ]
  },
  {
    "name": "Cufant",
    "types": [
      "Steel"
    ]
  },
  {
    "name": "Copperajah",
    "types": [
      "Steel"
    ]
  },
  {
    "name": "Dracozolt",
    "types": [
      "Electric",
      "Dragon"
    ]
  },
  {
    "name": "Arctozolt",
    "types": [
      "Electric",
      "Ice"
    ]
  },
  {
    "name": "Dracovish",
    "types": [
      "Water",
      "Dragon"
    ]
  },
  {
    "name": "Arctovish",
    "types": [
      "Water",
      "Ice"
    ]
  },
  {
    "name": "Duraludon",
    "types": [
      "Steel",
      "Dragon"
    ]
  },
  {
    "name": "Dreepy",
    "types": [
      "Dragon",
      "Ghost"
    ]
  },
  {
    "name": "Drakloak",
    "types": [
      "Dragon",
      "Ghost"
    ]
  },
  {
    "name": "Dragapult",
    "types": [
      "Dragon",
      "Ghost"
    ]
  },
  {
    "name": "Zacian",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Zamazenta",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Eternatus",
    "types": [
      "Poison",
      "Dragon"
    ]
  },
  {
    "name": "Kubfu",
    "types": [
      "Fighting"
    ]
  },
  {
    "name": "Urshifu-single-strike",
    "types": [
      "Fighting",
      "Dark"
    ]
  },
  {
    "name": "Zarude",
    "types": [
      "Dark",
      "Grass"
    ]
  },
  {
    "name": "Regieleki",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Regidrago",
    "types": [
      "Dragon"
    ]
  },
  {
    "name": "Glastrier",
    "types": [
      "Ice"
    ]
  },
  {
    "name": "Spectrier",
    "types": [
      "Ghost"
    ]
  },
  {
    "name": "Calyrex",
    "types": [
      "Psychic",
      "Grass"
    ]
  },
  {
    "name": "Wyrdeer",
    "types": [
      "Normal",
      "Psychic"
    ]
  },
  {
    "name": "Kleavor",
    "types": [
      "Bug",
      "Rock"
    ]
  },
  {
    "name": "Ursaluna",
    "types": [
      "Ground",
      "Normal"
    ]
  },
  {
    "name": "Basculegion-male",
    "types": [
      "Water",
      "Ghost"
    ]
  },
  {
    "name": "Sneasler",
    "types": [
      "Fighting",
      "Poison"
    ]
  },
  {
    "name": "Overqwil",
    "types": [
      "Dark",
      "Poison"
    ]
  },
  {
    "name": "Enamorus-incarnate",
    "types": [
      "Fairy",
      "Flying"
    ]
  },
  {
    "name": "Sprigatito",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Floragato",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Meowscarada",
    "types": [
      "Grass",
      "Dark"
    ]
  },
  {
    "name": "Fuecoco",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Crocalor",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Skeledirge",
    "types": [
      "Fire",
      "Ghost"
    ]
  },
  {
    "name": "Quaxly",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Quaxwell",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Quaquaval",
    "types": [
      "Water",
      "Fighting"
    ]
  },
  {
    "name": "Lechonk",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Oinkologne-male",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Tarountula",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Spidops",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Nymble",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Lokix",
    "types": [
      "Bug",
      "Dark"
    ]
  },
  {
    "name": "Pawmi",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Pawmo",
    "types": [
      "Electric",
      "Fighting"
    ]
  },
  {
    "name": "Pawmot",
    "types": [
      "Electric",
      "Fighting"
    ]
  },
  {
    "name": "Tandemaus",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Maushold-family-of-four",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Fidough",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Dachsbun",
    "types": [
      "Fairy"
    ]
  },
  {
    "name": "Smoliv",
    "types": [
      "Grass",
      "Normal"
    ]
  },
  {
    "name": "Dolliv",
    "types": [
      "Grass",
      "Normal"
    ]
  },
  {
    "name": "Arboliva",
    "types": [
      "Grass",
      "Normal"
    ]
  },
  {
    "name": "Squawkabilly-green-plumage",
    "types": [
      "Normal",
      "Flying"
    ]
  },
  {
    "name": "Nacli",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Naclstack",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Garganacl",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Charcadet",
    "types": [
      "Fire"
    ]
  },
  {
    "name": "Armarouge",
    "types": [
      "Fire",
      "Psychic"
    ]
  },
  {
    "name": "Ceruledge",
    "types": [
      "Fire",
      "Ghost"
    ]
  },
  {
    "name": "Tadbulb",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Bellibolt",
    "types": [
      "Electric"
    ]
  },
  {
    "name": "Wattrel",
    "types": [
      "Electric",
      "Flying"
    ]
  },
  {
    "name": "Kilowattrel",
    "types": [
      "Electric",
      "Flying"
    ]
  },
  {
    "name": "Maschiff",
    "types": [
      "Dark"
    ]
  },
  {
    "name": "Mabosstiff",
    "types": [
      "Dark"
    ]
  },
  {
    "name": "Shroodle",
    "types": [
      "Poison",
      "Normal"
    ]
  },
  {
    "name": "Grafaiai",
    "types": [
      "Poison",
      "Normal"
    ]
  },
  {
    "name": "Bramblin",
    "types": [
      "Grass",
      "Ghost"
    ]
  },
  {
    "name": "Brambleghast",
    "types": [
      "Grass",
      "Ghost"
    ]
  },
  {
    "name": "Toedscool",
    "types": [
      "Ground",
      "Grass"
    ]
  },
  {
    "name": "Toedscruel",
    "types": [
      "Ground",
      "Grass"
    ]
  },
  {
    "name": "Klawf",
    "types": [
      "Rock"
    ]
  },
  {
    "name": "Capsakid",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Scovillain",
    "types": [
      "Grass",
      "Fire"
    ]
  },
  {
    "name": "Rellor",
    "types": [
      "Bug"
    ]
  },
  {
    "name": "Rabsca",
    "types": [
      "Bug",
      "Psychic"
    ]
  },
  {
    "name": "Flittle",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Espathra",
    "types": [
      "Psychic"
    ]
  },
  {
    "name": "Tinkatink",
    "types": [
      "Fairy",
      "Steel"
    ]
  },
  {
    "name": "Tinkatuff",
    "types": [
      "Fairy",
      "Steel"
    ]
  },
  {
    "name": "Tinkaton",
    "types": [
      "Fairy",
      "Steel"
    ]
  },
  {
    "name": "Wiglett",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Wugtrio",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Bombirdier",
    "types": [
      "Flying",
      "Dark"
    ]
  },
  {
    "name": "Finizen",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Palafin-zero",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Varoom",
    "types": [
      "Steel",
      "Poison"
    ]
  },
  {
    "name": "Revavroom",
    "types": [
      "Steel",
      "Poison"
    ]
  },
  {
    "name": "Cyclizar",
    "types": [
      "Dragon",
      "Normal"
    ]
  },
  {
    "name": "Orthworm",
    "types": [
      "Steel"
    ]
  },
  {
    "name": "Glimmet",
    "types": [
      "Rock",
      "Poison"
    ]
  },
  {
    "name": "Glimmora",
    "types": [
      "Rock",
      "Poison"
    ]
  },
  {
    "name": "Greavard",
    "types": [
      "Ghost"
    ]
  },
  {
    "name": "Houndstone",
    "types": [
      "Ghost"
    ]
  },
  {
    "name": "Flamigo",
    "types": [
      "Flying",
      "Fighting"
    ]
  },
  {
    "name": "Cetoddle",
    "types": [
      "Ice"
    ]
  },
  {
    "name": "Cetitan",
    "types": [
      "Ice"
    ]
  },
  {
    "name": "Veluza",
    "types": [
      "Water",
      "Psychic"
    ]
  },
  {
    "name": "Dondozo",
    "types": [
      "Water"
    ]
  },
  {
    "name": "Tatsugiri-curly",
    "types": [
      "Dragon",
      "Water"
    ]
  },
  {
    "name": "Annihilape",
    "types": [
      "Fighting",
      "Ghost"
    ]
  },
  {
    "name": "Clodsire",
    "types": [
      "Poison",
      "Ground"
    ]
  },
  {
    "name": "Farigiraf",
    "types": [
      "Normal",
      "Psychic"
    ]
  },
  {
    "name": "Dudunsparce-two-segment",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Kingambit",
    "types": [
      "Dark",
      "Steel"
    ]
  },
  {
    "name": "Great-tusk",
    "types": [
      "Ground",
      "Fighting"
    ]
  },
  {
    "name": "Scream-tail",
    "types": [
      "Fairy",
      "Psychic"
    ]
  },
  {
    "name": "Brute-bonnet",
    "types": [
      "Grass",
      "Dark"
    ]
  },
  {
    "name": "Flutter-mane",
    "types": [
      "Ghost",
      "Fairy"
    ]
  },
  {
    "name": "Slither-wing",
    "types": [
      "Bug",
      "Fighting"
    ]
  },
  {
    "name": "Sandy-shocks",
    "types": [
      "Electric",
      "Ground"
    ]
  },
  {
    "name": "Iron-treads",
    "types": [
      "Ground",
      "Steel"
    ]
  },
  {
    "name": "Iron-bundle",
    "types": [
      "Ice",
      "Water"
    ]
  },
  {
    "name": "Iron-hands",
    "types": [
      "Fighting",
      "Electric"
    ]
  },
  {
    "name": "Iron-jugulis",
    "types": [
      "Dark",
      "Flying"
    ]
  },
  {
    "name": "Iron-moth",
    "types": [
      "Fire",
      "Poison"
    ]
  },
  {
    "name": "Iron-thorns",
    "types": [
      "Rock",
      "Electric"
    ]
  },
  {
    "name": "Frigibax",
    "types": [
      "Dragon",
      "Ice"
    ]
  },
  {
    "name": "Arctibax",
    "types": [
      "Dragon",
      "Ice"
    ]
  },
  {
    "name": "Baxcalibur",
    "types": [
      "Dragon",
      "Ice"
    ]
  },
  {
    "name": "Gimmighoul",
    "types": [
      "Ghost"
    ]
  },
  {
    "name": "Gholdengo",
    "types": [
      "Steel",
      "Ghost"
    ]
  },
  {
    "name": "Wo-chien",
    "types": [
      "Dark",
      "Grass"
    ]
  },
  {
    "name": "Chien-pao",
    "types": [
      "Dark",
      "Ice"
    ]
  },
  {
    "name": "Ting-lu",
    "types": [
      "Dark",
      "Ground"
    ]
  },
  {
    "name": "Chi-yu",
    "types": [
      "Dark",
      "Fire"
    ]
  },
  {
    "name": "Roaring-moon",
    "types": [
      "Dragon",
      "Dark"
    ]
  },
  {
    "name": "Iron-valiant",
    "types": [
      "Fairy",
      "Fighting"
    ]
  },
  {
    "name": "Koraidon",
    "types": [
      "Fighting",
      "Dragon"
    ]
  },
  {
    "name": "Miraidon",
    "types": [
      "Electric",
      "Dragon"
    ]
  },
  {
    "name": "Walking-wake",
    "types": [
      "Water",
      "Dragon"
    ]
  },
  {
    "name": "Iron-leaves",
    "types": [
      "Grass",
      "Psychic"
    ]
  },
  {
    "name": "Dipplin",
    "types": [
      "Grass",
      "Dragon"
    ]
  },
  {
    "name": "Poltchageist",
    "types": [
      "Grass",
      "Ghost"
    ]
  },
  {
    "name": "Sinistcha",
    "types": [
      "Grass",
      "Ghost"
    ]
  },
  {
    "name": "Okidogi",
    "types": [
      "Poison",
      "Fighting"
    ]
  },
  {
    "name": "Munkidori",
    "types": [
      "Poison",
      "Psychic"
    ]
  },
  {
    "name": "Fezandipiti",
    "types": [
      "Poison",
      "Fairy"
    ]
  },
  {
    "name": "Ogerpon",
    "types": [
      "Grass"
    ]
  },
  {
    "name": "Archaludon",
    "types": [
      "Steel",
      "Dragon"
    ]
  },
  {
    "name": "Hydrapple",
    "types": [
      "Grass",
      "Dragon"
    ]
  },
  {
    "name": "Gouging-fire",
    "types": [
      "Fire",
      "Dragon"
    ]
  },
  {
    "name": "Raging-bolt",
    "types": [
      "Electric",
      "Dragon"
    ]
  },
  {
    "name": "Iron-boulder",
    "types": [
      "Rock",
      "Psychic"
    ]
  },
  {
    "name": "Iron-crown",
    "types": [
      "Steel",
      "Psychic"
    ]
  },
  {
    "name": "Terapagos",
    "types": [
      "Normal"
    ]
  },
  {
    "name": "Pecharunt",
    "types": [
      "Poison",
      "Ghost"
    ]
  }
];
