function sendToChat(msg) {
    document.getElementById("chat").innerHTML += msg + "<br>";
    
    var objDiv = document.getElementById("chat");
    objDiv.scrollTop = objDiv.scrollHeight;
}
function clearChat() {
    document.getElementById("chat").innerHTML = "";
    focusChat();
}
function onPressPlayerCount(ev) {
    if (ev.keyCode==13) {
        startNewGame();
    }
    return false;
}
function pressSend(ev) {
    if (ev.keyCode==9) { //Tab
        tabName();
        ev.preventDefault();
    } else {
        stopTab();
    }
    if (ev.keyCode==38) { //Up
        browseChat(-1);
    } else if (ev.keyCode==40) { //Down
        browseChat(1);
    } else {
        
    }
    if (ev.keyCode==13) { //Enter
        sendInput();
    }
    return false;
}
function pressUp(ev) {
    if (ev.keyCode!=38 && ev.keyCode !=40) { //Down
        saveTemporaryMessage();
    }
    return false;
}
function sendInput() {
    var txt = document.getElementById("chatbox").value;
    if (!(txt.length === 0 || !txt.trim())) {
        processInput(document.getElementById("chatbox").value);
    }
    document.getElementById("chatbox").value = "";
    focusChat();
}
function focusChat(){
    document.getElementById("chatbox").focus();
}


function System() {
	this.sendAll = function (msg, channel) {
		if (channel === 0) {
			// if (msg == "The Roles have been Decided! :") {
			if (msg == "±Time: Night 1") {
				gameStarted();
			} else if (msg == "±Game: Type /Join to enter the game!") {
				gamePrepared();
			}
			chatMessage(msg);
		}
	};
	this.sendMessage = function (src, msg, channel) {
		if (channel === 0) {
			if (src == currentPlayer) {
				chatMessage(msg);
			} else if (src == "isPolka" && msg == "±Luxray: GAME ENDED") {
				resetSimulator();
			}
		}
	};
	this.sendHtmlMessage = function (src, msg, channel) {
		if (channel === 0 && src == currentPlayer) {
			sendToChat(msg);
		}
	};
	this.sendHtmlAll = function (msg, channel) {
		if (channel === 0) {
			sendToChat(msg);
		}
	};

	this.fexists = function (name) {
		return false;
	};
	this.makeDir = function (name) {};
	this.writeToFile = function (file, content) {
		return false;
	};
	this.saveVal = function (file, val) {
		return false;
	};
	this.getVal = function (file, val) {
		return 1;
	};
	this.getFileContent = function (file) {
		switch (file) {
		case Config.Mafia.stats_file:
			return '[{"who" : "Player", "what" : "default", "when" : 1387574278,"playerCount" : 10 }]';
		case "mafialogs.txt":
			return "";
		case "scriptdata/mafiathemes/metadata.json":
			return null;
		default:
			return "{}";
		}
	};

	this.ip = function (src) {
		return players[src].ip;
	};
	this.id = function (name) {
		if (name) {
			if (name == "PolkaBot") {
				return "isPolka";
			}
			for (var e = 0; e < players.length; e++) {
				if (typeof name == "string" && name.toLowerCase() == players[e].name.toLowerCase()) {
					return e;
				}
			}
		}
		return undefined;
	};
	this.playerIds = function () {
		return [];
	};
	this.name = function (id) {
		return id in players ? players[id].name : null;
	};
	this.channel = function (id) {
		return "Mafia";
	};
	this.time = function () {
		return new Date().getTime * 1000;
	};
	this.loggedIn = function (src) {
		return false;
	};
	this.webcall = function (url, callbacl) {
		this.sendAll("This command is disabled.");
	};
	this.existChannel = function (name) {
		return false;
	};
	this.isInChannel = function (src, channel) {
		return false;
	};
	this.channelId = function (name) {
		return 0;
	};
	this.playersOfChannel = function (channel) {
		return [];
	};
	this.rand = function (min, max) {
		return min + Math.floor(Math.random() * max);
	};
	this.auth = function (src) {
		return 0;
	};
	this.dbAuths = function (src) {
		return [];
	};
	this.dbRegistered = function (name) {
		return true;
	};
	this.getColor = function (src) {
		return players[src].color;
	};
	this.kick = function (src, mafiachan) {
		return false;
	};
}
function Bot(name) {
	this.name = name;
	this.formatMsg = function (message) {
		return "±" + this.name + ": " + message;
	};
	/* Shortcuts to sys functions */
	this.sendAll = function (message, channel) {
		if (channel === undefined || channel == -1)
			sendChanAll(this.formatMsg(message), -1);
		else
			sendChanAll(this.formatMsg(message), channel);
	};

	this.sendMessage = function (tar, message, channel) {
		if (channel === undefined)
			sys.sendMessage(tar, this.formatMsg(message));
		else
			sys.sendMessage(tar, this.formatMsg(message), channel);
	};

	this.sendMainTour = function (message) {
		this.sendAll(message, 0);
		// Relies on Tournaments channel
		this.sendAll(message, sys.channelId("Tournaments"));
	};
	/* Following two rely on global channel parameter */
	this.sendChanMessage = function (tar, message) {
		this.sendMessage(tar, message, channel);
	};
	this.sendChanAll = function (message) {
		this.sendAll(message, channel);
	};
}
function require(scr) {
	switch (scr) {
        case "utilities.js":
            return utilities;
        case "mafiachecker.js":
            return checker;
        case "mafiastats.js":
            return stats;
	}
}
var updateModule = function updateModule(module_name, callback) {};
function sendChanAll(message, chan_id, channel) {
	if ((chan_id === undefined && channel === undefined) || chan_id == -1) {
		sys.sendAll(message);
	} else if (chan_id === undefined && channel !== undefined) {
		sys.sendAll(message, channel);
	} else if (chan_id !== undefined) {
		sys.sendAll(message, chan_id);
	}
}
function sendChanHtmlAll(message, chan_id) {
	if ((chan_id === undefined && channel === undefined) || chan_id == -1) {
		sys.sendHtmlAll(message);
	} else if (chan_id === undefined && channel !== undefined) {
		sys.sendHtmlAll(message, channel);
	} else if (chan_id !== undefined) {
		sys.sendHtmlAll(message, chan_id);
	}
}
