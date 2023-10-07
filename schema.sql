DROP TABLE IF EXISTS scores;

CREATE TABLE scores 
(
    user_name TEXT PRIMARY KEY NOT NULL,
    score INTEGER NOT NULL,
    small_mob INTEGER NOT NULL,
    medium_mob INTEGER NOT NULL,
    large_mob INTEGER NOT NULL,
    time TEXT NOT NULL,
    date DATE NOT NULL
);

SELECT * FROM scores;




DROP TABLE IF EXISTS login;

CREATE TABLE login
(
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    password TEXT NOT NULL
);

SELECT * FROM login;
