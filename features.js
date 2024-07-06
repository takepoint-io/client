(() => {
    //Classes
    class Game {
        static teamColors = ["#ed5555", "#3cd157", "#5597ff"];
        static teamColorsSolid = ["#ff2d00", "#00ff11", "#002cff"];
        static weaponNames = ["pistol", "assault", "sniper", "shotgun"];
        constructor(socket) {
            this.socket = socket;
            this.throwables = new Map();
            this.players = new Map();
            this.myID = null;
            this.self = null;
            this.attachment = {
                available: 0,
                toDraw: []
            };
            this.slashCommands = [];
            this.chatbox =  document.getElementById("chatbox");
            this.socket.addEventListener("message", packet => {
                try {
                    onMessage(packet);
                } catch (e) {}
            });
            this.chatbox.oninput = () => { onChatInput() };
            this.canvas = document.getElementById("canvas").getContext("2d");
            this.hud = document.getElementById("hud").getContext("2d");
            Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
                Browser.requestAnimationFrame(Browser.mainLoop.runner);
                drawGame();
            };
        }

        selectAttachment(id) {
            let packet = new Packet("attachment")
            packet.setParams(id);
            this.socket.send(packet.encode());
        }
    }

    class Packet {
        constructor(type) {
            this.params = [];
            if (type == "attachment") this.opcode = "y";
        }

        setParams(...args) {
            this.params = args;
        }

        encode() {
            let data = [this.opcode, ...this.params].join(",");
            return new TextEncoder().encode(data);
        }
    }

    class Player {
        constructor(id, x, y, angle, weaponID) {
            this.id = id;
            this.x = x;
            this.y = y;
            this.angle = angle;
            this.weapon = new Weapon(weaponID);
        }
    }

    class Weapon {
        constructor(id) {
            this.id = id;
            this.name = Game.weaponNames[this.id];
            this.attachment = null;
        }
        setAttachment(id) {
            switch (this.name) {
                case "assault":
                    if (id == 1) this.attachment = "fireRate";
                    break;
                case "sniper":
                    if (id == 1) this.attachment = "highImpact";
                    break;
                case "shotgun":
                    if (id == 1) this.attachment = "longBarrel";
                    break;
            }
        }
    }

    class Throwable {
        constructor(id, type, x, y, radius, teamCode) {
            this.id = id;
            this.type = type;
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.teamCode = teamCode;
        }
        update(x, y, radius) {
            this.x = x;
            this.y = y;
            this.radius = radius;
        }
    }

    class Util {
        static isInBox(x, y, ox, oy, width, height) {
            return (x >= ox && x <= ox + width && y >= oy && y <= oy + height) ? true : false;
        }
    }

    //Handlers
    function onMessage(packet) {
        let packetDecoded = new TextDecoder().decode(packet.data);
        let statePackets = packetDecoded.split("|");
        for (let statePacket of statePackets) {
            let parts = statePacket.split(",");
            let opcode = parts[0];
            switch (opcode) {
                case ".": {
                    break;
                }
                case "a": {
                    let playerID = +parts[1];
                    //let teamCode = +parts[2];
                    let weaponID = +parts[3];
                    let x = +parts[4];
                    let y = +parts[5];
                    game.myID = playerID;
                    let player = new Player(playerID, x, y, 0, weaponID);
                    game.players.set(player.id, player);
                    game.self = game.players.get(player.id);
                    break;
                }
                case "b": {
                    let playerID = +parts[1];
                    let x = +parts[2];
                    let y = +parts[3];
                    let angle = +parts[6];
                    let weaponAttachmentID = +parts[7];
                    let player = game.players.get(playerID);
                    player.x = x;
                    player.y = y;
                    player.angle = angle;
                    if (weaponAttachmentID) player.weapon.setAttachment(weaponAttachmentID);
                    break;
                }
                case "d": {
                    let playerID = +parts[1];
                    //let teamCode = +parts[2];
                    let weaponID = +parts[3];
                    let x = +parts[4];
                    let y = +parts[5];
                    let angle = +parts[7];
                    let weaponAttachmentID = +parts[17];
                    let player = new Player(playerID, x, y, angle, weaponID);
                    if (weaponAttachmentID) player.weapon.setAttachment(weaponAttachmentID);
                    game.players.set(player.id, player);
                    break;
                }
                case "e": {
                    let playerID = +parts[1];
                    if (playerID == game.myID) {
                        game.attachment.available = 0;
                        game.attachment.toDraw = [];
                    }
                    game.players.delete(playerID);
                }
                case "f": {
                    let weaponID = +parts[11];
                    let attachmentAvailable = +parts[14];
                    if (!self) return;
                    if (weaponID) {
                        self.weapon = new Weapon(weaponID);
                    }
                    if (attachmentAvailable === 0 || attachmentAvailable === 1) {
                        game.attachment.available = attachmentAvailable;
                        switch (self.weapon.name) {
                            case "assault":
                                game.attachment.toDraw.push({
                                    name: "Rapid Fire",
                                    id: 1,
                                    prop: "fireRate"
                                });
                                break;
                            case "sniper":
                                game.attachment.toDraw.push({
                                    name: "High Impact",
                                    id: 1,
                                    prop: "highImpact"
                                });
                                break;
                            case "shotgun":
                                game.attachment.toDraw.push({
                                    name: "Longer Barrel",
                                    id: 1,
                                    prop: "longBarrel"
                                });
                                break;
                        }
                    }
                    break;
                }
                case "m": {
                    let grenadeID = +parts[1];
                    let type = +parts[2];
                    let x = +parts[3];
                    let y = +parts[4];
                    let teamCode = +parts[8];
                    let grenade = new Throwable(grenadeID, type, x, y, 0, teamCode);
                    game.throwables.set(grenadeID, grenade);
                    break;
                }
                case "n": {
                    let grenadeID = +parts[1];
                    let x = +parts[2];
                    let y = +parts[3];
                    let radius = +parts[8];
                    game.throwables.get(grenadeID).update(x, y, radius);
                    break;
                }
                case "o": {
                    let grenadeID = +parts[1];
                    game.throwables.delete(grenadeID);
                    break;
                }
                case "sl": {
                    let slashCommands = [];
                    for (let i = 1; i < parts.length; i++) {
                        slashCommands.push(parts[i]);
                    }
                    game.slashCommands = slashCommands;
                }
            }
        }
    }

    function onChatInput() {
        let contents = game.chatbox.value;
        displaySlashCommands(contents);
    }

    function displaySlashCommands(userInput) {
        let slashCommandContainer = document.getElementById("slashCommandContainer");
        slashCommandContainer.innerHTML = '';
        if (userInput.length) for (let cmd of game.slashCommands) {
            let cmdName = "/" + cmd;
            if (!cmdName.startsWith(userInput)) continue;
            let cmdDiv = document.createElement("div");
            cmdDiv.innerText = cmdName;
            slashCommandContainer.appendChild(cmdDiv);
        }
        if (slashCommandContainer.hasChildNodes() && slashCommandContainer.style.display != "grid") {
            slashCommandContainer.style.display = "grid";
        } else if (!slashCommandContainer.hasChildNodes()) {
            slashCommandContainer.style.display = "none";
        }
    }

    function drawGame() {
        preDraw: {
            window.hovering = false;
        }
        //buggy, we need to adjust by adding viewport width/height
        //drawWeapons();
        drawHud();
        postDraw: {
            window.mouseEvents = [];
        }
    }

    function drawWeapons() {
        let ctx = game.canvas;
        let canvasHeight = (ctx.canvas.height / window.devicePixelRatio) / window.canvasScale;
        let canvasWidth = (ctx.canvas.width / window.devicePixelRatio) / window.canvasScale;
        for (let [id, player] of game.players) {
            if (id == game.myID) continue;
            let playerRelative = getRelPos(player.x, player.y, canvasHeight, canvasWidth);
            ctx.fillRect(playerRelative.x, playerRelative.y, 50, 50);
        }

    }

    function drawHud() {
        let hud = game.hud;
        let canvasHeight = (hud.canvas.height / window.devicePixelRatio) / window.hudScale;
        let canvasWidth = (hud.canvas.width / window.devicePixelRatio) / window.hudScale;
        let mouseX = window.mousePos[0] / window.hudScale;
        let mouseY = window.mousePos[1] / window.hudScale;
        if (game.attachment.available) {
            let choices = game.attachment.toDraw;
            let height = 80;
            let width = 80;
            let startOffsetY = (canvasHeight / 8) + height;
            for (let i = 0; i < choices.length; i++) {
                let choice = choices[i];
                let x = canvasWidth - width - 5;
                let y = startOffsetY + i * (height + 10);
                for (let j = 0; j < window.mouseEvents.length; j++) {
                    let evt = window.mouseEvents[j];
                    let eX = evt.x / window.hudScale;
                    let eY = evt.y / window.hudScale;
                    if (evt.btn == 1 && evt.pressed && Util.isInBox(eX, eY, x, y, width, height)) {
                        game.selectAttachment(choice.id);
                    }
                }
                let hovering = Util.isInBox(mouseX, mouseY, x, y, width, height);
                if (hovering) window.hovering = true;
                let border = hovering ? 1 : 2;
                //Draw border
                hud.beginPath();
                hud.globalAlpha = 1;
                hud.strokeStyle = "#4a4a4a";
                hud.lineWidth = border;
                hud.roundRect(x, y, width, height, 3);
                hud.stroke();
                hud.closePath();
                //Fill inside
                hud.beginPath();
                hud.roundRect(x + border / 2, y + border / 2, width - border, height - border, 3);
                hud.globalAlpha = 0.5;
                hud.fillStyle = "#b4b4b4"
                if (hovering) {
                    hud.globalAlpha = 1;
                    hud.fillStyle = "#d3d3d3";
                    ASM_CONSTS[134836]();
                }
                hud.fill();
                hud.closePath();
                //Draw text and svg
                hud.globalAlpha = 1;
                if (images[choice.prop]) hud.drawImage(images[choice.prop], x + 15, y + 6, width - 30, height - 30);
                hud.fillStyle = "#ffffff";
                hud.font = "16px Orbitron, sans-serif";
                hud.textAlign = "center";
                hud.lineWidth = 4;
                let txt = choice.name;
                let textWidth = hud.measureText(txt).width;
                if (textWidth > width - 20) {
                    txt = txt.split(" ");
                    hud.font = "13px Orbitron, sans-serif";
                    hud.lineWidth = 3;
                    hud.strokeText(txt[0], x + width / 2, y + height - 17);
                    hud.fillText(txt[0], x + width / 2, y + height - 17);
                    hud.strokeText(txt[1], x + width / 2, y + height - 5);
                    hud.fillText(txt[1], x + width / 2, y + height - 5);
                }
                else {
                    hud.strokeText(txt, x + width / 2, y + height - 15);
                    hud.fillText(txt, x + width / 2, y + height - 15);
                }
            }
        }
    }

    function getRelPos(x, y, width, height) {
        return {
            x: x - game.self.x,
            y: y - game.self.y
        };
    }

    //Init
    let game;

    let images = {};
    ["highImpact", "longBarrel", "fireRate"].forEach(n => {
        let img = new Image();
        img.src = '/img/' + n + '.svg';
        img.onload = function() {
            images[n] = img;
        }
    });

    window.hookWS = function(socket) {
        game = new Game(socket);
    }
    window.mousePos = [0, 0];
    window.mouseEvents = [];

    let asmConstsOverride = setInterval(() => {
        if (ASM_CONSTS) {
            ASM_CONSTS[135336] = function($0, $1, $2, $3, $4, $5) {
                if (contexts[$0].fillStyle == "#ddd763")  {
                    for (let [_id, throwable] of game.throwables) {
                        if ($3 == throwable.radius) {
                            contexts[$0].fillStyle = Game.teamColors[throwable.teamCode];
                            contexts[$0].strokeStyle = Game.teamColorsSolid[throwable.teamCode];
                        }
                    }
                }
                contexts[$0].arc($1 , $2 , $3 , $4, $5);
            }
            clearInterval(asmConstsOverride);
        }
    }, 16);
})();