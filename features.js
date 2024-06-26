(() => {
    //Classes
    class Game {
        static teamColors = ["#ed5555", "#3cd157", "#5597ff"];
        static teamColorsSolid = ["#ff2d00", "#00ff11", "#002cff"];
        constructor(socket) {
            this.socket = socket;
            this.throwablesInView = new Map();
            this.socket.addEventListener("message", packet => {
                try {
                    onMessage(packet);
                } catch (e) {}
            });
        }
        spawn(teamCode) {
            this.teamCode = teamCode;
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
                    let teamCode = +parts[2];
                    game.spawn(teamCode);
                    break;
                }
                case "m": {
                    let grenadeID = +parts[1];
                    let type = +parts[2];
                    let x = +parts[3];
                    let y = +parts[4];
                    let teamCode = +parts[8];
                    let grenade = new Throwable(grenadeID, type, x, y, 0, teamCode);
                    game.throwablesInView.set(grenadeID, grenade);
                    break;
                }
                case "n": {
                    let grenadeID = +parts[1];
                    let x = +parts[2];
                    let y = +parts[3];
                    let radius = +parts[8];
                    game.throwablesInView.get(grenadeID).update(x, y, radius);
                    break;
                }
                case "o": {
                    let grenadeID = +parts[1];
                    game.throwablesInView.delete(grenadeID);
                    break;
                }
            }
        }
    }

    //Init
    let game;

    window.hookWS = function(socket) {
        game = new Game(socket);
    }

    let asmConstsOverride = setInterval(() => {
        if (ASM_CONSTS) {
            ASM_CONSTS[135336] = function($0, $1, $2, $3, $4, $5) {
                if (contexts[$0].fillStyle == "#ddd763")  {
                    for (let [_id, throwable] of game.throwablesInView) {
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