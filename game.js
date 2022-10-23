import jsonMap1 from "./maps/map1.json" assert {type:"json"}
import jsonMap2 from "./maps/map2.json" assert {type:"json"}
import jsonMap3 from "./maps/map3.json" assert {type:"json"}



document.addEventListener('DOMContentLoaded', () => {

    //Super Class
    class Character{
        constructor(name, x, y, element, direction, speed){
            this.x = x
            this.y = y
            this.element = element
            this.direction = direction
            this.speed = speed
            this.startX = x
            this.startY = y
        }

        reset() {
            this.x = this.startX
            this.y = this.startY

            if (this === player) {
                this.direction = "right"
            }
        }
    }

    //Pacman Class
    class Player extends Character{
        constructor(name, x, y, element, direction, speed, img, hp) {
            super(name, x, y, element, direction, speed)
            this.img = img
            this.hp = hp
        }
    }

    //Ghost Class
    class Ghost extends Character{
        constructor(name, x, y, element, direction, speed) {
            super(name, x, y, element, direction, speed)
        }
    }

    //Map Classe
    class Game {
        constructor(map) {
            this.map = map
            this.score = 0
            this.totalScore = 0
            this.frames = 0
            this.mobile = false
        }

        switchMap() {

            if (this.map === jsonMap2) {
                this.map = jsonMap3
            }

            if (this.map === jsonMap1) {
                this.map = jsonMap2
            }

        }
    }

    const game = new Game(jsonMap1)

    //Erstellt alle Geister mit Koordinaten und dem HTML Element
    const ghosts = [
        new Ghost('blinky', 230, 400, document.getElementById("blinky"), "right", 1),
        new Ghost('pinky', 230, 400, document.getElementById("pinky"), "left", 1),
        new Ghost('inky', 230, 400, document.getElementById("inky"), "up", 1),
        new Ghost('clyde', 230, 400, document.getElementById("clyde"), "down", 1)
    ]

    //Erstellt Pacman
    const player = new Player('pacMan', 240, 240, document.getElementById("player"),"right", 3, 1, 1)

    //1x zeichnen
    drawMap(game.map)
    drawPoints()

    //Events auf den Mobile Controls und Restart
    createButtonEvents()

    //Game-Loop
    function gameController() {

        ghostController()
        drawGhosts()

        playerController()
        drawPlayer()

        collisionPlayerGhost()
        levelController()
        game.frames += 1
        document.addEventListener('keyup', keyPressed)
        document.getElementById("pointsBoard").innerHTML = game.score + " Points"

    }
    window.setInterval(gameController, 20)

    function playerController() {

        movePlayer(player.x, player.y, player.direction, player.speed)
        collision(player.x, player.y, player.speed, player, game.map)

        teleport(player.x, player.y)
        pickUpPoint(player.x, player.y)
    }

    function ghostController() {

        moveGhosts()
        ghostsCollision()

        if (game.frames % 150 === 0) {
            for (let i = 0; i < ghosts.length; i++) {
            ghosts[i].direction = randomDirection(ghosts[i].direction)
            }
        }

    }

    function drawPlayer() {

        player.element.style.left = document.getElementById('playground').getBoundingClientRect().left + player.x + "px"
        player.element.style.top = document.getElementById('playground').getBoundingClientRect().top + player.y + "px"
       changeImage()
    }

    function drawGhosts() {

        for (let i = 0; i < ghosts.length; i++) {
            ghosts[i].element.style.left = document.getElementById('playground').getBoundingClientRect().left + ghosts[i].x + "px"
            ghosts[i].element.style.top = document.getElementById('playground').getBoundingClientRect().top + ghosts[i].y + "px"
        }
    }


    function gameEnd(score) {

        document.getElementById("playground").style.display = "none"
        document.getElementById("teleporter").style.display = "none"
        document.getElementById("pointsBoard").style.display = "none"
        document.getElementById("controllsBoard").style.display = "none"
        document.getElementById("toggleArrows").style.display = "none"
        document.getElementById("lowerControlls").style.display = "none"
        document.querySelector(".level").style.display = "none"
        document.getElementById("upArrow").style.display = "block"
        document.getElementById("upArrow").innerHTML = score


        document.getElementById("gameOver").style.display = "flex"
        document.getElementById("restart").style.display = "flex"

        for (let i = 0; i < ghosts.length; i++) {
            ghosts[i].speed = 0
        }

        player.speed = 0

    }

    function resetGame() {

        document.getElementById("playground").style.display = "flex"
        document.getElementById("teleporter").style.display = "flex"
        document.getElementById("pointsBoard").style.display = "flex"
        document.getElementById("controllsBoard").style.display = "flex"
        document.getElementById("toggleArrows").style.display = "flex"
        document.querySelector(".level").style.display = "block"
        document.getElementById("gameOver").style.display = "none"
        document.getElementById("restart").style.display = "none"

        for (let i = 0; i < ghosts.length; i++) {
            ghosts[i].reset()
            ghosts[i].speed = 1
        }

        let counter = 0

        //Alle Punkte löschen
        for (let i = 0; i < 22 * 22; i++) {
            let element = document.getElementById("point_" + counter)
            element.remove()
            counter++
        }

        counter = 0

        //Map löschen
        for (let i = 0; i < game.map.length; i++) {
            let element = document.getElementById("obstacle_" + counter)
            element.remove()
            counter++
        }

        for (let i = 0; i < ghosts.length; i++) {
            ghosts[i].reset()
        }



        player.reset()
        player.speed = 3
        drawPoints()



        //Restart
        if (player.hp === 0) {
            player.hp = 1
            game.map = jsonMap1
        }

        document.getElementById("upArrow").style.display = "none"
        document.getElementById("upArrow").innerHTML = "ᐃ"

        drawMap(game.map)
        game.score = 0
    }


    function ghostsCollision() {
        //Collision Geister mit Map
        for (let i = 0; i < ghosts.length; i++) {

            if (collision(ghosts[i].x, ghosts[+i].y, ghosts[i].speed, ghosts[i], game.map)) {
                ghosts[i].direction = randomDirection(ghosts[i].direction)
            }
        }
    }

    function collisionPlayerGhost() {
        //Collision Player mit Geistern
        for (let i = 0; i < ghosts.length; i++) {
            if (player.x > ghosts[i].x - 15 && player.x < ghosts[i].x + 10 &&
                player.y > ghosts[i].y - 15 && player.y < ghosts[i].y + 10) {
                player.hp = 0
                gameEnd(game.score + game.totalScore)
            }
        }
    }

    function moveGhosts() {
        //Automatische Bewegung der Geister
        for (let j = 0; j < ghosts.length; j++) {

            switch (ghosts[j].direction) {
                case "left":
                    ghosts[j].x -= ghosts[j].speed;
                    break
                case "right":
                    ghosts[j].x += ghosts[j].speed;
                    break
                case "up":
                    ghosts[j].y += ghosts[j].speed;
                    break
                case "down":
                    ghosts[j].y -= ghosts[j].speed;
                    break
                default:
                    break
            }
        }
    }

    function randomDirection(direction){
        //Gibt Zufällige Direction zurück
        const newDirection= ["left","right", "up", "down"]

        let random = Math.floor((Math.random()*newDirection.length))

        if (newDirection[random] !== direction) {
            return newDirection[random]}
            else {
                return newDirection[Math.floor((Math.random()**newDirection.length))]}
    }

    function keyPressed(e) {
        //Direction von player ändern
        switch (e.keyCode) {

            case 65: //A
            case 37: //Linke Pfeiltaste

                player.direction = "left"
                break

            case 68: //D
            case 39: //Rechte Pfeiltaste
                player.direction = "right"
                break

            case 87: //W
            case 38: //Obere Pfeiltaste
                player.direction = "up"
                break

            case 83: //S
            case 40: //Untere Pfeiltaste
                player.direction = "down"
                break

            default:
                break
        }

    }

    function movePlayer(xPos, yPos, direction, moveValue) {
            //player position ändern nach Direction
            switch (direction) {
                case "left":
                    player.x = xPos - moveValue
                    player.element.style.transform = "rotate(180deg)"
                    break

                case "right":
                    player.x = xPos + moveValue
                    player.element.style.transform = "rotate(0deg)"
                    break

                case "up":
                    player.y = yPos - moveValue
                    player.element.style.transform = "rotate(270deg)"
                    break

                case "down":
                    player.y = yPos + moveValue
                    player.element.style.transform = "rotate(90deg)"
                    break

                default:
                    break
            }
    }



    function collision(xPos, yPos, moveValue, object, map) {

//Map Ränder

    //Rechts
        if (xPos > (475)) {
            object.x = xPos - moveValue
            return true;

    //Links
        } else if (xPos < (8)) {
            object.x = xPos + moveValue
            return true;
        }

    //Unten
        if (yPos > (470)) {
            object.y = yPos - moveValue
            return true;

    //Oben
        } else if (yPos < (8)) {
            object.y = yPos + moveValue
            return true;

        }

//Hindernisse

        for (let i = 0; i < map.length; i++){

            //Links
            if (xPos > map[i][0] - 25 && xPos < map[i][0] &&
                yPos > map[i][1] && yPos < map[i][1] + map[i][3]) {

                object.x = xPos - moveValue
                return true;
            }

            //Rechts
            if (xPos <  map[i][0] + map[i][2] + 6 && xPos > map[i][0] + map[i][2] - 2 &&
                yPos > map[i][1] && yPos < map[i][1] + map[i][3]) {

                object.x = xPos + moveValue
                return true;
            }

            //Oben
            if (yPos >  map[i][1] - 25 && yPos <  map[i][1] &&
                xPos >  map[i][0] && xPos <  map[i][0] + map[i][2]) {

                object.y = yPos - moveValue
                return true;
            }

            //Unten
            if (yPos <  map[i][1] + map[i][3] + 6 && yPos > map[i][1] + map[i][3] &&
                xPos >  map[i][0] && xPos < map[i][0] + map[i][2]) {

                object.y = yPos + moveValue
                return true;
            }
        }
        return false;

    }


    function changeImage() {
        //Mund öffnen/schließen alle 10 frames
        let newImg

        if (game.frames % 10 === 0) {

            if (player.img === 1) {
                newImg = 2

            }  else if (player.img === 2) {
                newImg = 1
            }

            player.img = newImg
            player.element.src = "images/player" + newImg + ".png"
        }
    }

    function pickUpPoint(xPos, yPos) {
        //Collision mit Punkten und Score hochzählen
        game.score = 0

        for (let i = 0; i < 22 * 22; i++) {

            let currentPoint = document.getElementById("point_" + i)
            let xPoint = document.getElementById("point_" + i).style.left
            let yPoint = document.getElementById("point_" + i).style.top


            if (xPos > parseInt(xPoint) - 15 && xPos < parseInt(xPoint) + 10 &&
                yPos > parseInt(yPoint) - 15 && yPos < parseInt(yPoint) + 10) {

                currentPoint.style.display = "none"
            }

            if (currentPoint.style.display === "none") { game.score++ }
        }


    }

    function teleport(xPos, yPos) {

    //Rechts
        if (xPos >  470 && yPos >  220 && yPos <  260 && player.direction === "right") {
            player.x = 30
            player.y = 230
        }
    //Links
        if (xPos < 10 && yPos > 220 && yPos < 260 && player.direction === "left") {
            player.x = 450
            player.y = 230
        }
    }

    function drawPoints() {
        //22 x 22 Punkte zeichnen mit HTML-Id
        let row = 22
        let counter = 0;

        for (let i = 0; i < row; i++) {

            for (let j = 0; j < row; j++) {

                let div = document.createElement("div");
                document.getElementById("points").appendChild(div);
                div.id = "point_" + counter


                let point = document.getElementById("point_" + counter)

                point.style.left = j * row + 17.5 + "px"
                point.style.top = i * row + 17.5 + "px"
                point.className = "points"

                counter++
            }
        }

    }

    function drawMap(data) {
        //Map aus json erstellen mit HTML-Id
        for (let i = 0; i < data.length; i++) {
            let div = document.createElement("div");

            document.getElementById("obstacles").appendChild(div);
            div.id = "obstacle_" + i

            let obstacle = document.getElementById("obstacle_" + i)

            obstacle.style.left = data[i][0] + "px"
            obstacle.style.top = data[i][1] + "px"

            obstacle.style.width = data[i][2] + "px"
            obstacle.style.height = data[i][3] + "px"

            obstacle.className = "obstacle"

        }
    }

    function createButtonEvents() {
        //Onclick events
        document.getElementById("restart").onclick = function () {resetGame()}
        document.getElementById("upArrow").onclick = function () {mobileController("up")}
        document.getElementById("leftArrow").onclick = function () {mobileController("left")}
        document.getElementById("downArrow").onclick = function () {mobileController("down")}
        document.getElementById("rightArrow").onclick = function () {mobileController("right")}
        document.getElementById("toggleArrows").onclick = function (){
            document.getElementById("upArrow").style.display = "block"
            document.getElementById("lowerControlls").style.display = "flex"
            game.mobile = true
        }

    }

    function mobileController(key) {
        //ändert player direction mit mobile Controls
        switch (key) {
            case "up":
                player.direction = "up"
                break
            case "down":
                player.direction = "down"
                break
            case "left":
                player.direction = "left"
                break
            case "right":
                player.direction = "right"
                break
        }
    }

    function levelController() {
        //Level 1 (0 Punkte) = Map 1 + speed 1
        //Level 2 (50 Punkte) = Map 1 + speed 2
        //Level 3 (0 Punkte) = Map 2 + speed 1
        //Level 4 (50 Punkte) = Map 2 + speed 2
        //Level 5 (100 Punkte) = Map 2 + speed 3
        //Level 6 (0 Punkte) = Map 3 + speed 1
        //Level 7 (50 Punkte) = Map 3 + speed 2
        //Level 8 (100 Punkte) = Map 3 + speed 3
        //Level 9 (200 Punkte) = Map 3 + speed 4

        //Ghost Speed
        if (game.score === 50) {
            for (let i = 0; i < ghosts.length; i++) {
                ghosts[i].speed = 2
            }
        }

            if (game.score === 100) {
                for (let i = 0; i < ghosts.length; i++) {
                    ghosts[i].speed = 3
                }
            }

        if (game.score === 200) {
            for (let i = 0; i < ghosts.length; i++) {
                ghosts[i].speed = 4
            }

        }

        if (game.map === jsonMap1 && game.score >= 100) {
            game.totalScore = game.score
            resetGame()
            game.switchMap()
            drawMap(game.map)
        }

        if (game.map === jsonMap2 && game.score >= 200) {
            game.totalScore += game.score
            resetGame()
            game.switchMap()
            drawMap(game.map)

        }

        if (game.map === jsonMap3 && game.score >= 300) {
            game.totalScore += game.score
            resetGame()
            gameEnd(game.totalScore)
            game.totalScore = 0
        }
    }

})








