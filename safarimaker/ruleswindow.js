var generationList = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos"];
function createRulesUI () {
    var home = $("#homePanel");
    home.addClass("topMargin");
    createInputSlider("Inverted Type Effectiveness", "inver", home, true, "Set a chance for Inverted Type Effectiveness (Fire strong against Water, etc)");
    createInputSlider("Inverted BST Effectiveness", "invertedBST", home, true, "Set a chance for Inverted BST Effectiveness (Lower BST = Better)");
    createInputSlider("Resistance Mode", "defensive", home, true, "Set a chance for Resistance Mode (Catch bonus by resistance against Wild Pokémon)");
    createInputSlider("Nerfed Legendaries", "noLegendaries", home, true, "Set a chance for nerfed Legendaries if used as active");
    
    createBuffNerfSlider("Shiny", "shiny", home, "Set a chance for buffed/nerfed Shiny if used as active");
    createBuffNerfSlider("Single-type", "singleType", home, "Set a chance for buffed/nerfed Single-type Pokémon if used as active");
    createBuffNerfSlider("Dual-type", "dualType", home, "Set a chance for buffed/nerfed Dual-type Pokémon if used as active");
    
    var generationPanel = $("<div class='panel panel-default'></div>");
    var generationHeader = $("<div class='panel-heading'><label>Generation</label> </div>");
    var check = $('<label><input type="checkbox" id="defaultGeneration" name="defaultGeneration" value="Default"> Use default settings </label> ');
    check.children("input[type=checkbox]").change(function(event) {
        var obj = $(this);
        var par = obj.parent().parent().parent();
        if (obj.prop("checked")) {
            par.find(".ruleSlider").slider("disable");
            par.find(".sliderInput").prop("disabled", true);
        } else {
            par.find(".ruleSlider").slider("enable");
            par.find(".sliderInput").prop("disabled", false);
        }
    });
    // var show = $("<span> </span> <a data-toggle='collapse' href='#generationPanel'><span class='glyphicon glyphicon-chevron-down'></span>Show/Hide</a> ");
    var show = $("<span> </span> <a data-toggle='collapse' href='#generationPanel'>Show/Hide</a> ");
    
    var generationContent = $("<div class='panel-body panel-collapse collapse' id='generationPanel'></div>");
    generationPanel.append(generationHeader);
    generationHeader.append(check);
    generationHeader.append(show);
    home.append(generationPanel);
    generationPanel.append(generationContent);
    for (var e = 0; e < generationList.length; e++) {
        createBuffNerfSlider(generationList[e] + " Pokémon", "generation" + generationList[e], generationContent, "Set a chance for buffed/nerfed " + generationList[e] + " Pokémon if used as active", true);
    }
    
    var bstPanels = $("<div class='panel panel-default topMargin'></div>");
    home.append(bstPanels);
    
    var header = $('<div class="panel-heading"></div>');
    var body = $('<div class="panel-body"></div>');
    
    bstPanels.append(header);
    bstPanels.append(body);
    
    check = $('<label><input type="checkbox" id="defaultBST" name="defaultBST" value="Default"> Use default BST settings</label>');
    header.append(check);
    
    var row = $("<div class='row'></div>");
    body.append(row);
    
    var col1 = $("<div class='col-md-6 '></div>");
    row.append(col1);
    
    var col2 = $("<div class='col-md-6'></div>");
    row.append(col2);
    
    createBstPanel("Minimum BST", "minBST", col1, [230, 400], "A random value will be picked based on this range. Pokémon with BST below the value picked will be nerfed.");
    createBstPanel("Maximum BST", "maxBST", col2, [430, 531], "A random value will be picked based on this range. Pokémon with BST above the value picked will be nerfed.");
    
    check.children("input[type=checkbox]").change(function(event) {
        var obj = $(this);
        var par = obj.parent().parent().parent();
        if (obj.prop("checked")) {
            par.find(".ruleSlider").slider("disable");
            par.find(".sliderInput").prop("disabled", true);
            par.find(".dualSliderInput").prop("disabled", true);
            par.find(".dualSlider").slider("disable");
        } else {
            par.find(".ruleSlider").slider("enable");
            par.find(".sliderInput").prop("disabled", false);
            par.find(".dualSliderInput").prop("disabled", false);
            par.find(".dualSlider").slider("enable");
        }
    });
    
    createSliderPage($("#nerfTypesPanel"));
    createSliderPage($("#buffTypesPanel"));
    createSliderPage($("#forbiddenBallsPanel"));
    
    createSetsPage($("#onlyTypesPanel"), "Creates a set of allowed types. If a set is picked, all types not in that set get nerfed");
    createSetsPage($("#onlyBallsPanel"), "Creates a set of allowed balls. If a set is picked, only those balls will be allowed");
    
    createRewardsPage($("#rewardsPanel"));
}

function createSliderPage(core) {
    var id = core.prop("id");
    core.find("input").change(function(event) {
        var obj = $(this);
        if (obj.prop("checked")) {
            $("#" + id).find(".panelContent").hide();
        } else {
            $("#" + id).find(".panelContent").show();
        }
    });
    
    var list = (core.attr("list") == "balls" ? balls : types).concat();
    if (list.indexOf("???") !== -1) {
        list.splice(list.indexOf("???"), 1);
    }

    var e, obj = $("#" + id + " .row .col-md-6"), container, t;
    for (e = 0; e < list.length; e++) {
        t = list[e];
        if (e < list.length / 2) {
            container = $(obj.get(0));
        } else {
            container = $(obj.get(1));
        }
        createInputSlider(t, t, container);
    }
}
function createSetsPage(core, hint) {
    var id = core.prop("id");
    core.find("input").change(function(event) {
        var obj = $(this);
        if (obj.prop("checked")) {
            $("#" + id).find(".panelContent").hide();
        } else {
            $("#" + id).find(".panelContent").show();
        }
    });
    
    var list, label;
    switch (core.attr("list")) {
        case "balls":
            list = balls.concat();
            label = "Ball";
        break;
        case "items":
            list = items.concat();
            label = "Item";
        break;
        case "types":
            list = types.concat();
            label = "Type";
        break;
        default:
            list = types.concat();
            label = "Type";
    }

    if (list.indexOf("???") !== -1) {
        list.splice(list.indexOf("???"), 1);
    }
    
    var container = core.children(".panelContent");
    createInputSlider("Chance", id + "Chance", container);
    
    createListMaker(container, list, label, hint);
}
function createRewardsPage(core) {
    var id = core.prop("id");
    core.find("input").change(function(event) {
        var obj = $(this);
        if (obj.prop("checked")) {
            $("#" + id).find(".panelContent").hide();
        } else {
            $("#" + id).find(".panelContent").show();
        }
    });
    
    var list, label;
    switch (core.attr("list")) {
        case "balls":
            list = balls.concat();
            label = "Ball";
        break;
        case "items":
            list = items.concat();
            label = "Item";
        break;
        case "types":
            list = types.concat();
            label = "Type";
        break;
        default:
            list = types.concat();
            label = "Type";
    }

    if (list.indexOf("???") !== -1) {
        list.splice(list.indexOf("???"), 1);
    }
    
    var container = core.children(".panelContent");
    
    createSetMaker(container, list, label);
}
function createListMaker(container, list, label, hint) {
    var addButton = $('<br/><input type="button" class="btn btn-success newSetButton" name="addList" value="Add set" />');
    container.append(addButton);
    if (hint) {
        container.append(tip(hint));
    }
    
    var listHolder = $("<div class='listHolder'></div>");
    container.append(listHolder);
    
    addButton.click(function(event){
        addList(listHolder, list, label);
    });
}
function createSetMaker(container, list, label) {
    var addButton = $('<input type="button" class="btn btn-success newSetButton" name="addList" value="Add set" />');
    container.append(addButton);
    container.append(tip("Create a set of rewards for the contest's winner. 'Chance' is relative to other sets (e.g.: If a set has chance 1 and other has chance 3, then their actual chances are 25% and 75%)"));
    
    var listHolder = $("<div class='listHolder container-fluid'></div>");
    container.append(listHolder);
    
    addButton.click(function(event){
        addSet(listHolder, list, label);
    });
}
function addList(listHolder, list, label, content) {
    //TODO: Set List's index
    var obj = $("<div class='well well-sm setList'></div>");
    listHolder.append(obj);
    
    var removeButton = $('<button type="button" class="btn btn-danger btn-sm"><span class="glyphicon glyphicon-remove"></span> </button>');
    obj.append(removeButton);
    removeButton.click(function(evt) {
        obj.remove();
    });
    
    var selector = $(' <div class="btn-group listOptions"><button type="button" class="btn btn-info btn-sm dropdown-toggle" data-toggle="dropdown">Add ' + label + ' <span class="caret"></span></button><ul class="dropdown-menu multi-column columns-2" role="menu"></ul></div>');
    obj.append(selector);
    selector.popover();
        
    var dropdown = selector.find(".multi-column");
    var dropRow = $("<div class='row'></div>");
    dropdown.append(dropRow);
    dropRow.append("<div class='col-sm-6'><ul class='multi-column-dropdown'></ul></div>");
    dropRow.append("<div class='col-sm-6'><ul class='multi-column-dropdown'></ul></div>");
    
    
    var itemsHolder = $("<div class='itemHolder labelHolder'></div>");
    obj.append(itemsHolder);
    
    var addItem = function(obj, elem) {
        var item = $("<span class='label label-success removableLabel' value='" + elem + "'>" + elem + "</span>");
        itemsHolder.append(item);
        
        item.click(function(evt){
            var it = $(this);
            it.remove();
            obj.removeClass("disabled");
        });
    };
    var clickItem = function(event) {
        var obj = $(this);
        if (obj.is(".disabled")) {
            event.preventDefault();
            return;
        }
        obj.addClass("disabled");
        var elem = obj.find("a").attr("ref");
        
        addItem(obj, elem);
    };
    
    var ul = selector.find("ul.multi-column-dropdown"), li;
    for (var e = 0; e < list.length; e++) {
        li = $("<li><a href='#' ref='" + list[e] + "'>" + list[e] + "</a></li>");
        $(ul.get(e%2)).append(li);
        li.click(clickItem);
    }
    
    if (content) {
        var t, l;
        for (e = 0; e < content.length; e++) {
            t = content[e];
            if (list.indexOf(t) !== -1) {
                l = ul.find("a[ref=" + t + "]").parent();
                l.addClass("disabled");
                addItem(l, t);
            }
        }
    }
}
function addSet(listHolder, list, label, content, chance) {
    var obj = $("<div class='well well-sm row setList'></div>");
    listHolder.append(obj);
    
    var col1 = $("<div class='col-md-2 tightCol'></div>");
    obj.append(col1);
    
    var removeButton = $('<button type="button" class="btn btn-danger btn-sm"><span class="glyphicon glyphicon-remove"></span> </button>');
    col1.append(removeButton);
    removeButton.click(function(evt) {
        obj.remove();
    });
    
    // var selector = $(' <div class="btn-group listOptions"><button type="button" class="btn btn-info btn-sm dropdown-toggle" data-toggle="dropdown">Add ' + label + ' <span class="caret"></span></button><ul class="dropdown-menu multi-column-dropdown" role="menu"><li><ul class="col-sm-3"></ul><ul class="col-sm-3"></ul><ul class="col-sm-3"></ul><ul class="col-sm-3"></ul></li></ul></div>');
    var selector = $(' <div class="btn-group listOptions"><button type="button" class="btn btn-info btn-sm dropdown-toggle" data-toggle="dropdown">Add ' + label + ' <span class="caret"></span></button><ul class="dropdown-menu multi-column columns-4" role="menu"></ul></div>');
    col1.append(selector);
    selector.popover();
        
    var dropdown = selector.find(".multi-column");
    var dropRow = $("<div class='row'></div>");
    dropdown.append(dropRow);
    dropRow.append("<div class='col-sm-3'><ul class='multi-column-dropdown'></ul></div>");
    dropRow.append("<div class='col-sm-3'><ul class='multi-column-dropdown'></ul></div>");
    dropRow.append("<div class='col-sm-3'><ul class='multi-column-dropdown'></ul></div>");
    dropRow.append("<div class='col-sm-3'><ul class='multi-column-dropdown'></ul></div>");
    
    var col2 = $("<div class='col-md-4 tightCol'></div>");
    obj.append(col2);
    
    var itemsHolder = $("<div class='itemHolder'></div>");
    col2.append(itemsHolder);
    
    var col3 = $("<div class='col-md-6 tightCol'></div>");
    obj.append(col3);
    var chanceSlider = createInputSlider("Chance", "chance", col3);
    chanceSlider.addClass("pull-right");
    chanceSlider.removeClass("slidersTabForms");
    
    var addItem = function(obj, elem, amt) {
        var item = $("<div class='itemAmount form-group' ><label value='" + elem + "'>" + elem + ":</label> <input type='number' class='amtInput form-control' value='" + amt + "' ></div>");
        itemsHolder.append(item);
    };
    var clickItem = function(event) {
        var obj = $(this);
        if (obj.is(".disabled")) {
            event.preventDefault();
            return;
        }
        obj.addClass("disabled");
        var elem = obj.find("a").attr("ref");
        
        addItem(obj, elem, 1);
    };
    
    var ul = selector.find("ul.multi-column-dropdown"), li;
    for (var e = 0; e < list.length; e++) {
        li = $("<li><a href='#' ref='" + list[e] + "'>" + list[e] + "</a></li>");
        $(ul.get(e%4)).append(li);
        li.click(clickItem);
    }
    
    if (content) {
        var t, l;
        for (e in content) {
            t = e;
            if (list.indexOf(t) !== -1) {
                l = ul.find("a[ref=" + t + "]").parent();
                l.addClass("disabled");
                addItem(l, t, content[e]);
            }
        }
        chanceSlider.find(".ruleSlider").slider("setValue", chance * 100, true, true);
    }
}
function createInputSlider(label, id, container, disabler, hint) {
    var obj = $("<div class='form-inline slidersTabForms'></div>");
    obj.appendTo(container);
    
    obj.append("<span class='sliderLabel'>" + label + "</span> ");
    if (hint) {
        obj.append(tip(hint));
    }
    
    var holder = $("<div class='slider-set'></div>");
    obj.append(holder);
    holder.append("<input type='text' class='span2 ruleSlider' ref='" + id + "' value='' data-slider-min='0' data-slider-max='100' data-slider-step='0.1' data-slider-value='0'/> ");
    holder.append("<input class='form-control sliderInput' type='number' value='0' ref='" + id + "' min='0' max='100'> ");
    
    if (disabler) {
        var check = $('<label><input type="checkbox" id="default'+id+'" name="default'+id+'" value="Default"> Use default settings</label>');
        obj.append(check);
        check.children("input[type=checkbox]").change(function(event) {
            var obj = $(this);
            var par = holder;
            if (obj.prop("checked")) {
                par.find(".ruleSlider").slider("disable");
                par.find(".sliderInput").prop("disabled", true);
            } else {
                par.find(".ruleSlider").slider("enable");
                par.find(".sliderInput").prop("disabled", false);
            }
        });
    }
    
    obj.find(".ruleSlider").slider({
        tooltip: "hide"
    });
    obj.find(".ruleSlider").change(function(slideEvt) {
        var obj = $(this);
        var type = obj.attr("ref");
        obj.siblings(".sliderInput[ref=" + type + "]").val(slideEvt.value.newValue);
    });
    obj.find(".sliderInput").on("input", function(event) {
        var obj = $(this);
        var val = parseInt(obj.val(), 10);
        if (!isNaN(val)) {
            var type = obj.attr("ref");
            obj.siblings(".ruleSlider[ref=" + type + "]").slider("setValue", val);
        }
    });
    return obj;
}
function createBuffNerfSlider(label, id, container, hint, noDefaulter) {
    var obj = $("<div class='form-inline slidersTabForms well well-sm'></div>");
    obj.appendTo(container);
    
    obj.append("<span class='buffNerfLabel'>" + label + "</span> ");
    
    if (hint) {
        obj.append(tip(hint));
    }
    
    if (!noDefaulter) {
        var check = $(' <label><input type="checkbox" id="default'+id+'" name="default'+id+'" value="Default"> Use default settings</label>');
        obj.append(check);
        check.children("input[type=checkbox]").change(function(event) {
            var obj = $(this);
            var par = obj.parent().parent();
            if (obj.prop("checked")) {
                par.find(".ruleSlider").slider("disable");
                par.find(".sliderInput").prop("disabled", true);
            } else {
                par.find(".ruleSlider").slider("enable");
                par.find(".sliderInput").prop("disabled", false);
            }
        });
    }
    obj.append("<br>");
    var slider1 = createInputSlider("Buff", id + "Buff", obj);
    var slider2 = createInputSlider("Nerf", id + "Nerf", obj);
    
    slider1.addClass("inlineSlider");
    slider2.addClass("inlineSlider");
    
    return obj;
}
function createDualSlider(container, label, id, range, tipPos) {
    var dualGroup = $('<div class="form-group dualInput-set"><input id="'+id+'Lower" ref="lower" class="form-control dualSliderInput" type="number" value="'+range[0]+'" min="100" max="999"><div class="panel-inline"></div><input id="'+id+'Upper" ref="upper" class="form-control dualSliderInput" type="number" value="'+range[1]+'" min="100" max="999"></div>');
    container.append(dualGroup);
    
    var dualSlider = $('<input type="text" class="span2 dualSlider" ref="' + id + '" value="" data-slider-min="100" data-slider-max="999" data-slider-step="1" data-slider-value="['+range[0]+','+range[1]+']"/>');
    dualGroup.find(".panel-inline").append(dualSlider);
    dualSlider.slider({
        tooltip_position: tipPos || null
    });
    
    dualSlider.change(function(slideEvt) {
        var obj = $(this);
        var val = slideEvt.value;
        var fields = obj.parent().parent().find(".dualSliderInput");
        
        $(fields.get(0)).val(val.newValue[0]);
        $(fields.get(1)).val(val.newValue[1]);
    });
    dualGroup.find(".dualSliderInput").on("input", function(event) {
        var obj = $(this);
        var val = parseInt(obj.val(), 10);
        if (!isNaN(val)) {
            var type = obj.attr("ref");
            
            var sliderVal;
            if (type == "lower") {
                sliderVal = [val, dualSlider.slider("getValue")[1]];
            } else {
                sliderVal = [dualSlider.slider("getValue")[0], val];
            }
            
            dualSlider.slider("setValue", sliderVal);
        }
    });
    return dualGroup;
}
function createBstPanel(label, id, container, startingRange, hint) {
    container.append("<label>" + label + " Range</label>");
    container.append(tip(hint));
    var dualGroup = createDualSlider(container, label, id, startingRange, "bottom");
    
    var chanceSlider = createInputSlider("Chance", "chance" + cap(id), container);
    chanceSlider.addClass("bstSlider");
}

function showRules() {
    if ($(".rulesRadio[value=custom]").prop("checked")) {
        $("#customRules").show();
    } else {
        $("#customRules").hide();
    }
}

function loadRules(rules) {
    var obj, e, t, holder, val, g, n;
    var setCustom = true;
    if (!rules) {
        obj = $(".rulesRadio[value=default]");
        obj.prop("checked", true);
        obj.trigger("change");
        $(".rulesRadio[value=custom]").prop("checked", false);
        $(".rulesRadio[value=none]").prop("checked", false);
        // return;
        rules = {};
        setCustom = false;
    } else if (Object.keys(rules).length === 0) {
        $(".rulesRadio[value=default]").prop("checked", false);
        $(".rulesRadio[value=custom]").prop("checked", false);
        obj = $(".rulesRadio[value=none]");
        obj.prop("checked", true);
        obj.trigger("change");
        // return;
        rules = {};
        setCustom = false;
    }
    
    obj = $(".rulesRadio[value=custom]");
    if (setCustom) {
        obj.prop("checked", true);
        obj.trigger("change");
    }
    
    if ("noLegendaries" in rules) {
        obj = $("#defaultnoLegendaries");
        obj.prop("checked", rules.noLegendaries === "default");
        obj.trigger("change");
        
        if (rules.noLegendaries !== "default") {
            $(".ruleSlider[ref=noLegendaries]").slider("setValue", rules.noLegendaries.chance * 100, true, true);
        }
    } else {
        obj = $("#defaultnoLegendaries");
        obj.prop("checked", false);
        obj.trigger("change");
        $(".ruleSlider[ref=noLegendaries]").slider("setValue", 0, true, true);
    }
    if ("inver" in rules) {
        obj = $("#defaultinver");
        obj.prop("checked", rules.inver === "default");
        obj.trigger("change");
        
        if (rules.inver !== "default") {
            $(".ruleSlider[ref=inver]").slider("setValue", rules.inver.chance * 100, true, true);
        }
    } else {
        obj = $("#defaultinver");
        obj.prop("checked", false);
        obj.trigger("change");
        $(".ruleSlider[ref=inver]").slider("setValue", 0, true, true);
    }
    if ("invertedBST" in rules) {
        obj = $("#defaultinvertedBST");
        obj.prop("checked", rules.invertedBST === "default");
        obj.trigger("change");
        
        if (rules.invertedBST !== "default") {
            $(".ruleSlider[ref=invertedBST]").slider("setValue", rules.invertedBST.chance * 100, true, true);
        }
    } else {
        obj = $("#defaultinvertedBST");
        obj.prop("checked", false);
        obj.trigger("change");
        $(".ruleSlider[ref=invertedBST]").slider("setValue", 0, true, true);
    }
    if ("defensive" in rules) {
        obj = $("#defaultdefensive");
        obj.prop("checked", rules.defensive === "default");
        obj.trigger("change");
        
        if (rules.defensive !== "default") {
            $(".ruleSlider[ref=defensive]").slider("setValue", rules.defensive.chance * 100, true, true);
        }
    } else {
        obj = $("#defaultdefensive");
        obj.prop("checked", false);
        obj.trigger("change");
        $(".ruleSlider[ref=defensive]").slider("setValue", 0, true, true);
    }
    if ("excludeTypes" in rules) {
        obj = $("#defaultNerfs");
        obj.prop("checked", rules.excludeTypes === "default");
        obj.trigger("change");
        
        if (rules.excludeTypes !== "default") {
            holder = $("#customNerfsPanel");
            for (e = 0; e < types.length; e++) {
                t = types[e];
                if (t == "???") {
                    continue;
                }
                holder.find(".ruleSlider[ref=" + t + "]").slider("setValue", (t in rules.excludeTypes ? rules.excludeTypes[t] * 100 : 0), true, true);
            }
        }
    } else {
        obj = $("#defaultNerfs");
        obj.prop("checked", false);
        obj.trigger("change");
        holder = $("#customNerfsPanel");
        for (e = 0; e < types.length; e++) {
            t = types[e];
            if (t == "???") {
                continue;
            }
            holder.find(".ruleSlider[ref=" + t + "]").slider("setValue", 0, true, true);
        }
    }
    if ("bonusTypes" in rules) {
        obj = $("#defaultBuffs");
        obj.prop("checked", rules.bonusTypes === "default");
        obj.trigger("change");
        
        if (rules.bonusTypes !== "default") {
            holder = $("#customBuffsPanel");
            for (e = 0; e < types.length; e++) {
                t = types[e];
                if (t == "???") {
                    continue;
                }
                holder.find(".ruleSlider[ref=" + t + "]").slider("setValue", (t in rules.bonusTypes ? rules.bonusTypes[t] * 100 : 0), true, true);
            }
        }
    } else {
        obj = $("#defaultBuffs");
        obj.prop("checked", false);
        obj.trigger("change");
        holder = $("#customBuffsPanel");
        for (e = 0; e < types.length; e++) {
            t = types[e];
            if (t == "???") {
                continue;
            }
            holder.find(".ruleSlider[ref=" + t + "]").slider("setValue", 0, true, true);
        }
    }
    if ("excludeBalls" in rules) {
        obj = $("#defaultBalls");
        obj.prop("checked", rules.excludeBalls === "default");
        obj.trigger("change");
        
        if (rules.excludeBalls !== "default") {
            holder = $("#forbiddenBallsPanel");
            for (e = 0; e < balls.length; e++) {
                t = balls[e];
                if (t == "???") {
                    continue;
                }
                holder.find(".ruleSlider[ref=" + t + "]").slider("setValue", (t in rules.excludeBalls ? rules.excludeBalls[t] * 100 : 0), true, true);
            }
        }
    } else {
        obj = $("#defaultBalls");
        obj.prop("checked", false);
        obj.trigger("change");
        holder = $("#forbiddenBallsPanel");
        for (e = 0; e < balls.length; e++) {
            t = balls[e];
            if (t == "???") {
                continue;
            }
            holder.find(".ruleSlider[ref=" + t + "]").slider("setValue", 0, true, true);
        }
    }
    if ("generation" in rules) {
        obj = $("#defaultGeneration");
        obj.prop("checked", rules.generation === "default");
        obj.trigger("change");
        
        if (rules.generation !== "default") {
            var nl, gen;
            for (g = 0; g < generationList.length; g++) {
                n = generationList[g];
                nl = n.toLowerCase();
                if (nl in rules.generation) {
                    gen = rules.generation[nl];
                    val = gen.buff || 0;
                    $(".ruleSlider[ref=generation" + n + "Buff]").slider("setValue", val * 100, true, true);
                    
                    val = gen.nerf || 0;
                    $(".ruleSlider[ref=generation" + n + "Nerf]").slider("setValue", val * 100, true, true);
                }
            }
        }
    } else {
        obj = $("#defaultGeneration");
        obj.prop("checked", false);
        obj.trigger("change");
        
        for (g = 0; g < generationList.length; g++) {
            $(".ruleSlider[ref=generation" + generationList[g] + "Buff]").slider("setValue", 0, true, true);
            $(".ruleSlider[ref=generation" + generationList[g] + "Nerf]").slider("setValue", 0, true, true);
        }
    }
    
    if ("shiny" in rules) {
        obj = $("#defaultshiny");
        obj.prop("checked", rules.shiny === "default");
        obj.trigger("change");
        
        if (rules.shiny !== "default") {
            val = rules.shiny.nerf || 0;
            $(".ruleSlider[ref=shinyNerf]").slider("setValue", val * 100, true, true);
            
            val = rules.shiny.buff || 0;
            $(".ruleSlider[ref=shinyBuff]").slider("setValue", val * 100, true, true);
        }
    } else {
        obj = $("#defaultshiny");
        obj.prop("checked", false);
        obj.trigger("change");
        $(".ruleSlider[ref=shinyNerf]").slider("setValue", 0, true, true);
        $(".ruleSlider[ref=shinyBuff]").slider("setValue", 0, true, true);
    }
    if ("singleType" in rules) {
        obj = $("#defaultsingleType");
        obj.prop("checked", rules.singleType === "default");
        obj.trigger("change");
        
        if (rules.singleType !== "default") {
            val = rules.singleType.nerf || 0;
            $(".ruleSlider[ref=singleTypeNerf]").slider("setValue", val * 100, true, true);
            
            val = rules.singleType.buff || 0;
            $(".ruleSlider[ref=singleTypeBuff]").slider("setValue", val * 100, true, true);
        }
    } else {
        obj = $("#defaultsingleType");
        obj.prop("checked", false);
        obj.trigger("change");
        $(".ruleSlider[ref=singleTypeNerf]").slider("setValue", 0, true, true);
        $(".ruleSlider[ref=singleTypeBuff]").slider("setValue", 0, true, true);
    }
    if ("dualType" in rules) {
        obj = $("#defaultdualType");
        obj.prop("checked", rules.dualType === "default");
        obj.trigger("change");
        
        if (rules.dualType !== "default") {
            val = rules.dualType.nerf || 0;
            $(".ruleSlider[ref=dualTypeNerf]").slider("setValue", val * 100, true, true);
            
            val = rules.dualType.buff || 0;
            $(".ruleSlider[ref=dualTypeBuff]").slider("setValue", val * 100, true, true);
        }
    } else {
        obj = $("#defaultdualType");
        obj.prop("checked", false);
        obj.trigger("change");
        $(".ruleSlider[ref=dualTypeNerf]").slider("setValue", 0, true, true);
        $(".ruleSlider[ref=dualTypeBuff]").slider("setValue", 0, true, true);
    }
    
    if ("onlyTypes" in rules) {
        obj = $("#defaultOnlyTypes");
        obj.prop("checked", rules.onlyTypes === "default");
        obj.trigger("change");
        
        if (rules.onlyTypes !== "default") {
            $(".ruleSlider[ref=onlyTypesPanelChance]").slider("setValue", rules.onlyTypes.chance * 100, true, true);
            
            holder = $("#customOnlyTypesPanel").find(".listHolder");
            holder.find(".setList").remove();
            
            for (e = 0; e < rules.onlyTypes.sets.length; e++) {
                addList(holder, types, "type", rules.onlyTypes.sets[e]);
            }
        }
    } else {
        obj = $("#defaultOnlyTypes");
        obj.prop("checked", false);
        obj.trigger("change");
        $(".ruleSlider[ref=onlyTypesPanelChance]").slider("setValue", 0, true, true);
        holder = $("#customOnlyTypesPanel").find(".listHolder");
        holder.find(".setList").remove();
    }
    if ("onlyBalls" in rules) {
        obj = $("#defaultOnlyBalls");
        obj.prop("checked", rules.onlyBalls === "default");
        obj.trigger("change");
        
        if (rules.onlyBalls !== "default") {
            $(".ruleSlider[ref=onlyBallsPanelChance]").slider("setValue", rules.onlyBalls.chance * 100, true, true);
            
            holder = $("#customOnlyBallsPanel").find(".listHolder");
            holder.find(".setList").remove();
            
            for (e = 0; e < rules.onlyBalls.sets.length; e++) {
                addList(holder, balls, "ball", rules.onlyBalls.sets[e]);
            }
        }
    } else {
        obj = $("#defaultOnlyBalls");
        obj.prop("checked", false);
        obj.trigger("change");
        $(".ruleSlider[ref=onlyBallsPanelChance]").slider("setValue", 0, true, true);
        holder = $("#customOnlyBallsPanel").find(".listHolder");
        holder.find(".setList").remove();
    }
    if ("rewards" in rules) {
        obj = $("#defaultRewards");
        obj.prop("checked", rules.rewards === "default");
        obj.trigger("change");
        
        if (rules.rewards !== "default") {
            
            holder = $("#customRewardsPanel").find(".listHolder");
            holder.find(".setList").remove();
            
            for (e in rules.rewards.sets) {
                // addList(holder, balls, "ball", rules.onlyBalls.sets[e]);
                addSet(holder, items, "item", rules.rewards.sets[e], rules.rewards.chance[e]);
            }
        }
    } else {
        obj = $("#defaultRewards");
        obj.prop("checked", false);
        obj.trigger("change");
        holder = $("#customRewardsPanel").find(".listHolder");
        holder.find(".setList").remove();
    }
}
function getRules() {
    var rules = {}, v, c, sets, setsMade, holder, tempObj;
    
    //Checks which set of rules to use
    var ruleRadios = $(".rulesRadio");
    if (ruleRadios.filter("[value=default]").prop("checked")) {
        return null;
    } else if (ruleRadios.filter("[value=none]").prop("checked")) {
        return rules;
    }
    
    //Inverted type settings
    if ($("#defaultinver").prop("checked")) {
        rules.inver = "default";
    } else {
        v = $(".ruleSlider[ref=inver]").slider("getValue");
        if (v > 0) {
            rules.inver = {
                chance: (v/100).toFixedNumber(2)
            };
        }
    }
    //Inverted BST settings
    if ($("#defaultinvertedBST").prop("checked")) {
        rules.invertedBST = "default";
    } else {
        v = $(".ruleSlider[ref=invertedBST]").slider("getValue");
        if (v > 0) {
            rules.invertedBST = {
                chance: (v/100).toFixedNumber(2)
            };
        }
    }
    //Defensive settings
    if ($("#defaultdefensive").prop("checked")) {
        rules.defensive = "default";
    } else {
        v = $(".ruleSlider[ref=defensive]").slider("getValue");
        if (v > 0) {
            rules.defensive = {
                chance: (v/100).toFixedNumber(2)
            };
        }
    }
    //No Legendaries settings
    if ($("#defaultnoLegendaries").prop("checked")) {
        rules.noLegendaries = "default";
    } else {
        v = $(".ruleSlider[ref=noLegendaries]").slider("getValue");
        if (v > 0) {
            rules.noLegendaries = {
                chance: (v/100).toFixedNumber(2)
            };
        }
    }
    //Buff/Nerf Shiny settings
    if ($("#defaultshiny").prop("checked")) {
        rules.shiny = "default";
    } else {
        v = $(".ruleSlider[ref=shinyNerf]").slider("getValue");
        if (v > 0) {
            if (!rules.shiny) {
                rules.shiny = {};
            }
            rules.shiny.nerf = (v/100).toFixedNumber(2);
        }
        v = $(".ruleSlider[ref=shinyBuff]").slider("getValue");
        if (v > 0) {
            if (!rules.shiny) {
                rules.shiny = {};
            }
            rules.shiny.buff = (v/100).toFixedNumber(2);
        }
    }
    //Buff/Nerf Single-type settings
    if ($("#defaultsingleType").prop("checked")) {
        rules.singleType = "default";
    } else {
        v = $(".ruleSlider[ref=singleTypeNerf]").slider("getValue");
        if (v > 0) {
            if (!rules.singleType) {
                rules.singleType = {};
            }
            rules.singleType.nerf = (v/100).toFixedNumber(2);
        }
        v = $(".ruleSlider[ref=singleTypeBuff]").slider("getValue");
        if (v > 0) {
            if (!rules.singleType) {
                rules.singleType = {};
            }
            rules.singleType.buff = (v/100).toFixedNumber(2);
        }
    }
    //Buff/Nerf Dual-type settings
    if ($("#defaultdualType").prop("checked")) {
        rules.dualType = "default";
    } else {
        v = $(".ruleSlider[ref=dualTypeNerf]").slider("getValue");
        if (v > 0) {
            if (!rules.dualType) {
                rules.dualType = {};
            }
            rules.dualType.nerf = (v/100).toFixedNumber(2);
        }
        v = $(".ruleSlider[ref=dualTypeBuff]").slider("getValue");
        if (v > 0) {
            if (!rules.dualType) {
                rules.dualType = {};
            }
            rules.dualType.buff = (v/100).toFixedNumber(2);
        }
    }
    //Generation settings
    if ($("#defaultGeneration").prop("checked")) {
        rules.generation = "default";
    } else {
        var gen = {}, n, ln;
        
        for (var g = 0; g < generationList.length; g++) {
            n = generationList[g];
            ln = n.toLowerCase();
            c = $(".ruleSlider[ref=generation" + n + "Buff]").slider("getValue");
            if (c > 0) {
                if (!gen[ln]) {
                    gen[ln] = {};
                }
                gen[ln].buff = (c/100).toFixedNumber(2);
            }
            c = $(".ruleSlider[ref=generation" + n + "Nerf]").slider("getValue");
            if (c > 0) {
                if (!gen[ln]) {
                    gen[ln] = {};
                }
                gen[ln].nerf = (c/100).toFixedNumber(2);
            }
        }
        
        for (g in gen) {
            rules.generation = gen;
            break;
        }
    }
    //BST settings
    if ($("#defaultBST").prop("checked")) {
        rules.bst = "default";
    } else {
        c = $(".ruleSlider[ref=chanceMinBST]").slider("getValue");
        if (c > 0) {
            v = $(".dualSlider[ref=minBST]").slider("getValue");
            if (!rules.bst) {
                rules.bst = {};
            }
            rules.bst.minChance = (c/100).toFixedNumber(2);
            rules.bst.min = v;
        }
        c = $(".ruleSlider[ref=chanceMaxBST]").slider("getValue");
        if (c > 0) {
            v = $(".dualSlider[ref=maxBST]").slider("getValue");
            if (!rules.bst) {
                rules.bst = {};
            }
            rules.bst.maxChance = (c/100).toFixedNumber(2);
            rules.bst.max = v;
        }
    }
    //Only Types settings
    if ($("#defaultOnlyTypes").prop("checked")) {
        rules.onlyTypes = "default";
    } else {
        c = $(".ruleSlider[ref=onlyTypesPanelChance]").slider("getValue");
        if (c > 0) {
            sets = [];
            setsMade = $("#onlyTypesPanel").find(".itemHolder");
            
            setsMade.each(function(i, obj) {
                var innerList = $(obj).find("span.removableLabel");
                var innerSet = [];
                innerList.each(function(e, ob) {
                    var innerValue = $(ob).attr("value");
                    if (innerSet.indexOf(innerValue) === -1) {
                        innerSet.push(innerValue);
                    }
                });
                if (innerSet.length > 0) {
                    sets.push(innerSet);
                }
            });
            
            if (sets.length > 0) {
                rules.onlyTypes = {
                    chance: (c/100).toFixedNumber(2),
                    sets: sets
                };
            }
        }
    }
    //Only Balls settings
    if ($("#defaultOnlyBalls").prop("checked")) {
        rules.onlyBalls = "default";
    } else {
        c = $(".ruleSlider[ref=onlyBallsPanelChance]").slider("getValue");
        if (c > 0) {
            sets = [];
            setsMade = $("#onlyBallsPanel").find(".itemHolder");
            
            setsMade.each(function(i, obj) {
                var innerList = $(obj).find("span.removableLabel");
                var innerSet = [];
                innerList.each(function(e, ob) {
                    var innerValue = $(ob).attr("value");
                    if (innerSet.indexOf(innerValue) === -1) {
                        innerSet.push(innerValue);
                    }
                });
                if (innerSet.length > 0) {
                    sets.push(innerSet);
                }
            });
            
            if (sets.length > 0) {
                rules.onlyBalls = {
                    chance: (c/100).toFixedNumber(2),
                    sets: sets
                };
            }
        }
    }
    //Nerf Types settings
    if ($("#defaultNerfs").prop("checked")) {
        rules.excludeTypes = "default";
    } else {
        holder = $("#customNerfsPanel").find(".ruleSlider");
        tempObj = {};
        
        holder.each(function(t, obj) {
            c = $(this);
            v = c.slider("getValue");
            if (v > 0) {
                var tp = c.attr("ref");
                tempObj[tp] = (v/100).toFixedNumber(2);
            }
        });
        
        if (Object.keys(tempObj).length > 0) {
            rules.excludeTypes = tempObj;
        }
    }
    //Buff Types settings
    if ($("#defaultBuffs").prop("checked")) {
        rules.bonusTypes = "default";
    } else {
        holder = $("#customBuffsPanel").find(".ruleSlider");
        tempObj = {};
        
        holder.each(function(t, obj) {
            c = $(this);
            v = c.slider("getValue");
            if (v > 0) {
                var tp = c.attr("ref");
                tempObj[tp] = (v/100).toFixedNumber(2);
            }
        });
        
        if (Object.keys(tempObj).length > 0) {
            rules.bonusTypes = tempObj;
        }
    }
    //Forbid Balls settings
    if ($("#defaultBalls").prop("checked")) {
        rules.excludeBalls = "default";
    } else {
        holder = $("#forbiddenBallsPanel").find(".ruleSlider");
        tempObj = {};
        
        holder.each(function(t, obj) {
            c = $(this);
            v = c.slider("getValue");
            if (v > 0) {
                var tp = c.attr("ref");
                tempObj[tp] = (v/100).toFixedNumber(2);
            }
        });
        
        if (Object.keys(tempObj).length > 0) {
            rules.excludeBalls = tempObj;
        }
    }
    //Rewards settings
    if ($("#defaultRewards").prop("checked")) {
        rules.rewards = "default";
    } else {
        holder = $("#customRewardsPanel").find(".setList");
        var setsObj = {};
        var chanceObj = {};
        var setCount = 1;
        
        holder.each(function(i, obj) {
            var elem = $(this);
            var c = elem.find(".ruleSlider").slider("getValue");
            
            if (c > 0) {
                var itemHolder = elem.find(".itemAmount");
                var thisSet = {};
                
                itemHolder.each(function(e, ob) {
                    var item = $(this);
                    var it = item.children("label").attr("value");
                    var amt = parseInt(item.children(".amtInput").prop("value"), 10);
                    if (!isNaN(amt) && amt > 0) {
                        thisSet[it] = amt;
                    }
                });
                if (Object.keys(thisSet).length > 0) {
                    setsObj["set" + setCount] = thisSet;
                    chanceObj["set" + setCount] = (c/100).toFixedNumber(2);
                    setCount++;
                }
            }
        });
        if (Object.keys(setsObj).length > 0) {
            rules.rewards = {
                sets: setsObj,
                chance: chanceObj
            };
        }
    }
    
    return rules;
}
function tip(msg) {
    return ' <span class="glyphicon glyphicon-question-sign ttip" data-toggle="tooltip" title="' + msg +'"></span>';
}