let canvas;
let context;

let fps = 30;
let fpsInterval = 1000 / fps // denominater is frames per second
let now;
let then = Date.now();
let request_id;

let tileSize = 16;

let player = {
    max_health: 100 ,
    current_health:100,
    x: 0,
    y: 0,
    width: tileSize * 3,
    height: tileSize * 3,
    frameX: 0,
    frameY: 0,
    in_air: false,
    attack_damage: 1,
    projectile_speed: 10,
    horizontal_speed: 8,
    vertical_speed: 6,
    direction: "right", //direction of player
};

let boundary;

//background position
let backgroundP = {
    x: 480,
    y: 540,
    width: 960,
    height: 540,
}

//mobs
let small_mob = {
    health: 5,
    width: tileSize * 2,
    height: tileSize * 2,
    score: 10,
    damage: 1,
    projectile_speed: 6, //pixels
    projectile_width: 12, //pixels
    projectile_height: 12, //pixels
}

let medium_mob = {
    health: 20,
    width: tileSize * 2.5,
    height: tileSize * 2.5,
    score: 50,
    damage: 2,
    projectile_speed: 8, //pixels
    projectile_width: 32, //pixels
    projectile_height: 6, //pixels
}

let large_mob = {
    health: 60,
    width: tileSize * 4,
    height: tileSize * 4,
    score: 400,
    damage: 5,
    projectile_speed: 7, //pixels
    projectile_width: 20, //pixels
    projectile_height: 16, //pixels
}

//list of controls
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let inFlight = false;
let attack = false;

//list of variables

//player
let player_attack; //player projectiles
let attack_interval = 0;
let flight_counter = 0;
let attack_speed; //attacks per second

//enemies
let enemy_attack = []; //enemy projectiles
let enemy_attack_rng; //enemy attack
let enemies = [];   //enemies
let spawn_timer;
let spawn_speed; //enemy spawn speed
let spawn_limit; //enemy spawn limit
let enemy_follow_counter;
let enemy_attack_speed; //enemy attack speed
let enemy_follow_interval = fps / 2; //seconds
let enemy_type;
let kill_count = {
    small_mob: 0,
    medium_mob: 0,
    large_mob: 0,
}

let scores = {
    small_mob: small_mob.score,
    medium_mob: medium_mob.score,
    large_mob: large_mob.score,
}

let mob_images;
let mob_projectile_images;
let boss;
let boss_defeated;

//natural disasters
let black_holes = []; //list of black_holes
let black_hole_timer = 0;

let idle; // idle animation
let index;
let erase = true;
let red_health; //health bar
let white_health;
let score;
let time;
let string_minutes;
let string_seconds;
let minutes;
let seconds;
let time_counter;
let pause;
let start;
let game_start;
let xhttp;
let inDanger = 0;


//enemy spawning
let enemy_top;
let enemy_right;
let enemy_left;
let enemy_bottom;
let random = [];
let random_choice;

//list of images
let playerImage = new Image();
let backgroundImage = new Image();
let playerAttack = new Image();
let small_mob_image = new Image();
let small_mob_projectile = new Image();
let medium_mob_image = new Image();
let medium_mob_projectile = new Image();
let large_mob_image = new Image();
let large_mob_projectile = new Image();
let black_hole_image = new Image();
let black_hole2_image = new Image();

//audio
let background_music = new Audio();
let player_attack_sound = new Audio();
let player_attack_explosion = new Audio();
let black_hole_opening = new Audio();
let dragon_growl = new Audio();
let dragon_death = new Audio();
let boss_death = new Audio();

let row = 36;
let col = 80;

let floor;

document.addEventListener("DOMContentLoaded", init, false);

function init() {
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");

    canvas.width = col * tileSize;
    canvas.height = row * tileSize;

    floor = canvas.height;

    boundary = {
        top: 96,
        bottom: canvas.height - 96,
        right: 1088,
        left: 160,
    }

    playerImage.src = "static/assets/Dragon_Assets/Animations/Adult Red Dragon/AdultRedDragonIdleSide.png";
    backgroundImage.src = "static/assets/Backgrounds/volcanic_background.jpg";
    playerAttack.src = "static/assets/Dragon_Assets/Attacks/fireball2.png";
    
    small_mob_image.src = "static/assets/Dragon_Assets/Animations/Aqua Drake/AquaDrakeIdleSide.png";
    small_mob_projectile.src = "static/assets/Dragon_Assets/Attacks/microicons_pack43.png";
    medium_mob_image.src = "static/assets/Dragon_Assets/Animations/Poison Drake/PoisonDrakeIdleSide.png";
    medium_mob_projectile.src = "static/assets/Dragon_Assets/Attacks/microicons_pack39.png";
    large_mob_image.src = "static/assets/Dragon_Assets/Animations/Great Golden Wyrm/GreateGoldenWyrmSideIdle.png";
    large_mob_projectile.src = "static/assets/Dragon_Assets/Attacks/microicons_pack38.png";

    black_hole_image.src = "static/assets/Natural_Disasters/black_hole2.png";
    black_hole2_image.src = "static/assets/Natural_Disasters/black_hole3.png";
    background_music.src = "static/assets/Audio/Dragon_Castle.mp3";
    player_attack_sound.src = "static/assets/Audio/fireball1.mp3";
    player_attack_explosion.src = "static/assets/Audio/fireball_explosion1.mp3";
    black_hole_opening.src = "static/assets/Audio/black_hole_opening.mp3";
    dragon_growl.src = "static/assets/Audio/dragon_growl.mp3";
    dragon_death.src = "static/assets/Audio/dragon_death.mp3";
    boss_death.src = "static/assets/Audio/boss_death.mp3";

    load_assets([
        {"var": playerImage, "url": "static/assets/Dragon_Assets/Animations/Adult Red Dragon/AdultRedDragonIdleSide.png"},
        {"var": backgroundImage, "url": "static/assets/Backgrounds/volcanic_background.jpg"},
        {"var": playerAttack, "url": "static/assets/Dragon_Assets/Attacks/fireball2.png"},
        {"var": small_mob_image, "url": "static/assets/Dragon_Assets/Animations/Aqua Drake/AquaDrakeIdleSide.png"},
        {"var": small_mob_projectile, "url": "static/assets/Dragon_Assets/Attacks/microicons_pack43.png"},
        {"var": medium_mob_image, "url": "static/assets/Dragon_Assets/Animations/Poison Drake/PoisonDrakeIdleSide.png"},
        {"var": medium_mob_projectile, "url": "static/assets/Dragon_Assets/Attacks/microicons_pack39.png"},
        {"var": large_mob_image, "url": "static/assets/Dragon_Assets/Animations/Great Golden Wyrm/GreatGoldenWyrmSideIdle.png"},
        {"var": large_mob_projectile, "url": "static/assets/Dragon_Assets/Attacks/microicons_pack38.png"},
        {"var": black_hole_image, "url": "static/assets/Natural_Disasters/black_hole2.png"},
        {"var": black_hole2_image, "url": "static/assets/Natural_Disasters/black_hole3.png"},           
        {"var": background_music, "url": "static/assets/Audio/Dragon_Castle.mp3"},
        {"var": player_attack_sound, "url": "static/assets/Audio/fireball1.mp3"},
        {"var": player_attack_explosion, "url": "static/assets/Audio/fireball_explosion1.mp3"},
        {"var": black_hole_opening, "url": "static/assets/Audio/black_hole_opening.mp3"},
        {"var": dragon_growl, "url": "static/assets/Audio/dragon_growl.mp3"},
        {"var": dragon_death, "url": "static/assets/Audio/dragon_death.mp3"},
        {"var": boss_death, "url": "static/assets/Audio/boss_death.mp3"}
    ], Initialise)

}

function Initialise() {
    document.querySelector("canvas").removeEventListener("click", Initialise, false);

    mob_images = {
        small_mob: small_mob_image,
        medium_mob: medium_mob_image,
        large_mob: large_mob_image,
    }

    mob_projectile_images = {
        small_mob: small_mob_projectile,
        medium_mob: medium_mob_projectile,
        large_mob: large_mob_projectile,
    }

    background_music.volume = 0.5;
    background_music.loop = true;
    player_attack_sound.volume = 0.6;
    player_attack_explosion.volume = 0.4;
    black_hole_opening.volume = 0.8;
    dragon_death.volume = 0.4;

    player.x = canvas.width / 2;
    player.y = floor - player.height;

    attack_speed = 10;
    spawn_speed = 1;
    spawn_limit = 10;
    enemy_attack_speed = fps * 4;
    score = 0;
    time = 0;
    string_minutes = "00";
    string_seconds = "00";
    minutes = 0;
    seconds = 0;
    time_counter = 0;
    idle = 0;
    spawn_timer = 0;
    enemy_follow_counter = 0;
    black_hole_timer = 0;
    inDanger = 0;
    pause = true;
    start = true;
    game_start = true;
    boss = false;
    boss_defeated = false;

    player_attack = [];
    enemy_attack = [];
    enemies = [];
    random = [];
    black_holes = [];
    kill_count = {
        small_mob: 0,
        medium_mob: 0,
        large_mob: 0,
    }


    player.current_health = player.max_health;

    //starting background position
    backgroundP = {
        x: 480,
        y: 540,
        width: 960,
        height: 540,
    }

    moveLeft = false;
    moveRight = false;
    moveUp = false;
    moveDown = false;
    inFlight = false;
    attack = false;
    player.direction = "right";

    background_music.currentTime = 0;
    
    draw();

}

function draw() {
    request_id = window.requestAnimationFrame(draw);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //background
    context.clearRect(0, 0, canvas.width, canvas.height);

    

    //background to be in the middle of the image 1920 x 1080
    context.drawImage(backgroundImage,backgroundP.x,backgroundP.y,backgroundP.width,backgroundP.height,
                        0,0,canvas.width ,canvas.height )

    //spawn black_hole
    if (score >= 200) {
        black_hole_timer += 1
        if (black_hole_timer === 2 * fps) {
        Spawn_Black_Hole();
        }
    }

    //rotating black_hole
    for (let black_hole of black_holes) {
        context.save();
        context.translate(black_hole.x, black_hole.y);
        context.rotate(black_hole.angle * Math.PI / 180);
        if (black_hole.type === "blue") {
        context.drawImage(black_hole_image,250,250,1500,1500,
            -black_hole.width/2, -black_hole.height/2, black_hole.width, black_hole.height);
        }
        else {
            context.drawImage(black_hole2_image,250,250,1500,1500,
                -black_hole.width/2, -black_hole.height/2, black_hole.width, black_hole.height);
        }
        black_hole.angle -= black_hole.rotation_speed;
        context.restore();
        if (black_hole.width != black_hole.max_width) {
            black_hole.width += black_hole.growth.width;
            black_hole.height += black_hole.growth.height
        }
        else {
            black_hole.lifespan -= 1;
        }

    }
    
    //black_hole damage
    for (let black_hole of black_holes) {
        black_hole.y -= black_hole.height/2;
        black_hole.x -= black_hole.width/2;
        if (collision(black_hole,player) === true && black_hole.lifespan > 0) {
            inDanger = 5;
            black_hole.current_tick += 1;
            if (black_hole.current_tick >= black_hole.tick_rate) {
                player.current_health -= 1;
                black_hole.current_tick = 0;
            }
        }
        black_hole.y += black_hole.height/2;
        black_hole.x += black_hole.width/2;

    }


    //spawn enemies
    if (enemies.length != spawn_limit){
    spawn_timer += 1;
    }
    if (enemies.length < spawn_limit && spawn_timer >= fps * spawn_speed) { //null values are placeholders to better visualise what attributes enemy has
        //spawning from top
        if (player.y != boundary.top) {
        enemy_top = {
            type: null,
            max_health: null, 
            current_health: null,
            x: Math.floor(randint(0,canvas.width) / 8) * 8, // spawn position only in multiples of 8
            y: 24,
            width: null,
            height: null,
            direction: null, 
            attack: 0,
            frameX: 0,
            frameY: 0,
        }
        random.push(enemy_top);
        }

        //spawning from bottom
        if (player.y + player.height < boundary.bottom) {
            enemy_left = {
                type: null,
                max_health: null, 
                current_health: null,
                x: Math.floor(randint(0,canvas.height) / 8) * 8, // spawn position only in multiples of 8,
                y: canvas.height - 24,
                width: null,
                height: null,
                direction: null, 
                attack: 0,
                frameX: 0,
                frameY: 0,
            }
            random.push(enemy_left);
            }

        if (player.x != boundary.right - player.width) {
        //spawning from right
        enemy_right = {
            type: null,
            max_health: null, 
            current_health: null,
            x: canvas.width - 48,
            y: Math.floor(randint(0,canvas.height) / 6) * 6, // spawn position only in multiples of 6
            width: null,
            height: null,
            direction: null, 
            attack: 0,
            frameX: 0,
            frameY: 0,
        }
        random.push(enemy_right);
        }

        //spawning from left
        if (player.x != boundary.left) {
        enemy_left = {
            type: null,
            max_health: null, 
            current_health: null,
            x: 48,
            y: Math.floor(randint(0,canvas.height) / 6) * 6, // spawn position only in multiples of 6
            width: null,
            height: null,
            direction: null, 
            attack: 0,
            frameX: 0,
            frameY: 0,
        }
        random.push(enemy_left);
        }

        //randomly picks where mobs spawn
        random_choice = randint(0,random.length-1)

        //assigning which mob to spawn
        if (boss === true) {
        boss_defeated = true;
        for (let enemy of enemies) {
            if (enemy.type === "large_mob") {
                boss_defeated = false;
            }
        }
        if (boss_defeated === true) {
            boss = false;
        }
        }
        RandomMob();
        if (random[random_choice]["type"] === "small_mob") {
            random[random_choice]["max_health"] = small_mob.health;
            random[random_choice]["current_health"] = small_mob.health;
            random[random_choice]["width"] = small_mob.width;
            random[random_choice]["height"] = small_mob.height;
        }
        else if (random[random_choice]["type"] === "medium_mob") {
            random[random_choice]["max_health"] = medium_mob.health;
            random[random_choice]["current_health"] = medium_mob.health;
            random[random_choice]["width"] = medium_mob.width;
            random[random_choice]["height"] = medium_mob.height;
        }
        else if (random[random_choice]["type"] === "large_mob") {
            random[random_choice]["max_health"] = large_mob.health;
            random[random_choice]["current_health"] = large_mob.health;
            random[random_choice]["width"] = large_mob.width;
            random[random_choice]["height"] = large_mob.height;
        }
        if (random[random_choice]["x"] < player.x) {
            random[random_choice]["direction"] = "right";
        }
        else {
            random[random_choice]["direction"] = "left";
        }
        enemies.push(random[random_choice]);
        //resets variables for next mob spawn
        spawn_timer = 0;
        random = [];
    }

    //enemy movement
    enemy_follow_counter +=1
    if (enemy_follow_counter === enemy_follow_interval) {
    for (let enemy of enemies) {
        if (enemy.x - enemy.width < player.x) { //approaching from right
            enemy.x += 8
            enemy.direction = "right";
        }
        if (enemy.x + (enemy.width) > player.x + (player.width)) { //approaching from left
            enemy.x -= 8
            enemy.direction = "left";
        }
        if (enemy.y - enemy.height < player.y) { //approaching from top
            enemy.y += 6
        }
        if (enemy.y + (enemy.height) > player.y + (player.height)) {//approaching from bottom
            enemy.y -= 6
        }
    } 
    enemy_follow_counter = 0;
    }

    //draw enemies
    for (let enemy of enemies) {
        let enemy_type = enemy.type;
        if (enemy_type === "large_mob") {
            if (enemy.direction === "right") { //facing right
                context.drawImage(mob_images[enemy_type],
                    32 * enemy.frameX, 32 * enemy.frameY, 32, 32,
                    enemy.x, enemy.y, enemy.width, enemy.height);
                }
                else { //facing left
                    context.save();
                    context.scale(-1,1);
                    context.drawImage(mob_images[enemy_type],
                        32 * enemy.frameX, 32 * enemy.frameY, 32, 32,
                        -enemy.x - enemy.width, enemy.y, enemy.width, enemy.height);
                    context.restore();
                }
        }
        else {
        if (enemy.direction === "right") { //facing right
        context.drawImage(mob_images[enemy_type],
            16 * enemy.frameX, 16 * enemy.frameY, 16, 16,
            enemy.x, enemy.y, enemy.width, enemy.height);
        }
        else { //facing left
            context.save();
            context.scale(-1,1);
            context.drawImage(mob_images[enemy_type],
                16 * enemy.frameX, 16 * enemy.frameY, 16, 16,
                -enemy.x - enemy.width, enemy.y, enemy.width, enemy.height);
            context.restore();
        }
        }
    }

    //enemy projectiles attacks
    for (let enemy of enemies) {
        enemy.attack += 1 //attack interval
        if (enemy.attack === enemy_attack_speed) {
            let enemy_projectile = {
                x: enemy.x,
                y: enemy.y + Math.floor(enemy.height / 3), // shoots from 1/3 from the head of the enemy
                width: enemy.width / 2,
                height: enemy.width / 2,
                direction: enemy.direction,
                hit: true,
                damage: null,
            }
            if (enemy.type === "small_mob") {
                enemy_projectile["type"] = enemy.type;
                enemy_projectile["damage"] = small_mob.damage;
                enemy_projectile["speed"] = small_mob.projectile_speed;
                enemy_projectile["width"] = small_mob.projectile_width;
                enemy_projectile["height"] = small_mob.projectile_height;
            }
            else if (enemy.type === "medium_mob") {
                enemy_projectile["type"] = enemy.type;
                enemy_projectile["damage"] = medium_mob.damage;
                enemy_projectile["speed"] = medium_mob.projectile_speed;
                enemy_projectile["width"] = medium_mob.projectile_width;
                enemy_projectile["height"] = medium_mob.projectile_height;
            }
            else if (enemy.type === "large_mob") {
                enemy_projectile["type"] = enemy.type;
                enemy_projectile["damage"] = large_mob.damage;
                enemy_projectile["speed"] = large_mob.projectile_speed;
                enemy_projectile["width"] = large_mob.projectile_width;
                enemy_projectile["height"] = large_mob.projectile_height;
            }
            if (enemy_projectile.direction === "right") { //shooting right
                enemy_projectile.x += enemy.width;
            }
            enemy.attack = 0;
            enemy_attack.push(enemy_projectile);
        }
    }

    //draw enemy attack
    for (let projectile of enemy_attack) {
        let enemy_type = projectile.type;
        if (projectile.direction === "left") {
            context.save();
            context.scale(-1,1);
            context.drawImage(mob_projectile_images[enemy_type], 4, 4, 8, 8,
                -projectile.x, projectile.y, projectile.width, projectile.height);
            context.restore();
        }
        else {
            context.drawImage(mob_projectile_images[enemy_type], 4, 4, 8, 8,
                projectile.x, projectile.y, projectile.width, projectile.height);
        }
    }

    if (enemy_attack != []) {
        for (let projectile of enemy_attack) {

                if (projectile_collision(projectile,player) === true && projectile.hit === true) {
                    inDanger = fpsInterval / 5;
                    player.current_health -= projectile.damage;
                    projectile.hit = false;
            }
        }
        }



    //erase enemy attacks which hit
    erase = true;
        if (erase === true) {
            index = 0
            for (let i = 0; i < enemy_attack.length; i++) {
                if (enemy_attack[index].hit === false) {
                    enemy_attack.splice(index, 1);
                }
                index +=1
            }
            erase = false;
        } 

    //update projectile movement
    for (let projectile of enemy_attack) {
        if (projectile.direction === "right") { //right
            projectile.x += projectile.speed
        }
        else { //left
            projectile.x -= projectile.speed
        }
    }



    //Draw player
    
    //facing right
    if (player.direction === "right"){
    context.drawImage(playerImage,
        16 * player.frameX, 16 * player.frameY, 16, 16,
        player.x, player.y, player.width, player.height);
    }

    //facing left
    else {
        context.save();
        context.scale(-1,1);
        context.drawImage(playerImage,
            16 * player.frameX, 16 * player.frameY, 16, 16,
            -player.x - player.width, player.y, player.width, player.height);
        context.restore();
    }
    
    //idle animation
    if (idle === 4) {
    player.frameX = (player.frameX + 1) % 4;
    for (let enemy of enemies) {
        if (enemy.type === "large_mob") {
            enemy.frameX = (enemy.frameX + 1) % 8;
        }
        else {
            enemy.frameX = (enemy.frameX + 1) % 4;
        }

    }
    idle = 0   
    }
    idle +=1

    //pause game as to wait for player to start
    if (start === true ) {
        start = false
        if (start === false) {
        pause_game();
        }
    }


    //player attack
    attack_interval += 1
    if (attack && attack_interval > fps / attack_speed) {
        let fireball = {
            x: player.x + player.width,
            y: player.y + ((player.height/3)),
            width: 24,
            height: 16,
            hit: true, //if attack collides
            damage: 1,
        }
        if (player.direction === "right") {
        fireball["direction_speed"] = player.projectile_speed;  // attack to right
        }
        else {
            fireball["direction_speed"] = -player.projectile_speed; // attack to left
            fireball["x"] -= player.width;            
        }
        player_attack.push(fireball)
        attack_interval = 0
        player_attack_sound.currentTime = 0.2;
        player_attack_sound.play();
    }

    //draws player attack
    for (let attack of player_attack) {
        if (attack.direction_speed > 0) {
            context.drawImage(playerAttack,0,0,554,344,
                attack.x, attack.y, attack.width, attack.height);
        }

        else {
            context.save();
            context.scale(-1,1);
            context.drawImage(playerAttack,0,0,554,344,
            -attack.x, attack.y, attack.width, attack.height);
            context.restore();
        }
        //updates attack
        attack.x += attack.direction_speed;
    }

    //remove projectiles to prevent it from infinitely stacking
    if (player_attack.length > 600) {
    player_attack.splice(0,1);
    }
    if (enemy_attack.length > 600) {
        enemy_attack.splice(0,1);
    }

    //physics
    //if not on flight mode then slowly fall
    if (!inFlight && !moveUp && !moveDown) {
        if (player.y + player.height < boundary.bottom || backgroundP.y == 540) {
            player.y = player.y + player.vertical_speed;
            if (player.y > canvas.height - player.height) {
                player.y = canvas.height - player.height;
            }
        }

        else if (player.y + player.height >= boundary.bottom) {
            backgroundP.y += player.vertical_speed;
        //if background not lowest point then entities come float up to simulate player falling down
        if (player.in_air && backgroundP.y < 540) {
            for (let enemy of enemies) {
                enemy.y -= player.vertical_speed;
            }
            for (let attack of player_attack) {
                attack.y -= player.vertical_speed;
            }
            for (let projectile of enemy_attack) {
                projectile.y -= player.vertical_speed
            }
            for (let black_hole of black_holes) {
                black_hole.y -= player.vertical_speed
            }
        }
        }
    }
            
    //makes the dragon not touch the bottom of the screen as it is falling down as long as background is not at lowest point
    if (player.y + player.height> boundary.bottom && backgroundP.y < 540) {
            player.y = boundary.bottom - player.height;
        }

    //background floor
    if (backgroundP.y > 540) {
        backgroundP.y = 540;
    }

    //collisions
    if (player.y + player.height >= floor) {
        player.in_air = false;
        player.y = floor - player.height;
    }

    //projectile collisions
    if (player_attack != [] && enemies != []) {
    for (let projectile of player_attack) {
        for (let enemy of enemies) {
            if (projectile_collision(projectile,enemy) === true && projectile.hit === true) {
                if (enemy.current_health > 0) {
                enemy.current_health -= projectile.damage;
                projectile.hit = false;
                player_attack_explosion.currentTime = 0;
                player_attack_explosion.play();
                }

            }
        }
    }
    }
    
    //printing healthbars
    for (let enemy of enemies) {
        HealthBar(enemy)
    }

    HealthBar(player)
    
    //handle key presses
    //inverting image if player moves left
    //https://stackoverflow.com/questions/7918803/flip-a-sprite-in-canvas
    //https://youtube.com/watch?v=cB6paLHebb4&t=111s
    //width 960 divides into 8
    if (moveLeft){
        if (player.x > boundary.left || backgroundP.x === 0) {
        player.direction = "left"; // flip sprite facing left
        player.x = player.x - player.horizontal_speed;
        if (player.x < 0) {
            player.x = 0;
        }
        }
        else if (player.x === boundary.left && backgroundP.x != 0) {
        backgroundP.x -= player.horizontal_speed;
        if (backgroundP.x >= 0)
        for (let enemy of enemies) {
            enemy.x += player.horizontal_speed
        }

        //player attack flys off the screen when the background can no longer scroll
        for (let attack of player_attack) {
            attack.x += player.horizontal_speed
        }
        for (let projectile of enemy_attack) {
            projectile.x += player.horizontal_speed
        }
        for (let black_hole of black_holes) {
            black_hole.x += player.horizontal_speed
        }
        }
        
    }
    if (moveRight){
        if (player.x < boundary.right - player.width || backgroundP.x === 960){
            player.x = player.x + player.horizontal_speed;
            player.direction = "right"; // flip sprite facing right
            if (player.x + player.width > canvas.width) {
                player.x = canvas.width - player.width;
            }
        }

        else if (player.x === boundary.right - player.width && backgroundP.x != 960) {
            backgroundP.x += player.horizontal_speed;
            if ( backgroundP.x <= 960)
            for (let enemy of enemies) {
                enemy.x -= player.horizontal_speed
            }

            //player attack flys off screen when background can no longer scroll
            for (let attack of player_attack) {
                attack.x -= player.horizontal_speed
            }
            for (let projectile of enemy_attack) {
                projectile.x -= player.horizontal_speed
            }
            for (let black_hole of black_holes) {
                black_hole.x -= player.horizontal_speed
            }

        }
        
    }
    // height of 540 divides into 6
    if (moveUp){
        player.in_air = true;
        if (player.y > boundary.top || backgroundP.y === 0){
        player.y = player.y - player.vertical_speed;
        if (player.y < 0) {
            player.y = 0;
        }
        }

        else if (player.y <= boundary.top && backgroundP.y != 0){
        backgroundP.y -= player.vertical_speed;
        if (backgroundP.y >= 0){
            for (let enemy of enemies) {
                enemy.y += player.vertical_speed
            }
            for (let attack of player_attack) {
                attack.y += player.vertical_speed
            }
            for (let projectile of enemy_attack) {
                projectile.y += player.vertical_speed
            }
            for (let black_hole of black_holes) {
                black_hole.y += player.vertical_speed
            }
        }


        }
    }

    if (moveDown){
        if (player.y + player.height < boundary.bottom || backgroundP.y == 540) {
            player.y = player.y + player.vertical_speed;
            if (player.y > canvas.height - player.height) {
                player.y = canvas.height - player.height;
            }
        }
        else if (player.y + player.height >= boundary.bottom) {
        backgroundP.y += player.vertical_speed;
        if (backgroundP.y <= 544) {
        for (let enemy of enemies) {
            enemy.y -= player.vertical_speed
        }
        for (let attack of player_attack) {
            attack.y -= player.vertical_speed
        }
        for (let projectile of enemy_attack) {
            projectile.y -= player.vertical_speed
        }
        for (let black_hole of black_holes) {
            black_hole.y -= player.vertical_speed
        }
        }
        }

    }  

    //get rid of mobs with 0 health
    erase = true;
    if (erase === true) {
        index = 0
        for (let i = 0; i < enemies.length; i++) {
            if (enemies[index].current_health <= 0) {
                enemy_type = enemies[index].type;
                if (enemies[index].type === "large_mob") {
                    boss_death.currentTime = 0;
                    boss_death.play();
                }
                else {
                dragon_death.currentTime = 5.2;
                dragon_death.play();
                }
                enemies.splice(index, 1);
                score += scores[enemy_type];
                kill_count[enemy_type] += 1;
            }
            index +=1
        }
        erase = false;
    }

    //get rid of projectiles which hit
    //player attack
    erase = true;
    if (erase === true) {
        index = 0
        for (let i = 0; i < player_attack.length; i++) {
            if (player_attack[index].hit === false) {
                player_attack.splice(index, 1);
            }
            index +=1
        }
        erase = false;
    }

    erase = true;
    if (erase === true) {
        index = 0
        for (let i = 0; i < black_holes.length; i++) {
            if (black_holes[index].lifespan <= 0) {
                black_holes.splice(index, 1);
            }
            index +=1
        }
        erase = false;
    }


    //invisible map boundary so there will be no blank background
    //left boundary

    if (backgroundP.x < 0) {
        backgroundP.x = 0;
    }

    //right boundary

    if (backgroundP.x > 960) {
        backgroundP.x = 960;
    }

    //top boundary

    if (backgroundP.y < 0) {
        backgroundP.y = 0;
    }

    //time
    time_counter +=1
    if (time_counter === fps) {
        TimeTracker();
    }

    if (player.current_health <= 0) {
        player.current_health = 0;
    }



    context.font = "20px Arial bold"
    context.fillStyle = "yellow"
    //player and background position
    // context.fillText("Player " + "(" + player.x + "," + player.y + ")",1000,100)
    // context.fillText("Map " + "(" + backgroundP.x + "," + backgroundP.y + ")" ,100,100)
    context.fillText("Score: " + score,(canvas.width/2) -40,100) 
    context.fillText("Health " + player.current_health, 40,40)
    context.fillText(string_minutes + ":" + string_seconds, canvas.width - 80,40)

    if (inDanger > 0) {
        canvas.style.border = "2px solid red";
        canvas.style.boxShadow = "2px 2px darkred";
    }
    else {
        canvas.style.border = "2px solid blue";
        canvas.style.boxShadow = "2px 2px white";
    }

    if (inDanger > 0) {
        inDanger -= 1;
    }

    //if player health reaches 0 end game
    if (player.current_health <= 0) {
        let end_time = string_minutes + ":" + string_seconds
        stop(score,end_time,kill_count);
    }
}


function activate(event) {
    let key = event.key;
    if (key === "a") {
        moveLeft = true;
    }
    else if (key === "d") {
        moveRight = true;
    }
    else if (key === "w") {
        moveUp = true;
    }
    else if (key === "s") {
        moveDown = true;
    }
    else if (key === "o") {
        inFlight = true;
    }
    else if (key === "p") {
        attack = true;
    }
}

function deactivate(event) {
    let key = event.key;
    if (key === "a") {
        moveLeft = false;
    }
    else if (key === "d") {
        moveRight = false;
    }
    else if (key === "w") {
        moveUp = false;
    }
    else if (key === "s") {
        moveDown = false;
    }
    else if (key === "o") {
        inFlight = false;
    }
    else if (key === "p") {
        attack = false;
    }
}

function load_assets(assets, callback) {
    let num_assets = assets.length;
    let loaded = function(event) {
        if (num_assets > 1) {
        console.log("loaded");
        }
        // https://www.w3schools.com/jsreF/obj_event.asp
        // event.target.removeEventListener(event.type, loaded);
        num_assets = num_assets - 1;
        if (num_assets === 0 ) {
            document.querySelector("canvas").addEventListener("click", pause_game, false);
            callback();
        }
    };
    for (let asset of assets) {
        let element = asset.var;
        if ( element instanceof HTMLImageElement) {
            console.log("img");
            element.addEventListener("load", loaded, false);
        }
        else if ( element instanceof HTMLAudioElement) {
            console.log("audio")
            element.addEventListener("canplaythrough", loaded, false);
        }
        element.src = asset.url;
    }
}

//projectile collision
function projectile_collision (projectile, enemy) {// when projectile flys from the right the image is flipped on its horizontal axis such that the origin will now be on the top-right instead of top-left so minus projectile.width
    if (projectile.x + projectile.width >= enemy.x && projectile.x - projectile.width <= enemy.x + enemy.width && projectile.y + projectile.height >= enemy.y && projectile.y <= enemy.y + enemy.height) {
            return true;
        }
    else {
        return false;
    }
}

//collision
function collision (projectile, enemy) {
    if (projectile.x + projectile.width >= enemy.x && projectile.x <= enemy.x + enemy.width && projectile.y + projectile.height >= enemy.y && projectile.y <= enemy.y + enemy.height) {
            return true;
        }
    else {
        return false;
    }
}

function randint(min,max) {
    return Math.round(Math.random() * (max - min)) + min;
}

function stop(score,end_time,kill_count) {
    window.removeEventListener("keydown", activate, false);
    window.removeEventListener("keyup", deactivate, false);
    window.cancelAnimationFrame(request_id);

    //replay game
    document.querySelector("canvas").addEventListener("click", Initialise, false);
    context.font = "italic bold 20px arial,serif";
    context.fillStyle = "#AB2328";
    context.fillText("Play Again",canvas.width/2 -50,canvas.height/2 -20);
      
    let data = new FormData();
    data.append("score", score);
    data.append("time", end_time);
    data.append("small_mob",kill_count.small_mob);
    data.append("medium_mob",kill_count.medium_mob);
    data.append("large_mob",kill_count.large_mob);

    xhttp = new XMLHttpRequest();
    xhttp.addEventListener("readystatechange", handle_response, false);
    xhttp.open("POST", "store_score", true);
    xhttp.send(data);
}

function handle_response() {
    // Check that the response has fully arrived
    if ( xhttp.readyState === 4) {
        // Check the request was successful
        if ( xhttp.status === 200) {
            if (xhttp.responseText === "success") {
                // score was successfully stored in database
                console.log("Score saved")
            }
            else {
                // score was not successfully stored in database
                console.log("Score not saved")
            }
        }
    }
}

//function to pause game
function pause_game() {
    context.font = "italic bold 40px arial,serif";
    context.fillStyle = "#AB2328";
    if (game_start != true) {
        context.fillText("Resume",canvas.width/2 - 80,canvas.height/2 - 40); 
    }
    else {
    context.fillText("Start",canvas.width/2 - 40,canvas.height/2 - 40); 
    game_start = false;
    }
    moveLeft = false;
    moveRight = false;
    moveUp = false;
    moveDown = false;
    inFlight = false;
    attack = false;
    if (pause === false) {
        window.addEventListener("keydown", activate, false);
        window.addEventListener("keyup", deactivate, false);
        request_id = window.requestAnimationFrame(draw);
        pause = true;
        background_music.play(); 
    }
    else {
        window.removeEventListener("keydown", activate, false);
        window.removeEventListener("keyup", deactivate, false);
        window.cancelAnimationFrame(request_id);
        pause = false;  
        background_music.pause(); 
    }
}

function HealthBar(entity) {
                //health bar
                //red for current health
                //white for lost health
                red_health = (entity.current_health / entity.max_health)
                if (red_health < 0) {
                    red_health = 0;
                }

                white_health = 1 - red_health
                context.fillStyle = "red"
                context.fillRect(entity.x, entity.y - (tileSize/2), red_health * entity.width, (tileSize/8))
                context.fillStyle = "white"
                context.fillRect(entity.x + (red_health * entity.width), entity.y - (tileSize/2), white_health * entity.width, (tileSize/8))
}

function TimeTracker() {
    time +=1
    seconds +=1
    if (seconds % 60 === 0) {
        seconds -=60
        minutes += 1
    }
    if (minutes < 10) {
        string_minutes = "0" + minutes
    }
    else {
        string_minutes = minutes
    }
    if (seconds < 10) {
        string_seconds = "0" + seconds
    }
    else {
        string_seconds = seconds
    }
    time_counter = 0
}

function Spawn_Black_Hole() {
    let spawn_ready = true;
    let black_hole = {
        type: "blue",
        x: Math.floor(randint(0,canvas.width) / 8) * 8,
        y: Math.floor(randint(0,canvas.height) / 6) * 6,
        width: null,
        height: null,
        growth: null,
        max_width: randint(4,7) * 16,
        max_height: randint(4,7) * 16,
        angle: 0,
        rotation_speed: null,
        current_tick: 0,
        tick_rate: fps, //1 dps
        lifespan: randint(6,10) * fps, //seconds 
    }
    if (score >= 400) {// red black holes
        let chance = randint(1,4)
        if (chance === 1) {
        black_hole["type"] = "red"
        black_hole["tick_rate"] *= 0.6
        black_hole["max_width"] += randint(2,4) * 16
        black_hole["max_height"] += randint(2,4) * 16
        black_hole["rotation_speed"] += 2
        }
        else {
            black_hole["type"] = "blue"
        }
    }
    black_hole["width"] = black_hole["max_width"]
    black_hole["height"] = black_hole["max_height"]
    //ensures black holes dont spawn on top of each other or on the player
    if (projectile_collision(black_hole,player) === true) {
        spawn_ready = false
    }
    for (let black_hole_collision of black_holes) {
        if (projectile_collision(black_hole_collision,black_hole) === true) {
            spawn_ready = false
        }
    }
    if (spawn_ready === true) { // rotation speed dependant on the ratio of width and height of black hole
    black_hole["rotation_speed"] += 4 - (Math.abs(black_hole.max_width - black_hole.max_height) / 16)
    black_hole["width"] = black_hole["max_width"] / 4
    black_hole["height"] = black_hole["max_height"] / 4
    black_hole["growth"] = {width:black_hole["max_width"]/16,height:black_hole["max_height"]/16}
    black_hole_opening.currentTime = 0.5;
    black_hole_opening.play();
    black_holes.push(black_hole);
    black_hole_timer = 0;
    }
    else {
        Spawn_Black_Hole()
    }

}

function RandomMob() {
    if (score >= 500 && boss === false) {
        random[random_choice]["type"] = "large_mob";
        dragon_growl.currentTime = 2;
        dragon_growl.play();
        boss = true; //spawn only 1 boss at a time
    }
    else if (score >= 100) { //chance to spawn stronger mobs
        let chance = randint(1,5)
        if (chance === 1) {
            random[random_choice]["type"] = "medium_mob";     
        }
        else {
            random[random_choice]["type"] = "small_mob";       
        }
    }
    else {
        random[random_choice]["type"] = "small_mob";  
    }

}
