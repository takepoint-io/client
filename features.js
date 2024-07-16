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
            this.self = new Player(null, 0, 0, 0, 0, 0, 0);
            this.self.alive = false;
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
        constructor(id, x, y, spdX, spdY, angle, weaponID) {
            this.id = id;
            this.x = x;
            this.y = y;
            this.spdX = spdX;
            this.spdY = spdY;
            this.angle = angle;
            this.weapon = new Weapon(weaponID);
            this.alive = true;
        }

        calcWeaponPos() {
            return {
                x: Math.cos(Util.toRadians(this.angle + 37)) * 25,
                y: Math.sin(Util.toRadians(this.angle + 37)) * 25
            }
        }
    }

    class Weapon {
        constructor(id) {
            this.id = id;
            this.name = Game.weaponNames[this.id];
            this.reloading = false;
            this.firing = false;
            this.firingFrame = 0;
            this.attachment = null;
        }
        update() {
            if (this.firing) this.firingFrame++;
            if (this.reloading) this.reloadingFrame++;
        }
        setAttachment(id) {
            switch (this.name) {
                case "assault":
                    if (id == 1) this.attachment = Game.attachments.fireRate;
                    else if (id == 2) this.attachment = Game.attachments.unlimitedAmmo;
                    break;
                case "sniper":
                    if (id == 1) this.attachment = Game.attachments.highImpact;
                    else if (id == 2) this.attachment = Game.attachments.explosiveRounds;
                    break;
                case "shotgun":
                    if (id == 1) this.attachment = Game.attachments.longBarrel;
                    else if (id == 2) this.attachment = Game.attachments.droneLauncher;
                    break;
            }
        }
    }

    class Attachment {
        constructor(...args) {
            this.id = args[0];
            this.name = args[1];
            this.prop = args[2];
            this.color = args[3];
        }
    }

    Game.attachments = {
        fireRate:        new Attachment(1, "Rapid Fire", "fireRate", "#ffa54e"),
        unlimitedAmmo:   new Attachment(2, "Unlimited Ammo", "unlimitedAmmo", "#f060dd"),
        highImpact:      new Attachment(1, "High Impact", "highImpact", "#95ffe9"),
        explosiveRounds: new Attachment(2, "Explosive Rounds", "explosiveRounds", "#95ff98"),
        longBarrel:      new Attachment(1, "Longer Barrel", "longBarrel", "#95b1ff"),
        droneLauncher:   new Attachment(2, "Drone Launcher", "droneLauncher", "#fff795")
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
        static toRadians(degrees) {
            return degrees * Math.PI / 180;
        }
        static roundTowardZero(n) {
            return n >= 0 ? Math.floor(n ) : Math.ceil(n);
        }
    }

    //Handlers
    function onMessage(packet) {
        let packetDecoded = new TextDecoder().decode(packet.data);
        let statePackets = packetDecoded.split("|");
        let playerStateCount = 0;
        for (let statePacket of statePackets) {
            let parts = statePacket.split(",");
            let opcode = parts[0];
            //right now, all updating happens here,
            //but later I should offload it to the instaces of classes that are affected.
            switch (opcode) {
                case ".": {
                    break;
                }
                case "a": {
                    let playerID = parseInt(parts[1]);
                    let teamCode = parseInt(parts[2]);
                    let weaponID = parseInt(parts[3]);
                    let x = parseInt(parts[4]);
                    let y = parseInt(parts[5]);
                    game.myID = playerID;
                    let player = new Player(playerID, x, y, 0, 0, 0, weaponID);
                    game.players.set(player.id, player);
                    game.self = player;
                    break;
                }
                case "b": {
                    let playerID = parseInt(parts[1]);
                    let x = parseInt(parts[2]);
                    let y = parseInt(parts[3]);
                    let spdX = parseInt(parts[4]);
                    let spdY = parseInt(parts[5]);
                    let angle = parseInt(parts[6]);
                    let player;
                    if (playerID == game.myID || (!game.myID && playerStateCount == 0)) {
                        player = game.self;
                        game.myID = playerID;
                    }
                    else player = game.players.get(playerID);
                    player.x = x;
                    player.y = y;
                    player.spdX = spdX;
                    player.spdY = spdY;
                    player.angle = angle;
                    playerStateCount++;
                    break;
                }
                case "c": {
                    let playerID = parseInt(parts[1]);
                    let firing = parseInt(parts[2]);
                    let reloading = parseInt(parts[3]);
                    let deathFrame = parseInt(parts[7]);
                    let player;
                    if (playerID == game.myID) player = game.self;
                    else player = game.players.get(playerID);
                    if (!isNaN(firing)) {
                        player.weapon.firing = Boolean(firing);
                        if (player.weapon.firing) player.weapon.firingFrame = 0;
                    }
                    if (!isNaN(reloading)) {
                        player.weapon.reloading = Boolean(reloading)
                        if (player.weapon.reloading) player.weapon.reloadingFrame = 0;
                    };
                    if (!isNaN(deathFrame)) player.alive = false;
                    break;
                }
                case "d": {
                    let playerID = parseInt(parts[1]);
                    let teamCode = parseInt(parts[2]);
                    let weaponID = parseInt(parts[3]);
                    let x = parseInt(parts[4]);  
                    let y = parseInt(parts[5]);
                    let angle = parseInt(parts[7]);
                    let weaponAttachmentID = parseInt(parts[17]);
                    let player = new Player(playerID, x, y, 0, 0, angle, weaponID);
                    if (weaponAttachmentID) player.weapon.setAttachment(weaponAttachmentID);
                    game.players.set(player.id, player);
                    break;
                }
                case "e": {
                    let playerID = parseInt(parts[1]);
                    if (playerID == game.myID) {
                        game.attachment.available = 0;
                        game.attachment.toDraw = [];
                    }
                    game.players.delete(playerID);
                    break;
                }
                case "f": {
                    let weaponID = parseInt(parts[11]);
                    let attachmentAvailable = parseInt(parts[14]);
                    let attachmentID = parseInt(parts[15]);
                    if (!game.self) return;
                    if (weaponID) game.self.weapon = new Weapon(weaponID);
                    if (attachmentID) game.self.weapon.setAttachment(attachmentID);
                    if (attachmentAvailable === 0 || attachmentAvailable === 1) {
                        game.attachment.available = attachmentAvailable;
                        switch (game.self.weapon.name) {
                            case "assault":
                                game.attachment.toDraw.push(Game.attachments.fireRate);
                                game.attachment.toDraw.push(Game.attachments.unlimitedAmmo);
                                break;
                            case "sniper":
                                game.attachment.toDraw.push(Game.attachments.highImpact);
                                game.attachment.toDraw.push(Game.attachments.explosiveRounds);
                                break;
                            case "shotgun":
                                game.attachment.toDraw.push(Game.attachments.longBarrel);
                                game.attachment.toDraw.push(Game.attachments.droneLauncher);
                                break;
                        }
                    }
                    break;
                }
                case "m": {
                    let grenadeID = parseInt(parts[1]);
                    let type = parseInt(parts[2]);
                    let x = parseInt(parts[3]);
                    let y = parseInt(parts[4]);
                    let teamCode = parseInt(parts[8]);
                    let grenade = new Throwable(grenadeID, type, x, y, 0, teamCode);
                    game.throwables.set(grenadeID, grenade);
                    break;
                }
                case "n": {
                    let grenadeID = parseInt(parts[1]);
                    let x = parseInt(parts[2]);
                    let y = parseInt(parts[3]);
                    let radius = parseInt(parts[8]);
                    game.throwables.get(grenadeID).update(x, y, radius);
                    break;
                }
                case "o": {
                    let grenadeID = parseInt(parts[1]);
                    game.throwables.delete(grenadeID);
                    break;
                }
                case "sl": {
                    let slashCommands = [];
                    for (let i = 1; i < parts.length; i++) {
                        slashCommands.push(parts[i]);
                    }
                    game.slashCommands = slashCommands;
                    break;
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
            game.self.angle = window.mouseAngle;
        }
        updatePositions();
        updateWeapons();
        drawWeapons();
        drawHud();
        postDraw: {
            window.mouseEvents = [];
        }
    }

    function updatePositions() {
        for (let [id, player] of game.players) {
            if (id == game.myID) continue;
            //ms per frame / ms per tick
            player.x += Util.roundTowardZero(player.spdX * 0.4);
            player.y += Util.roundTowardZero(player.spdY * 0.4);
        }
        let self = game.self;
        self.x += Util.roundTowardZero(self.spdX * 0.4);
        self.y += Util.roundTowardZero(self.spdY * 0.4);
    }

    function updateWeapons() {
        for (let [id, player] of game.players) {
            if (id == game.myID) continue;
            player.weapon.update();
        }
        game.self.weapon.update();
    }

    function drawWeapons() {
        let ctx = game.canvas;
        let canvasHeight = (ctx.canvas.height / window.devicePixelRatio) / window.canvasScale;
        let canvasWidth = (ctx.canvas.width / window.devicePixelRatio) / window.canvasScale;
        for (let [id, player] of game.players) {
            if (id == game.myID) continue;
            drawAttachments(ctx, player, canvasWidth, canvasHeight);
        }
        drawAttachments(ctx, game.self, canvasWidth, canvasHeight);
    }

    function drawAttachments(ctx, player, width, height) {
        if (!player.alive || !player.weapon.attachment) return;
        let attachment = player.weapon.attachment;
        let playerRelative = getRelPos(player.x, player.y, width, height);
        let weaponPos = player.calcWeaponPos();
        let squarePos = { x: playerRelative.x + weaponPos.x, y: playerRelative.y + weaponPos.y };
        if (!player.weapon.reloading) drawAttachmentSquare(ctx, player, squarePos, attachment.color);
        if (attachment.prop == "longBarrel") {
            drawExtendedBarrel(ctx, player, playerRelative);
        }
    }

    function drawExtendedBarrel(ctx, player, pos) {
        let weapon = player.weapon;
        let extendedBarrel = [
            [86, 20],
            [86, 23],
            [113, 23],
            [113, 20],
            [86, 20]
        ];
        if (weapon.firing) {
            if (weapon.firingFrame < 6) {
                extendedBarrel[2][1] = 23 + weapon.firingFrame * 0.05;
                extendedBarrel[3][1] = 19 - weapon.firingFrame * 0.05;
                for (let i = 0; i < extendedBarrel.length; i++) {
                    extendedBarrel[i][0] -= weapon.firingFrame * 0.25;
                }
            } else if (weapon.firingFrame < 12) {
                let frame = weapon.firingFrame - 5;
                extendedBarrel[2][1] = 23 + (6 - frame) * 0.05;
                console.log(extendedBarrel[2][1]);
                extendedBarrel[3][1] = 19 - (6 - frame) * 0.05;
                for (let i = 0; i < extendedBarrel.length; i++) {
                    extendedBarrel[i][0] -= (6 - frame) * 0.25;
                }
            }
        } else if (weapon.reloading && weapon.reloadingFrame < 115) {
            extendedBarrel = [
                [87, 28.5],
                [87, 30.5],
                [114, 30.5],
                [114, 28.5],
                [87, 28.5]
            ]
        }
        let rads = Util.toRadians(player.angle);
        let barrelRotated = rotatePolygon(extendedBarrel, rads, pos, 3);
        drawPolygon(ctx, barrelRotated);
        ctx.fillStyle = "#565a5e";
        ctx.fill();
    }

    function drawAttachmentSquare(ctx, player, pos, color) {
        let offsetX = 0;
        let offsetY = 0;
        switch (player.weapon.name) {
            case "assault":
                offsetX = 16;
                offsetY = 5;
                break;
            case "sniper":
                offsetX = 12;
                offsetY = 2;
                break;
            case "shotgun":
                offsetX = 8;
                offsetY = 4.5;
                break;
        }
        let square = [
            [0, 0],
            [0, 5],
            [9, 5],
            [9, 0],
            [-1.5, 0]
        ].map((e) => [e[0] + offsetX, e[1] + offsetY]);
        let rads = Util.toRadians(player.angle);
        let squareRotated = rotatePolygon(square, rads, pos, 3);
        drawPolygon(ctx, squareRotated);
        ctx.fillStyle = color;
        ctx.fill();
    }

    function rotatePolygon(polygon, rads, pos, lineWidth=4, border="#2d2f33") {
        let polygonRotated = [];
        for (let i = 0; i < polygon.length; i++) {
            let x = polygon[i][0];
            let y = polygon[i][1];
            
            let rotatedX = x * Math.cos(rads) - y * Math.sin(rads);
            let rotatedY = x * Math.sin(rads) + y * Math.cos(rads);
            
            polygonRotated.push([
                pos.x + rotatedX,
                pos.y + rotatedY,
                lineWidth,
                border
            ]);
        }
        return polygonRotated;
    }

    function drawPolygon(ctx, data) {
        ctx.beginPath();
        ctx.moveTo(data[0][0], data[0][1]);
        for (let i = 0; i < data.length; i++) {
            ctx.lineWidth = data[i][2];
            ctx.strokeStyle = data[i][3];
            ctx.lineTo(data[i][0], data[i][1]);
        }
        ctx.stroke();
        ctx.closePath();
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
                    //hud.globalAlpha = 1;
                    hud.fillStyle = choice.color;
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
            x: x - game.self.x + Util.roundTowardZero(game.self.spdX * 0.4) + width / 2,
            y: y - game.self.y + Util.roundTowardZero(game.self.spdY * 0.4) + height / 2
        };
    }

    //Init
    let game = {};
    let images = {};
    window.addEventListener("load", () => {
        ["highImpact", "longBarrel", 
        "fireRate", "unlimitedAmmo",
        "explosiveRounds", "droneLauncher"].forEach(n => {
            let img = new Image();
            img.src = '/img/' + n + '.svg';
            img.onload = function() {
                images[n] = img;
            }
        });
    })
    window.hookWS = function(socket) {
        game = new Game(socket);
    }
    window.mousePos = [0, 0];
    window.mouseAngle = 0;
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
            ASM_CONSTS[135507] = function($0, $1, $2) {
                contexts[$0].lineTo($1, $2);
            }
            ASM_CONSTS[139420] = function($0, $1, $2) {
                var socket = sockets[$0];
                if (!socket) {
                    return;
                }
                if (socket.readyState != 1) {
                    return;
                } else {
                    var str = UTF8ToString($1);
                    if (str[0] == "m") {
                        let parts = str.split(",");
                        let x = parseInt(parts[1]);
                        let y = parseInt(parts[2]);
                        let testAngle = (Math.atan2(y, x) * (180 / Math.PI) + 540) % 360;
                        let calculatedAngle = Math.round((testAngle + Math.asin(18 / Math.sqrt(x * x + y * y)) * 180 / Math.PI)) % 360;
                        calculatedAngle += (360 - calculatedAngle) * 0.001;
                        if (calculatedAngle) window.mouseAngle = calculatedAngle;
                    }
                    var ptr = Module._malloc($2);
                    Module.stringToUTF8(str, ptr, $2 * 4);
                    try {
                        sockets[$0].send(HEAP8.subarray(ptr, ptr + $2));
                        Module._free(ptr);
                    } catch (e) {
                        return;
                    }
                }
            }
            clearInterval(asmConstsOverride);
        }
    }, 16);

    const channel = new BroadcastChannel("_");
    const ts = Date.now();
    setInterval(() => channel.postMessage(ts), 3000);
    channel.onmessage = (ev) => { 
        if (ev.data < ts && game.socket) {
            game.socket.close();
            const t = new Uint8Array(new TextEncoder().encode("t"));
            const b = Module._malloc(t.length);
            writeArrayToMemory(t, b);
            game.socket.events.push([b, t.length, Module.getClientTime()]);
            window.reconnecting = true;
        }
    }
})();