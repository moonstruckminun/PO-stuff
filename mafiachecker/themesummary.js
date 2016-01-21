var theme, minorErrors, fatalErrors, noMinor, noFatal, 
    possibleNightActions = ["kill", "protect", "inspect", "distract", "poison", "safeguard", "stalk", "watch", "convert", "massconvert", "curse", "copy", "detox", "dispel", "shield", "dummy", "dummy2", "dummy3", "dummy4", "dummy5", "dummy6", "dummy7", "dummy8", "dummy9", "dummy10"];


function checkTheme(content) {
	outputToPage("Checking your theme, please wait");
	minorErrors = [];
	fatalErrors = [];
    noMinor = true;
    noFatal = true;
    
    var checker = new mafiaChecker();
    
    var raw;
    try {
		raw = JSON.parse(content);
	} catch (err) {
		outputToPage("<h3>Error parsing JSON</h3><p>JSON-Error: - Syntax error, malformed JSON</p><p>You might want to hone your syntax with <a href='http://jsonlint.com'>JSONLint</a>", "errors");
        outputToPage("Your theme contains errors, so this feature is not available.", "roles");
        outputToPage("Your theme contains errors, so this feature is not available.", "sides");
        outputToPage("Your theme contains errors, so this feature is not available.", "priority");
        outputToPage("Your theme contains errors, so this feature is not available.", "spawn");
		return;
	}
    
    var errors = checker.checkTheme(raw);
    
    var finalOutput = "<h2> Fatal errors found in your script: </h2><ul>";
	if (errors.fatal.length === 0) {
        finalOutput += "No fatal errors found. Good job.";
    } else {
        for (e = 0; e < errors.fatal.length; ++e) {
            finalOutput += "<li>" + errors.fatal[e] + "</li>";
        }
    }
	finalOutput += "</ul><h2> Minor errors found in your script: </h2><ul>";
	if (errors.minor.length === 0) {
        finalOutput += "No minor errors found. Good job.";
    } else {
        for (e = 0; e < errors.minor.length; ++e) {
            finalOutput += "<li>" + errors.minor[e] + "</li>";
        }
    }
	finalOutput += "</ul>";
    var rolesOutput = "", sidesOutput = "", priorityOutput = "", spawnOutput = "";
    theme = createTheme(raw);
    if (errors.fatal.length === 0) {
        try {
            rolesOutput += "<h2> Roles Summary: </h2> ";
            // rolesOutput += theme.writeRolesSummary();
            rolesOutput += theme.writeRolesSummary2();
            sidesOutput += "<h2> Sides: </h2>";
            sidesOutput += theme.writeSidesList();
            priorityOutput += "<h2> Priority List: </h2>";
            priorityOutput += theme.writePriorityList();
            spawnOutput += "<h2> Spawn Lists: </h2>";
            spawnOutput += theme.writeSpawnLists(raw);
        } catch (err) {
            finalOutput += "<font color='red'>Error found while running analysis tools. The following error has occured: " +  err + (err.lineNumber ? " on line: " + err.lineNumber : "") + "</font>";
        }
    } else {
        rolesOutput += "Your theme contains errors, so this feature is not available.";
        sidesOutput += "Your theme contains errors, so this feature is not available.";
        priorityOutput += "Your theme contains errors, so this feature is not available.";
        spawnOutput += "Your theme contains errors, so this feature is not available.";
    }
	outputToPage(finalOutput, "errors");
	outputToPage(rolesOutput, "roles");
	outputToPage(sidesOutput, "sides");
	outputToPage(priorityOutput, "priority");
	outputToPage(spawnOutput, "spawn");
    showHTMLSpawn();
    hideGrey();
}

function createTheme(plain_theme) {
	var theme = new Theme();
    
    // Parse variables first - so we can extract the actual value later.
    theme.variables = plain_theme.variables;
    
    var it, prop;
    // This is only done when variables are available.
    if (Object.prototype.toString.call(theme.variables) === '[object Object]') {
        // Iterate over the entire theme, parsing variable:(name) strings.
        for (it in plain_theme) {
            prop = plain_theme[it];
            assignVariable(plain_theme, it, prop, theme.variables);
        }
    }
    
    theme.sideTranslations = {};
    theme.roles = {};
    
    var i;

    for (i in plain_theme.sides) {
        theme.addSide(plain_theme.sides[i]);
    }
    for (i in plain_theme.roles) {
        theme.addRole(plain_theme.roles[i]);
    }
    i = 1;
    while ("roles" + i in plain_theme) {
        theme["roles" + i] = plain_theme["roles" + i];
        ++i;
    }
    theme.roleLists = i - 1;
    theme.spawnPacks = plain_theme.spawnPacks;
    
    return theme;
}

function Theme(){}
Theme.prototype.addSide = function(obj) {
	this.sideTranslations[obj.side] = obj.translation;
};
Theme.prototype.addRole = function(obj) {
	if (!obj.actions) {
		obj.actions = {};
	}
	this.roles[obj.role] = obj;
};
Theme.prototype.trside = function (side) {
    return this.sideTranslations[side];
};
Theme.prototype.trrole = function (role) {
    return this.roles[role].translation;
};
Theme.prototype.writeSidesList = function() {
    var sides = [];
    var side;
    var side_order = Object.keys(this.sideTranslations);
    var this_sideTranslations = this.sideTranslations;
    // sort sides by name
    side_order.sort(function (a, b) {
        var tra = this_sideTranslations[a];
        var trb = this_sideTranslations[b];
        if (tra == trb)
            return 0;
        else if (tra < trb)
            return -1;
        else
            return 1;
    });
    // sort roles by name
    var role;
    var role_order = Object.keys(this.roles);
    var this_roles = this.roles;
    role_order.sort(function (a, b) {
        var tra = this_roles[a].translation;
        var trb = this_roles[b].translation;
        if (tra == trb)
            return 0;
        else if (tra < trb)
            return -1;
        else
            return 1;
    });
    
    var hide;
    var side_list = {};
    var randomSide_list = [];
    for (var r = 0; r < role_order.length; ++r) {
        role = this.roles[role_order[r]];
        if (typeof role.side == "string") {
            if (side_list[role.side] === undefined)
                side_list[role.side] = [];
            side_list[role.side].push(role);
        } else if (typeof role.side == "object" && role.side.random) {
            var plop = Object.keys(role.side.random);
            var tran = [];
            for (var p = 0; p < plop.length; ++p) {
                tran.push(this_sideTranslations[plop[p]]);
            }
            randomSide_list.push("<u>" + role.translation + "</u> (can be sided with " + readable(tran, "or") + "). ");
        }
    }

    for (var s = 0; s < side_order.length; ++s) {
        side = side_order[s];
        if (side_list[side] !== undefined) {
            sides.push("<b>" + this_sideTranslations[side] + "</b>" + (side == "village" ? " <font color=grey>(village)</font>" : "") + "<b>:</b><ul>");
            for (r in side_list[side]) {
                role = side_list[side][r];
                hide = role.hide == true || role.hide == "side" || role.hide == "both" || false;
                sides.push("<li" + (hide ? " class='hidelist'":"") + ">" + (hide ? "<font color=grey>" : "") + role.translation + (hide ? "</font>" : "") + "</li>");
                // sides.push("<li>" + (hide ? "<font color=grey>" : "") + role.translation + (hide ? "</font>" : "") + "</li>");
            }
            sides.push("</ul>");
        }
    }
    if (randomSide_list.length > 0) {
        sides.push("<b>Roles that get a random side:</b><ul>");
        for (s in randomSide_list) {
            sides.push("<li>" + randomSide_list[s] + "</li>");
        }
        sides.push("</ul>");
    }
    var sidesList = "";
    for (s in sides) {
        sidesList += sides[s];
    }

    return sidesList;
};
Theme.prototype.writePriorityList = function() {
    var nightPriority = [], output = "", out = [], role, r, i, hide;
    for (r in this.roles) {
        role = this.roles[r];
        if ("night" in role.actions) {
            for (i in role.actions.night) {
                var priority = role.actions.night[i].priority;
                var action = i;
                hide = role.actions.night[i].hide || false;
                nightPriority.push({ 'priority': priority, 'action': action, 'role': role.translation, 'hide': hide });
            }
            nightPriority.sort(function (a, b) { return a.priority - b.priority; });
        }
    }
    for (r = 0; r < nightPriority.length; ++r) {
        var prio = nightPriority[r];
        var act = "[" + prio.priority + "] " + prio.role + " (" + cap(prio.action) + ")";
        hide = prio.hide || false;
        if (hide !== true && out.indexOf(act) === -1) {
            out.push(act);
        } else {
            hide = true;
        }
        output += (hide ? "<font color=grey class='hideline'>": "") + act + "<br/>" + (hide ? "</font>": "");
    }
    return output;
};
Theme.prototype.writeSpawnLists = function(obj) {
    var output = "";
    var i = 1, list, r, role, id, packs, packName, pInfo, pIndex, out, e, chance, name, limit,
        color = "grey",
        last = ("minplayers" in obj) ? obj.minplayers : 5;
    
    var icons = {
        village: "<font color=blue>█</font>"
    };
    
    var count = 0;
    var colors = ["Red", "DarkGreen", "MediumTurquoise", "DarkOrchid", "GoldenRod", "Magenta", "LightSlateGray", "Indigo", "Yellow", "DarkGoldenRod"];
    for (var e in this.sideTranslations) {
        if (!(e in icons)) {
            icons[e] = "<font color=" + colors[count] + ">█</font>";
            count++;
        }
    }
    var side;
    while ("roles" + i in obj) {
        list = obj["roles" + i];
        output += "<b>List " + i + "</b> <font color=grey>(" + (last + "~" + list.length) + " players)</font>: <ol>";
        limit = last;
        last = list.length + 1;
        packs = {};
        for (r = 0; r < list.length; ++r) {
            side = "";
            id = list[r];
            if (typeof id == "object") {
                role = randomSampleText(id, function(x){ return theme.roles[x].translation + " <font color="+color+">(" + x + ")</font>"; });
                side = this.roles[Object.keys(id)[0]].side;
            } else {
                if (id.indexOf("pack:") === 0) {
                    packName = id.substr(5);
                    
                    pInfo = obj.spawnPacks[packName];
                    if (!(packName in packs)) {
                        packs[packName] = 0;
                    }
                    
                    out = [];
                    
                    if (!("chance" in pInfo)) {
                        pInfo.chance = [];
                        for (e in pInfo.roles) {
                            pInfo.chance.push(1);
                        }
                    } 
                    chance = 0;
                    for (e in pInfo.chance) {
                        chance += pInfo.chance[e];
                    }
                    for (e in pInfo.roles) {
                        name = pInfo.roles[e][packs[packName] % pInfo.roles[e].length];
                        out.push((parseInt(e, 10) + 1) + ". " + this.roles[name].translation + " <font color="+color+">(" + name + ")</font> [" + (chance === 0 ? pInfo.chance.length/100 : (pInfo.chance[e] / chance * 100).toFixed(2)) + "%]");
                        side = this.roles[name].side;
                    }
                    packs[packName] += 1;
                    role = "Pack <b>" + packName + "</b>: " + out.join(" | ");
                } else {
                    role = this.roles[list[r]].translation + " <font color="+color+">(" + list[r] + ")</font>";
                    side = this.roles[id].side;
                }
            }
            if (side in icons) {
                role = icons[side] + " " + role;
            }
            if (r < limit) {
                // #B22222
                // #8B0000
                output += "<li><font color=#A01F1F>" + role + "</font></li>";
            } else {
                output += "<li>" + role + "</li>";
            }
        }
        output += "</ol><br/>";
        ++i;
    }
    // return toBBCode(output);
    return "<div class='htmlspawn'> <input type='button' name='bbc_button' value='BBC Mode' onclick='showBBCSpawn()'/> <br/>" + output + "</div>" + toBBCode(output);
};
Theme.prototype.writeRolesSummary = function() {
    var output = "<br>", sides = {}, s, randomSide = [], role, r, info;
    for (s in this.sideTranslations) {
        sides[s] = [];
    }
    for (r in this.roles) {
        role = this.roles[r];
        info = "<b><font size=3 color=red>" + role.translation + "</font></b> <font color=grey>(" + role.role + ")</font><br>";

        if (typeof role.side == "object" && "random" in role.side) {
            info += "<b><u>Possible Sides</u></b>: " + randomSampleText(role.side.random, function(x){ return theme.sideTranslations[x]; }) + ".<br>";
        }

        info += "<b><u>Help Text</u></b>: " + role.help + "<br>";

        if ("winningSides" in role || "winIfDeadRoles" in role) {
            info += "<b><u>Win Conditions</u></b>:<ul>";
                if ("winningSides" in role) {
                    if (role.winningSides == "*") {
                        info += "<li>If any side win. </li>";
                    } else {
                        info += "<li>If the following sides win: " + readable(role.winningSides.map(function(x){ return this.sideTranslations[x];}, this), "or") + ". </li>";
                    }
                }
                if ("winIfDeadRoles" in role) {
                    var w = readable(role.winIfDeadRoles.map(function(x){ return this.roles[x].translation; }, this), "and");
                    if (w !== "") {
                        info += "<li>If the following roles are dead: " + w + ". </li>";
                    } else {
                        info += "<li>Instantly win when this role is obtained. </li>";
                    }
                }
            info += "</ul>";
        }

        if ("actions" in role) {
            var actions = role.actions, a, act;
            info += "<b><u>Abilities:</u></b><ul>";

            if ("night" in actions) {
                info += "<li>Night Actions:</li><ul>";
                for (a in actions.night) {
                    act = actions.night[a];
                    info += "<li><u>" + cap(a) + "</u>: ";
                    var hasConvert = false, hasMassConvert = false, hasCopy = false, hasCurse = false;
                    if ("command" in act) {
                        if (typeof act.command == "string") {
                            var additional = additionalAttributes(act, act.command, true);
                            info += cap(act.command) + ". " + additionalAttributes(act, act.command, true);
                            if (act.command == "convert") hasConvert = true;
                            if (act.command == "massconvert") hasMassConvert = true;
                            if (act.command == "copy") hasCopy = true;
                            if (act.command == "curse") hasCurse = true;
                        } else if (Array.isArray(act.command)) {
                            info += readable(act.command.map(function(x) { var additional = additionalAttributes(act, x, true); return cap(x) + (additional !== "" ? " " + additional : ""); }), "and") + ". ";
                            if (act.command.indexOf("convert") !== -1) hasConvert = true;
                            if (act.command.indexOf("massconvert") !== -1) hasMassConvert = true;
                            if (act.command.indexOf("copy") !== -1) hasCopy = true;
                            if (act.command.indexOf("curse") !== -1) hasCurse = true;
                        } else if (typeof act.command == "object") {
                            info += randomSampleText(act.command, function(x) { return cap(x) + " " + additionalAttributes(act, x, true); }) + ". ";
                            if ("convert" in act.command) hasConvert = true;
                            if ("massconvert" in act.command) hasMassConvert = true;
                            if ("copy" in act.command) hasCopy = true;
                            if ("curse" in act.command) hasCurse = true;
                        }
                    } else {
                        info += additionalAttributes(act, a);
                        if (a == "convert") hasConvert = true;
                        if (a == "massconvert") hasMassConvert = true;
                        if (a == "copy") hasCopy = true;
                        if (a == "curse") hasCurse = true;
                    }
                    if ("avoidHax" in actions && actions.avoidHax.indexOf(a) !== -1) {
                        info += "Can't be haxed. ";
                    }
                    if (act.target == "OnlySelf") {
                        info += "Can only be used on itself. ";
                    }
                    if (act.common == "Role") {
                        info += "Shared with role. ";
                    } else if (act.common == "Team" ) {
                        info += "Shared with team. ";
                    }
                    if ("pierce" in act && act.pierce === true) {
                        info += "Bypass protect/safeguard. ";
                    } else if ("pierceChance" in act) {
                        info += "Has a " + (act.pierceChance * 100) + "% chance of bypassing protect/safeguard. ";
                    }
                    if ("bypass" in act) {
                        info += "Action is not affected by roles with the " + readable(act.bypass, "and") + " mode(s).";
                    }
                    if ("limit" in act) {
                        info += "Can be used " + act.limit + " times per night. ";
                    }
                    if ("recharge" in act) {
                        info += "Can be used every " + act.recharge+ " nights. ";
                    }
                    if ("initialrecharge" in act) {
                        info += "First use only after " + act.initialrecharge + " night(s). ";
                    }
                    if ("charges" in act) {
                        info += "Can be used " + act.charges + " times during the game. ";
                    }
                    if ("failChance" in act) {
                        info += "Has a " + (act.failChance * 100) + "% chance of failing. ";
                    }
                    if ("suicideChance" in act) {
                        info += "User has a " + (act.suicideChance * 100) + "% chance of dying when using this action. ";
                    }
                    if ("restrict" in act) {
                        info += "Can't use " + readable(act.restrict, "and") + " during the same night this action is used. ";
                    }
                    if ("cancel" in act) {
                        info += "Cancels " + readable(act.cancel, "and") + " commands if used during the same night. ";
                    }
                    if ("noFollow" in act && act.noFollow === true) {
                        info += "Cannot be detected by stalk or watch. ";
                    }
                    if ("userMustBeVisited" in act) {
                        info += "Only works if user was " + (act.userMustBeVisited ? "" : "not ") + "visited during the night. ";
                    }
                    if ("targetMustBeVisited" in act) {
                        info += "Only works if target was " + (act.targetMustBeVisited ? "" : "not ") + "visited by someone else during the night. ";
                    }
                    if ("userMustVisit" in act) {
                        info += "Only works if user was " + (act.userMustVisit ? "" : "not ") + "visiting someone else during the night. ";
                    }
                    if ("targetMustVisit" in act) {
                        info += "Only works if target was " + (act.targetMustVisit ? "" : "not ") + "visiting someone else during the night. ";
                    }

                    info += "</li>";

                    if (hasConvert) {
                        info += "<ul><li>" + convertList(act) + ". </li></ul>";
                    }
                    if (hasMassConvert) {
                        info += "<ul><li>" + massConvertList(act) + ". </li></ul>";
                    }
                    if (hasCopy) {
                        info += "<ul><li>" + copyList(act) + ". </li></ul>";
                    }
                    if (hasCurse) {
                        info += "<ul><li>" + curseList(act) + ". </li></ul>";
                    }

                }
                info += "</ul>";
            }
            if ("standby" in actions) {
                info += "<li>Standby Actions:</li><ul>";
                for (a in actions.standby) {
                    var c = a;
                    act = actions.standby[a];
                    info += "<li><u>" + cap(a) + "</u>: ";
                    if ("command" in act) {
                        info += cap(act.command) + ". ";
                        c = act.command;
                    }
                    if (["kill", "expose"].indexOf(c) != -1) {
                        if ((c == "kill" && (!act.killmsg || act.killmsg.indexOf("~Self~") != -1)) || (c == "expose" && (!act.exposemsg || act.exposemsg.indexOf("~Self~") != -1))) {
                            info += "Reveals user. ";
                        } else if ("revealChance" in act) {
                            info += (act.revealChance * 100)  + "% chance of revealing user. ";
                        } else {
                            info += "User is not revealed. ";
                        }
                    }
                    if ("limit" in act) {
                        info += "Can be used " + act.limit + " times per day. ";
                    }
                    if ("recharge" in act) {
                        info += "Can be used every " + act.recharge+ " days. ";
                    }
                    if ("initialrecharge" in act) {
                        info += "First use only after " + act.initialrecharge + " days. ";
                    }
                    if ("charges" in act) {
                        info += "Can be used " + act.charges + " times during the game. ";
                    }
                    if ("avoidStandbyHax" in actions && actions.avoidStandbyHax.indexOf(a) !== -1) {
                        info += "Can't be haxed. ";
                    }
                    info += "</li>";
                }
                info += "</ul>";
            }
            for (var e in possibleNightActions) {
                if (possibleNightActions[e] in actions) {
                    a = possibleNightActions[e];
                    var mode = actions[a];
                    if ("mode" in mode) {
                        if (typeof mode.mode == "object") {
                            if ("evadeCharges" in mode.mode) {
                                if (typeof mode.mode.evadeCharges == "number") {
                                    info += "<li>Evades " + a + " up to " + mode.mode.evadeCharges + " times. </li>";
                                } else {
                                    info += "<li>Evades " + a + " a limited number of times (only if converted from a role with this same ability). </li>";
                                }
                            }
                            if ("evadeChance" in mode.mode) {
                                info += "<li>Has a " + (mode.mode.evadeChance * 100) + "% chance of evading " + a + ". </li>";
                            }
                            if ("ignore" in mode.mode) {
                                info += "<li>Can't be " + a + "ed by " + readable(mode.mode.ignore.map(function(x){ return theme.roles[x].translation; }), "and") + ". </li>";
                            }
                            if ("killif" in mode.mode) {
                                info += "<li>Kills players that " + a + " this role (only if " + readable(mode.mode.killif.map(function(x){ return theme.roles[x].translation; }), "or") + "). </li>";
                            }
                            if ("identify" in mode.mode) {
                                info += "<li>Identify players that " + a + " this role (only if " + readable(mode.mode.identify.map(function(x){ return theme.roles[x].translation; }), "or") + "). </li>";
                            }
                        } else {
                            switch (mode.mode) {
                                case "killattacker":
                                    info += "<li>Kills anyone that " + a + " this role (action is not canceled). </li>";
                                    break;
                                case "killattackerevenifprotected":
                                    info += "<li>Kills anyone that " + a + " this role even if protected/safeguarded  (action is not canceled). </li>";
                                    break;
                                case "poisonattacker":
                                    info += "<li>Poison anyone that " + a + " this role" + ("count" in mode ? " for " + (mode.count - 1) + " turns"  : "") + ". </li>";
                                    break;
                                case "poisonattackerevenifprotected":
                                    info += "<li>Poison anyone that " + a + " this role " + ("count" in mode ? "for " + (mode.count - 1) + "turns "  : "") + "even if protected/safeguarded. </li>";
                                    break;
                                case "ignore":
                                    info += "<li>Can't be " + a + "ed. </li>";
                                    break;
                                case "ChangeTarget":
                                    info += "<li>Kills anyone that " + a + " this role (action is canceled). </li>";
                                    break;
                                case "identify":
                                    info += "<li>Identify a player that " + a + " this role. </li>";
                                    break;
                                case "die":
                                    info += "<li>Instantly die if " + a + "ed. </li>";
                                    break;
                                case "noVisit":
                                    if (a === "stalk") {
                                        info += "<li>Always shows as having visited no one when stalked. </li>";
                                    }
                                    break;
                                case "resistance":
                                    if (a === "poison") {
                                        if ("rate" in mode) {
                                            if (mode.rate > 1) {
                                                info += "<li>Dies " + mode.rate + " times faster from poison. </li>";
                                            } else {
                                                info += "<li>Dies " + Math.round(1 / mode.rate) + " times slower from poison. </li>";
                                            }
                                        } else {
                                            if (mode.constant > 0 || mode.constant === undefined) {
                                                info += "<li>Dies " + (mode.constant ? mode.constant : 1) + " nights slower from poison. </li>";
                                            } else {
                                                info += "<li>Dies " + Math.abs(mode.constant) + " nights faster from poison. </li>";
                                            }
                                        }
                                    } else if (a === "curse") {
                                        if ("rate" in mode) {
                                            if (mode.rate > 1) {
                                                info += "<li>Converts " + mode.rate + " times faster from curses. </li>";
                                            } else {
                                                info += "<li>Converts " + Math.round(1 / mode.rate) + " times slower from curses. </li>";
                                            }
                                        } else {
                                            if (mode.constant > 0 || mode.constant === undefined) {
                                                info += "<li>Converts " + (mode.constant ? mode.constant : 1) + " nights slower from curses. </li>";
                                            } else {
                                                info += "<li>Converts " + Math.abs(mode.constant) + " nights faster from curses. </li>";
                                            }
                                        }
                                    }
                                    break;
                            }
                        }
                    }
                    if (a == "inspect") {
                        if ("revealSide" in mode && mode.revealSide !== false) {
                            info += "<li>Reveal side instead of role when inspected. </li>";
                        }
                        if ("revealAs" in mode) {
                            if (Array.isArray(mode.revealAs)) {
                                info += "<li>Inspected as " + readable(mode.revealAs.map(function(x){ return theme.roles[x].translation; }), "or") + ". </li>";
                            } else if (mode.revealAs == "*") {
                                info += "<li>Inspected as a random role. </li>";
                            } else if (typeof mode.revealAs === "string") {
                                info += "<li>Inspected as " + theme.roles[mode.revealAs].translation + ". </li>";
                            }
                        }
                    }
                }
            }
            if ("daykill" in actions) {
                if (typeof actions.daykill == "object") {
                    if ("evadeCharges" in actions.daykill.mode) {
                        if (typeof actions.daykill.mode.evadeCharges == "number") {
                            info += "<li>Evades daykills up to " + actions.daykill.mode.evadeCharges + " times. </li>";
                        } else {
                            info += "<li>Evades daykills a limited number of times (only if converted from a role with this same ability). </li>";
                        }
                    }
                    if ("evadeChance" in actions.daykill.mode) {
                        info += "<li>Has a " + (actions.daykill.mode.evadeChance * 100) + "% chance of evading daykills. </li>";
                    }
                    if ("ignore" in actions.daykill.mode) {
                        info += "<li>Evades daykills from " + readable(actions.daykill.mode.ignore.map(function(x){ return theme.roles[x].translation; }), "and") + " </li>";
                    }
                    if ("revenge" in actions.daykill.mode) {
                        info += "<li>Counter daykills from " + readable(actions.daykill.mode.revenge.map(function(x){ return theme.roles[x].translation; }), "and") + " </li>";
                    }
                } else {
                    if (actions.daykill == "evade") {
                        info += "<li>Can't be daykilled. </li>";
                    } else if (actions.daykill == "revenge") {
                        info += "<li>Counter daykills " + (!("daykillrevengemsg" in actions) || actions.daykillrevengemsg.indexOf("~Self~") != -1 ? "(Player is revealed)" : "(Player is not revealed)" ) + ". </li>";
                    } else if (actions.daykill == "bomb") {
                        info += "<li>Kill attacker when daykilled. </li>";
                    } else if (actions.daykill == "revealkiller") {
                        info += "<li>Reveals attacker when daykilled. </li>";
                    }

                }
            }
            if ("expose" in actions) {
                if (typeof actions.expose == "object") {
                    if ("evadeCharges" in actions.expose.mode) {
                        if (typeof actions.expose.mode.evadeCharges == "number") {
                            info += "<li>Evades exposes up to " + actions.expose.mode.evadeCharges + " times. </li>";
                        } else {
                            info += "<li>Evades exposes a limited number of times (only if converted from a role with this same ability). </li>";
                        }
                    }
                    if ("evadeChance" in actions.expose.mode) {
                        info += "<li>Has a " + (actions.expose.mode.evadeChance * 100) + "% chance of evading expose. </li>";
                    }
                    if ("ignore" in actions.expose.mode) {
                        info += "<li>Evades expose from " + readable(actions.expose.mode.ignore.map(function(x){ return theme.roles[x].translation; }), "and") + " </li>";
                    }
                    if ("revenge" in actions.expose.mode) {
                        info += "<li>Counter expose from " + readable(actions.expose.mode.revenge.map(function(x){ return theme.roles[x].translation; }), "and") + " </li>";
                    }
                } else {
                    if (actions.expose == "evade") {
                        info += "<li>Can't be exposed. </li>";
                    } else if (actions.expose == "revenge") {
                        info += "<li>Counter expose " + (!("exposerevengemsg" in actions) || actions.exposerevengemsg.indexOf("~Self~") != -1 ? "(Player is revealed)" : "(Player is not revealed)" ) + ". </li>";
                    } else if (actions.expose == "revealexposer") {
                        info += "<li>Reveals exposer when exposed. </li>";
                    }

                }
            }
            var count;
            if ("onDeath" in actions) {
                info += "<li>On Death:</li><ul>";
                if ("killRoles" in actions.onDeath) {
                    info += "<li>Kill the following roles: " + readable(actions.onDeath.killRoles.map(roleName), "and") + ". </li>";
                }
                if ("poisonRoles" in actions.onDeath) {
                    info += "<li>Poison the following roles: " + readable(Object.keys(actions.onDeath.poisonRoles).map(function(x){ return theme.roles[x].translation + " (" + actions.onDeath.poisonRoles[x] + " turns)"; }), "and") + ". </li>";
                }
                if ("convertRoles" in actions.onDeath) {
                    info += "<li>Convert the following roles: " + readable(Object.keys(actions.onDeath.convertRoles).map(function(x){ return theme.roles[x].translation + " (to " + theme.roles[actions.onDeath.convertRoles[x]].translation + ")"; }), "and") + ". </li>";
                }
                if ("curseRoles" in actions.onDeath) {
                    count = ("curseCount" in actions.onDeath) ? actions.onDeath.curseCount : 2;
                    info += "<li>Curse the following roles for " + count + " nights: " + readable(Object.keys(actions.onDeath.curseRoles).map(function(x){ return theme.roles[x].translation + " (to " + theme.roles[actions.onDeath.curseRoles[x]].translation + ")"; }), "and") + ". </li>";
                }
                if ("exposeRoles" in actions.onDeath) {
                    info += "<li>Expose the following roles: " + readable(actions.onDeath.exposeRoles.map(roleName), "and") + ". </li>";
                }
                info += "</ul>";
            }
            if ("onDeadRoles" in actions) {
                info += "<li>On Dead Roles:</li><ul>";
                if ("convertTo" in actions.onDeadRoles) {
                    act = actions.onDeadRoles.convertTo;
                    for (e in act) {
                        info += "<li>Converts to " + roleName(e) +  " when the following roles are dead: " + readable(actions.onDeadRoles.convertTo[e].map(roleName), "and") + ". </li>";
                    }
                }
                info += "</ul>";
            }
            if ("initialCondition" in actions) {
                if ("poison" in actions.initialCondition) {
                    info += "<li>Gets poisoned "+ ("count" in actions.initialCondition.poison ? "for " + actions.initialCondition.poison.count + " turns " : "") + "when game starts or player is converted to this role. </li>";
                }
                if ("clearPoison" in actions.initialCondition) {
                    info += "<li>Removes poison when changing to this role. </li>";
                }
                if ("curse" in actions.initialCondition) {
                    info += "<li>Gets cursed "+ ("curseCount" in actions.initialCondition.curse ? "for " + actions.initialCondition.curse.curseCount + " turns " : "") + "when game starts or player is converted to this role (changes to " +  theme.roles[actions.initialCondition.curse.cursedRole].translation + "). </li>";
                }
                if ("clearCurse" in actions.initialCondition) {
                    info += "<li>Removes curse when changing to this role. </li>";
                }
            }
            if ("hax" in actions) {
                info += "<li>Gets night hax on:</li><ul>";
                for (a in actions.hax) {
                    act = actions.hax[a];
                    info += "<li><u>" + cap(a) + "</u>: ";
                    if ("revealTeam" in act) {
                        info += "Team/Action/Target (" + (act.revealTeam * 100).toFixed(1) + "%). ";
                    }
                    if ("revealPlayer" in act) {
                        info += "Player/Team (" + (act.revealPlayer * 100).toFixed(1) + "%). ";
                    }
                    if ("revealRole" in act) {
                        info += "Player/Role (" + (act.revealRole * 100).toFixed(1) + "%). ";
                    }
                    if ("revealTarget" in act) {
                        info += "Target/Command (" + (act.revealTarget * 100).toFixed(1) + "%). ";
                    }
                    info += "</li>";
                }
                info += "</ul>";
            }
            if ("standbyHax" in actions) {
                info += "<li>Gets standby hax on:</li><ul>";
                for (a in actions.standbyHax) {
                    act = actions.standbyHax[a];
                    info += "<li><u>" + cap(a) + "</u>: ";
                    if ("revealTeam" in act) {
                        info += "Team/Action/Target (" + (act.revealTeam * 100).toFixed(1) + "%). ";
                    }
                    if ("revealPlayer" in act) {
                        info += "Player/Team (" + (act.revealPlayer * 100).toFixed(1) + "%). ";
                    }
                    if ("revealRole" in act) {
                        info += "Player/Role (" + (act.revealRole * 100).toFixed(1) + "%). ";
                    }
                    info += "</li>";
                }
                info += "</ul>";
            }
            if ("vote" in actions) {
                if (typeof actions.vote == "number") {
                    info += "<li>Vote counts as " + actions.vote + ". </li>";
                } else {
                    info += "<li>Vote counts randomly as " + readable(actions.vote, "or") + ". </li>";
                }
            }
            if ("voteshield" in actions) {
                if (typeof actions.voteshield == "number") {
                    info += "<li>Voteshield of " + actions.voteshield + ".</li>";
                } else {
                    info += "<li>Random Voteshield of " + readable(actions.voteshield, "or") + ". </li>";
                }
            }
            if ("lynch" in actions) {
                if ("revealAs" in actions.lynch) {
                    info += "<li>Reveal as " + this.roles[actions.lynch.revealAs].translation + " if lynched. </li>";
                }
                if ("convertTo" in actions.lynch) {
                    info += "<li>Convert to " + this.roles[actions.lynch.convertTo].translation + " if lynched. </li>";
                }
                if ("killRoles" in actions.lynch) {
                    info += "<li>If lynched, Kill the following roles: " + readable(actions.lynch.killRoles.map(function(x){ return theme.roles[x].translation; }), "and") + ". </li>";
                }
                if ("poisonRoles" in actions.lynch) {
                    info += "<li>If lynched, Poison the following roles: " + readable(Object.keys(actions.lynch.poisonRoles).map(function(x){ return theme.roles[x].translation + " (" + actions.lynch.poisonRoles[x] + " turns)"; }), "and") + ". </li>";
                }
                if ("convertRoles" in actions.lynch) {
                    info += "<li>If lynched, Convert the following roles: " + readable(Object.keys(actions.lynch.convertRoles).map(function(x){ return theme.roles[x].translation + " (to " + theme.roles[actions.lynch.convertRoles[x]].translation + ")"; }), "and") + ". </li>";
                }
                if ("curseRoles" in actions.lynch) {
                    count = ("curseCount" in actions.lynch) ? actions.lynch.curseCount : 2;
                    info += "<li>If lynched, Curse the following roles for " + count + " nights: " + readable(Object.keys(actions.lynch.curseRoles).map(function(x){ return theme.roles[x].translation + " (to " + theme.roles[actions.lynch.curseRoles[x]].translation + ")"; }), "and") + ". </li>";
                }
                if ("exposeRoles" in actions.lynch) {
                    info += "<li>If lynched, Expose the following roles: " + readable(actions.lynch.exposeRoles.map(function(x){ return theme.roles[x].translation; }), "and") + ". </li>";
                }
                var voters, n;
                if ("killVoters" in actions.lynch) {
                    voters = [];
                    if ("first" in actions.lynch.killVoters && actions.lynch.killVoters.first > 0) {
                        voters.push("first " + actions.lynch.killVoters.first);
                    }
                    if ("last" in actions.lynch.killVoters && actions.lynch.killVoters.last > 0) {
                        voters.push("last " + actions.lynch.killVoters.last);
                    }
                    if (voters.length === 0) {
                        voters.push("first");
                    }
                    info += "<li>If lynched, kills the " + readable(voters, "and") + " player(s) to vote them. </li>";
                }
                if ("convertVoters" in actions.lynch) {
                    voters = [];
                    if ("first" in actions.lynch.convertVoters && actions.lynch.convertVoters.first > 0) {
                        voters.push("first " + actions.lynch.convertVoters.first);
                    }
                    if ("last" in actions.lynch.convertVoters && actions.lynch.convertVoters.last > 0) {
                        voters.push("last " + actions.lynch.convertVoters.last);
                    }
                    if (voters.length === 0) {
                        voters.push("first");
                    }
                    
                    var list = [];
                    for (n in actions.lynch.convertVoters.newRole) {
                        list.push(theme.roles[n].translation + " (" + actions.lynch.convertVoters.newRole[n].map(function(x) { return theme.roles[x].translation; }).join(", ") + ")");
                    }
                    
                    info += "<li>If lynched, converts the " + readable(voters, "and") + " player(s) to vote them. </li>";
                    info += "<ul><li>Converts to " + readable(list, "or") + ". </li></ul>";
                    
                }
                info += "</ul>";
            }
            if ("onlist" in actions) {
                info += "<li>Appears as " + theme.roles[actions.onlist].translation + " at Current Roles list. </li>";
            }
            if ("onteam" in actions) {
                info += "<li>Appears as " + theme.roles[actions.onteam].translation + " at Current Team list. </li>";
            }
            if ("startup" in actions) {
                if (typeof actions.startup == "object") {
                    if ("revealAs" in actions.startup) {
                        info += "<li>Sees itself as " +  theme.roles[actions.startup.revealAs].translation + ". </li>";
                    }
                    if ("revealRole" in actions.startup) {
                        if (typeof actions.startup.revealRole == "string") {
                            info += "<li>Knows " +  theme.roles[actions.startup.revealRole].translation + ". </li>";
                        } else {
                            info += "<li>Knows " +  readable(actions.startup.revealRole.map(function(x){ return theme.roles[x].translation; }), "and") + ". </li>";
                        }
                    }
                    if ("team-revealif" in actions.startup) {
                        info += "<li>Knows teammates if sided with " +  readable(actions.startup["team-revealif"].map(function(x){ return theme.sideTranslations[x]; }), "or") + ". </li>";
                    }
                    if ("team-revealif-with-roles" in actions.startup) {
                        info += "<li>Knows teammates if sided with " +  readable(actions.startup["team-revealif-with-roles"].map(function(x){ return theme.sideTranslations[x]; }), "or") + ". </li>";
                    }
                } else {
                    if (actions.startup == "role-reveal") {
                        info += "<li>Knows players with the same role. </li>";
                    } else if (actions.startup == "team-reveal" || actions.startup == "team-reveal-with-roles") {
                        info += "<li>Knows teammates. </li>";

                    }
                }
            }

            info += "</ul>";
        }
        if (typeof role.side == "object") {
            randomSide.push(info);
        } else {
            sides[role.side].push(info);
        }
    }
    for (s in sides) {
        output += "<b><font size=4><font size=5 >" + theme.sideTranslations[s] + "</font></font></b><br><br>";
        output += sides[s].join("<br>");
        output += "<br><hr><br>";
    }
    if (randomSide.length > 0) {
        output += "<b><font size=5 >Random Side:</font></b><br><br>";
        output += randomSide.join("<br>");
        output += "<br><hr><br>";
    }

    return output;
};
Theme.prototype.writeRolesSummary2 = function() {
    var output = "<br>", sides = {}, s, randomSide = [], role, r, info;
    var sep = "*** *********************************************************************** ***";
    var roles = [sep];
    var role;
    var role_i = null;
    var role_order = Object.keys(this.roles);
    var this_roles = this.roles;
    role_order.sort(function (a, b) {
        var tra = this_roles[a].translation;
        var trb = this_roles[b].translation;
        if (tra == trb)
            return 0;
        else if (tra < trb)
            return -1;
        else
            return 1;
    });

    function trrole(s) { return this.trrole(s); }
    function trside(s) { return this.trside(s); }
    //NEWSTUFF
    function sideName(r, obj) {
        var out = "";
        if (typeof r.side == "string") {
            out += "Sided with " + obj.trside(r.side) + ". ";
        } else if (typeof r.side == "object") {
            var plop = Object.keys(r.side.random);
            var tran = [];
            for (var p = 0; p < plop.length; ++p) {
                tran.push(obj.trside(plop[p]));
            }
            out += "Sided with " + readable(tran, "or") + ". ";
        }
        if (r.hasOwnProperty("winningSides")) {
            if (r.winningSides == "*") {
                out += "Wins the game in any case. ";
            } else if (Array.isArray(r.winningSides)) {
                out += "Wins the game with " + readable(r.winningSides.map(trside, obj), "or");
            }
        }
        return out;
    }
    function spawnAt(role, list, index, theme) {
        var slot = list[index];
        if (typeof slot == "object" && role in slot) {
            return true;
        }
        if (typeof slot == "string") {
            if (slot.indexOf("pack:") == 0) {
                var count = 0;
                for (var s = 0; s <= index; s++) {
                    if (list[index] == slot) {
                        count++;
                    }
                }
                var pack = theme.spawnPacks[slot.substr(5)],
                    list;
                for (s in pack.roles) {
                    list = pack.roles[s];
                    if (list[count % list.length] == role) {
                        return true;
                    }
                }
            } else if (slot == role) {
                return true;
            }
        }
        return false;
    }
    for (var r = 0; r < role_order.length; ++r) {
        try {
            role = this.roles[role_order[r]];
              // Don't add this role to /roles
            if ((role.hide && role.hide !== "side") || role.hide == "both") {
                continue;
            }
            if ("infoName" in role) {
                roles.push("±Role: " + role.infoName);
            } else {
                roles.push("±Role: " + role.translation);
            }

            // check which abilities the role has
            var abilities = "", a, ability;
            if ("info" in role) {
                //NEWSTUFF
                abilities += role.info.replace(/~Sided~/g, sideName(role, this));
            } else {
                if (role.actions.night) {
                    for (a in role.actions.night) {
                        ability = role.actions.night[a];
                        abilities += "Can " + a + " " + ("limit" in ability ? ability.limit + " persons" : "one person") + " during the night";
                        if ("bypass" in ability) {
                            abilities += " bypassing the modes " + readable(ability.bypass, "and");
                        }
                        if ("avoidHax" in role.actions && role.actions.avoidHax.indexOf(a) != -1) {
                            abilities += "(Cannot be detected by spies) ";
                        }
                        abilities += ". ";
                    }
                }
                if (role.actions.standby) {
                    for (a in role.actions.standby) {
                        ability = role.actions.standby[a];
                        abilities += "Can " + a + " " + ("limit" in ability ? ability.limit + " persons" : "one person") + " during the standby. ";
                    }
                }
                if ("vote" in role.actions) {
                    if (typeof role.actions.vote === "number") {
                        abilities += "Vote counts as " + role.actions.vote + ". ";
                    } else if (Array.isArray(role.actions.vote)) {
                        abilities += "Vote counts randomly between " + role.actions.vote[0] + " (inclusive) and " + role.actions.vote[1] + " (exclusive). ";
                    }
                }
                if ("voteshield" in role.actions) {
                    if (typeof role.actions.voteshield === "number") {
                        abilities += "Receives " + role.actions.voteshield + " extra votes if voted for at all. ";
                    } else if (Array.isArray(role.actions.voteshield)) {
                        abilities += "Receives between " + role.actions.voteshield[0] + " (inclusive) and " + role.actions.voteshield[1] + " (exclusive) extra votes randomly if voted for at all. ";
                    }
                }
                if ("kill" in role.actions) {
                    if (role.actions.kill.mode == "ignore") {
                        abilities += "Can't be nightkilled. ";
                    }
                    else if (role.actions.kill.mode == "killattackerevenifprotected") {
                        abilities += "Revenges nightkills (even when protected). ";
                    }
                    else if (role.actions.kill.mode == "killattacker") {
                        abilities += "Revenges nightkills. ";
                    }
                    else if (role.actions.kill.mode == "poisonattacker" || role.actions.kill.mode == "poisonattackerevenifprotected") {
                        abilities += "Poison attacker when killed. ";
                    }
                    else if (typeof role.actions.kill.mode == "object") {
                        if ("ignore" in role.actions.kill.mode) {
                            var ignoreRoles = role.actions.kill.mode.ignore.map(trrole, this);
                            abilities += "Can't be nightkilled by " + readable(ignoreRoles, "and") + ". ";
                        }
                        if ("evadeChance" in role.actions.kill.mode && role.actions.kill.mode.evadeChance > 0) {
                            abilities += "Has a " + Math.floor(role.actions.kill.mode.evadeChance * 100) + "% chance of evading nightkills. ";
                        }
                    }
                }
                if ("daykill" in role.actions) {
                    if (role.actions.daykill == "evade") {
                        abilities += "Can't be daykilled. ";
                    }
                    else if (role.actions.daykill == "revenge") {
                        abilities += "Counter daykills. ";
                    }
                    else if (role.actions.daykill == "bomb") {
                        abilities += "Revenges daykills. ";
                    }
                    else if (typeof role.actions.daykill == "object" && typeof role.actions.daykill.mode == "object" && role.actions.daykill.mode.evadeChance > 0) {
                        abilities += "Has a " + Math.floor(role.actions.daykill.mode.evadeChance * 100) + "% chance of evading daykills. ";
                    }
                    else if (role.actions.daykill == "revealkiller") {
                        abilities += "Reveals killer when daykilled. ";
                    }
                }
                if ("poison" in role.actions) {
                    if (role.actions.poison.mode == "ignore") {
                        abilities += "Can't be poisoned. ";
                    }
                    else if (typeof role.actions.poison.mode == "object" && role.actions.poison.mode.evadeChance > 0) {
                        abilities += "Has a " + Math.floor(role.actions.poison.mode.evadeChance * 100) + "% chance of evading poison. ";
                    } else if (role.actions.poison.mode == "resistance") {
                        if (typeof role.actions.poison.rate == "number") {
                            if (role.actions.poison.rate > 1) {
                                abilities += "Dies " + role.actions.poison.rate + " times faster from poison. ";
                            } else {
                                abilities += "Dies " + Math.round(1 / role.actions.poison.rate) + " times slower from poison. ";
                            }
                        } else {
                            if (role.actions.poison.constant > 0 || role.actions.poison.constant === undefined) {
                                abilities += "Dies " + (role.actions.poison.constant ? role.actions.poison.constant : 1) + " nights slower from poison. ";
                            } else {
                                abilities += "Dies " + Math.abs(role.actions.poison.constant) + " nights faster from poison. ";
                            }
                        }
                    }
                }
                if ("curse" in role.actions) {
                    if (role.actions.curse.mode == "resistance") {
                        if (typeof role.actions.curse.rate == "number") {
                            if (role.actions.curse.rate > 1) {
                                abilities += "Converts " + role.actions.curse.rate  + " times faster from curses. ";
                            } else {
                                abilities += "Converts " + Math.round(1 / role.actions.curse.rate)  + " times slower from curses. ";
                            }
                        } else {
                            if (role.actions.curse.constant > 0 || role.actions.curse.constant === undefined) {
                                abilities += "Converts " + (role.actions.curse.constant ? role.actions.curse.constant : 1) + " nights slower from curses. ";
                            } else {
                                abilities += "Converts " + Math.abs(role.actions.curse.constant) + " nights faster from curses. ";
                            }
                        }
                    }
                }
                if ("hax" in role.actions && Object.keys) {
                    var haxy = Object.keys(role.actions.hax);
                    abilities += "Gets hax on " + readable(haxy, "and") + ". ";
                }
                if ("inspect" in role.actions) {
                    if ("revealAs" in role.actions.inspect) {
                        if (Array.isArray(role.actions.inspect.revealAs)) {
                            var revealAs = role.actions.inspect.revealAs.map(trrole, this);
                            abilities += "Reveals as " + readable(revealAs, "or") + " when inspected. ";
                        } else if (role.actions.inspect.revealAs == "*") {
                            abilities += "Reveals as a random role when inspected. ";
                        } else {
                            abilities += "Reveals as " + this.roles[role.actions.inspect.revealAs].translation + " when inspected. ";
                        }
                    }
                }
                if ("distract" in role.actions) {
                    if (role.actions.distract.mode == "ChangeTarget")
                        abilities += "Kills any distractors. ";
                    if (role.actions.distract.mode == "ignore")
                        abilities += "Ignores any distractors. ";
                }
                if ("initialCondition" in role.actions) {
                    if ("poison" in role.actions.initialCondition) {
                        abilities += "Dies at the end of night " + (role.actions.initialCondition.poison.count || 2) + ". ";
                    }
                }
                abilities += sideName(role, this);
            }
            roles.push("±Ability: " + abilities);

            // check on which player counts the role appears
            var playerCount = '';
            var roleplayers = role.players;
            
            if (roleplayers !== false) { // players: false
                var parts = [];
                var end = 0;
                if (typeof roleplayers === "string") { // players: "Convert" -> Convert
                    playerCount = roleplayers;
                } else if (typeof roleplayers === "number") { // players: 30 -> 30 Players
                    playerCount = roleplayers + " Players";
                } else if (Array.isArray(roleplayers)) { // players: [20, 30] -> 20-30 Players
                    playerCount = roleplayers.join("-") + " Players";
                } else {
                        // alert("OK"+this.roleLists);
                    for (var i = 1; i <= this.roleLists; ++i) {
                        role_i = "roles" + i;
                        var start = -1, v;
                        for (var e = 0; e < this[role_i].length; e++) {
                            v = this[role_i][e];
                            // if ((typeof v == "string" && v == role.role) || (typeof v == "object" && role.role in v)) {
                            if (spawnAt(role.role, this[role_i], e, this)) {
                                start = e;
                                break;
                            }
                        }
                        var last = end;
                        end = this[role_i].length;
                        if (start >= 0) {
                            ++start;
                            start = start > last ? start : 1 + last;
                            if (parts.length > 0 && parts[parts.length - 1][1] == start - 1) {
                                parts[parts.length - 1][1] = end;
                            } else {
                                parts.push([start, end]);
                                if (parts.length > 1) {
                                    parts[parts.length - 2] = parts[parts.length - 2][0] < parts[parts.length - 2][1] ? parts[parts.length - 2].join("-") : parts[parts.length - 2][1];
                                }
                            }
                        }
                    }
                    if (parts.length > 0) {
                        parts[parts.length - 1] = parts[parts.length - 1][0] < parts[parts.length - 1][1] ? parts[parts.length - 1].join("-") : parts[parts.length - 1][1];
                    }
                    
                    playerCount = parts.join(", ") + " Players";
                }

                roles.push("±Players: " + playerCount);
            }

            roles.push(sep);
        } catch (err) {
            if (role_i === null)
                alert("Error adding role " + role.translation + "(" + role.role + ") to /roles");
            else
                alert("Error making rolelist with role id: " + role_i);
            throw err;
        }
    }
    // this.roleInfo = roles;

    return "<font face=Tahoma>" + formatToPOChat(roles).join("<br>") + "</font>";
};
function formatToPOChat(arr) {
    var sep = "*** *********************************************************************** ***";
    var line;
    for (var e in arr) {
        line = arr[e];
        if (line == sep) {
            arr[e] = "<font color=Fuchsia>" + line + "</font>";
        } else if (line[0] == "±" && line.indexOf(":") !== -1) {
            //3daa68
            arr[e] = "<font color=#3daa68><b>" + (line.substr(0, line.indexOf(":")+1)) + "</b></font>" + line.substr(line.indexOf(":")+1);
        }
    }
    return arr;
}
function toBBCode(str) {
    var out = str;
    var patt = [
        ["<b>", "[b]"],
        ["</b>", "[/b]"],
        ["<font color=", "[color="],
        ["</font>", "[/color]"],
        ["<ol>", "~br~[list=1]"],
        ["</ol>", "~br~[/list]~br~"],
        ["<li>", "~br~[*]"],
        ["</li>", ""],
        ["<br/>", "\n"],
        [">", "]"]
    ];
    
    for (var i in patt) {
        out = out.replace(new RegExp(patt[i][0], "g"), patt[i][1]);
    }
    
    out = out.replace(new RegExp("~br~", "gi"), "\n");
    // out = out.replace(new RegExp("~br~", "gi"), "<br/>");
    
    return "<div class='bbcspawn'> <input type='button' name='html_button' value='Normal' onclick='showHTMLSpawn()'/> <br/> <textarea id='bbc' rows='24' cols='80' name='inputbox'>" +out+"</textarea><br/></div>";
}

function additionalAttributes(act, a, enclose) {
    var out = "", c;
    if (a == "poison" && "count" in act) {
        out += "Kills after " + (act.count - 1) + " days";
    } else if (a == "inspect" && "Sight" in act) {
        if (act.Sight == "Team") {
            out += "Inspect target's side";
        } else if (typeof act.Sight == "object") {
            out += "Can inspect target as " + randomSampleText(act.Sight, function(x) { return (x == "true" ? "True Role" : theme.roles[x].translation); });
        }
    } else if (a == "curse" && "curseCount" in act){
        out += "Convert after " + (act.curseCount - 1) + " days";
    } else if (a == "shield" && "shieldActions" in act) {
        out += "Shield target against " + (act.shieldActions === "*" ? "any action" : readable(act.shieldActions.map(cap), "and"));
    }
    if (out !== "") {
        if (enclose === true) {
            out = "(" + out + ") ";
        } else {
            out += ". ";
        }
    }
    return out;
}
function convertList(act) {
    var out = "";
    if (typeof act.newRole == "string") {
        out += "Can convert to " + theme.roles[act.newRole].translation + " (" + ("canConvert" in act && act.canConvert !== "*" ? act.canConvert.map(function(x) { return theme.roles[x].translation; }).join(", ") : "Any role") + ")";
    } else {
        if ("random" in act.newRole && !Array.isArray(act.newRole.random)) {
            out += "Can convert to " + randomSampleText(act.newRole.random, function(x) { return theme.roles[x].translation; }) + " " + " (" + ("canConvert" in act  && act.canConvert !== "*" ? act.canConvert.map(function(x) { return theme.roles[x].translation; }).join(", ") : "Any role") + ")";
        } else {
            var list = [];
            for (var c in act.newRole) {
                list.push(theme.roles[c].translation + " (" + act.newRole[c].map(function(x) { return theme.roles[x].translation; }).join(", ") + ")");
            }
            out += "Can convert to " + readable(list, "or");
        }
    }
    return out;
}
function massConvertList(act) {
    var out = "";
   
    out += "Converts the following roles: " + readable(Object.keys(act.convertRoles).map(function(x){ return theme.roles[x].translation + " (to " + theme.roles[act.convertRoles[x]].translation + ")"; }), "and");
    
    
    
    /* for (var c in act.newRole) {
        list.push(theme.roles[c].translation + " (" + act.newRole[c].map(function(x) { return theme.roles[x].translation; }).join(", ") + ")");
    }
    out += "Can convert to " + readable(list, "or");
         */
    return out;
}
function copyList(act) {
    var out = "";
    if (typeof act.copyAs == "string") {
        if (act.copyAs == "*") {
            out += "Becomes the same role when copying";
        } else {
            out += "Becomes " + theme.roles[act.copyAs].translation + " when copying";
        }
    } else {
        var list = [];
        for (var c in act.copyAs) {
            list.push(theme.roles[c].translation + " (" + act.copyAs[c].map(function(x) { return theme.roles[x].translation; }).join(", ") + ")");
        }
        out += "Can copy as " + readable(list, "or");
    }
    return out;
}
function curseList(act) {
    var out = "";
    if (typeof act.cursedRole == "string") {
        out += "Can curse to " + theme.roles[act.cursedRole].translation + " (" + ("canCurse" in act && act.canCurse !== "*" ? act.canCurse.map(function(x) { return theme.roles[x].translation; }).join(", ") : "Any role") + ")";
    } else {
        if ("random" in act.cursedRole && !Array.isArray(act.cursedRole.random)) {
            out += "Can curse to " + randomSampleText(act.cursedRole.random, function(x) { return theme.roles[x].translation; }) + " " + " (" + ("canCurse" in act  && act.canCurse !== "*" ? act.canCurse.map(function(x) { return theme.roles[x].translation; }).join(", ") : "Any role") + ")";
        } else {
            var list = [];
            for (var c in act.cursedRole) {
                list.push(theme.roles[c].translation + " (" + act.cursedRole[c].map(function(x) { return theme.roles[x].translation; }).join(", ") + ")");
            }
            out += "Can curse to " + readable(list, "or");
        }
    }
    return out;
}
function assignVariable(master, index, prop, variables) {
    var variable, len, j, val;
    
    if (typeof prop === 'string' && prop.slice(0, 9) === 'variable:') {
        variable = prop.slice(9);
        // Check for undefined variable here.
        master[index] = variables[variable];
    } else if (Array.isArray(prop)) {
        for (j = 0, len = prop.length; j < len; j += 1) {
            val = prop[j];
            assignVariable(prop, j, val, variables);
        }
    } else if (Object.prototype.toString.call(prop) === '[object Object]') {
        for (j in prop) {
            assignVariable(prop, j, prop[j], variables);
        }
    }
}
function randomSampleText(obj, translator) {
    var total = 0, count = 0, list = [], s;
    for (s in obj) {
        total += obj[s];
        count++;
    }
    for (s in obj) {
        list.push(translator(s) + " [" + (total === 0 ? count/100 : (obj[s] / total * 100).toFixed(2)) + "%]");
    }
    return readable(list, "or");
}
function roleName(x) {
    return theme.roles[x].translation;
}
function outputToPage(msg, areaName) {
	switch (areaName) {
        case "errors":
            document.getElementById('errors').innerHTML = msg;
            break;
        case "roles":
            document.getElementById('roles').innerHTML = msg;
            break;
        case "sides":
            document.getElementById('sides').innerHTML = msg;
            break;
        case "priority":
            document.getElementById('priority').innerHTML = msg;
            break;
        case "spawn":
            document.getElementById('spawn').innerHTML = msg;
            break;
        default:
            document.getElementById('errors').innerHTML = msg;
            break;
    }
}
function readable(arr, last_delim) {
	if (!Array.isArray(arr))
	return arr;
	if (arr.length > 1) {
		return arr.slice(0, arr.length-1).join(", ") + " " + last_delim + " " + arr.slice(-1)[0];
	} else if (arr.length == 1) {
		return arr[0];
	} else {
		return "";
	}
}
function cap(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function removeDuplicates(arr) {
    var result = {};
    for (var x in arr) {
        result[arr[x]] = 1;
    }
    return Object.keys(result);
}