import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import * as Constants from './defaultVars.js'

function CustomMax(texturePaths)
{
	this.labels = {};
	this.textures = texturePaths;
	this.leftPos = 1.03;
	this.root = new THREE.Object3D();
}

CustomMax.prototype._createLabel = function(name, val)
{
	const text = document.createElement( 'div' );
	text.className = 'white_label';
	text.textContent = val.toString();
	
	let label = new CSS2DObject( text );
	if (Constants.isVertical)
		label.center.copy(new THREE.Vector2(1, .5));
	this.root.add(label);

	const img = document.createElement('div');
	img.style.backgroundImage = `url('${this.textures[name]}')`;
	img.style.width = "30px";
	img.style.height = "30px";
	img.style.backgroundSize = "contain";

	let imgLabel = new CSS2DObject( img );
	this.root.add(imgLabel);

	this.labels[name] = {"text" : label, "image" : imgLabel};
}

CustomMax.prototype._deleteLabel = function(name)
{
	let label = this.labels[name];
	delete this.labels[name];
	this.root.remove(label["text"]);
	this.root.remove(label["image"]);
	
}

CustomMax.prototype._updatePositions = function()
{
	let id = 0;
	for (let i in this.labels)
	{
		this.labels[i]["image"].position.copy(new THREE.Vector3(this.leftPos + id * .075, 1., 0.));
		this.labels[i]["text"].position.copy(new THREE.Vector3(this.leftPos + id * .075, .9, 0.));
		id++;
	}
}

CustomMax.prototype.update = function(max)
{
	for (let i in this.labels)
	{
		if (!max[i])
			this._deleteLabel(i);
	}

	for (let i in max)
	{
		if (max[i] == 0)
			continue;

		if (!this.labels[i])
			this._createLabel(i, max[i]);
		else
			this.labels[i]["text"].element.textContent = max[i].toString();
	}
	this._updatePositions();
}

function BarsGrid(width, height, texturePaths, {verLabels = Constants.hourNames, horLines = 2, verLines = 0, horSubLines = true, verSubLines = false} = {})
{
	this.customMax = new CustomMax(texturePaths);
	this.root = new THREE.Object3D();
	this.root.add(this.customMax.root);
	this.labels = [];
	this.maxSellLabel = this.makeLabel("0", new THREE.Vector3(-.03, 1., 0));
	this.midSellLabel = this.makeLabel("0", new THREE.Vector3(-.03, .5, 0));
	this.maxCustomLabels = {};
	this.midCustomLabels = {};
	for (let i = 0; i < verLabels.length; i++)
	{
		let y = height;
		let x = (i + .5) / verLabels.length;
		this.labels.push(this.makeLabel(verLabels[i], new THREE.Vector3(x, -.05, 0)));
	}
	//basis
	this.baseMat = new LineMaterial({color : 0xffffff, linewidth: 2});
	this.secondMat = new LineMaterial({color : 0xffffff, linewidth: 1, transparent: true, opacity: .5});
	this.unnecMat = new LineMaterial({color : 0xffffff, linewidth: 1, transparent: true, opacity: .15});
	
	this.basisLines = [];
	this.vertLines = [];
	this.horLines = [];

	this.basisLines.push(this.makeLine([0, 0, 0, 0, 1, 0], this.baseMat));
	this.basisLines.push(this.makeLine([0, 0, 0, 1, 0, 0], this.baseMat));
	for (let i = 0; i < horLines; i++)
	{
		let y = (i + 1.) / horLines;
		let halfStep = .5 / horLines;
		this.horLines.push(this.makeLine([0, y, 0, 1, y, 0], this.secondMat));
		if (horSubLines)
			this.horLines.push(this.makeLine([0, y - halfStep, 0, 1, y - halfStep, 0], this.unnecMat));
	}

	for (let i = 0; i < verLines; i++)
	{
		let x = (i + 1.) / verLines;
		let halfStep = .5 / verLines;
		this.vertLines.push(this.makeLine([x, 0, 0, x, 1, 0], this.secondMat));
		if (verSubLines)
			this.vertLines.push(this.makeLine([x - halfStep, 0, 0, x - halfStep, 1, 0], this.unnecMat));
	}

	for (let i = 0; i < this.basisLines.length; i++)
		this.root.add(this.basisLines[i]);
	for (let i = 0; i < this.vertLines.length; i++)
		this.root.add(this.vertLines[i]);
	for (let i = 0; i < this.horLines.length; i++)
		this.root.add(this.horLines[i]);
	
	this.root.scale.x = width;
	this.root.scale.y = height;
}

BarsGrid.prototype.updateMax = function(max)
{
	if (max["Money"])
		max["Money"] = (max["Money"] / 1000.).toFixed(1) + "k";
	
	let sellMax = max["Sells"]
	if(sellMax)
	{
		delete max["Sells"];
		this.maxSellLabel.element.textContent = sellMax.toString();
		this.midSellLabel.element.textContent = (Math.round(sellMax / 2)).toString();
	}
	else
	{
		this.maxSellLabel.element.textContent = "0";
		this.midSellLabel.element.textContent = "0";
	}
	
	this.customMax.update(max);
}

BarsGrid.prototype.changeVertical = function(newNames)
{
	let namesArr = [];
	if (newNames == "by hour")
		namesArr = Constants.hourNames;
	else if (newNames == "by day")
		namesArr = Constants.dayShortNames;
	else if (newNames == "by month")
		namesArr = Constants.monthShortNames;
	else if (newNames == "by season")
		namesArr = Constants.seasonNames;
	else namesArr = newNames;
	
	for (let i = 0; i < this.vertLines.length; i++)
	{
		this.vertLines[i].removeFromParent();
	}
	for (let i = 0; i <= namesArr.length; i++)
	{
		let line = this.makeLine([i / namesArr.length, 0, 0, i / namesArr.length, 1, 0], this.secondMat);
		this.vertLines.push(line);
		this.root.add(line);
	}
	for (let i = 0; i < this.labels.length; i++)
	{
		this.labels[i].element.remove()
		this.labels[i].removeFromParent();
	}
	for (let i = 0; i < namesArr.length; i++)
	{
		let x = (i + .5) / namesArr.length;
		let label = this.makeLabel(namesArr[i], new THREE.Vector3(x, -.05, 0));
		this.labels.push(label);
		this.root.add(label);
	}
}

BarsGrid.prototype.makeLabel = function(labelText, pos)
{
	const text = document.createElement( 'div' );
	text.className = 'white_label';
	text.textContent = labelText;
	
	let label = new CSS2DObject( text );
	label.position.copy( pos );
	this.root.add(label);
	return label;
}

BarsGrid.prototype.makeLine = function(points, material)
{
	let geometry = new LineGeometry();
	geometry.setPositions( points );
	return new Line2( geometry, material );
}
export default BarsGrid;