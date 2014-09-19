/*jshint "laxbreak":true,"shadow":true,"undef":true,"evil":true,"trailing":true,"proto":true,"withstmt":true*/
/*global alert, document, sendToChat, Mafia, exports, mafiaChecker, mafiaStats*/
var theme, mafia, sys, mafiabot, utilities, stats, checker, SESSION, script, timer, savedTicks, is_command, nonFlashing, html_escape,
    currentPlayer = null,
    channel = 0,
    mafiachan = 0,
    sachannel = 1,
    staffchannel = 2;


/*Pending: sys*/

var Config = {
    dataDir: "",
    Mafia: {
        bot: "Murkrow",
        norepeat: 0,
        stats_file: "scriptdata/mafia_stats.json",
        max_name_length: 16,
        notPlayingMsg: "±Game: The game is in progress. Please type /join to join the next mafia game."
    }
};

try{
delete Object.prototype.watch; //Necessary for /watch actions to work
}catch(error){alert(error);}

var players = [
    { name: "Magikarp", ip: "636645705", color: "red" },
    { name: "Castform", ip: "306688596", color: "orange" },
    { name: "Kakuna", ip: "390949746", color: "blue" },
    { name: "Meowth", ip: "436983082", color: "red" },
    { name: "Mew", ip: "702114961", color: "green" },
    { name: "Omanyte", ip: "566330974", color: "red" },
    { name: "Noctowl", ip: "581735903", color: "green" },
    { name: "Metapod", ip: "407177379", color: "orange" },
    { name: "Pikachu", ip: "289409155", color: "blue" },
    { name: "Kadabra", ip: "294556289", color: "blue" },
    { name: "Togepi", ip: "171747186", color: "green" },
    { name: "Sunkern", ip: "843506359", color: "red" },
    { name: "Pineco", ip: "657839665", color: "green" },
    { name: "Phanpy", ip: "778454300", color: "blue" },
    { name: "Lombre", ip: "932003135", color: "red" },
    { name: "Slakoth", ip: "808310860", color: "green" },
    { name: "Mawile", ip: "425894869", color: "orange" },
    { name: "Volbeat", ip: "770932389", color: "green" },
    { name: "Beldum", ip: "265676978", color: "blue" },
    { name: "Deoxys", ip: "454195069", color: "red" },
    { name: "Cranidos", ip: "305785746", color: "orange" },
    { name: "Combee", ip: "198985839", color: "blue" },
    { name: "Stunky", ip: "336995656", color: "orange" },
    { name: "Chatot", ip: "254722270", color: "red" },
    { name: "Mantyke", ip: "509001574", color: "green" },
    { name: "Azelf", ip: "700269411", color: "blue" },
    { name: "Phione", ip: "320933022", color: "orange" },
    { name: "Servine", ip: "599773022", color: "green" },
    { name: "Simisear", ip: "649444087", color: "orange" },
    { name: "Audino", ip: "766739909", color: "red" },
    { name: "Cottonee", ip: "973800371", color: "orange" },
    { name: "Maractus", ip: "493877828", color: "green" },
    { name: "Zorua", ip: "693418320", color: "red" },
    { name: "Emolga", ip: "973078788", color: "blue" },
    { name: "Klink", ip: "151595424", color: "blue" },
    { name: "Lampent", ip: "666538907", color: "orange" },
    { name: "Cobalion", ip: "518028706", color: "green" },
    { name: "Pyroar", ip: "359051674", color: "blue" },
    { name: "Inkay", ip: "735979526", color: "orange" },
    { name: "Amaura", ip: "738810061", color: "green" },
    { name: "Xerneas", ip: "248039070", color: "blue" },
    { name: "Zubat", ip: "385498420", color: "red" },
    { name: "Voltorb", ip: "667010004", color: "orange" },
    { name: "Pinsir", ip: "892635601", color: "orange" },
    { name: "Ledyba", ip: "624472783", color: "blue" },
    { name: "Slugma", ip: "203922830", color: "green" },
    { name: "Ralts", ip: "427262850", color: "orange" },
    { name: "Makuhita", ip: "495249167", color: "red" },
    { name: "Vaporeon", ip: "445249665", color: "green" },
    { name: "Regirock", ip: "317801858", color: "blue" }
];

function onPageLoaded() {
    setPlayerSelector();
    changePlayer();
    document.getElementById("newGameButton").disabled = true;
    document.getElementById("endGameButton").disabled = true;
    document.getElementById("nextButton").disabled = true;
    document.getElementById("pauseButton").disabled = true;
    document.getElementById("playersCount").disabled = true;
}
function setPlayerSelector() {
    var sele = document.getElementById("playerSelect");
    var option;
    
    /* option = document.createElement("option");
    option.text = "Pick a player";
    option.value = "none";
    sele.add(option); */
    
    players = shuffle(players);
    for (var e = 0; e < players.length; e++) {
        option = document.createElement("option");
        option.value = e;
        option.text = players[e].name;
        sele.add(option);
    }
}
function updatePlayerSelector() {
    var sele = document.getElementById("playerSelect");
    var option, name;
    
    for (var e = 0; e < sele.options.length; e++) {
        option = sele.options[e];
        if (option.value in players) {
            name = players[option.value].name
            option.text = name + (mafia.gameInProgress() && mafia.isInGame(name) ? " (" + mafia.players[name].role.translation + ")" : "");
        }
    }
}
function init() {
    try {
        sys = new System();
        SESSION = {
            global: function() {},
            channels: function(channel_id) {
                return {
                    muteall: false,
                    isChannelOperator: function(src) {
                        return false;
                    }
                };
            },
            users: function(id) {
                return {
                    mafiaAdmin: false,
                    mute: {
                        active: false
                    },
                    smute: {
                        active: false
                    }
                };
            }
        };
        script = {
            cmp: function(a, b) {
                return a.toLowerCase() == b.toLowerCase();
            },
            mafiaAdmins: { hash: {} },
            mafiaSuperAdmins: { hash: {} },
            saveKey: function(thing, id, val) {
                sys.saveVal(key(thing,id), val);
            },
            hasAuthElements: function (array) {
                return false;
            },
            issueBan: function(type, src, tar, commandData, maxTime) { },
            unban: function(type, src, tar, commandData) { }
        };
        utilities = exports;
        checker = new mafiaChecker();
        stats = new mafiaStats();
        stats.init();
        mafiabot = new Bot(Config.Mafia.bot);
        is_command = require("utilities.js").is_command;
        nonFlashing = require("utilities.js").non_flashing;
        html_escape = require("utilities.js").html_escape;
        mafia = new Mafia(mafiachan);
        timer = setInterval(onTick, 1000);
    } catch(err){
        alert(err + " / at line " + err.lineNumber);
    }
    mafia.init();
}

init();

function changePlayer() {
    var sele = document.getElementById("playerSelect");
    if (sele.value == "none") {
        currentPlayer = null;
        sendToChat(timestamp() + " You are now a spectator!");
    } else {
        currentPlayer = sele.value;
        sendToChat(timestamp() + " You are now <b><font color='" + players[currentPlayer].color + "'>" + players[currentPlayer].name + "</font></b>!");
    }
    focusChat();
}
function loadTheme(raw) {
    try {
        var plain_theme = JSON.parse(raw);
                
        // Create a copy to prevent the checker from changing the theme.
        var errors = mafia.mafiaChecker.checkTheme(JSON.parse(raw));
        if (errors.fatal.length > 0) {
            sys.sendAll("", mafiachan);
            sys.sendAll("Fatal Errors found in the theme: ", mafiachan);
            for (var e = 0; e < 5 && e < errors.fatal.length; e++) {
                sys.sendHtmlAll("-" + errors.fatal[e], mafiachan);
            }
            if (errors.fatal.length > 5) {
                sys.sendAll("And " + (errors.fatal.length - 5) + " other errors.", mafiachan);
            }
        }
        if (errors.minor.length > 0) {
            sys.sendAll("", mafiachan);
            sys.sendAll("Minor Errors found in the theme: ", mafiachan);
            for (var e = 0; e < 5 && e < errors.minor.length; e++) {
                sys.sendHtmlAll("-" + errors.minor[e], mafiachan);
            }
            if (errors.minor.length > 5) {
                sys.sendAll("And " + (errors.minor.length - 5) + " other errors.", mafiachan);
            }
        }
        if (errors.fatal.length > 0) {
            sys.sendAll("", mafiachan);
            sys.sendAll("Theme contains fatal errors, unable to load it.", mafiachan);
            return;
        }
        
        // Don't care about loadTheme changing plain_theme as it's not being reused.
        theme = mafia.themeManager.loadTheme(plain_theme);
        mafia.themeManager.themes[theme.name.toLowerCase()] = theme;
        
        sendChanAll("±Game: Loaded theme " + theme.name, mafiachan);
        document.getElementById("currentTheme").innerHTML = theme.name;
        document.getElementById("newGameButton").disabled = false;
        
        document.getElementById("playersCount").disabled = false;
        document.getElementById("playersCount").min = (theme.minplayers === undefined ? "5" : (theme.minplayers < 3 ? 3 : theme.minplayers));
        document.getElementById("playersCount").max = theme["roles" + theme.roleLists].length;
        endGame();
    } catch (err) {
        alert(err);
    }
    focusChat();
}
function startNewGame(){
    if (theme == undefined) {
        sendChanAll("You must load a theme first!", mafiachan);
        return;
    }
    try {
        var count = parseInt(document.getElementById("playersCount").value, 10);
        
        if (mafia.gameInProgress()) {
            sendChanAll("Game already running!", mafiachan);
        } else {
            var min = (theme.minplayers === undefined ? "5" : (theme.minplayers < 3 ? 3 : theme.minplayers));
            var max = theme["roles" + theme.roleLists].length;
            if (count < min || count > max) {
                sendChanAll("Invalid number of players! Please pick a number between " + min + " and " + max + ".", mafiachan);
                return;
            }
            if (count > players.length) {
                sendChanAll("±Game: Not enough players! Reducing number of players to " + players.length + ".", mafiachan);
                count = players.length;
            }
        
            mafia.startGame(0, theme.name);
            var e = 0;
            while (mafia.signups.length < count) {
                if (mafia.signups.indexOf(players[e].name) == -1) {
                    mafia.signups.push(players[e].name);
                }
                e++;
            }
            sendChanAll("±Game: " + mafia.signups.join(", ") + " joined the game!", mafiachan);
            mafia.callHandler(mafia.state);
            
            savedTicks = "*";
            
            // gameStarted();
        }
    } catch(err){alert(err + " | " + err.lineNumber);}
    focusChat();
}
function endGame() {
    mafia.endGame();
    resetSimulator();
    focusChat();
}
function resetSimulator() {
    updatePlayerSelector();
    document.getElementById("endGameButton").disabled = true;
    document.getElementById("nextButton").disabled = true;
    document.getElementById("pauseButton").value = "Pause";
    document.getElementById("pauseButton").disabled = true;
    document.getElementById("newGameButton").disabled = false;
    document.getElementById("playersCount").disabled = false;
}
function gamePrepared() {
    document.getElementById("endGameButton").disabled = false;
    document.getElementById("nextButton").disabled = false;
    document.getElementById("pauseButton").disabled = false;
}
function gameStarted() {
    document.getElementById("newGameButton").disabled = true;
    document.getElementById("playersCount").disabled = true;
    updatePlayerSelector();
}
function nextPhase() {
    if (mafia.state != "blank") {
        mafia.callHandler(mafia.state);
        document.getElementById("pauseButton").value = "Pause";
    }
    focusChat();
}
function pauseGame() {
    if (mafia.state != "blank") {
        // sendChanAll(mafia.ticks + " / " + typeof mafia.ticks, mafiachan)
        if (typeof mafia.ticks === "number" && isNaN(mafia.ticks) == false) {
            savedTicks = mafia.ticks;
            mafia.ticks = "*";
            sendChanAll("Game Paused", mafiachan);
            document.getElementById("pauseButton").value = "Unpause";
        } else {
            mafia.ticks = savedTicks;
            savedTicks = "*";
            sendChanAll("Game Unpaused", mafiachan);
            document.getElementById("pauseButton").value = "Pause";
        }
    }
    focusChat();
}
function onTick() {
    mafia.stepEvent();
}


var tabList, isTabbing, tabPosition, chatHistory = [], historyPos = 0, tempMsg;

function tabName() {
    var box = document.getElementById('chatbox');
    var startPos = box.selectionStart;
    var endPos = box.selectionEnd;
    if (startPos != box.value.length) {
        stopTab();  
        return;
    }
    
    if (isTabbing) {
        tabPosition += 1;
        if (tabPosition >= tabList.length) {
            tabPosition = 0;
        }
        
        var msg = box.value;
        var pos = msg.lastIndexOf(" ");
        box.value = msg.substr(0, pos+1) + tabList[tabPosition];
    } else {
        tabList = [];
        var msg = box.value;
        var pos = msg.lastIndexOf(" ");
        var part = msg.substr(pos + 1);
        
        
        var player;
        for (var p in players) {
            player = players[p];
            if (player.name.toLowerCase().indexOf(part.toLowerCase()) == 0) {
                tabList.push(player.name);
            }
        }
        
        tabList.sort();
        if (mafia.gameInProgress()) {
            for (p = tabList.length; p >= 0; p--) {
                if (mafia.isInGame(tabList[p]) == false) {
                    tabList.splice(p, 1);
                }
            }
        }
        if (tabList.length > 0) {
            isTabbing = true;
            tabPosition = 0;
            box.value = msg.substr(0, pos +1) + tabList[tabPosition];
        }
    }
}
function stopTab() {
    isTabbing = false;
    tabPosition = null;
    tabList = [];
}
function browseChat(dir) {
    if (chatHistory.length > 0) {
        var box = document.getElementById('chatbox');
        if (historyPos + dir < 0) {
            return;
        } else if (historyPos + dir >= chatHistory.length) {
            box.value = tempMsg;
            historyPos = chatHistory.length;
            return;
        }
        historyPos += dir;
        box.value = chatHistory[historyPos];
    }
}
function saveTemporaryMessage() {
    tempMsg = document.getElementById('chatbox').value;
}

/* STUFF START */
function System() {
    this.sendAll = function(msg, channel) {
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
    this.sendMessage = function(src, msg, channel) {
        if (channel === 0) {
            if (src == currentPlayer) {
                chatMessage(msg);
            } else if (src == "isPolka" && msg == "±Luxray: GAME ENDED") {
                resetSimulator();
            }
        }
    };
    this.sendHtmlMessage = function(src, msg, channel) { 
        if (channel === 0 && src == currentPlayer) {
            sendToChat(msg);
        }
    };
    this.sendHtmlAll = function(msg, channel) { 
        if (channel === 0) {
            sendToChat(msg);
        }
    };
    
    this.fexists = function(name) { return false; };
    this.makeDir = function(name) { };
    this.writeToFile = function(file, content) { return false; };
    this.saveVal = function(file, val) { return false; };
    this.getVal = function(file, val) { return 1; };
    this.getFileContent = function(file) {
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
    
    this.ip = function(src) { return players[src].ip; };
    this.id = function(name) {
        if (name) {
            if (name == "PolkaBot") {
                return "isPolka";
            }
            for (var e = 0; e < players.length; e++) {
                if (name.toLowerCase() == players[e].name.toLowerCase()){
                    return e;
                }
            }
        }
        return undefined;
    };
    this.playerIds = function() { return []; };
    this.name = function(id) { return id in players ? players[id].name : null; };
    this.channel = function(id) { return "Mafia"; };
    this.time = function() { return new Date().getTime * 1000; };
    this.loggedIn = function(src) { return false; };
    this.webcall = function(url, callbacl) { this.sendAll("This command is disabled."); };
    this.existChannel = function(name) { return false; };
    this.isInChannel = function(src, channel) { return false; };
    this.channelId = function(name) { return 0; };
    this.playersOfChannel = function(channel) { return []; };
    this.rand = function(min, max) { return min + Math.floor(Math.random() * max); };
    this.auth = function(src) { return 0; };
    this.dbAuths = function(src) { return []; };
    this.dbRegistered = function(name) { return true; };
    this.getColor = function(src) { return players[src].color; };
    this.kick = function(src, mafiachan) { return false; };
}
function Bot(name) {
    this.name = name;
    this.formatMsg = function(message)
    {
        return "±" + this.name + ": " + message;
    };
    /* Shortcuts to sys functions */
    this.sendAll = function(message, channel)
    {
        if (channel === undefined || channel == -1)
            sendChanAll(this.formatMsg(message),-1);
        else
            sendChanAll(this.formatMsg(message), channel);
    };

    this.sendMessage = function(tar, message, channel)
    {
        if (channel === undefined)
            sys.sendMessage(tar, this.formatMsg(message));
        else
            sys.sendMessage(tar, this.formatMsg(message), channel);
    };

    this.sendMainTour = function(message)
    {
        this.sendAll(message, 0);
        // Relies on Tournaments channel
        this.sendAll(message, sys.channelId("Tournaments"));
    };
    /* Following two rely on global channel parameter */
    this.sendChanMessage = function(tar, message)
    {
        this.sendMessage(tar, message, channel);
    };
    this.sendChanAll = function(message)
    {
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
var updateModule = function updateModule(module_name, callback) { };
function sendChanAll(message, chan_id, channel) {
    if((chan_id === undefined && channel === undefined) || chan_id == -1)
    {
        sys.sendAll(message);
    } else if(chan_id === undefined && channel !== undefined)
    {
       sys.sendAll(message, channel);
    } else if(chan_id !== undefined)
    {
        sys.sendAll(message, chan_id);
    }
}
function sendChanHtmlAll(message, chan_id) {
    if((chan_id === undefined && channel === undefined) || chan_id == -1)
    {
        sys.sendHtmlAll(message);
    } else if(chan_id === undefined && channel !== undefined)
    {
        sys.sendHtmlAll(message, channel);
    } else if(chan_id !== undefined)
    {
        sys.sendHtmlAll(message, chan_id);
    }
}

/* STUFF END */

function key(a,b) {
    return a + "*" + sys.ip(b);
}
function processInput(msg) {
    if (currentPlayer == null) {
        sendToChat("<b>Pick a player!</b>");
    } else {
        if (utilities.is_command(msg)) {
            if (mafia.handleCommand(currentPlayer, msg.substr(1), mafiachan) != true) {
                chatMessage("±CommandBot: This command doesn't exist");
            }
        } else {
            var player = players[currentPlayer];
            var msg = utilities.html_escape(msg);
            if (mafia.beforeChatMessage(currentPlayer, msg, mafiachan) == false) {
                // sendToChat("<font color='" + player.color + "'>" + timestamp() + " <b>" + player.name + ":</b></font> " + msg);
                chatMessage(player.name + ": " + msg);
                // sendToChat("<font color='" + player.color + "'>" + timestamp() + " <b>" + player.name + ":</b></font> " + msg);
            }
        }
    }
    if (chatHistory.indexOf(msg) != -1) {
        chatHistory.splice(chatHistory.indexOf(msg), 1);
    }
    chatHistory.push(msg);
    if (chatHistory.length > 10) {
        chatHistory.splice(0, 1);
    }
    historyPos = chatHistory.length;
    tempMsg = "";
}
function chatMessage(msg) {
    if (msg == "") {
        sendToChat("");
    } else {
        msg = utilities.html_escape(msg);
        
        if (msg.indexOf(":") != -1 && msg.indexOf(":") != msg.length-1) {
            var name = msg.substr(0, msg.indexOf(":"));
            var color = "#3daa68";
            for (var p in players) {
                if (players[p].name == name) {
                    color = players[p].color;
                    break;
                }
            }
            
            sendToChat("<font color=" + color + ">"+timestamp() + " <b>" + msg.substr(0, msg.indexOf(":")+1) + "</b></font>" + msg.substr(msg.indexOf(":")+1));
        } 
        else if (msg.indexOf("***") === 0) {
            sendToChat("<font color=Fuchsia>"+timestamp() + " " + msg + "</font>");
        }
        else if (msg.indexOf(":") == msg.length - 1) {
            sendToChat("<font color=#318739>"+timestamp() + " <b>" + msg + "</b></font>");
        }
        else {
            sendToChat(timestamp() + " " + msg);
        }
    }
}
function timestamp() {
    var time = getDateNumbers();
    return "(" + time.hours + ":" + time.minutes + ":" + time.seconds+ ")";
}
function getTimeString(sec) {
    var s = [];
    var n;
    var d = [[7*24*60*60, "week"], [24*60*60, "day"], [60*60, "hour"], [60, "minute"], [1, "second"]];
    for (var j = 0; j < 5; ++j) {
        n = parseInt(sec / d[j][0], 10);
        if (n > 0) {
            s.push((n + " " + d[j][1] + (n > 1 ? "s" : "")));
            sec -= n * d[j][0];
            if (s.length >= 2) break;
        }
    }
    return s.join(", ");
}
function getDateNumbers() {
    var now = new Date();
    
    return {
        year: addZero(now.getFullYear()),
        month: addZero(now.getMonth() + 1),
        day: addZero(now.getDate()),
        hours: addZero(now.getHours()),
        minutes: addZero(now.getMinutes()),
        seconds: addZero(now.getSeconds())
    };
}
function addZero(num) {
    return (num < 10 ) ? "0" + num : num;
}
function shuffle(o) {
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i, 10), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}