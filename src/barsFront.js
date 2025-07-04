import * as Constants from './defaultVars.js'


function groupHeader(parent, id, name, isClosed)
{
	let isFirst = (Object.keys(parent.bars).length == 0);
	this.id = id;
	this.parent = parent;
	const barsContainer = document.getElementById('barsContainer');
	this.line = document.createElement('div');
	this.line.className = 'bar_line';
	this.line.id = "groupId_" + id.toString();

	this.barElement = document.createElement('div');
	this.barElement.className = 'bar';
		
	this.barHeader1 = document.createElement('span');
	this.barHeader1.textContent = isClosed ? ">" : "v";
	this.barHeader1.className = 'bar_header_arrow';

	this.barHeader2 = document.createElement('span');
	this.barHeader2.textContent = name;
	this.barHeader2.className = "bar_header_text";

	this.barHeader2.addEventListener('click', function(e) {this.editStart_clb(e)}.bind(this));
	this.barHeader2.addEventListener('keydown', function(e) {
		if (e.key !== "Enter")
			return;
		e.preventDefault();
		this.barHeader2.blur();
	}.bind(this));
	this.barHeader2.addEventListener('blur', function(e) {this.editFinish_clb()}.bind(this));

	this.barElement.appendChild(this.barHeader1);
	this.barElement.appendChild(this.barHeader2);
	this.line.appendChild(this.barElement);
	
	//barsContainer.insertBefore(this.line, barsContainer.lastChild);
	if (isFirst)
		barsContainer.insertBefore(this.line, barsContainer.firstChild);
	else
		barsContainer.insertBefore(this.line, barsContainer.lastChild);

	this.handleBarClick = (e) => {
    	this.parent.active_clb.call(this.parent.callbacksScope, this.id);
	};
	this.toggleBarClick = (enable) => {
		if (enable)
	    	this.barElement.addEventListener('click', this.handleBarClick);
		else
			this.barElement.removeEventListener('click', this.handleBarClick);
	};

	this.toggleBarClick(true);
}

groupHeader.prototype.swingGroup = function(close)
{
	this.barHeader1.textContent = close ? ">" : "v";
}
groupHeader.prototype.remove = function()
{
	this.line.remove();
}

groupHeader.prototype.addRemoveButton = function()
{
	if (this.removeButton)
		return;
	this.removeButton = document.createElement('div');
	this.removeButton.textContent = "-";
	this.removeButton.className = "bar_button";
	//this.removeButton.style.paddingLeft = "5px";
	this.removeButton.style.borderLeft = "none";
	this.removeButton.style.borderTop = "none";
	this.barElement.style.width = "calc(var(--button-width) * 3 + 18px - var(--button-height))";
	this.line.appendChild(this.removeButton);
	this.removeButton.addEventListener('click', function(e) 
	{
		this.parent.remove_clb.call(this.parent.callbacksScope, this.id);
	}.bind(this));
}

groupHeader.prototype.removeRemoveButton = function()
{
	if (!this.removeButton)
		return;
	this.removeButton.remove();
	this.barElement.style.width = "calc(var(--button-width) * 3 + 18px)";
	this.removeButton = undefined;
}

groupHeader.prototype.editStart_clb = function(e)
{
	this.toggleBarClick(false);
	const textWidth = this.barHeader2.scrollWidth;
	const clickX = e.offsetX;
  	if (clickX > textWidth)
		return;

	this.barHeader2.setAttribute('contenteditable', 'true');
	this.barHeader2.focus();
	
	this.editingName = this.barHeader2.textContent;
	const range = document.createRange();
	range.selectNodeContents(this.barHeader2);
	const selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
}

groupHeader.prototype.editFinish_clb = function(e)
{
	this.toggleBarClick(true);
	const selection = window.getSelection();
	selection.removeAllRanges();

	let newName = this.barHeader2.textContent.replace(/\s/g, '');
	newName = newName.slice(0, 40);
	if (newName == "")
		newName = this.editingName;
	
	this.barHeader2.textContent = newName;
	this.parent.rename_clb.call(this.parent.callbacksScope, this.id, newName);
	this.barHeader2.setAttribute('contenteditable', 'false');
}

export function groupsFront(callbacksScope, renameCallback, activeCallback, addCallback, removeCallback)
{
	this.editingName = "thats_a_bug";
	this.rename_clb = renameCallback;
	this.active_clb = activeCallback;
	this.add_clb = addCallback;
	this.remove_clb = removeCallback;
	this.callbacksScope = callbacksScope;
	this.bars = {};
	
	this.addButton = document.createElement('div');
	this.addButton.className = 'bar_button';
	this.addButton.textContent = "+";
	this.addButton.id = "addBar";
	this.addButton.style.display = "none";

	this.addButton.addEventListener('click', addCallback.bind(callbacksScope));

	const barsContainer = document.getElementById('barsContainer');
	barsContainer.appendChild(this.addButton);
}

groupsFront.prototype.toggleHovers = function(enable)
{
	const dropdowns = document.querySelectorAll('.dropdown');

	dropdowns.forEach(dropdown => {
        if (enable)
            dropdown.classList.remove('no_hover');
        else
            dropdown.classList.add('no_hover');
    
    });
}

groupsFront.prototype.setActiveGroup = function(id)
{
	for (let i in this.bars)
		this.bars[i].swingGroup(true);
	
	let bar = this.bars[id];
	bar.swingGroup(false);
	let buttons = document.getElementById("dropdownButtons");
	let parent = document.getElementById("barsContainer");
	parent.removeChild(buttons);
	if (bar.line.nextSibling)
		parent.insertBefore(buttons, bar.line.nextSibling);
	else
		parent.appendChild(buttons);
}

groupsFront.prototype.removeGroup = function(id)
{
	this.bars[id].remove();
	delete this.bars[id];
	
	let removeRemoveButton = (Object.keys(this.bars).length <= 1);
	if (removeRemoveButton)
	{
		for (let i in this.bars)
			this.bars[i].removeRemoveButton();
	}
	if (Object.keys(this.bars).length == 0)
		this.addButton.style.display = "none";
}

groupsFront.prototype.addGroup = function(id, name, isClosed)
{
	this.bars[id] = new groupHeader(this, id, name, isClosed);
	this.addButton.style.display = "inline-flex";

	let addRemoveButton = (Object.keys(this.bars).length > 1);
	if (addRemoveButton)
	{
		for (let i in this.bars)
			this.bars[i].addRemoveButton();
	}
}

export function addGroup(callback, callbackScope)
{
	const groupCheckbox = document.getElementById('groupSells');
	groupCheckbox.addEventListener('change', function() {
		callback.call(callbackScope, this.value, this.checked);
	});
}

export function addSample(callback, callbackScope)
{
	const samples = ["By Hour", "By Day", "By Month", "By Season"];
	
	const sampleListEl = document.getElementById('sampleList');
	const samplButton = sampleListEl.previousSibling.previousSibling;
	samples.forEach(item => 
	{
		const option = document.createElement("label");
		option.textContent = item;
		sampleListEl.appendChild(option);
	});

	const dropdownItems = sampleListEl.querySelectorAll('.dropdown_list_simple label');
	dropdownItems.forEach(item => {
		item.addEventListener('click', () => {
			callback.call(callbackScope, item.textContent.toLowerCase());
			//samplButton.textContent = "Sample " + item.textContent.toLowerCase();
		});
	});
}

export function groupProps(callbackScope, changeTint_clb, changeTexture_clb, textures, colors)
{
	const textureEl = document.getElementById('sellsTexture');
	textureEl.style.backgroundImage = `url('./public/textures/beer.jpg')`;

	const colorEl = document.getElementById('tintColor');
	colorEl.style.backgroundColor = '#000000';

	this.callbackScope = callbackScope;
	this.changeTint_clb = changeTint_clb;
	this.changeTexture_clb = changeTexture_clb;

	let texturesListEl = document.getElementById("sellsTextureList");
	this._makeImagesList(texturesListEl, textures);
	let dropdownItems = texturesListEl.querySelectorAll('.texture_container');
	dropdownItems.forEach(item => {
		let name = item.lastChild.textContent;
		item.firstChild.style.backgroundImage = `url('${textures[name]}')`;
		item.addEventListener('click', () => {
			changeTexture_clb.call(callbackScope, item.lastChild.textContent);
		});
	});

	let colorsListEl = document.getElementById("tintColorList");
	this._makeImagesList(colorsListEl, colors);
	dropdownItems = colorsListEl.querySelectorAll('.texture_container');
	dropdownItems.forEach(item => {
		let name = item.lastChild.textContent;
		item.firstChild.style.backgroundColor = colors[name];
		item.addEventListener('click', () => {
			changeTint_clb.call(callbackScope, item.lastChild.textContent);
		});
	});
}

groupProps.prototype.setProps = function(texturePath, tint)
{
	const textureEl = document.getElementById('sellsTexture');
	textureEl.style.backgroundImage = `url('${texturePath}')`;;

	const colorEl = document.getElementById('tintColor');
	colorEl.style.backgroundColor = tint;
}

groupProps.prototype._makeImagesList = function(listEl, names)
{
	for (let i in names)
	{
		const container = document.createElement("div");
		container.className = "texture_container";
		const texture = document.createElement("div");
		texture.className = "texture_preview";
		//texture.style.backgroundImage = `url('${textures[i]}')`;
		const label = document.createElement("div");
		label.className = "image_label";
		label.textContent = i;
		container.appendChild(texture);
		container.appendChild(label);
		listEl.appendChild(container);
	}
}

export function mainButtonsFront(callbackScope, filterEnable_clb, filter_clb, sell_clb, group_clb)
{
	this.filter_clb = filter_clb;
	this.sells_clb = sell_clb;
	this.group_clb = group_clb;
	this.filterEnable_clb = filterEnable_clb;
	this.callbacksScope = callbackScope;

	this.sellsList();
	this.filterList();

	let buttons = [
		document.getElementById("sells"),
		document.getElementById("filters"),
		document.getElementById("groupSettings")
	]
	for (let i = 0; i < 3; i++)
	{
		buttons[i].addEventListener('click', function() {
			buttons[i].getElementsByClassName("dropdown_list")[0].classList.toggle('active');
			buttons[(i + 1) % 3].getElementsByClassName("dropdown_list")[0].classList.remove('active');
			buttons[(i + 2) % 3].getElementsByClassName("dropdown_list")[0].classList.remove('active');
		});
	}

	document.addEventListener('click', function(event) {
		let ifButton = !!event.target.closest('.dropdown_button');
		let ifList = (event.target.closest('.dropdown_list') || event.target.closest('.dropdown_nested_list'));
		if (ifButton || ifList)
			return;
		for (let i = 0; i < 3; i++)
		{
			buttons[i].getElementsByClassName("dropdown_list")[0].classList.remove('active');
		}
	});
	document.querySelectorAll('.dropdown_list').forEach(nestedList => {
		nestedList.addEventListener('click', function(e) {
			e.stopPropagation();	
		});
	});
	document.querySelectorAll('.dropdown_nested_list').forEach(nestedList => {
		nestedList.addEventListener('click', function(e) {
			e.stopPropagation();	
		});
	});

	document.getElementById("enableFilters").addEventListener("change", function(e) {
		filterEnable_clb.call(callbackScope, this.checked);
	});
}


mainButtonsFront.prototype.addClick = function(button)
{
	

	document.addEventListener('click', function(event) {
		if (!event.target.closest('.dropdown_button') && !event.target.closest('.dropdown_list')) {
			document.querySelector('.dropdown_list').classList.remove('active');
		}
	});
}

mainButtonsFront.prototype.setFilters = function(enable, season, month, day, hour)
{
	document.getElementById("enableFilters").checked = enable;

	for (let i in this.filterCheckboxes)
		this.filterCheckboxes[i].checked = false;

	for (let i in Constants.hourNames)
		document.getElementById(Constants.hourNames[i]).checked = hour[i];
	for (let i in Constants.dayNames)
		document.getElementById(Constants.dayNames[i]).checked = day[i];
	for (let i in Constants.monthNames)
		document.getElementById(Constants.monthNames[i]).checked = month[i];
	for (let i in Constants.seasonNames)
		document.getElementById(Constants.seasonNames[i]).checked = season[i];
}

mainButtonsFront.prototype.setSells = function(sells)
{
	for (let i in this.sellCheckboxes)
		this.sellCheckboxes[i].checked = false;
	for (let i in sells)
		document.getElementById(sells[i]).checked = true;
}

mainButtonsFront.prototype.addCheckboxes = function(id, list, defaultValue = false)
{
	const checkboxList = document.getElementById(id);
	
	list.forEach(item => {
		const label = document.createElement("label");
		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.value = item;
		checkbox.checked = defaultValue;
		checkbox.id = item;
		label.className = "dropdown_nested_list_label";
		label.appendChild(checkbox);
		label.appendChild(document.createTextNode(item));
		checkboxList.appendChild(label);
	});
}

mainButtonsFront.prototype.sellsList = function()
{
	this.addCheckboxes("beerList", Constants.beerNames);
	this.addCheckboxes("spiritList", Constants.spiritNames);
	this.addCheckboxes("softList", Constants.softNames);
	this.addCheckboxes("noalcList", Constants.nonAlcoNames);
	this.addCheckboxes("otherList", Constants.otherNames);
	
	let ids = ["beerList", "spiritList", "softList", "noalcList", "otherList"];
	let checkboxes = [];
	for (let i in ids)
	{
		let newCheckboxes = document.getElementById(ids[i]).querySelectorAll('input[type="checkbox"]');
		checkboxes.push(...newCheckboxes);
	}
	this.sellCheckboxes = checkboxes;
	let clb = this.sells_clb;
	let scope = this.callbacksScope;
	checkboxes.forEach(checkbox => {
		checkbox.addEventListener('change', function() {
			clb.call(scope, this.value, this.checked);
		})});
}

mainButtonsFront.prototype.filterList = function()
{
	this.addCheckboxes("dayFilterList", Constants.dayNames, true);
	this.addCheckboxes("seasonFilterList", Constants.seasonNames, true);
	this.addCheckboxes("hourFilterList", Constants.hourNames, true);
	this.addCheckboxes("monthFilterList", Constants.monthNames, true);

	let ids = ["dayFilterList", "seasonFilterList", "hourFilterList", "monthFilterList"];
	let checkboxes = [];
	for (let i in ids)
	{
		let newCheckboxes = document.getElementById(ids[i]).querySelectorAll('input[type="checkbox"]');
		checkboxes.push(...newCheckboxes);
	}
	
	let clb = this.filter_clb;
	let scope = this.callbacksScope;
	this.filterCheckboxes = checkboxes;
	checkboxes.forEach(checkbox => {
		checkbox.addEventListener('change', function() {
			clb.call(scope, this.value, this.checked);
		})});
}