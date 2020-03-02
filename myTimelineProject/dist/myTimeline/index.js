"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var visTimeLine = require("vis/lib/timeline/Timeline");
var visDataSet = require("vis/lib/DataSet");
var moment = require("moment");
var RowRecordId = "rowRecId";
var myTimeline = /** @class */ (function () {
    /**
     * Empty constructor.
     */
    function myTimeline() {
        this.isRefresh = false;
    }
    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    myTimeline.prototype.init = function (context, notifyOutputChanged, state, container) {
        this.contextObj = context;
        this.currentRecord = this.getPageParameters();
        this._notifyOutputChanged = notifyOutputChanged;
        // Create main table container div. 
        this.mainContainer = document.createElement("div");
        // Create Timeline container
        this.visuContainer = document.createElement("div");
        this.visuContainer.setAttribute("id", "visualisation");
        this.mainContainer.appendChild(this.visuContainer);
        container.appendChild(this.mainContainer);
        this.isRefresh = true;
    };
    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    myTimeline.prototype.updateView = function (context) {
        if (this.isRefresh == true) {
            this.initAll();
        }
        else {
            this.createTimeline();
        }
    };
    myTimeline.prototype.initAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initConfiguration(this.currentRecord.etn)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.initActivities()];
                    case 2:
                        _a.sent();
                        this.createTimeline();
                        this.isRefresh = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    myTimeline.prototype.createTimeline = function () {
        var timeLineItems = new visDataSet([]);
        for (var _i = 0, _a = this.activities; _i < _a.length; _i++) {
            var currentActivity = _a[_i];
            var startdate = currentActivity[currentActivity.startDateField] != null ? new Date(currentActivity[currentActivity.startDateField]) : new Date();
            var enddate = currentActivity[currentActivity.endDateField] != null ? new Date(currentActivity[currentActivity.endDateField]) : new Date();
            var description = currentActivity[currentActivity.descriptionField] != null ? currentActivity[currentActivity.descriptionField] : "";
            var title = currentActivity[currentActivity.titleField] != null ? currentActivity[currentActivity.titleField] : "";
            var color = currentActivity.colorField != null ? currentActivity.colorField : "";
            var icon = this.getEntityIconUrl(currentActivity.entityNameField);
            var activityId = currentActivity[currentActivity.primaryKeyField];
            if (title != "" && title != null) {
                var iconType = "box";
                if (startdate == new Date() && enddate == new Date())
                    continue;
                if (startdate == new Date() && enddate != new Date()) {
                    startdate = enddate;
                    enddate = new Date();
                }
                if ((startdate != new Date() && enddate == new Date()) || startdate == enddate) {
                    iconType = "point";
                }
                var item = {
                    id: activityId,
                    content: title != "" && title != null ? "<img src='" + icon + "'> " + title : "<img src='" + icon + "'>" + "",
                    start: this.FormatDate(startdate),
                    end: (enddate != new Date()) ? this.FormatDate(enddate) : "",
                    type: iconType,
                    title: "<div id='tootlip'><h1>" + this.splitString(description, 80) + "</h1></div>",
                    style: "background-color: " + color + ";"
                };
                timeLineItems.add(item);
            }
        }
        // Configuration for the Timeline
        var options = {};
        debugger;
        // Create a Timeline
        if (!this.timeline) {
            this.timeline = new visTimeLine(this.visuContainer, timeLineItems, options);
            this.timeline.on("click", function (properties) {
                console.log("click:" + properties.item);
            });
            this.timeline.on("doubleClick", function (properties) {
                console.log("doubleClick:" + properties.item);
            });
        }
    };
    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    myTimeline.prototype.getOutputs = function () {
        return {};
    };
    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    myTimeline.prototype.destroy = function () {
        // Add code to cleanup control if necessary
    };
    myTimeline.prototype.FormatDate = function (d) {
        var dformat = [d.getMonth() + 1,
            d.getDate(),
            d.getFullYear()].join('/') + ' ' +
            [d.getHours(),
                d.getMinutes()].join(':');
        return dformat;
    };
    myTimeline.prototype.initActivities = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, currentConfiguration, startDateField, endDateField, descriptionField, entityNameField, regardingName, colorField, titleField, primaryKeyField, activityAux, _b, activityAux_1, activityTemp, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.activities = new Array();
                        _i = 0, _a = this.configurations;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        currentConfiguration = _a[_i];
                        startDateField = currentConfiguration["childConfig.myp_startdate"];
                        endDateField = currentConfiguration["childConfig.myp_enddate"];
                        descriptionField = currentConfiguration["childConfig.myp_descriptionfield"];
                        entityNameField = currentConfiguration["childConfig.myp_entityname"];
                        regardingName = currentConfiguration["childConfig.myp_regardingname"];
                        colorField = currentConfiguration["childConfig.myp_color"];
                        titleField = currentConfiguration["childConfig.myp_title"];
                        primaryKeyField = currentConfiguration["childConfig.myp_primarykey"];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.getActivity(startDateField, endDateField, descriptionField, entityNameField, regardingName, titleField)];
                    case 3:
                        activityAux = _c.sent();
                        activityAux = JSON.parse(JSON.stringify(activityAux));
                        for (_b = 0, activityAux_1 = activityAux; _b < activityAux_1.length; _b++) {
                            activityTemp = activityAux_1[_b];
                            activityTemp.startDateField = startDateField;
                            activityTemp.endDateField = endDateField;
                            activityTemp.descriptionField = descriptionField;
                            activityTemp.entityNameField = entityNameField;
                            activityTemp.regardingName = regardingName;
                            activityTemp.colorField = colorField;
                            activityTemp.titleField = titleField;
                            activityTemp.primaryKeyField = primaryKeyField;
                            this.activities.push(activityTemp);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _c.sent();
                        console.log("Error: " + error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    myTimeline.prototype.getActivity = function (startDateField, endDateField, descriptionField, entityName, regardingField, titleField) {
        return __awaiter(this, void 0, void 0, function () {
            var fetchData, fetchXml;
            return __generator(this, function (_a) {
                debugger;
                fetchData = {
                    regardingobjectid: this.currentRecord.id
                };
                fetchXml = [
                    "<fetch>",
                    "  <entity name='" + entityName + "'>",
                    "    <attribute name='" + startDateField + "' />",
                    "    <attribute name='" + endDateField + "' />",
                    "    <attribute name='" + descriptionField + "' />",
                    "    <attribute name='" + titleField + "' />",
                    "    <filter type='and'>",
                    "      <condition attribute='" + regardingField + "' operator='not-null' />", ,
                    "      <condition attribute='" + regardingField + "' operator='eq' value='", fetchData.regardingobjectid, "'/>",
                    "      <condition attribute='" + titleField + "' operator='not-null' />",
                    "    </filter>",
                    "  </entity>",
                    "</fetch>",
                ].join("");
                return [2 /*return*/, this.contextObj.webAPI.retrieveMultipleRecords(entityName, "?fetchXml=" + fetchXml).then(function success(results) {
                        return results.entities;
                    }, function (error) {
                        return error;
                    })];
            });
        });
    };
    myTimeline.prototype.initConfiguration = function (entityName) {
        return __awaiter(this, void 0, void 0, function () {
            var configurationsAux, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getConfiguration(entityName)];
                    case 1:
                        configurationsAux = _a.sent();
                        this.configurations = JSON.parse(JSON.stringify(configurationsAux));
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.log("Error: " + error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    myTimeline.prototype.getConfiguration = function (entityName) {
        return __awaiter(this, void 0, void 0, function () {
            var fetchData, fetchXml;
            return __generator(this, function (_a) {
                fetchData = {
                    myp_entityname: entityName
                };
                fetchXml = [
                    "<fetch>",
                    "  <entity name='myp_mytimelineconfiguration'>",
                    "    <filter type='and'>",
                    "      <condition attribute='myp_entityname' operator='eq' value='", fetchData.myp_entityname, "'/>",
                    "    </filter>",
                    "    <link-entity name='myp_myp_mytimelineconfiguration_myp_mytimel' from='myp_mytimelineconfigurationidone' to='myp_mytimelineconfigurationid' link-type='inner' intersect='true'>",
                    "      <link-entity name='myp_mytimelineconfiguration' from='myp_mytimelineconfigurationid' to='myp_mytimelineconfigurationidtwo' link-type='inner' alias='childConfig'>",
                    "        <attribute name='myp_color' />",
                    "        <attribute name='myp_startdate' />",
                    "        <attribute name='myp_title' />",
                    "        <attribute name='myp_regardingname' />",
                    "        <attribute name='myp_userprofileid' />",
                    "        <attribute name='myp_userid' />",
                    "        <attribute name='myp_invisibledisplayname' />",
                    "        <attribute name='myp_entityname' />",
                    "        <attribute name='myp_descriptionfield' />",
                    "        <attribute name='myp_primarykey' />",
                    "        <attribute name='myp_enddate' />",
                    "      </link-entity>",
                    "    </link-entity>",
                    "  </entity>",
                    "</fetch>",
                ].join("");
                return [2 /*return*/, this.contextObj.webAPI.retrieveMultipleRecords("myp_mytimelineconfiguration", "?fetchXml=" + fetchXml).then(function success(results) {
                        return results.entities;
                    }, function (error) {
                        return error;
                    })];
            });
        });
    };
    myTimeline.prototype.getPageParameters = function () {
        var url = window.location.href;
        var parametersString = url.split("?")[1];
        var parametersObj = {};
        if (parametersString) {
            for (var _i = 0, _a = parametersString.split("&"); _i < _a.length; _i++) {
                var paramPairStr = _a[_i];
                var paramPair = paramPairStr.split("=");
                parametersObj[paramPair[0]] = paramPair[1];
            }
        }
        return parametersObj;
    };
    myTimeline.prototype.getParentConfiguration = function (context) {
    };
    //Gets The URL From The Entity Passed As Argument
    myTimeline.prototype.getEntityIconUrl = function (logicalName) {
        var currentURL = window.location.href;
        var parametersString = currentURL.split("?")[0];
        var clientURL = parametersString.replace("/main.aspx", "");
        var request = "/api/data/v9.1/EntityDefinitions?$select=ObjectTypeCode&$filter=LogicalName eq '" + logicalName + "'";
        var url = "/_imgs/ico_16_customEntity.gif";
        var req = new XMLHttpRequest();
        req.open("GET", clientURL + request, false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    for (var i = 0; i < results.value.length; i++) {
                        var objectTypeCode = results.value[i]["ObjectTypeCode"];
                        var http = new XMLHttpRequest();
                        http.open('HEAD', url, false);
                        http.send();
                        var result = http.status != 404;
                        if (!result) {
                            url = "/_imgs/ico_16_customEntity.gif";
                        }
                        else {
                            url = "/_imgs/ico_16_" +
                                objectTypeCode + ".gif";
                            var http = new XMLHttpRequest();
                            http.open('HEAD', url, false);
                            http.send();
                            var result = http.status != 404;
                            if (!result) {
                                url = "/_imgs/ico_16_"
                                    + objectTypeCode +
                                    ".png";
                                var http = new XMLHttpRequest();
                                http.open('HEAD', url, false);
                                http.send();
                                var result = http.status != 404;
                                if (!result)
                                    url = "/_imgs/ico_16_customEntity.gif";
                            }
                        }
                    }
                }
                else {
                    console.log(this.statusText);
                }
            }
        };
        req.send();
        return url;
    };
    myTimeline.prototype.UrlExists = function (url) {
    };
    myTimeline.prototype.splitString = function (input, maxLength) {
        /*var output = "";
        var len = maxLength;
        var prev = 0;
        var curr = len;

        while (curr < input.length) {
            while (input[curr]) {
                var currValue = curr++;

                if (input[currValue] == ' ' || input[currValue] == "." || input[currValue] == "\n") {
                    output += input.substring(prev, curr) + "\n";
                    prev = curr;

                    if (curr + len < input.length)
                        curr += len;
                    else
                        curr = input.length;
                }

                if (curr == input.length) {
                    output += input.substring(prev, curr) + "\n";
                    prev = curr;
                }
            }
        }
        return output;
        */
        return input;
    };
    myTimeline.prototype.redirectTo = function (id) {
        document.getElementById('myTimeline');
    };
    return myTimeline;
}());
exports.myTimeline = myTimeline;
