import { IInputs, IOutputs } from "./generated/ManifestTypes";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
import { debug } from "util";
type DataSet = ComponentFramework.PropertyTypes.DataSet;
const visTimeLine = require("vis/lib/timeline/Timeline");
const visDataSet = require("vis/lib/DataSet")
const moment = require("moment")
const RowRecordId: string = "rowRecId";

export class myTimeline implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private contextObj: ComponentFramework.Context<IInputs>;
	private mainContainer: HTMLDivElement;
	private visuContainer: HTMLDivElement;
	private timeline: any;
	private currentRecord: any;
	private activities: any;
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

		// Create main table container div. 
		this.mainContainer = document.createElement("div");

		// Create Timeline container
		this.visuContainer = document.createElement("div");
		this.visuContainer.setAttribute("id", "visualisation");
		this.mainContainer.appendChild(this.visuContainer);
		container.appendChild(this.mainContainer);

		this.isRefresh = true;
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

		console.log(this.activities);

		let i = 0;

		for (let currentActivity of this.activities) {
			var startdate = currentActivity[currentActivity.startDateField] != null ? new Date(currentActivity[currentActivity.startDateField]) : new Date();
			var enddate = currentActivity[currentActivity.endDateField] != null ? new Date(currentActivity[currentActivity.endDateField]) : new Date();
			var description = currentActivity[currentActivity.descriptionField] != null ? currentActivity[currentActivity.descriptionField] : "";
			var title = currentActivity[currentActivity.titleField] != null ? currentActivity[currentActivity.titleField] : "";
			var color = currentActivity.colorField;

			if (title != "" && title != null) {
				var iconType = "box";

				if (startdate == new Date() && enddate == new Date())
					continue;

				if (startdate == new Date() && enddate != new Date()) {
					startdate = enddate;
					enddate = new Date();
				}

				if (startdate != new Date() && enddate == new Date()) {
					iconType = "point";
				}

				let item = {
					id: ++i,
					content: title != "" && title != null ? title : "",
					start: this.FormatDate(startdate),
					end: (enddate != new Date()) ? this.FormatDate(enddate) : "",
					type: iconType,
					title: description,
					style: "background-color: " + color + ";"
				}

				timeLineItems.add(item);
			}
		}

		// Configuration for the Timeline
		var options = {};

		debugger;
		// Create a Timeline
		if (!this.timeline)
			this.timeline = new visTimeLine(this.visuContainer, timeLineItems, options);
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

	public FormatDate(d: Date) {
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
					this.activities.push(activityTemp);
				}
			} catch (error) {
				console.log("Error: " + error);
			}
		}
	}

	public async getActivity(startDateField: string, endDateField: string, descriptionField: string, entityName: string, regardingField: string, titleField: string) {
		debugger;
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
}