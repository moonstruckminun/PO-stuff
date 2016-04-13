var pokemon = {};
var pokeIndex = [];
var allPickers = {};
var theme = {
    name: "None",
    types: [], //Types that will be included. Pokémon only needs to match one of these types
    excludeTypes: [], //Types that will be excluded even if it matches the type above
    include: [], //Pokémon that do not match any of the criteria above, but will be included anyway
    exclude: [], //Pokémon that matches all of the previous criteria, but will be excluded anyway,
    customBST: {  }, //Makes a pokémon count as a different BST for this theme. In the example, Pokémon #289 (Slaking) will be considered a 600 BST Pokémon for this theme.
    minBST: 300, //Choose a different minimum BST for pokémon to spawn. Optional, defaults to 300.
    maxBST: 601, //Choose a different maximum BST for pokémon to spawn. Optional, defaults to 600.
    icon: 0
};
var types = ["Normal", "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost", "Steel", "Fire", "Water", "Grass", "Electric", "Psychic", "Ice", "Dragon", "Dark", "Fairy", "???"];
var balls = ["safari", "great", "ultra", "master", "myth", "luxury", "quick", "heavy", "spy", "clone", "premier", "mono"];
var items = ["safari", "great", "ultra", "master", "myth", "heavy", "quick", "luxury", "premier", "spy", "clone", "mono", "rock", "bait", "gacha", "mega", "stick", "itemfinder", "dust", "salt", "silver", "entry", "rare", "gem", "amulet", "honey", "soothe", "crown", "scarf", "battery", "eviolite", "box", "pearl", "stardust", "bigpearl", "starpiece", "nugget", "bignugget", "pack", "fragment", "egg", "bright", "water", "cherry", "materia", "fragment", "philosopher", "blkapricorn", "whtapricorn"];
var legendaries = [144,145,146,150,151,243,244,245,249,250,251,377,378,379,380,381,382,383,384,385,386,480,481,482,483,484,485,486,487,488,490,491,492,493,494,638,639,640,641,642,643,644,645,646,647,648,649,716,717,718,719,720,721];
/*
"1": {
    name: "Bulbasaur",
    types: ["Grass", "Poison"],
    bst: 318
    index: 1
}
*/

Number.prototype.toFixedNumber = function(x, base){
  var pow = Math.pow(base||10,x);
  return +( Math.round(this*pow) / pow );
}
$(document).ready(function () {
    // loadData(pokeData, type1Data, type2Data, statsData);
    
    /* ****************************** */
    /*      BST SLIDER SETUP          */
    /* ****************************** */
    
    $("#bstMin").on("input", function(event) {
        var val = parseInt($(this).val(), 10);
        if (!isNaN(val)) {
            var high = $("#ex2").slider("getValue")[1];
            $("#ex2").slider("setValue", [val, high]);
            // activateBstApply();
            applyBst();
        }
    });
    $("#bstMax").on("input", function(event) {
        var val = parseInt($(this).val(), 10);
        if (!isNaN(val)) {
            var low = $("#ex2").slider("getValue")[0];
            $("#ex2").slider("setValue", [low, val]);
            // activateBstApply();
            applyBst();
        }
    });
    $("#ex2").slider({});
    $("#ex2").change(function(slideEvt) {
        $("#bstMin").val(slideEvt.value.newValue[0]);
        $("#bstMax").val(slideEvt.value.newValue[1]);
        // activateBstApply();
        applyBst();
    });
    $("#ex2").slider("setValue", [parseInt($("#bstMin").val(), 10), parseInt($("#bstMax").val(), 10)]);
    
    
    /* ****************************** */
    /*     INCLUDE/EXCLUDE SETUP      */
    /* ****************************** */
    $('.includeExclude').on("contextmenu", function(evt) {evt.preventDefault();});
    $('#includeBox').on("mousedown", ".includeExclude", function (event) {
		event.preventDefault();
        var obj = $(this);
        var state = obj.attr("name");
        var type = $(this).attr("value");
        var list, rList;
        
        var rClass = [], aClass = [], fName = state, addToList = true, e;
        
        switch (event.which) {
            case 3:
                list = theme.excludeTypes;
                rList = theme.types;
                if (state == "excluded") {
                    rClass.push("btn-danger");
                    aClass.push("btn-default");
                    fName = "nothing";
                    addToList = false;
                } else {
                    rClass = ["btn-default", "btn-success"];
                    aClass.push("btn-danger");
                    fName = "excluded";
                }
            break;
            case 1:
                list = theme.types;
                rList = theme.excludeTypes;
                if (state == "included") {
                    rClass.push("btn-success");
                    aClass.push("btn-default");
                    fName = "nothing";
                    addToList = false;
                } else {
                    rClass = ["btn-default", "btn-danger"];
                    aClass.push("btn-success");
                    fName = "included";
                }
            break;
            default:
                return;
        }
        
        for (e in rClass) {
            obj.removeClass(rClass[e]);
        }
        for (e in aClass) {
            obj.addClass(aClass[e]);
        }
        if (addToList) {
            if (list.indexOf(type) == -1) {
                list.push(type);
            }
            if (rList.indexOf(type) !== -1) {
                rList.splice(rList.indexOf(type), 1);
            }
        } else {
            if (list.indexOf(type) !== -1) {
                list.splice(list.indexOf(type), 1);
            }
        }
        obj.attr("name", fName);
        checkAll();
	});
    $('#includedPokeContainer').on("contextmenu", function(evt) {evt.preventDefault();});
    $('#includedPoke').on("mousedown", ".includedLabel", function (event) {
		event.preventDefault();
        var obj = $(this), num = parseInt($(this).attr("value"), 10), id;
        
        if (!isNaN(num)) {
            switch (event.which) {
                case 3:
                    if (theme.include.indexOf(num) !== -1) {
                        splice(theme.include, num);
                        theme.exclude.push(num);
                        updateIncluded();
                        id = species(num) + "-" + forme(num);
                        markPokemon(id);
                    }
                break;
                case 1:
                    if (theme.include.indexOf(num) !== -1) {
                        splice(theme.include, num);
                        updateIncluded();
                        id = species(num) + "-" + forme(num);
                        markPokemon(id);
                    }
                break;
                default:
                    return;
            }
        }
        
	});
    $('#includedPoke').on("mousedown", ".excludedLabel", function (event) {
		event.preventDefault();
        var obj = $(this), num = parseInt($(this).attr("value"), 10), id;
        
        if (!isNaN(num)) {
            switch (event.which) {
                case 1:
                    if (theme.exclude.indexOf(num) !== -1) {
                        splice(theme.exclude, num);
                        theme.include.push(num);
                        updateIncluded();
                        id = species(num) + "-" + forme(num);
                        markPokemon(id);
                    }
                break;
                case 3:
                    if (theme.exclude.indexOf(num) !== -1) {
                        splice(theme.exclude, num);
                        updateIncluded();
                        id = species(num) + "-" + forme(num);
                        markPokemon(id);
                    }
                break;
                default:
                    return;
            }
        }
        
	});
    
    /* ****************************** */
    /*           MISC SETUP           */
    /* ****************************** */
    $("#themeName").on("input", function(event) {
        theme.name = $(this).val();
    });
    $("#themeIcon").on("input", function(event) {
        var val = parseInt($(this).val(), 10);
        if (!isNaN(val)) {
            theme.icon = val;
        }
    });
    
    
    createRulesUI();
    $(".rulesRadio").change(showRules);
    showRules();
    
    $('[data-toggle="tooltip"]').tooltip(); 
    
    setTimeout(function() {
        $("#loadingIcons").remove();
        loadData(pokeData, type1Data, type2Data, statsData);
        hideMega();
    }, 50);
});

function hideMega() {
    $(".mega").toggle();
}
function hideForms() {
    $(".altform").toggle();
}
function hideLegendaries() {
    $(".legendary").toggle();
}
function activateBstApply() {
    var btn = $("#applyBstBtn");
    if (btn.hasClass("btn-default")) {
        btn.removeClass("btn-default");
        btn.addClass("btn-success");
    }
}
function applyBst() {
    var val = $("#ex2").slider("getValue");
    theme.minBST = val[0];
    theme.maxBST = val[1];
    checkAll();
    
    var btn = $("#applyBstBtn");
    if (btn.hasClass("btn-success")) {
        btn.removeClass("btn-success");
        btn.addClass("btn-default");
    }
}

function loadData(poke, types1, types2, stats) {
    var pokeRaw = poke.split("||");
    
    poke = toRawObject(poke);
    types1 = toRawObject(types1);
    types2 = toRawObject(types2);
    stats = toRawObject(stats);
    
    var size = pokeRaw.length, pkmn, t1, t2, bst,  e;
    // var size = 40, pkmn, t1, t2, bst,  e;
    for (e = 1; e < size; e++) {
        pkmn = convertRawValue(pokeRaw[e]);
        
        pokemon[pkmn.url] = {
           name: pkmn.value,
           base: pkmn.index,
           form: pkmn.form,
           index: calcForm(pkmn.index, pkmn.form),
           icon: (pkmn.form > 0 ? pkmn.url : pkmn.index),
           mega: pkmn.mega
        };
    }
    
    var index, form, pTypes;
    for (e in pokemon) {
        index = e.split("-")[0];
        form = e.split("-")[1];
                
        t1 = types[getValFromUrl(e, types1)];
        t2 = types[getValFromUrl(e, types2)];
        pTypes = [t1];
        if (t2 !== "???") {
            pTypes.push(t2);
        }
        
        bst = addRawBST(getValFromUrl(e, stats));
        
        
        pokemon[e].types = pTypes;
        pokemon[e].bst = bst;
    }
    
    var ordered = Object.keys(pokemon).sort(function(a, b) {
        return pokemon[a].base - pokemon[b].base;
    });
    var pokeOrdered = {};
    for (e = 0; e < ordered.length; e++) {
        pokeOrdered[ordered[e]] = pokemon[ordered[e]];
    }
    pokemon = pokeOrdered;
    pokeIndex = Object.keys(pokemon);

    buildPicker();
}
function buildPicker(){
    var holder = $('#pokePicker'), out = "", data, title, pick;
    for (var e in pokemon) {
        data = pokemon[e];
        title = "#" + data.icon + " " + data.name + " | " + data.types.join("/") + " | BST " + data.bst;
        pick = $("<img class='pickerIcon"+(data.mega ? " mega" : (data.form != 0 ? " altform" : ""))+(legendaries.indexOf(parseInt(data.base, 10)) !== -1 ? " legendary" : "")+"' pokeid='"+e+"' src='icons/" + data.icon + ".png' title='" + title + "'>");
        holder.append(pick);
        allPickers[e] = pick;
    }
    holder.append(out);
    
    $('#pokePicker').on("contextmenu", function(evt) {evt.preventDefault();});
    $('#pokePicker').on("mousedown", ".pickerIcon", function (event) {
		event.preventDefault();
        var id = $(this).attr("pokeid");
        var num = pokemon[id].index;
        
        switch (event.which) {
            case 3:
                if (theme.exclude.indexOf(num) !== -1) {
                    theme.exclude.splice(theme.exclude.indexOf(num), 1);
                    $(this).removeClass("excluded");
                    $(this).removeClass("included");
                } else {
                    theme.exclude.push(num);
                    splice(theme.include, num);
                    $(this).addClass("excluded");
                }
                updateIncluded();
            break;
            case 2:
                setForCustomBST(id);
            break;
            case 1:
                if (theme.include.indexOf(num) !== -1) {
                    theme.include.splice(theme.include.indexOf(num), 1);
                    $(this).removeClass("included");
                } else {
                    theme.include.push(num);
                    splice(theme.exclude, num);
                    $(this).removeClass("excluded");
                    $(this).addClass("included");
                }
                updateIncluded();
        }
        markPokemon(id);
	});
}
function getValFromUrl(url, obj) {
    if (url in obj) {
        return obj[url];
    } else {
        var index = parseInt(url.split("-")[0], 10);
        var form = parseInt(url.split("-")[1], 10);
        
        for (var e = form; e >= 0; e--) {
            if ((index + "-" + e) in obj) {
                return obj[index + "-" + e];
            }
        }
    }
    return null;
}
function toRawObject(raw) {
    info = raw.split("||");
    var result = {};
    
    var index, form, value, data;
    for (var e = 1; e < info.length; e++) {
        data = info[e];
        index = data.split(":")[0];
        form = data.split(":")[1].split(" ")[0];
        value = data.split(" ").slice(1).join(" ");
        
        result[index + "-" + form] = value;
    }
    
    return result;
}
function convertRawValue(raw) {
    var info = raw.split(":");
    var index = info[0];
    var form = info[1].split(" ")[0];
    var isMega = info.length > 2 ? info[2].split(" ")[0] == "M" : false;
    var val = raw.split(" ").slice(1).join(" ");
    
    return { index: index, form: form, value: val, mega: isMega, url: index + "-" + form };
}
function addRawBST(raw) {
    var info = raw.split(" ");
    var sum = 0;
    
    for (var e in info) {
        sum += parseInt(info[e], 10);
    }
    
    return sum;
}

function setForCustomBST(id, value) {
    var data = pokemon[id];
    
    if ($(".custombst[key="+id+"]").length) {
        $(".custombst[key="+id+"]").remove();
        $(".pickerIcon[pokeid="+id+"]").removeClass("customized");
        delete theme.customBST[data.index];
    } else {
        var bst = theme.customBST[data.index] = value || data.bst;
        
        var sele = "<div class='custombst form-group' key='" + id + "' ><label>" + data.name + ":</label> <input type='number' class='bstInput form-control' key='" + id + "' value='" + bst + "' ></div>";
        
        $("#customBST").append(sele);
        $(".pickerIcon[pokeid="+id+"]").addClass("customized");
        
        $(".bstInput[key=" + id + "]").on("input", function(e) {
            var val = parseInt($(this).val(), 10);
            if (!isNaN(val)) {
                theme.customBST[data.index] = val;
                markPokemon(id);
            }
        });
        $(".bstInput.form-control").on("keypress", function(event) {
            if (event.which == 13) {
                event.preventDefault();
            }
        });
    }
}

function species(poke) {
    return poke & ((1 << 16) - 1);
}
function forme(poke) {
    return poke >> 16;
}
function calcForm(base, forme) {
    return parseInt(base,10) + parseInt(forme << 16, 10);
}
function checkAll() {
    for (var e in pokemon) {
        markPokemon(e);
    }
    /* loop(pokeIndex.length, function(i) {
        markPokemon(pokeIndex[i]);
    }); */
    /* repeat(pokeIndex.length, function(i) {
        markPokemon(pokeIndex[i]);
    }); */
}
function repeat (n, f) {
    var i = 0, end = {}, ret = null;
    return Deferred.next(function () {
        var t = (new Date()).getTime();
        divide: {
            do {
                if (i >= n) break divide;
                ret = f(i++);
            } while ((new Date()).getTime() - t < 40);
            return Deferred.call(arguments.callee);
        }
    });
}
function markPokemon(pokeId) {
    // var icon = $(".pickerIcon[pokeid=" + pokeId + "]");
    var icon = allPickers[pokeId];
    if (validForTheme(pokeId)) {
        if (!icon.hasClass("included")) {
            console.log("Including " + pokeId);
            icon.addClass("included");
            icon.removeClass("excluded");
        }
    } else {
        if (theme.exclude.indexOf(pokemon[pokeId].index) !== -1) {
            if (!icon.hasClass("excluded")) {
                icon.addClass("excluded");
            } 
        } else {
            if (icon.hasClass("excluded")) {
                icon.removeClass("excluded");
            }
        }
        if (icon.hasClass("included")) {
            icon.removeClass("included");
        }
    }
}

function validForTheme(pokeId) {
    var data = pokemon[pokeId];
    
    if (data.index in theme.customBST) {
        if (theme.customBST[data.index] >= theme.maxBST) {
            return false;
        }
    } else if (data.bst >= theme.maxBST) {
        return false;
    }
    if (theme.exclude.indexOf(data.index) !== -1) {
        return false;
    }
    if (theme.include.indexOf(data.index) !== -1) {
        return true;
    }
    for (var e in theme.excludeTypes) {
        if (hasType(pokeId, theme.excludeTypes[e])) {
            return false;
        }
    }
    if (data.mega || data.form > 0) {
        return false;
    }
    for (e in theme.types) {
        if (hasType(pokeId, theme.types[e]) && legendaries.indexOf(parseInt(pokeId, 10)) === -1) {
            return true;
        }
    }
    return false;
}
function hasType(pokeId, type) {
    return pokemon[pokeId].types.indexOf(type) !== -1;
}

function updateIncluded() {
    var out = [], e, id, num;
    
    for (e = 0; e < theme.include.length; e++) {
        num = theme.include[e];
        id = species(num) + "-" + forme(num);
        out.push("<span class='label label-success includedLabel' value='" + num + "'>" + pokemon[id].name + "</span>");
    }
    for (e = 0; e < theme.exclude.length; e++) {
        num = theme.exclude[e];
        id = species(num) + "-" + forme(num);
        out.push("<span class='label label-danger excludedLabel' value='" + num + "'>" + pokemon[id].name + "</span>");
    }
    
    $("#includedPoke").html(out.join(" "));
}
function resetButton(btn) {
    btn.removeClass("btn-success");
    btn.removeClass("btn-danger");
    btn.addClass("btn-default");
    btn.prop("name", "nothing");
}

function showImportWindow() {
    $("#inputOverlay").toggle();
}
function importTheme(data) {
    var raw;
    data = data.substr(data.indexOf("{"));
    data = data.substr(0, data.lastIndexOf("}") + 1);
    try {
        raw = JSON.parse(data);
    } catch (err) {
        alert("Invalid JSON! " + data);
        return;
    }
    
    var newTheme = {
        name: raw.name || "None",
        types: raw.types || [],
        excludeTypes: raw.excludeTypes || [],
        include: raw.include || [],
        exclude: raw.exclude || [],
        customBST: raw.customBST || {},
        minBST: raw.minBST || 300,
        maxBST: raw.maxBST || 601,
        icon: raw.icon || 0
    };
    
    theme = newTheme;
    $("#inputOverlay").fadeOut();
    
    //Update UI
    $("#themeName").val(theme.name);
    $("#themeIcon").val(theme.icon);
    $("#bstMin").val(theme.minBST);
    $("#bstMax").val(theme.maxBST);
    
    var e, num;
    for (e = theme.include.length - 1; e >= 0; e--) {
        num = theme.include[e];
        if (theme.exclude.indexOf(num) !== -1) {
            theme.include.splice(e, 1);
        }
    }
    
    var obj, type, boxes = $("input.includeExclude");
    boxes.each(function(i){
        obj = $(this);
        resetButton(obj);
        type = obj.val();
        if (theme.types.indexOf(type) !== -1) {
            obj.removeClass("btn-default");
            obj.addClass("btn-success");
            obj.prop("name", "included");
            if (theme.excludeTypes.indexOf(type) !== -1) {
                theme.excludeTypes.splice(theme.excludeTypes.indexOf(type), 1);
            }
        } else if (theme.excludeTypes.indexOf(type) !== -1) {
            obj.removeClass("btn-default");
            obj.addClass("btn-danger");
            obj.prop("name", "excluded");
        }
    });
    
    checkAll();
    updateIncluded();
    
    $(".pickerIcon.customized").removeClass("customized");
    $("#customBST").empty();
    
    for (e in theme.customBST) {
        num = parseInt(e, 10);
        var id = species(num) + "-" + forme(num);
        setForCustomBST(id, theme.customBST[e]);
    }
    
    loadRules(raw.rules);
    
    $("#importWindow").modal("hide");
}
function exportTheme() {
    var rules = getRules();
    
    if (rules) {
        theme.rules = rules;
    } else {
        delete theme.rules;
    }
    
    $("#outputThemeField").val(JSON.stringify(theme));
}

function splice(arr, val) {
    var index = arr.indexOf(val);
    if (index !== -1) {
        arr.splice(index, 1);
        return index;
    }
    return -1;
}
function cap(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}