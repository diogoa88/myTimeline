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
	private buttonExample: HTMLButtonElement;
	private selectExample: HTMLSelectElement;
	private visuContainer: HTMLDivElement;
	private timeline: any;
	private currentRecord: any;
	private activities: any;
	private _notifyOutputChanged: () => void;

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
		this.activities = this.getConfigurationMain(this.currentRecord.etn);
		debugger;
		console.log(this.activities);
		this._notifyOutputChanged = notifyOutputChanged;

		// Create main table container div. 
		this.mainContainer = document.createElement("div");

		// this.buttonExample = document.createElement("button");
		// this.buttonExample.innerText = "Button Test";
		// this.mainContainer.appendChild(this.buttonExample);

		// Create Timeline container
		this.visuContainer = document.createElement("div");
		this.visuContainer.setAttribute("id", "visualisation");

		// this.buttonExample = document.createElement("button");
		// this.buttonExample.innerText = "Button Test";

		// this.selectExample = document.createElement("select");
		// this.selectExample.multiple = true;
		// var opt1 = document.createElement("option");
		// var opt2 = document.createElement("option");
		// opt1.value = "1";
		// opt1.text = "Option: Value 1";
		// opt2.value = "2";
		// opt2.text = "Option: Value 2";
		// this.selectExample.add(opt1);
		// this.selectExample.add(opt2);

		// this.mainContainer.appendChild(this.selectExample);
		// this.mainContainer.appendChild(this.buttonExample);
		this.mainContainer.appendChild(this.visuContainer);
		container.appendChild(this.mainContainer);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		this.createTimeLine();
	}

	private createTimeLine() {
		var dateColumn1 = this.activities.myp_startdate;
		var dateColumn2 = this.activities.myp_enddate;
		var labelColumn = this.activities.myp_name;

		var timeLineItems = new visDataSet([
		]);

		let i = 0;



		// for (let currentRecordId of timeLineItems.sortedRecordIds) {
		// 	let startdate = timeLineItems.records[currentRecordId].getFormattedValue(dateColumn1);
		// 	let enddate = timeLineItems.records[currentRecordId].getFormattedValue(dateColumn2);
		// 	let label = timeLineItems.records[currentRecordId].getFormattedValue(labelColumn);

		// 	if (startdate != null && startdate != "" && label != null && label != "") {
		// 		let item = {
		// 			id: ++i,
		// 			content: label,
		// 			start: moment(startdate, "D/MM/YYYY h:mm A").format('YYYY-MM-DD h:mm A'),
		// 			end: (enddate != null) ? moment(enddate, "D/MM/YYYY h:mm A").format('YYYY-MM-DD h:mm A') : "",
		// 			type: 'box',
		// 			title: ''
		// 		}
		// 		item["title"] = (item.end != "") ? item.start + "  -  " + item.end : item.start;
		// 		timeLineItems.add(item);
		// 	}
		// }


		// Configuration for the Timeline
		var options = {};

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

	public async getConfigurationMain(entityName: string) {
		try{
			return await this.getConfiguration(entityName);
		}catch(error){
			return Promise.reject(error);
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
			"      <condition attribute='myp_entityname' operator='eq' value='", fetchData.myp_entityname/*account*/, "'/>",
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

		return this.contextObj.webAPI.retrieveMultipleRecords("myp_mytimelineconfiguration", "?fetchXml="+ fetchXml).then(
			function success(results) {
				return results;
			},
			function(error) {
				return Promise.reject(error);
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