SITE_NAME = "Poketilities"
MY_NAME = "Arham"
TAGLINE = "Gotta make 'em all!"

NAV_LINKS = [
    ("Calculator", "calculator"),
    ("Who's That Pokemon?", "whos_that"),
    ("Pokedle", "pokedle"),
    ("Stat Battle", "pokedex_game"),
    ("Akinator", "akinator"),
    ("Pokedex", "pokedex_naming"),
    ("Team Builder", "team_builder"),
    ("Quiz", "quiz"),
    ("Favorites", "favorites"),
    ("Contact", "contact"),
    ("Multiplayer", "multiplayer_home"),
]

THEME = {
    "color-bg": "#0f1115",
    "color-bg-alt": "#1a1d24",
    "color-primary": "#ffcb05",
    "color-secondary": "#ca403b",
    "color-text": "#f4f4f4",
    "color-text-muted": "#9a9ca3",
    "font-heading": "Poppins, sans-serif",
    "font-body": "Inter, sans-serif",
    "radius": "12px",
}

FAVORITES = [
    {
        "name": "Rayquaza",
        "image_url": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png",
        "blurb": "Rayquaza is a Dragon/Flying-type Legendary that lives in the ozone layer, rarely coming down to the ground. As the mediator of Groudon and Kyogre's Gen 3 rivalry, it's one of the most iconic legendaries in the series, and can Mega Evolve without even needing a Mega Stone.",
        "video_id": "NaE6N1_KO5M"
    },
    {
        "name": "Lucario",
        "image_url": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png",
        "blurb": "Lucario is a Fighting/Steel-type that can sense the aura of any living thing, letting it read emotions and even see through solid objects. It shot to fame as the star of Pokémon: Lucario and the Mystery of Mew, and later became a Super Smash Bros. regular.",
        "video_id": "CAIdBoYKrRo"
    },
    {
        "name": "Greninja",
        "image_url": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/658.png",
        "blurb": "Greninja is a Water/Dark-type ninja Pokémon, the final evolution of Froakie and Ash's signature partner through the Kalos region. Its water shuriken and blistering speed made Ash-Greninja one of the most memorable transformations in the anime.",
        "video_id": "VaRldHkPR3A"
    },
    {
        "name": "Infernape",
        "image_url": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/392.png",
        "blurb": "Infernape is a Fire/Fighting-type, the final form of Chimchar and Ash's Sinnoh ace. Modeled after the Monkey King Sun Wukong, it fights with a flame-crowned intensity that made it one of Ash's most beloved partners.",
        "video_id": "CfnzJcxUnRg"
    },
    {
        "name": "Decidueye",
        "image_url": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/724.png",
        "blurb": "Decidueye is a Grass/Ghost-type archer Pokémon, the final evolution of Rowlet. Precise, silent, and deadly with its arrow quills, it's one of the standout Alola starters and a fan-favorite design.",
        "video_id": "UkhkSYE_ANQ"
    }
]

GENERATIONS = {
    "1": (1, 151),
    "2": (152, 251),
    "3": (252, 386),
    "4": (387, 493),
    "5": (494, 649),
    "6": (650, 721),
    "7": (722, 809),
    "8": (810, 905),
    "9": (906, 1025),
}

WHOS_THAT_SETTINGS = {
    "easyHintAfterWrongGuesses": 3,
    "hardTimerSeconds": 10,
    "livesCount": 3
}

MEGA_EVOLUTIONS = [
    # Original Gen 6 / ORAS Megas
    "venusaur-mega", "charizard-mega-x", "charizard-mega-y", "blastoise-mega",
    "alakazam-mega", "gengar-mega", "kangaskhan-mega", "pinsir-mega",
    "gyarados-mega", "aerodactyl-mega", "mewtwo-mega-x", "mewtwo-mega-y",
    "ampharos-mega", "scizor-mega", "heracross-mega", "houndoom-mega",
    "tyranitar-mega", "blaziken-mega", "gardevoir-mega", "mawile-mega",
    "aggron-mega", "medicham-mega", "manectric-mega", "banette-mega",
    "absol-mega", "garchomp-mega", "lucario-mega", "abomasnow-mega",
    "salamence-mega", "metagross-mega", "latias-mega", "latios-mega",
    "rayquaza-mega", "sableye-mega", "sharpedo-mega", "camerupt-mega",
    "altaria-mega", "glalie-mega", "diancie-mega",

    # New in Pokemon Legends Z-A (Oct 2025) — 23 of the 26, see chat note
    # on why Zygarde and Eternal Floette are left out for now
    "barbaracle-mega", "chandelure-mega", "chesnaught-mega", "clefable-mega",
    "delphox-mega", "dragalge-mega", "dragonite-mega", "drampa-mega",
    "eelektross-mega", "emboar-mega", "excadrill-mega", "falinks-mega",
    "feraligatr-mega", "froslass-mega", "greninja-mega", "hawlucha-mega",
    "malamar-mega", "meganium-mega", "pyroar-mega", "scolipede-mega",
    "scrafty-mega", "skarmory-mega", "starmie-mega", "victreebel-mega",
]

REGIONAL_FORMS = [
    "rattata-alola", "raticate-alola", "raichu-alola", "sandshrew-alola",
    "sandslash-alola", "vulpix-alola", "ninetales-alola", "diglett-alola",
    "dugtrio-alola", "meowth-alola", "persian-alola", "geodude-alola",
    "graveler-alola", "golem-alola", "grimer-alola", "muk-alola",
    "exeggutor-alola", "marowak-alola",
    "meowth-galar", "ponyta-galar", "rapidash-galar", "slowpoke-galar",
    "farfetchd-galar", "weezing-galar", "mr-mime-galar", "articuno-galar",
    "zapdos-galar", "moltres-galar", "slowbro-galar", "corsola-galar",
    "zigzagoon-galar", "linoone-galar", "darumaka-galar", "yamask-galar",
    "stunfisk-galar",
    "growlithe-hisui", "arcanine-hisui", "voltorb-hisui", "typhlosion-hisui",
    "qwilfish-hisui", "sneasel-hisui", "samurott-hisui", "lilligant-hisui",
    "zorua-hisui", "zoroark-hisui", "braviary-hisui", "sliggoo-hisui",
    "goodra-hisui", "avalugg-hisui", "decidueye-hisui",
] # used ai to compile these lists

TYPE_CHART = {
    "normal":   {"rock": 0.5, "ghost": 0, "steel": 0.5},
    "fire":     {"fire": 0.5, "water": 0.5, "grass": 2, "ice": 2, "bug": 2, "rock": 0.5, "dragon": 0.5, "steel": 2},
    "water":    {"fire": 2, "water": 0.5, "grass": 0.5, "ground": 2, "rock": 2, "dragon": 0.5},
    "electric": {"water": 2, "electric": 0.5, "grass": 0.5, "ground": 0, "flying": 2},
    "grass":    {"fire": 0.5, "water": 2, "grass": 0.5, "poison": 0.5, "ground": 2, "flying": "0.5", "bug": 0.5, "rock": 2, "dragon": 0.5, "steel": 0.5},
    "ice":      {"fire": 0.5, "water": 0.5, "grass": 2, "ice": 0.5, "ground": 2, "flying": 2, "dragon": 2, "steel": 0.5},
    "fighting": {"normal": 2, "ice": 2, "poison": 0.5, "flying": 0.5, "psychic": 0.5, "bug": 0.5, "rock": 2, "ghost": 0, "dark": 2, "steel": 2, "fairy": 0.5},
    "poison":   {"grass": 2, "poison": 0.5, "ground": 0.5, "rock": 0.5, "ghost": 0.5, "steel": 0, "fairy": 2},
    "ground":   {"fire": 2, "electric": 2, "grass": 0.5, "poison": 2, "flying": 0, "bug": 0.5, "rock": 2, "steel": 2},
    "flying":   {"electric": 0.5, "grass": 2, "fighting": 2, "bug": 2, "rock": 0.5, "steel": 0.5},
    "psychic":  {"fighting": 2, "poison": 2, "psychic": 0.5, "dark": 0, "steel": 0.5},
    "bug":      {"fire": 0.5, "grass": 2, "fighting": 0.5, "poison": 0.5, "flying": 0.5, "psychic": 2, "ghost": 0.5, "dark": 2, "steel": 0.5, "fairy": 0.5},
    "rock":     {"fire": 2, "ice": 2, "fighting": 0.5, "ground": 0.5, "flying": 2, "bug": 2, "steel": 0.5},
    "ghost":    {"normal": 0, "psychic": 2, "ghost": 2, "dark": 0.5},
    "dragon":   {"dragon": 2, "steel": 0.5, "fairy": 0},
    "dark":     {"fighting": 0.5, "psychic": 2, "ghost": 2, "dark": 0.5, "fairy": 0.5},
    "steel":    {"fire": 0.5, "water": 0.5, "electric": 0.5, "ice": 2, "rock": 2, "steel": 0.5, "fairy": 2},
    "fairy":    {"fire": 0.5, "fighting": 2, "poison": 0.5, "dragon": 2, "dark": 2, "steel": 0.5},
}

TYPE_COLORS = {
    "normal": "#A8A878", "fire": "#F08030", "water": "#6890F0", "electric": "#F8D030",
    "grass": "#78C850", "ice": "#98D8D8", "fighting": "#C03028", "poison": "#A040A0",
    "ground": "#E0C068", "flying": "#A890F0", "psychic": "#F85888", "bug": "#A8B820",
    "rock": "#B8A038", "ghost": "#705898", "dragon": "#7038F8", "dark": "#705848",
    "steel": "#B8B8D0", "fairy": "#EE99AC",
}

QUIZ_QUESTIONS = [
    {"question": "What type is Pikachu?", "options": ["Normal", "Electric", "Fairy", "Psychic"], "correct": 1},
    {"question": "What is Charizard's second type?", "options": ["Dragon", "Ground", "Flying", "Rock"], "correct": 2},
    {"question": "Which stat does the item Choice Scarf boost the use of?", "options": ["Attack", "Speed", "Defense", "HP"], "correct": 1},
    {"question": "What move does a Pokemon use to learn from an Egg passed down by its parents?", "options": ["TM Move", "Egg Move", "Tutor Move", "Level-up Move"], "correct": 1},
    {"question": "Which of these types resists Ghost-type moves?", "options": ["Psychic", "Normal", "Dark", "Ghost"], "correct": 2},
    {"question": "What is the maximum possible IV value for a single stat?", "options": ["31", "100", "252", "6"], "correct": 0},
    {"question": "Which Pokemon is known as the Pseudo-Legendary of Kanto?", "options": ["Snorlax", "Dragonite", "Gyarados", "Tyranitar"], "correct": 1},
    {"question": "What status condition prevents a Pokemon from using moves besides Struggle?", "options": ["Paralysis", "Confusion", "Full Restore", "Disable"], "correct": 3},
    {"question": "Which type of berry cures poison?", "options": ["Cheri Berry", "Pecha Berry", "Rawst Berry", "Chesto Berry"], "correct": 1},
    {"question": "How many badges are needed to enter the Pokemon League in a typical region?", "options": ["4", "6", "8", "12"], "correct": 2},
    {"question": "What is Eevee's evolution that requires a Water Stone?", "options": ["Jolteon", "Flareon", "Vaporeon", "Umbreon"], "correct": 2},
    {"question": "Which move has a base power that's always exactly enough to knock out the target?", "options": ["Guillotine", "False Swipe", "Explosion", "Self-Destruct"], "correct": 0},
    {"question": "What ability prevents a Pokemon from being statused by weather-related conditions like Sandstorm damage?", "options": ["Sand Veil", "Sand Force", "Sand Rush", "Magic Guard"], "correct": 3},
    {"question": "Which region introduced the Fairy type?", "options": ["Sinnoh", "Unova", "Kalos", "Alola"], "correct": 2},
    {"question": "What happens to a move's power when it's super effective?", "options": ["x1.5", "x2", "x3", "No change"], "correct": 1},






]

AKINATOR_POKEMON = [
    {"name": "bulbasaur", "types": ["grass", "poison"], "legendary": False, "starter": True, "gen": 1, "pseudo": False, "eeveelution": False},
    {"name": "charmander", "types": ["fire"], "legendary": False, "starter": True, "gen": 1, "pseudo": False, "eeveelution": False},
    {"name": "squirtle", "types": ["water"], "legendary": False, "starter": True, "gen": 1, "pseudo": False, "eeveelution": False},
    {"name": "chikorita", "types": ["grass"], "legendary": False, "starter": True, "gen": 2, "pseudo": False, "eeveelution": False},
    {"name": "torchic", "types": ["fire"], "legendary": False, "starter": True, "gen": 3, "pseudo": False, "eeveelution": False},
    {"name": "mudkip", "types": ["water"], "legendary": False, "starter": True, "gen": 3, "pseudo": False, "eeveelution": False},
    {"name": "piplup", "types": ["water"], "legendary": False, "starter": True, "gen": 4, "pseudo": False, "eeveelution": False},
    {"name": "pikachu", "types": ["electric"], "legendary": False, "starter": False, "gen": 1, "pseudo": False, "eeveelution": False},
    {"name": "eevee", "types": ["normal"], "legendary": False, "starter": False, "gen": 1, "pseudo": False, "eeveelution": True},
    {"name": "snorlax", "types": ["normal"], "legendary": False, "starter": False, "gen": 1, "pseudo": False, "eeveelution": False},
    {"name": "gengar", "types": ["ghost", "poison"], "legendary": False, "starter": False, "gen": 1, "pseudo": False, "eeveelution": False},
    {"name": "mewtwo", "types": ["psychic"], "legendary": True, "starter": False, "gen": 1, "pseudo": False, "eeveelution": False},
    {"name": "mew", "types": ["psychic"], "legendary": True, "starter": False, "gen": 1, "pseudo": False, "eeveelution": False},
    {"name": "charizard", "types": ["fire", "flying"], "legendary": False, "starter": False, "gen": 1, "pseudo": False, "eeveelution": False},
    {"name": "gyarados", "types": ["water", "flying"], "legendary": False, "starter": False, "gen": 1, "pseudo": False, "eeveelution": False},
    {"name": "dragonite", "types": ["dragon", "flying"], "legendary": False, "starter": False, "gen": 1, "pseudo": True, "eeveelution": False},
    {"name": "lucario", "types": ["fighting", "steel"], "legendary": False, "starter": False, "gen": 4, "pseudo": False, "eeveelution": False},
    {"name": "garchomp", "types": ["dragon", "ground"], "legendary": False, "starter": False, "gen": 4, "pseudo": True, "eeveelution": False},
    {"name": "greninja", "types": ["water", "dark"], "legendary": False, "starter": False, "gen": 6, "pseudo": False, "eeveelution": False},
    {"name": "rayquaza", "types": ["dragon", "flying"], "legendary": True, "starter": False, "gen": 3, "pseudo": False, "eeveelution": False},
    {"name": "lugia", "types": ["psychic", "flying"], "legendary": True, "starter": False, "gen": 2, "pseudo": False, "eeveelution": False},
    {"name": "ho-oh", "types": ["fire", "flying"], "legendary": True, "starter": False, "gen": 2, "pseudo": False, "eeveelution": False},
    {"name": "groudon", "types": ["ground"], "legendary": True, "starter": False, "gen": 3, "pseudo": False, "eeveelution": False},
    {"name": "kyogre", "types": ["water"], "legendary": True, "starter": False, "gen": 3, "pseudo": False, "eeveelution": False},
    {"name": "arceus", "types": ["normal"], "legendary": True, "starter": False, "gen": 4, "pseudo": False, "eeveelution": False},
    {"name": "zacian", "types": ["fairy"], "legendary": True, "starter": False, "gen": 8, "pseudo": False, "eeveelution": False},
    {"name": "zamazenta", "types": ["fighting"], "legendary": True, "starter": False, "gen": 8, "pseudo": False, "eeveelution": False},
    {"name": "gardevoir", "types": ["psychic", "fairy"], "legendary": False, "starter": False, "gen": 3, "pseudo": False, "eeveelution": False},
    {"name": "alakazam", "types": ["psychic"], "legendary": False, "starter": False, "gen": 1, "pseudo": False, "eeveelution": False},
    {"name": "machamp", "types": ["fighting"], "legendary": False, "starter": False, "gen": 1, "pseudo": False, "eeveelution": False},
    {"name": "blastoise", "types": ["water"], "legendary": False, "starter": False, "gen": 1, "pseudo": False, "eeveelution": False},
    {"name": "venusaur", "types": ["grass", "poison"], "legendary": False, "starter": False, "gen": 1, "pseudo": False, "eeveelution": False},
    {"name": "tyranitar", "types": ["rock", "dark"], "legendary": False, "starter": False, "gen": 2, "pseudo": True, "eeveelution": False},
    {"name": "metagross", "types": ["steel", "psychic"], "legendary": False, "starter": False, "gen": 3, "pseudo": True, "eeveelution": False},
    {"name": "salamence", "types": ["dragon", "flying"], "legendary": False, "starter": False, "gen": 3, "pseudo": True, "eeveelution": False},
    {"name": "umbreon", "types": ["dark"], "legendary": False, "starter": False, "gen": 2, "pseudo": False, "eeveelution": True},
    {"name": "sylveon", "types": ["fairy"], "legendary": False, "starter": False, "gen": 6, "pseudo": False, "eeveelution": True},
]

AKINATOR_MAX_QUESTIONS = 9