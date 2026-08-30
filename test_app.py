import os
import sys
import unittest.mock as mock

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import app as app_module
from app import (
    app,
    normalize_pokemon_name,
    generation_for_id,
    base_species_name,
    akinator_matches,
    akinator_best_question,
)
from config import AKINATOR_POKEMON


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


@pytest.fixture
def temp_db(tmp_path, monkeypatch):
    """Points the app at a throwaway SQLite file so these tests never
    touch (or depend on) the real leaderboard data."""
    db_file = tmp_path / "test.db"
    monkeypatch.setattr(app_module, "DB_PATH", str(db_file))
    app_module.init_db()
    yield db_file


# ---------- Every page should load ----------

ALL_PAGE_ROUTES = [
    "/", "/calculator", "/whos-that", "/pokedle", "/pokedex-game",
    "/quiz", "/favorites", "/contact", "/multiplayer", "/akinator",
    "/pokedex", "/team-builder", "/profile",
]


@pytest.mark.parametrize("route", ALL_PAGE_ROUTES)
def test_page_routes_return_200(client, route):
    assert client.get(route).status_code == 200


# ---------- normalize_pokemon_name ----------

def test_normalize_strips_accents():
    assert normalize_pokemon_name("Flabébé") == normalize_pokemon_name("flabebe")


def test_normalize_lowercases():
    assert normalize_pokemon_name("PIKACHU") == "pikachu"


def test_normalize_keeps_hyphens_and_apostrophes():
    assert normalize_pokemon_name("Ho-Oh") == "ho-oh"
    assert normalize_pokemon_name("Farfetch'd") == "farfetch'd"

# ---------- generation_for_id ----------

def test_generation_for_id_boundaries():
    assert generation_for_id(1) == "1"
    assert generation_for_id(151) == "1"
    assert generation_for_id(152) == "2"
    assert generation_for_id(1025) == "9"


def test_generation_for_id_out_of_range():
    assert generation_for_id(99999) is None


# ---------- base_species_name (Mega/Regional form stripping) ----------

def test_base_species_name_strips_mega():
    assert base_species_name("charizard-mega-x") == "charizard"
    assert base_species_name("gengar-mega") == "gengar"

def test_base_species_name_strips_regional():
    assert base_species_name("meowth-galar") == "meowth"
    assert base_species_name("raichu-alola") == "raichu"

def test_base_species_name_leaves_normal_names_alone():
    assert base_species_name("pikachu") == "pikachu"

# ---------- Akinator question engine ----------

def test_akinator_matches_type():
    mewtwo = next(p for p in AKINATOR_POKEMON if p["name"] == "mewtwo")
    assert akinator_matches(mewtwo, "type:psychic") is True
    assert akinator_matches(mewtwo, "type:fire") is False

def test_akinator_matches_legendary():
    mewtwo = next(p for p in AKINATOR_POKEMON if p["name"] == "mewtwo")
    pikachu = next(p for p in AKINATOR_POKEMON if p["name"] == "pikachu")
    assert akinator_matches(mewtwo, "legendary") is True
    assert akinator_matches(pikachu, "legendary") is False

def test_akinator_best_question_never_picks_a_useless_split():
    result = akinator_best_question(AKINATOR_POKEMON, set())
    assert result is not None
    _, yes, no, _ = result
    assert yes > 0 and no > 0

def test_akinator_converges_to_correct_guess():
    """Plays a full game against every Pokemon in the pool. Matches the
    ~89% first-guess accuracy verified during development — remaining
    misses are between genuinely similar Pokemon (Mew/Mewtwo, etc)."""
    correct = 0
    for target in AKINATOR_POKEMON:
        candidates = list(AKINATOR_POKEMON)
        asked = set()
        for _ in range(9):
            if len(candidates) <= 1:
                break
            result = akinator_best_question(candidates, asked)
            if result is None:
                break
            attr_key, _, _, _ = result
            asked.add(attr_key)
            answer = akinator_matches(target, attr_key)
            candidates = [c for c in candidates if akinator_matches(c, attr_key) == answer]
        if candidates and candidates[0]["name"] == target["name"]:
            correct += 1

    assert correct / len(AKINATOR_POKEMON) >= 0.85


# ---------- Pokedle guess flow (mocked PokeAPI, no real network calls) ----------

class FakeResp:
    def __init__(self, data, status=200):
        self._data = data
        self.status_code = status

    def json(self):
        return self._data

def test_pokedle_full_round(client):
    fake_pikachu = {
        "id": 25, "name": "pikachu",
        "types": [{"type": {"name": "electric"}}],
        "height": 4, "weight": 60,
    }

    with mock.patch("app.requests.get", return_value=FakeResp(fake_pikachu)):
        with mock.patch("app.random.choice", return_value="1"), mock.patch("app.random.randint", return_value=25):
            client.get("/api/pokedle/new")

        data = client.post("/api/pokedle/guess", json={"guess": "pikachu"}).get_json()

    assert data["correct"] is True
    assert data["guessCount"] == 1

def test_pokedle_guess_without_active_round_errors(client):
    response = client.post("/api/pokedle/guess", json={"guess": "pikachu"})
    assert response.status_code == 400

# ---------- Leaderboard (isolated temp DB, never touches the real one) ----------

def test_leaderboard_submit_and_fetch(client, temp_db):
    response = client.post("/api/leaderboard/submit", json={"name": "TestPlayer", "score": 42})
    assert response.status_code == 200

    top = client.get("/api/leaderboard/top").get_json()
    assert any(row["player_name"] == "TestPlayer" and row["score"] == 42 for row in top)

def test_leaderboard_rejects_missing_name(client, temp_db):
    response = client.post("/api/leaderboard/submit", json={"score": 42})
    assert response.status_code == 400

def test_leaderboard_rejects_non_positive_score(client, temp_db):
    response = client.post("/api/leaderboard/submit", json={"name": "Cheater", "score": 0})
    assert response.status_code == 400

def test_leaderboard_rejects_non_integer_score(client, temp_db):
    response = client.post("/api/leaderboard/submit", json={"name": "Cheater", "score": "a lot"})
    assert response.status_code == 400

def test_leaderboard_top_returns_at_most_ten_highest_first(client, temp_db):
    for i in range(15):
        client.post("/api/leaderboard/submit", json={"name": f"Player{i}", "score": i + 1})

    top = client.get("/api/leaderboard/top").get_json()
    assert len(top) == 10
    assert top[0]["score"] == 15