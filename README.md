# IronGrave

**Survive the cell. Win the arena. Escape.**

A Fallout-inspired, turn-based browser RPG. Create your character, fight your way out of the cell, gear up at the shop and conquer the arena. Full-stack university project built with PHP, MySQL and vanilla JavaScript, no frameworks.

## Features

- Registration and login with sessions and hashed passwords
- Character creation with Fallout-style stats (strength, intelligence, toughness, luck) and multiple races
- Point-and-click navigation between environments: cell, shop and arena
- Turn-based combat against a roster of enemies
- Shop with weapons and medikits
- Save/load system
- Endgame epilogue and match history

## Tech stack

- **Backend:** PHP with PDO and prepared statements
- **Database:** MySQL (tables: `utenti`, `salvataggi`, `storico`)
- **Frontend:** HTML, CSS, vanilla JavaScript (`async`/`await` with `fetch`)

## Run it locally

1. Install [XAMPP](https://www.apachefriends.org/) and start **Apache** and **MySQL** from the control panel.
2. Clone or download this repository into `C:\xampp\htdocs\irongrave`.
3. Open `http://localhost/phpmyadmin`, go to **Import**, select `database.sql` and run it. This creates a database called `irongrave` with empty tables.
4. In the `php/` folder, copy `db.example.php` to `db.php`. The defaults (`root`, empty password, database `irongrave`) work with a standard XAMPP setup.
5. Open `http://localhost/irongrave/index.html`, register an account and play.

## Project structure

```
index.html      landing page, login and registration
game.html       the game
css/            stylesheets
js/             game logic and utilities
php/            backend endpoints (auth, save/load, history)
img/            weapons, characters, backgrounds
database.sql    database schema
```

## Credits

Background textures from [ambientCG](https://ambientcg.com) (CC0).

Made in italian as a university exam project.