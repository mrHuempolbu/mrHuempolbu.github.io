import * as THREE from 'three';
import BarsSet from './barsVisual.js'
import BarsGrid from './barsGrid.js'
import {getData} from './dataPicker.js'
import {mainButtonsFront, addGroup, groupsFront, addSample, groupProps} from './barsFront.js'
import {DataGroup} from './barsData.js'
import {AdvDataBar} from './barAdvDataVisual.js'
import * as Constants from './defaultVars.js'

function BarsMain(scene, width, height)
{
	this.sample = Constants.defaultSample;
	this.width = Constants.defaultBarsWidth;
	this.height = Constants.defaultBarsHeight;
	this.grid = new BarsGrid(this.width, this.height, Constants.sepTexturePaths, {verLines : 11});
	this.scene = scene;
	this.root = new THREE.Object3D();
	this.advRoot = new THREE.Object3D();
	this.scene.add(this.advRoot);
	this.advRoot.position.copy(new THREE.Vector3(Constants.defaultBarsWidth + 1, 0, 0));
	this.scene.add(this.root);
	this.isGrouped = false;
	this.dataGroups = {0 : new DataGroup("group00"), 1 : new DataGroup("group01")};
	this.groupNextId = 2;
	this.activeGroup = 0;

	this.bars = new BarsSet(this.width, this.height, this.barPick_clb, this.barUnpick_clb, this);
	
	this.root.add(this.bars.root);
	this.root.add(this.grid.root);

	addSample(this.changeSample_clb, this);
	addGroup(this.changeGroup_clb, this);
	
	this.mainFront = new mainButtonsFront(this, this.enableFilters_clb, this.changeFilter_clb, this.changeData_clb, undefined);
	this.groupsFront = new groupsFront(this, this.renameGroup, this.setActiveGroup, this.newGroup, this.deleteGroup);
	this.groupProps = new groupProps(this, this.changeTint_clb, this.changeSellTexture_clb, Constants.sellsTextures, Constants.tintColors);

	this.globalMax = {"Sells" : 0, "Ladydrinks" : 0, "Barfines" : 0, "Ringabells" : 0, "Money" : 0};
}

BarsMain.prototype._iterateGroups = function(callback)
{
	for (const [groupStrId, group] of Object.entries(this.dataGroups))
	{
		callback(Number(groupStrId), group);
	}
}

BarsMain.prototype.barPick_clb = function(name, id)
{
	if (this.sample == "by season" || (this.sample == "by month"))
		return;
	
	let groupId = name.split("_")[0];
	let dataName = name.split("_")[1]
	let group = this.dataGroups[groupId];
	let data = group.getAdvancedData(dataName, id);
	let texture;
	if (this.isGrouped && (dataName == "Sells"))
		texture = this.dataGroups[groupId].getSellsTexture();
	else
		texture = Constants.textures[dataName];
	data['texture'] = texture;
	if (this.advData)
		this.advData.destroy();
	
	this.advData = new AdvDataBar(this.advRoot, data);
	this.lastPicked = name + "_" + id.toString();
}

BarsMain.prototype.barUnpick_clb = function(name, id)
{
	let unpicked = name + "_" + id.toString();
	if (unpicked != this.lastPicked)
		return;
	if (!this.advData)
		return;
	this.advData.destroy();
	this.advData = 0;
}

BarsMain.prototype.deleteGroup = function(id)
{
	if (!this.dataGroups[id])
		return;
	let data = this.dataGroups[id].getAllData(true);
	for (let i in data)
	{
		this.bars.removeData(id.toString() + "_" + i);
	}
	delete this.dataGroups[id];
	this.groupsFront.removeGroup(id);

	if (id == this.activeGroup)
	{
		let keys = Object.keys(this.dataGroups);
		this.setActiveGroup(keys[0]);
	}
}

BarsMain.prototype.newGroup = function()
{
	let groupId = this.groupNextId;
	this.groupNextId++;
	let name = "group" + ('0' + groupId).slice(-2);
	this.dataGroups[groupId] = new DataGroup(name, this.sample);
	this.groupsFront.addGroup(groupId, name, true);
}

BarsMain.prototype.changeTint_clb = function(colorName)
{
	let group = this.dataGroups[this.activeGroup];
	group.setTintColor(Constants.tintColors[colorName]);
	let datas = group.getAllData(this.isGrouped);
	for (let i in datas)
	{
		this.bars.setTint(this.activeGroup + "_" + i, Constants.tintColors[colorName]);
	}
	let textureFile = group.getSellsTexture().source.data.currentSrc;
	this.groupProps.setProps(textureFile, group.getTintColor());

	group._isS = (colorName == "Shit");
	if (group._isP && group._isS)
		window.app.sickBastardEaster();
}

BarsMain.prototype._calcGlobalMax = function()
{
	let dataNames = Constants.separateDataNames;
	for (let j in dataNames)
		this.globalMax[dataNames[j]] = 0;

	this._iterateGroups((groupId, group) =>
	{
		for (let i in dataNames)
		{
			let max = group.getMax(dataNames[i]);
			if ((!isNaN(max)) && (max > this.globalMax[dataNames[i]]))
				this.globalMax[dataNames[i]] = max;
		}
	});
}

BarsMain.prototype.setActiveGroup = function(newActive)
{
	this.activeGroup = newActive;
	let group = this.dataGroups[this.activeGroup];
	
	this.mainFront.setSells(group.getNames());
	this.mainFront.setFilters(group.enableFilters, 
		group.filters.season, group.filters.month, group.filters.day, group.filters.hour);
	this.groupProps.setProps(group.getSellsTexture().source.data.currentSrc, group.getTintColor());
	this.groupsFront.setActiveGroup(newActive);
	this.bars.setActiveGroup(newActive);
}

BarsMain.prototype.renameGroup = function(id, newName)
{
	this.dataGroups[id].setName(newName);
}

BarsMain.prototype.enableFilters_clb = function(value)
{
	this.dataGroups[this.activeGroup].enableFilters = value;
	this._refreshFilters();
	this._refreshBars();
}

BarsMain.prototype._refreshFilters = function()
{
	let group = this.dataGroups[this.activeGroup];
	let dataNames = group.getNames();
	for (let i = 0; i < dataNames.length; i++)
	{
		group.setData(dataNames[i]);
	}

	this._calcGlobalMax();
	if (this.isGrouped)
		this.grid.updateMax(this.globalMax);
	else
		this.grid.updateMax(this.dataGroups[this.activeGroup].getLocalMax());
}


BarsMain.prototype._enableGroups = function()
{
	this.bars.destroy();
	this._calcGlobalMax();
	let group = this.dataGroups[this.activeGroup];
	this.groupsFront.addGroup(this.activeGroup, group.getName(), false);
	this._iterateGroups((groupId, group) => 
	{
		let name = group.getName();
		if (groupId != this.activeGroup)
			this.groupsFront.addGroup(groupId, name, true);
		
		let datas = group.getAllData(true);
		for (let i in datas)
		{
			let texture;
			if (i == "Sells")
				texture = group.getSellsTexture();
			else
				texture = Constants.textures[i];
			
			let tint = group.getTintColor();
			this.bars.setData(groupId.toString() + "_" + i, datas[i], texture, this.globalMax[i], tint);
		}
	});
	this.bars.setActiveGroup(this.activeGroup);
}

BarsMain.prototype._disableGroups = function()
{
	this.bars.destroy();
	this._iterateGroups( (groupId, group) =>
	{
		this.groupsFront.removeGroup(groupId);
	});

	let group = this.dataGroups[this.activeGroup];
	let datas = group.getAllData(false);
	for (let i in datas)
	{
		let max = group.getMax(i);
		this.bars.setData(this.activeGroup.toString() + "_" + i, datas[i], Constants.textures[i], max, group.getTintColor());
	}
	this.bars.setActiveGroup(-1);
}

BarsMain.prototype.changeSellTexture_clb = function(texName)
{
	let group = this.dataGroups[this.activeGroup];
	group.setSellsTexture(Constants.textures[texName]);
	this.bars.setTexture(this.activeGroup + "_Sells", Constants.textures[texName]);

	let textureFile = group.getSellsTexture().source.data.currentSrc;
	this.groupProps.setProps(textureFile, group.getTintColor());

	group._isP = (texName == "Piss");
	if (group._isP && group._isS)
		window.app.sickBastardEaster();
}

BarsMain.prototype.changeGroup_clb = function(name, value)
{
	this.isGrouped = value;
	if (value)
		this._enableGroups();
	else
		this._disableGroups();

	
	if (this.isGrouped)
		this.grid.updateMax(this.globalMax);
	else
		this.grid.updateMax(this.dataGroups[this.activeGroup].getLocalMax());
}

BarsMain.prototype.changeFilter_clb = function(name, value)
{ 
	this.dataGroups[this.activeGroup].changeFilter(name, value);
	this._refreshFilters();
	this._refreshBars();
}

BarsMain.prototype.changeSample_clb = function(newSample)
{
	if (newSample == this.sample)
		return;

	this._iterateGroups( (groupId, group) =>
	{
		group.changeSample(newSample);
	});

	this.sample = newSample;
	this.bars.destroy();
	
	this._iterateGroups( (groupId, group) =>
	{
		let dataNames = group.getNames();
		let newGroup = new DataGroup(group.getName(), this.sample, group);

		for (let j in dataNames)
		{
			let newData = getData(this.sample, dataNames[j], newGroup.getFilters());
			newGroup.setData(dataNames[j], newData);
		}
		this.dataGroups[groupId] = newGroup;
	});
	
	this._calcGlobalMax();
	this._iterateGroups( (groupId, group) =>
	{
		let allData = group.getAllData(this.isGrouped);
		let sellsTex = group.getSellsTexture();
		let tint = group.getTintColor();
		for (let i in allData)
		{
			let max = this.isGrouped ? this.globalMax[i] : group.getMax(i);
			let texture = ((this.isGrouped && i == "Sells") ? sellsTex : Constants.textures[i]);
			this.bars.setData(groupId.toString() + "_" + i, allData[i], texture, max, tint);
		}
	});

	this.grid.changeVertical(newSample);
	if (this.isGrouped)
		this.grid.updateMax(this.globalMax);
	else
		this.grid.updateMax(this.dataGroups[this.activeGroup].getLocalMax());
	
}

BarsMain.prototype._refreshBars = function()
{
	let group = this.dataGroups[this.activeGroup];

	if (!this.isGrouped)
	{
		let allData = group.getAllData(false);
		for (let i in allData)
		{
			let max = group.getMax(i);
			this.bars.setData(this.activeGroup.toString() + "_" + i, allData[i], Constants.textures[i], max, group.getTintColor());
		}
		return;
	}
	this._calcGlobalMax();
	this._iterateGroups( (groupId, group) =>
	{
		let datas = group.getAllData(true);
		for (let i in datas)
		{
			let tex = ((i === "Sells") ? group.getSellsTexture() : Constants.textures[i]);
			let tint = group.getTintColor();
			this.bars.setData(groupId.toString() + "_" + i, datas[i], tex, this.globalMax[i], tint);
		}
	});
}

BarsMain.prototype.changeData_clb = function(name, value)
{
	let group = this.dataGroups[this.activeGroup];
	if (!value)
	{
		let removeSells = group.removeData(name);
		this.bars.removeData(this.activeGroup + "_" + name);
		if (removeSells)
			this.bars.removeData(this.activeGroup + "_" + "Sells");
	}
	else
		group.setData(name);
	
	this._refreshBars();
	
	if (this.isGrouped)
		this.grid.updateMax(this.globalMax);
	else
		this.grid.updateMax(this.dataGroups[this.activeGroup].getLocalMax());
}

export default BarsMain;