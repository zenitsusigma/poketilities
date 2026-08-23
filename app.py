import random
import string
import secrets
import sqlite3
import requests
from flask import Flask, render_template, jsonify, request, redirect, url_for, session
from flask_socketio import SocketIO, join_room, leave_room, emit
from config import SITE_NAME, MY_NAME, TAGLINE, NAV_LINKS, THEME, FAVORITES, GENERATIONS, WHOS_THAT_SETTINGS, MEGA_EVOLUTIONS, REGIONAL_FORMS, TYPE_CHART, TYPE_COLORS, QUIZ_QUESTIONS

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

socketio = SocketIO(app)

def generation_for_id(pokemon_id):
    for gen_key, (start, end) in GENERATIONS.items():
        if start <= pokemon_id <= end:
            return gen_key
    return None

DB_PATH = "poketilities.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_name TEXT NOT NULL,
            score INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

rooms = {}  # room_code -> room state, lives in memory while the server runs

def generate_room_code():
    while True:
        code = "".join(random.choices(string.ascii_uppercase, k=4))
        if code not in rooms:
            return code

def start_new_round(code):
    room = rooms[code]
    gen_key = random.choice(room["gens"])
    start, end = GENERATIONS[gen_key]
    pokemon_id = random.randint(start, end)
    response = requests.get(f"https://pokeapi.co/api/v2/pokemon/{pokemon_id}")
    data = response.json()

    room["current_answer"] = data["name"].lower()
    room["current_sprite"] = data["sprites"]["front_default"]
    room["round_active"] = True

    payload = {"sprite": room["current_sprite"]}
    if room["difficulty"] != "hard":
        payload["length"] = len(room["current_answer"])

    socketio.emit("round_start", payload, to=code)

@app.context_processor
def inject_globals():
    return dict(
        site_name=SITE_NAME,
        my_name=MY_NAME,
        tagline=TAGLINE,
        nav_links=NAV_LINKS,
        theme=THEME,
    )

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/calculator")
def calculator():
    return render_template("calculator.html", type_chart=TYPE_CHART, type_colors=TYPE_COLORS)

@app.route("/whos-that")
def whos_that():
    return render_template("whos_that.html", whos_that_settings=WHOS_THAT_SETTINGS, generations=GENERATIONS)

@app.route("/pokedle")
def pokedle():
    return render_template("pokedle.html", type_colors=TYPE_COLORS)

@app.route("/api/pokedle/new")
def pokedle_now():
    gen_key = random.choice(list(GENERATIONS.keys()))
    start, end = GENERATIONS[gen_key]
    pokemon_id = random.randint(start, end)

    response = requests.get(f"https://pokeapi.co/api/v2/pokemon/{pokemon_id}")
    data = response.json()

    types = [t["type"]["name"] for t in data["types"]]
    while len(types) < 2:
        types.append(None)

    session["pokedle_answer"] = {
        "id": data["id"],
        "name": data["name"],
        "types": types,
        "height": data["height"],
        "weight": data["weight"],
        "generation": generation_for_id(data["id"]),
    }
    session["pokedle_guess_count"] = 0

    return jsonify({"started": True})

@app.route("/api/pokedle/guess", methods=["POST"])
def pokedle_guess():
    answer = session.get("pokedle_answer")
    if not answer:
        return jsonify({"error": "No round in progress. Refresh to start a new one."}), 400

    body = request.get_json(silent=True) or {}
    guess_name = body.get("guess", "").strip().lower()
    if not guess_name:
        return jsonify({"error": "Type a Pokemon name first."}), 400

    response = requests.get(f"https://pokeapi.co/api/v2/pokemon/{guess_name}")
    if response.status_code != 200:
        return jsonify({"error": f'"{guess_name}" isn\'t a Pokemon I recognize \u2014 check the spelling.'}), 404

    data = response.json()
    guess_types = [t["type"]["name"] for t in data["types"]]
    while len(guess_types) < 2:
        guess_types.append(None)

    session["pokedle_guess_count"] = session.get("pokedle_guess_count", 0) + 1

    def type_status(guess_type, slot_index):
        if guess_type is None:
            return "absent"
        if answer["types"][slot_index] == guess_type:
            return "correct"
        if guess_type in answer["types"]:
            return "present"
        return "absent"

    def numeric_hint(guess_value, answer_value):
        if guess_value == answer_value:
            return "correct"
        return "up" if guess_value < answer_value else "down"

    correct = data["id"] == answer["id"]
    guess_gen = generation_for_id(data["id"])

    result = {
        "guessName": data["name"],
        "correct": correct,
        "guessCount": session["pokedle_guess_count"],
        "types": [
            {"value": guess_types[0], "status": type_status(guess_types[0], 0)},
            {"value": guess_types[1], "status": type_status(guess_types[1], 1)},
        ],
        "generation": {
            "value": guess_gen,
            "status": numeric_hint(int(guess_gen or 0), int(answer["generation"] or 0))
        },
        "height": {"value": data["height"], "status": numeric_hint(data["height"], answer["height"])},
        "weight": {"value": data["weight"], "status": numeric_hint(data["weight"], answer["weight"])},
    }

    if correct:
        result["answerName"] = answer["name"]
        session.pop("pokedle_answer", None)

    return jsonify(result)

@app.route("/api/pokedle/quit", methods=["POST"])
def pokedle_quit():
    answer = session.get("pokedle_answer")
    if not answer:
        return jsonify({"error": "No round in progress."}), 400

    session.pop("pokedle_answer", None)
    return jsonify({"answerName": answer["name"]})

STAT_CATEGORIES = {
    "hp": "HP",
    "attack": "Attack",
    "defense": "Defense",
    "special-attack": "Sp. Attack",
    "special-defense": "Sp. Defense",
    "speed": "Speed",
}

def fetch_random_pokemon(selected_keys):
    gen_key = random.choice(selected_keys)
    start, end = GENERATIONS[gen_key]
    pokemon_id = random.randint(start, end)
    response = requests.get(f"https://pokeapi.co/api/v2/pokemon/{pokemon_id}")
    return response.json()

@app.route("/pokedex-game")
def pokedex_game():
    return render_template("pokedex-game.html", generations=GENERATIONS)

@app.route("/api/pokedex-game/round")
def pokedex_game_round():
    selected = request.args.get("gens", "")
    selected_keys = [g for g in selected.split(",") if g in GENERATIONS] or list(GENERATIONS.keys())

    left_data = fetch_random_pokemon(selected_keys)
    right_data = fetch_random_pokemon(selected_keys)
    # Avoid a Pokemon facing itself — just re-roll the right side once, good enough odds-wise
    if right_data["id"] == left_data["id"]:
        right_data = fetch_random_pokemon(selected_keys)

    category = random.choice(list(STAT_CATEGORIES.keys()))

    def stat_lookup(data):
        stats = {s["stat"]["name"]: s["base_stat"] for s in data["stats"]}
        artwork = data["sprites"].get("other", {}).get("official-artwork", {}).get("front_default")
        return {
            "name": data["name"],
            "sprite": artwork or data["sprites"].get("front_default"),
            "value": stats.get(category, 0),
        }

    left = stat_lookup(left_data)
    right = stat_lookup(right_data)

    session["pokedex_game_round"] = {
        "left_value": left["value"],
        "right_value": right["value"],
    }

    return jsonify({
        "category": STAT_CATEGORIES[category],
        "left": {"name": left["name"], "sprite": left["sprite"]},
        "right": {"name": right["name"], "sprite": right["sprite"]},
    })

@app.route("/api/pokedex-game/guess", methods=["POST"])
def pokedex_game_guess():
    round_data = session.get("pokedex_game_round")
    if not round_data:
        return jsonify({"error": "No round in progress. Refresh to start a new one."}), 400

    body = request.get_json(silent=True) or {}
    choice = body.get("choice")
    if choice not in ("left", "right"):
        return jsonify({"error": "Invalid choice."}), 400

    left_value = round_data["left_value"]
    right_value = round_data["right_value"]

    if left_value == right_value:
        correct = True  # a true tie counts as a win either way, rare but fair
    elif choice == "left":
        correct = left_value > right_value
    else:
        correct = right_value > left_value

    session.pop("pokedex_game_round", None)

    return jsonify({
        "correct": correct,
        "leftValue": left_value,
        "rightValue": right_value,
    })

@app.route("/quiz")
def quiz():
    return render_template("quiz.html", questions=QUIZ_QUESTIONS)

@app.route("/favorites")
def favorites():    
    return render_template("favorites.html", favorites=FAVORITES)

@app.route("/contact")
def contact():
    return render_template("contact.html")

def base_species_name(form_name):
    """Turn a PokeAPI form slug into the species name you're meant to guess."""
    for suffix in ("-mega-x", "-mega-y", "-mega", "-alola", "-galar", "-hisui"):
        if form_name.endswith(suffix):
            return form_name[: -len(suffix)]
    return form_name

@app.route("/api/random-pokemon")
def random_pokemon():
    selected = request.args.get("gens", "")
    selected_keys = [g for g in selected.split(",") if g in GENERATIONS] or list(GENERATIONS.keys())

    want_mega = request.args.get("mega") == "1"
    want_regional = request.args.get("regional") == "1"

    extra_pool = []
    if want_mega:
        extra_pool += MEGA_EVOLUTIONS
    if want_regional:
        extra_pool += REGIONAL_FORMS

    # Extra pool gets a fair shot without swamping the normal dex picks —
    # capped at 35% so most rounds still come from the selected generations.
    use_extra = bool(extra_pool) and random.random() < min(0.35, len(extra_pool) / 300)
    lookup = random.choice(extra_pool) if use_extra else None

    if lookup is None:
        gen_key = random.choice(selected_keys)
        start, end = GENERATIONS[gen_key]
        lookup = random.randint(start, end)

    response = requests.get(f"https://pokeapi.co/api/v2/pokemon/{lookup}")
    if response.status_code != 200:
        # A form name typo'd or PokeAPI hiccuped — fall back to a normal dex pick
        gen_key = random.choice(selected_keys)
        start, end = GENERATIONS[gen_key]
        lookup = random.randint(start, end)
        response = requests.get(f"https://pokeapi.co/api/v2/pokemon/{lookup}")

    data = response.json()
    is_variant = isinstance(lookup, str)
    answer = base_species_name(data["name"]) if is_variant else data["name"]

    sprites = data["sprites"]
    artwork = sprites.get("other", {}).get("official-artwork", {}).get("front_default")

    return jsonify({
        "name": answer,
        "sprite": artwork or sprites.get("front_default"),
    })

@app.route("/api/leaderboard/submit", methods=["POST"])
def leaderboard_submit():
    body = request.get_json(silent=True) or {}
    name = body.get("name", "").strip()[:20]
    score = body.get("score")

    if not name or not isinstance(score, int) or score <= 0:
        return jsonify({"error": "Need a name and a positive score."}), 400

    conn = get_db()
    conn.execute(
        "INSERT INTO leaderboard (player_name, score) VALUES (?, ?)",
        (name, score),
    )
    conn.commit()
    conn.close()
    return jsonify({"saved": True})

@app.route("/api/leaderboard/top")
def leaderboard_top():
    conn = get_db()
    rows = conn.execute(
        "SELECT player_name, score, created_at FROM leaderboard ORDER BY score DESC, created_at ASC LIMIT 10"
    ).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route("/multiplayer")
def multiplayer_home():
    return render_template("multiplayer.html", generations=GENERATIONS)

@app.route("/multiplayer/create", methods=["POST"])
def multiplayer_create():
    name = request.form.get("name", "Player").strip()[:20] or "Player"
    difficulty = request.form.get("difficulty", "normal")
    gens = request.form.getlist("gens") or ["1"]

    code = generate_room_code()
    rooms[code] = {
        "players": {},
        "difficulty": difficulty,
        "gens": gens,
        "current_answer": None,
        "current_sprite": None,
        "round_active": False,
    }
    return redirect(url_for("multiplayer_room", code=code, name=name, host="1"))

@app.route("/multiplayer/join", methods=["POST"])
def multiplayer_join():
    code = request.form.get("code", "").strip().upper()
    name = request.form.get("name", "Player").strip()[:20] or "Player"

    if code not in rooms:
        return render_template("multiplayer.html", generations=GENERATIONS, error="Room not found. Check the code and try again.")

    return redirect(url_for("multiplayer_room", code=code, name=name))

@app.route("/multiplayer/<code>")
def multiplayer_room(code):
    code = code.upper()
    if code not in rooms:
        return redirect(url_for("multiplayer_home"))
    name = request.args.get("name", "Player")
    is_host = request.args.get("host") == "1"
    return render_template("multiplayer_room.html", room_code=code, player_name=name, is_host=is_host)

@socketio.on("join")
def handle_join(data):
    code = data["code"].upper()
    name = data["name"]

    if code not in rooms:
        emit("error", {"message": "Room not found."})
        return

    join_room(code)
    rooms[code]["players"][request.sid] = {"name": name, "score": 0}
    emit("player_list", {"players": list(rooms[code]["players"].values())}, to=code)

    if rooms[code]["round_active"]:
        payload = {"sprite": rooms[code]["current_sprite"]}
        if rooms[code]["difficulty"] != "hard":
            payload["length"] = len(rooms[code]["current_answer"])
        emit("round_start", payload)

@socketio.on("start_game")
def handle_start_game(data):
    code = data["code"].upper()
    if code in rooms:
        start_new_round(code)

@socketio.on("submit_guess")
def handle_guess(data):
    code = data["code"].upper()
    guess = data["guess"].strip().lower()
    room = rooms.get(code)

    if not room or not room["round_active"]:
        return

    if guess == room["current_answer"]:
        room["round_active"] = False
        winner = room["players"].get(request.sid)
        if winner:
            winner["score"] += 1

        socketio.emit("round_won", {
            "winner": winner["name"] if winner else "Someone",
            "answer": room["current_answer"],
            "players": list(room["players"].values()),
        }, to=code)

        socketio.sleep(3)
        start_new_round(code)
    else:
        emit("wrong_guess")

@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid
    for code, room in list(rooms.items()):
        if sid in room["players"]:
            del room["players"][sid]
            leave_room(code)
            if room["players"]:
                emit("player_list", {"players": list(room["players"].values())}, to=code)
            else:
                del rooms[code]
            break

if __name__ == "__main__":
    socketio.run(app, debug=True)