var pokemon = {};
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
var legendaries = [144,145,146,150,151,243,244,245,249,250,251,377,378,379,380,381,382,383,384,385,386,480,481,482,483,484,485,486,487,488,490,491,492,493,494,638,639,640,641,642,643,644,645,646,647,648,649,716,717,718,719,720,721];
/*
"1": {
    name: "Bulbasaur",
    types: ["Grass", "Poison"],
    bst: 318
    index: 1
}
*/

$(document).ready(function () {
    loadData(pokeData, type1Data, type2Data, statsData);
    
    $("input[type=number]").on("keypress", function(event) {
        if (event.which == 13) {
            var id = $(this).attr("id").toLowerCase();
            var val = parseInt($(this).val(), 10);
            if (!isNaN(val)) {
                if (id == "minbst") {
                    theme.minBST = val;
                    checkAll();
                } else if (id == "maxbst") {
                    theme.maxBST = val;
                    checkAll();
                }
            }
        }
    });
    $("#themeName").on("input", function(event) {
        theme.name = $(this).val();
    });
    $("#themeIcon").on("input", function(event) {
        var val = parseInt($(this).val(), 10);
        if (!isNaN(val)) {
            theme.icon = val;
        }
    });
    $("input[type=checkbox]").on("click", function(event) {
        var action = $(this).attr("name");
        var type = $(this).attr("value");
        var val = $(this).is(":checked");
        var list;
        if (action == "include") {
            list = theme.types;
            if (val) {
                if (list.indexOf(type) == -1) {
                    list.push(type);
                }
            } else {
                if (list.indexOf(type) !== -1) {
                    list.splice(list.indexOf(type), 1);
                }
            }
            checkAll();
        } else if (action == "exclude") {
            list = theme.excludeTypes;
            if (val) {
                if (list.indexOf(type) == -1) {
                    list.push(type);
                }
            } else {
                if (list.indexOf(type) !== -1) {
                    list.splice(list.indexOf(type), 1);
                }
            }
            checkAll();
        }
    });
    
    $("#closeInput").on("click", function(e){
        $("#inputOverlay").fadeOut();
    });
    $("#closeOutput").on("click", function(e){
        $("#outputOverlay").fadeOut();
    });
});

function hideMega() {
    $(".mega").toggle();
}

function loadData(poke, types1, types2, stats) {
    var pokeRaw = poke.split("||");
    
    poke = toRawObject(poke);
    types1 = toRawObject(types1);
    types2 = toRawObject(types2);
    stats = toRawObject(stats);
    
    var size = pokeRaw.length, pkmn, t1, t2, bst,  e;
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
    
    buildPicker();
}
function buildPicker(){
    var holder = $('#pokePicker'), out = "", data, title;
    for (var e in pokemon) {
        data = pokemon[e];
        title = "#" + data.icon + " " + data.name + " | " + data.types.join("/") + " | BST " + data.bst;
        out+="<img class='pickerIcon"+(data.mega ? " mega" : "")+"' pokeid='"+e+"' src='icons/" + data.icon + ".png' title='" + title + "'>";
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
                } else {
                    theme.exclude.push(num);
                    $(this).addClass("excluded");
                }
                updateExcluded();
            break;
            case 2:
                setForCustomBST(id);
            break;
            case 1:
                if (theme.include.indexOf(num) !== -1) {
                    theme.include.splice(theme.include.indexOf(num), 1);
                } else {
                    theme.include.push(num);
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
        var sele = "<div class='custombst' key='" + id + "'>" + data.name + ": <input type='number' class='bstInput' key='" + id + "' value='" + bst + "' ></div>";
        
        $("#customBST").append(sele);
        $(".pickerIcon[pokeid="+id+"]").addClass("customized");
        
        $(".bstInput[key=" + id + "]").on("input", function(e) {
            var val = parseInt($(this).val(), 10);
            if (!isNaN(val)) {
                theme.customBST[data.index] = val;
                markPokemon(id);
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
}
function markPokemon(pokeId) {
    var icon = $(".pickerIcon[pokeid=" + pokeId + "]");
    if (validForTheme(pokeId)) {
        if (!icon.hasClass("included")) {
            icon.addClass("included");
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
    
    if (data.bst >= theme.maxBST && !(data.index in theme.customBST && theme.customBST[data.index] < theme.maxBST)) {
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
function toPokeName(num) {
    var id = species(num) + "-" + forme(num);
    return pokemon[id].name;
}

function updateIncluded() {
    $("#includedPoke").html(theme.include.map(toPokeName).join(", "));  
}
function updateExcluded() {
    $("#excludedPoke").html(theme.exclude.map(toPokeName).join(", "));
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
    checkAll();
    
    //Update UI
    $("#themeName").val(theme.name);
    $("#themeIcon").val(theme.icon);
    $("#minbst").val(theme.minBST);
    $("#maxbst").val(theme.maxBST);
    updateIncluded();
    updateExcluded();
    
    var boxes = $("input[type=checkbox][name=include]"), obj, type;
    boxes.each(function(i){
        obj = $(this);
        obj.prop("checked", false);
        type = obj.val();
        if (theme.types.indexOf(type) !== -1) {
            obj.prop("checked", true);
        }
    });
    boxes = $("input[type=checkbox][name=exclude]");
    boxes.each(function(i){
        obj = $(this);
        obj.prop("checked", false);
        type = obj.val();
        if (theme.excludeTypes.indexOf(type) !== -1) {
            obj.prop("checked", true);
        }
    });
    
    $(".pickerIcon.customized").removeClass("customized");
    $("#customBST").empty();
    var e, num;
    for (e in theme.customBST) {
        num = parseInt(e, 10);
        var id = species(num) + "-" + forme(num);
        setForCustomBST(id, theme.customBST[e]);
    }
}
function exportTheme() {
    $("#outputOverlay").toggle();
    $("#outputThemeField").val(JSON.stringify(theme));
}