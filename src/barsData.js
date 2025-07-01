import year from "../public/data/iconicYear.json" with {type: "json"};
import * as Constants from './defaultVars.js'

function RawDataStruct()
{
	this.datas = [];
	this.sum = 0;
}

function AdvancedData(data)
{
	this.rawData = data.slice();
	this.data = data.slice().sort((a, b) => a - b);
	this.median = this._getMedian(this.data);
	let mid = Math.ceil(this.data.length / 2);
	this.q1 = this._getMedian(this.data.slice(0, mid));
	this.q3 = this._getMedian(this.data.slice(mid));
	
	this.min = 1000000;
	this.max = 0;
	this.outliersLow = [];
	this.outliersHigh = [];
	this.modes = {};
	let sum = 0;
	let iqSum = 0;
	let iqLength = 0;
	let frequencies = {};
	let maxFrequency = 1;
	for (let i in this.data)
	{
		sum += this.data[i];
		if (this.data[i] < this.min)
			this.min = this.data[i];
		if (this.data[i] > this.max)
			this.max = this.data[i];
/*
		frequencies[i] = (frequencies[i] || 0) + 1;
		if (frequencies[i] > maxFrequency)
			maxFrequency = frequencies[i];
*/
		let isLow = (this.data[i] < this.q1);
		let isHigh = (this.data[i] > this.q3);

		if (!(isLow || isHigh))
		{
			iqSum += this.data[i];
			iqLength++;
			continue;
		}
		if (isLow)
			this.outliersLow.push(this.data[i]);
		if (isHigh)
			this.outliersHigh.push(this.data[i]);
	}
	this.mean = sum / data.length;
	this.iqm = iqSum / iqLength;
	this.variance = 0;
	for (let i in this.data)
	{
		let dif = this.data[i] - this.mean;
		this.variance += (dif * dif);
	}
	this.variance = this.variance / (this.data.length - 1);
	/*
	for (let i in frequencies)
	{
		if (frequencies[i] == maxFrequency)
			this.modes[i] = maxFrequency;
	}
		*/
}

AdvancedData.prototype._getMedian = function(data)
{
	let midElement = Math.floor(data.length * .5);
	if (data.length % 2 == 1)
		return data[midElement];
	else
		return (data[midElement] + data[midElement - 1]) * .5;
}


function Data(name, data)
{
	this.data = data.map(item => item.sum);
	this.advancedData = data.map(item => new AdvancedData(item.datas));
	this.isSeparate = (Constants.separateDataNames.indexOf(name) >= 0);
	this.max = 0;
	this._calcMax();
}

Data.prototype.getAdvancedData = function(id)
{
	return this.advancedData[id];
}

Data.prototype._calcMax = function()
{
	this.max = 0;
	for (let i in this.data)
		if (this.data[i] > this.max)
			this.max = this.data[i];
}

Data.prototype.setData = function(data)
{
	this.data = data.map(item => item.sum);
	this.advancedData = data.map(item => new AdvancedData(item.datas));
	this._calcMax();
}

Data.prototype.getData = function()
{
	return this.data;
}

export function DataGroup(name, sample = Constants.defaultSample, other = undefined)
{
	this.name = name;
	this.datas = {};
	this.filters = {season : new Array(3).fill(1), };
	this.filters.season = new Array(3).fill(1);
	this.filters.month = new Array(13).fill(1);
	this.filters.day = new Array(7).fill(1);
	this.filters.hour = new Array(11).fill(1);
	this.enableFilters = false;
	this.haveSells = false;
	this.tintColor = Constants.defaultTint;
	this.sample = sample;

	this.sellsMax = 0;
	this.sellsTexture = Constants.defaultSellsTexture;
	
	if (!other)
		return;
	this.sellsTexture = other.sellsTexture;
	this.filters = other.filters;
	this.enableFilters = other.enableFilters;
	this.tintColor = other.tintColor;
	this.sample = other.sample;

	//secret easter egg
	this._isS = false;
	this._isP = false;
}

DataGroup.prototype.setData = function(name)
{
	let data = requestData(this.sample, name, this.getFilters());

	if (!this.datas[name])
		this.datas[name] = new Data(name, data);
	else
		this.datas[name].setData(data);

	if (!this.datas[name].isSeparate)
		this._calcSellsData();
}

DataGroup.prototype.changeFilter = function(filterName, filterValue)
{
	let filterGroups = 
	{
		"hour" : Constants.hourNames,
		"day" : Constants.dayNames,
		"month" : Constants.monthNames,
		"season" : Constants.seasonNames
	};
	
	for (const [filterGroup, filterNames] of Object.entries(filterGroups))
	{
		let filterId = filterNames.indexOf(filterName);
		if (filterId < 0)
			continue;
		
		this.filters[filterGroup][filterId] = filterValue;
		break;
	}

	if (this.enableFilters)
		this.refreshAllData();
}

DataGroup.prototype.changeSample = function(newSample)
{
	if (this.sample == newSample)
		return;
	
	this.sample = newSample;
	this.refreshAllData(true);
}

DataGroup.prototype._getNotSepNames = function()
{
	let res = [];
	for (let i in this.datas)
		if (!this.datas[i].isSeparate)
			res.push(i);
	return res;
}

DataGroup.prototype._calcSellsData = function()
{
	let names = this._getNotSepNames();
	if (names.length == 0)
	{
		this.sellsMax = 0;
		this.haveSells = false;
		return;
	}
	//let sells = newDataArr(Constants.sampleDataLength[this.sample]);
	
	let sells = requestData(this.sample, names, this.getFilters());
	this.sellsMax = 0;
	this.haveSells = true;

	for (let i in this.datas)
	{
		if (this.datas[i].isSeparate)
			continue;

		for (let j in this.datas[i].data)
		{
			let val = this.datas[i].data[j];
			if (val > this.sellsMax)
				this.sellsMax = val;	
		}
	}
	
	if (!this.datas["Sells"])
		this.datas["Sells"] = new Data("Sells", sells);
	this.datas["Sells"].setData(sells);
}

DataGroup.prototype.clear = function()
{
	for (let i in this.datas)
		delete this.datas[i];
}

DataGroup.prototype.refreshAllData = function(clearFirst = false)
{
	let dataNames = this.getNames();
	if (clearFirst)
		this.clear();
	
	for (let i in dataNames)
		this.setData(dataNames[i]);
}

DataGroup.prototype._checkDeleteSells = function()
{
	for (let i in this.datas)
		if (!this.datas[i].isSeparate)
			return false;
	
	return true;
}

DataGroup.prototype.getFilters = function()
{
	if (this.enableFilters)
		return this.filters;
	
	return {season : new Array(3).fill(1), month : new Array(13).fill(1),
		day : new Array(7).fill(1), hour : new Array(11).fill(1)};
}

DataGroup.prototype.removeData = function(name)
{
	if (!this.datas[name])
		return;

	let isSell = !this.datas[name].isSeparate;
	delete this.datas[name];

	if (isSell)
		this._calcSellsData();
	
	let removeSells = (isSell && (!this.haveSells));
	if (removeSells)
		delete this.datas["Sells"];

	return removeSells;
}

DataGroup.prototype.getMax = function(name)
{
	if (!this.datas[name])
		return NaN;
	if (this.datas[name].isSeparate)
		return this.datas[name].max;
	return this.sellsMax;
}

DataGroup.prototype.getNames = function()
{
	let res = [];
	for (let name in this.datas)
		if (name != "Sells")
			res.push(name);
	return res;
}

DataGroup.prototype.getAllData = function(isGroup)
{
	let res = {};
	for (let name in this.datas)
	{
		if ((!isGroup) && (name == "Sells"))
			continue;
		if (isGroup && (!this.datas[name].isSeparate))
			continue;

		res[name] = this.datas[name].data;
	}
	return res;
}

DataGroup.prototype.getAdvancedData = function(name, id)
{
	return this.datas[name].getAdvancedData(id);
}

DataGroup.prototype.getData = function(name)
{
	if (!this.datas[name])
		return NaN;
	return this.datas[name].data;
}

//using
DataGroup.prototype.getLocalMax = function()
{
	let res = {};
	for (let i in this.datas)
	{
		if (this.datas[i].isSeparate)
			res[i] = this.datas[i].max;
	}
	
	res["Sells"] = this.sellsMax;
	return res;
}

DataGroup.prototype.setSellsTexture = function(texture)
{
	this.sellsTexture = texture;
}

DataGroup.prototype.getSellsTexture = function()
{
	return this.sellsTexture;
}

DataGroup.prototype.setTintColor = function(newColor)
{
	this.tintColor = newColor;
}

DataGroup.prototype.getTintColor =function()
{
	return this.tintColor;
}

DataGroup.prototype.setName = function(newName)
{
	this.name = newName;
}

DataGroup.prototype.getName = function()
{
	return this.name;
}


function newDataArr(l)
{
	return Array.from({ length: l }, () => (new RawDataStruct()));
}

function requestData(sample, name, filters)
{
	let res = newDataArr(Constants.sampleDataLength[sample]);
	
	//I'm sorry for this.
	for (let m in year)
	{
		const month = year[m];
		if (!filters.season[month.season]) continue;
		if (!filters.month[m]) continue;

		for (let d in month.days)
		{
			const day = month.days[d];
			if (!filters.day[day.weekDay]) continue;
			if (!filters.season[day.season]) continue;
			if (sample == "by day")
				res[day.weekDay].datas.push(0);
			
			for (let h in day.hours)
			{
				const hour = day.hours[h];
				if (!filters.hour[h]) continue;

				let data;
				if (Array.isArray(name))
					data = getSellsTotal(hour, name);
				else
					data = getSells(hour, name);

				if (sample === "by hour")
				{
					res[h].datas.push(data);
					res[h].sum += data;
				}
				if (sample === "by day")
				{
					res[day.weekDay].sum += data;
					let val = res[day.weekDay].datas[res[day.weekDay].datas.length - 1];
					res[day.weekDay].datas[res[day.weekDay].datas.length - 1] = val + data;
				}
				if (sample === "by month")
					res[m].sum += data;
				if (sample === "by season")
					res[day.season].sum += data;
			}
		}
	}
	
	return res;
}

function getSellsTotal(hour, names)
{
	let res = 0;
	for (let i in names)
	{
		if (hour.sells[names[i]])
			res += hour.sells[names[i]];
	}
	
	return res;
}

function getSells(hour, name)
{
	if (name == "Ladydrinks")
		return hour.ladydrinks;
	if (name == "Ringabells")
		return hour.ringabells;
	//When I parsed data, I have accidentally removed one zero, so I put it back here. And convert Thai baht to dollar.
	if (name == "Money")
		return Math.round(hour.money * 10 / 34.);

	if (hour.sells[name])
		return hour.sells[name];
	
	return 0;
	
/*
	for (const receipt in hour.receipts)
		for (const item in hour.receipts[receipt].items)
		{
			if (hour.receipts[receipt].items[item].name == name)
				res += 1;
		}
*/
	return res;
}