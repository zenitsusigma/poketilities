from flask import Flask, render_template, jsonify, request
import random
import requests
from config import SITE_NAME, MY_NAME, TAGLINE, NAV_LINKS, THEME, FAVORITES, GENERATIONS, WHOS_THAT_SETTINGS

app = Flask(__name__)

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
    return render_template("calculator.html")

@app.route("/whos-that")
def whos_that():
    return render_template("whos_that.html", whos_that_settings=WHOS_THAT_SETTINGS, generations=GENERATIONS)

@app.route("/pokedle")
def pokedle():
    return render_template("pokedle.html")

@app.route("/pokedex-game")
def pokedex_game(): 
    return render_template("pokedex-game.html")

@app.route("/quiz")
def quiz():
    return render_template("quiz.html")

@app.route("/favorites")
def favorites():    
    return render_template("favorites.html", favorites=FAVORITES)

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/api/random-pokemon")
def random_pokemon():
    selected = request.args.get("gens", "")
    selected_keys = [g for g in selected.split(",") if g in GENERATIONS] or list(GENERATIONS.keys())
    gen_key = random.choice(selected_keys)
    start, end = GENERATIONS[gen_key]
    pokemon_id = random.randint(start, end)
    response = requests.get(f"https://pokeapi.co/api/v2/pokemon/{pokemon_id}")
    data = response.json()
    return jsonify({
        "name": data["name"],
        "sprite": data["sprites"]["front_default"],
    })

if __name__ == "__main__":
    app.run(debug=True)