import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { debug } from "util";
import './js/bootstrap.bundle.min';
import './js/bootstrap-select.min';
require("jquery/dist/jquery");

const visTimeLine = require("vis/lib/timeline/Timeline");
const visDataSet = require("vis/lib/DataSet")

export class myTimeline implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	//Current Context
	private contextObj: ComponentFramework.Context<IInputs>;

	//Div Elements
	private mainContainer: HTMLDivElement;
	private filterContainer: HTMLDivElement;
	private intervalDiv: HTMLDivElement;
	private activitiesDiv: HTMLDivElement;
	private visuContainer: HTMLDivElement;

	//Interval Buttons
	private dayButton: HTMLButtonElement;
	private weekButton: HTMLButtonElement;
	private monthButton: HTMLButtonElement;
	private yearButton: HTMLButtonElement;

	//Dropdown Elements
	private activitiesSelector: HTMLSelectElement;

	//Timeline
	private timeline: any;

	//Current Record Information
	private currentRecord: any;

	//Activities Regarding Current Record
	private activities: any;

	//Configurations Regarding Current Record
	private configurations: any;

	private _notifyOutputChanged: () => void;
	private isRefresh = false;

	/**
	 * Empty constructor.
	 */
	constructor() {

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
		this.contextObj = context;
		this.currentRecord = this.getPageParameters();
		this._notifyOutputChanged = notifyOutputChanged;

		// Create All Divs
		this.createContainers();

		//Create Date Buttons
		this.createIntervalButtons();

		//Create Activities Selector
		this.activitiesSelector = document.createElement("select");
		this.activitiesSelector.setAttribute("class", "selectpicker");

		// var optionTest = document.createElement("option");
		// optionTest.setAttribute("value", "Test");
		// optionTest.innerHTML = "Test";
		// this.activitiesSelector.appendChild(optionTest);
		this.activitiesDiv.appendChild(this.activitiesSelector);

		// Create Timeline container
		this.createTimelineContainer(container);

		//For The Initialization
		this.isRefresh = true;
	}

	private createTimelineContainer(container: HTMLDivElement) {
		this.visuContainer = document.createElement("div");
		this.visuContainer.setAttribute("id", "visualisation");
		this.mainContainer.appendChild(this.visuContainer);
		container.appendChild(this.mainContainer);
	}

	private createIntervalButtons() {
		this.dayButton = document.createElement("button");
		this.dayButton.innerHTML = "Day";
		this.dayButton.setAttribute("id", "dayButton");
		this.dayButton.setAttribute("style", "color:black");
		this.dayButton.setAttribute("class", "filter-btn btn btn-primary");
		this.intervalDiv.appendChild(this.dayButton);

		this.weekButton = document.createElement("button");
		this.weekButton.innerHTML = "Week";
		this.weekButton.setAttribute("id", "weekButton");
		this.weekButton.setAttribute("style", "color:black");
		this.weekButton.setAttribute("class", "filter-btn btn btn-primary");
		this.intervalDiv.appendChild(this.weekButton);

		this.monthButton = document.createElement("button");
		this.monthButton.innerHTML = "Month";
		this.monthButton.setAttribute("id", "monthButton");
		this.monthButton.setAttribute("style", "color:black");
		this.monthButton.setAttribute("class", "filter-btn btn btn-primary");
		this.intervalDiv.appendChild(this.monthButton);

		this.yearButton = document.createElement("button");
		this.yearButton.innerHTML = "Year";
		this.yearButton.setAttribute("id", "yearButton");
		this.yearButton.setAttribute("style", "color:black");
		this.yearButton.setAttribute("class", "filter-btn btn btn-primary");
		this.intervalDiv.appendChild(this.yearButton);
	}

	private createContainers() {
		this.mainContainer = document.createElement("div");

		this.filterContainer = document.createElement("div");
		this.filterContainer.setAttribute("class", "row");
		this.mainContainer.appendChild(this.filterContainer);

		this.intervalDiv = document.createElement("div");
		this.intervalDiv.setAttribute("class", "col-sm");
		this.filterContainer.appendChild(this.intervalDiv);

		this.activitiesDiv = document.createElement("div");
		this.activitiesDiv.setAttribute("class", "col-sm");
		this.filterContainer.appendChild(this.activitiesDiv);
	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		if (this.isRefresh == true) {
			this.initAll();
		} else {
			this.createTimeline();
		}
	}

	private async initAll() {
		await this.initConfiguration(this.currentRecord.etn);
		await this.initActivities();
		this.createTimeline();
		this.isRefresh = false;
	}

	public createTimeline() {
		var timeLineItems = new visDataSet([]);
		var context = this.contextObj;
		var activities = this.activities;

		for (let currentActivity of this.activities) {
			var startdate = currentActivity[currentActivity.startDateField] != null ? new Date(currentActivity[currentActivity.startDateField]) : new Date();
			var enddate = currentActivity[currentActivity.endDateField] != null ? new Date(currentActivity[currentActivity.endDateField]) : new Date();
			var description = currentActivity[currentActivity.descriptionField] != null ? currentActivity[currentActivity.descriptionField] : "";
			var title = currentActivity[currentActivity.titleField] != null ? currentActivity[currentActivity.titleField] : "";
			var color = currentActivity.colorField != null ? currentActivity.colorField : "";
			var icon = this.getEntityIconUrl(currentActivity.entityNameField);
			var activityId = currentActivity[currentActivity.primaryKeyField];

			if (title != "" && title != null) {
				var iconType = "range";

				if (startdate == new Date() && enddate == new Date())
					continue;

				if (startdate == new Date() && enddate != new Date()) {
					startdate = enddate;
					enddate = new Date();
				}

				if ((startdate != new Date() && enddate == new Date()) || startdate.getTime() === enddate.getTime()) {
					iconType = "point";
					color = "transparent";
				}

				let item = {
					id: activityId,
					content: title != "" && title != null ? "<img src='" + icon + "'> " + title : "<img src='" + icon + "'>" + "",
					start: this.formatDate(startdate),
					end: (enddate != new Date()) ? this.formatDate(enddate) : "",
					type: iconType,
					title: this.splitString(description, 80) != "" ? "<div id='tootlip'><h6>" + this.splitString(description, 80) + "</h6></div>" : "<div id='tootlip'><h6>No Description to be displayed.</h6></div>",
					style: "background-color: " + color + ";"
				}

				timeLineItems.add(item);
			}
		}

		// Configuration for the Timeline
		var options = {
			start: this.formatDate(this.getStartOfWeek()),
			end: this.formatDate(this.getEndOfWeek()),
		};

		// Create a Timeline
		if (!this.timeline) {
			this.timeline = new visTimeLine(this.visuContainer, timeLineItems, options);

			this.timeline.on("doubleClick", function (properties: any) {
				var activityName = "";

				for (var activity of activities) {
					if (activity[activity.primaryKeyField] == properties.item) {
						activityName = activity.entityNameField;
						break;
					}
				}

				var entityFormOptions = {
					entityName: activityName,
					entityId: properties.item,
					openInNewWindow: true,
				};

				context.navigation.openForm(entityFormOptions);
			});

			var timeline = this.timeline;
			this.initButtonEvents(timeline);
		}
	}

	public initButtonEvents(timeline: any) {
		var startDay = this.formatDate(this.getStartOfDay());
		var endDay = this.formatDate(this.getEndOfDay());

		this.dayButton.addEventListener("click", function () {
			timeline.setWindow(startDay, endDay, { animation: false });
		});

		var startWeek = this.formatDate(this.getStartOfWeek());
		var endWeek = this.formatDate(this.getEndOfWeek());

		this.weekButton.addEventListener("click", function () {
			timeline.setWindow(startWeek, endWeek, { animation: false });
		});

		var startMonth = this.formatDate(this.getStartOfMonth());
		var endMonth = this.formatDate(this.getEndOfMonth());

		this.monthButton.addEventListener("click", function () {
			timeline.setWindow(startMonth, endMonth, { animation: false });
		});

		var startYear = this.formatDate(this.getStartOfYear());
		var endYear = this.formatDate(this.getEndOfYear());

		this.yearButton.addEventListener("click", function () {
			timeline.setWindow(startYear, endYear, { animation: false });
		});
	}

	public getStartOfDay() {
		var start = new Date();
		start.setHours(0, 0, 0, 0);
		return start;
	}

	public getEndOfDay() {
		var end = new Date();
		end.setHours(23, 59, 59, 999);
		return end;
	}

	public getStartOfWeek() {
		var d = new Date()
		var day = d.getDay();
		return new Date(d.getFullYear(), d.getMonth(), d.getDate() + (day == 0 ? -6 : 1) - day);
	}

	public getEndOfWeek() {
		var d = new Date();
		var day = d.getDay();
		return new Date(d.getFullYear(), d.getMonth(), d.getDate() + (day == 0 ? 0 : 7) - day);
	}

	public getStartOfMonth() {
		var curr = new Date();
		var firstDay = new Date(curr.getFullYear(), curr.getMonth(), 1);
		return firstDay;
	}

	public getEndOfMonth() {
		var curr = new Date();
		var lastDay = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
		return lastDay;
	}

	public getStartOfYear() {
		return new Date(new Date().getFullYear(), 0, 1);;
	}

	public getEndOfYear() {
		return new Date(new Date().getFullYear(), 11, 31);
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void {
		// Add code to cleanup control if necessary
	}

	public formatDate(d: Date) {
		var dformat = [d.getMonth() + 1,
		d.getDate(),
		d.getFullYear()].join('/') + ' ' +
			[d.getHours(),
			d.getMinutes()].join(':');
		return dformat;
	}

	public async initActivities() {
		this.activities = new Array();

		for (let currentConfiguration of this.configurations) {
			var startDateField = currentConfiguration["childConfig.myp_startdate"];
			var endDateField = currentConfiguration["childConfig.myp_enddate"];
			var descriptionField = currentConfiguration["childConfig.myp_descriptionfield"];
			var entityNameField = currentConfiguration["childConfig.myp_entityname"];
			var regardingName = currentConfiguration["childConfig.myp_regardingname"];
			var colorField = currentConfiguration["childConfig.myp_color"];
			var titleField = currentConfiguration["childConfig.myp_title"];
			var primaryKeyField = currentConfiguration["childConfig.myp_primarykey"];

			try {
				var activityAux = await this.getActivity(startDateField, endDateField, descriptionField, entityNameField, regardingName, titleField);
				activityAux = JSON.parse(JSON.stringify(activityAux));

				for (let activityTemp of activityAux) {
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
			} catch (error) {
				console.log("Error: " + error);
			}
		}
	}

	public async getActivity(startDateField: string, endDateField: string, descriptionField: string, entityName: string, regardingField: string, titleField: string) {
		var fetchData = {
			regardingobjectid: this.currentRecord.id
		};

		var fetchXml = [
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

		return this.contextObj.webAPI.retrieveMultipleRecords(entityName, "?fetchXml=" + fetchXml).then(
			function success(results) {
				return results.entities;
			},
			function (error) {
				return error;
			}
		);
	}

	public async initConfiguration(entityName: string) {
		try {
			var configurationsAux = await this.getConfiguration(entityName);
			this.configurations = JSON.parse(JSON.stringify(configurationsAux));
		} catch (error) {
			console.log("Error: " + error);
		}
	}

	public async getConfiguration(entityName: string) {
		var fetchData = {
			myp_entityname: entityName
		};

		var fetchXml = [
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
			"</fetch>",].join("");

		return this.contextObj.webAPI.retrieveMultipleRecords("myp_mytimelineconfiguration", "?fetchXml=" + fetchXml).then(
			function success(results) {
				return results.entities;
			},
			function (error) {
				return error;
			}
		);
	}

	public getPageParameters(): any {
		const url = window.location.href;
		const parametersString = url.split("?")[1];

		let parametersObj: any = {};

		if (parametersString) {
			for (let paramPairStr of parametersString.split("&")) {
				let paramPair = paramPairStr.split("=");
				parametersObj[paramPair[0]] = paramPair[1];
			}
		}

		return parametersObj;
	}

	public getParentConfiguration(context: ComponentFramework.Context<IInputs>) {
	}

	//Gets The URL From The Entity Passed As Argument
	public getEntityIconUrl(logicalName: string) {
		const currentURL = window.location.href;
		const parametersString = currentURL.split("?")[0];
		const clientURL = parametersString.replace("/main.aspx", "");

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
						} else {
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
				} else {
					console.log(this.statusText)
				}
			}
		};
		req.send();

		return url;
	}

	public UrlExists(url: string) {

	}

	public splitString(input: string, maxLength: number) {
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
	}
}