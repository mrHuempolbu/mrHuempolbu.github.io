import * as THREE from 'three';
import {PropertySimple} from './animatable.js'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

function BarsSet(width, height, barPick_clb, barUnpick_clb, callbacksScope)
{
	this.barPick_clb = barPick_clb;
	this.barUnpick_clb = barUnpick_clb;
	this.callbacksScope = callbacksScope;
	this.width = width;
	this.height = height;
	this.root = new THREE.Object3D();
	this.bars = {};
	window.app.barsRoot = this.root;
	this.active = -1;
}

BarsSet.prototype.setActiveGroup = function(groupId)
{
	this.active = groupId;
	for (let i in this.bars)
	{
		if (Number(i.split("_")[0]) != groupId)
			this.bars[i].setBrightness(0);
		else
			this.bars[i].setBrightness(.25);
	}
}

BarsSet.prototype.setTexture = function(name, texture)
{
	if (!this.bars[name])
		return;

	this.bars[name].setTexture(texture);
}
BarsSet.prototype.setTint = function(name, color)
{
	if (!this.bars[name])
		return;
	
	this.bars[name].setTint(color);
}

BarsSet.prototype.setData = function(name, data, texture, max, tint = "#000000")
{
	if (name in this.bars)
		this.bars[name].setData(data, max, texture, tint);
	else
	{
		this.bars[name] = this._newBars(name, data, max, texture, tint);
		this._updateGaps();
	}
}

BarsSet.prototype.removeData = function(name)
{
	if (!(name in this.bars))
		return;

	this.bars[name].destroy();
	delete this.bars[name];
	this._updateGaps();
}

BarsSet.prototype._newBars = function(name, data, max, texture, tint)
{
	let gap = Object.keys(this.bars).length + 1;
	let off = (gap - 1) / gap;
	if (off == 0) off = .5;

	let newBars = new Bars(name, data, max, texture, tint, this.width, this.height, gap, off);
	newBars.setCallbacks(this.barPick_clb, this.barUnpick_clb, this.callbacksScope);
	this.root.add(newBars.root);

	if (Number(name.split("_")[0]) == this.active)
		newBars.setBrightness(.25);
	return newBars;
}

BarsSet.prototype._updateGaps = function()
{
	let gap = Object.keys(this.bars).length;
	let id = 0;
	
	for (let i in this.bars)
	{
		this.bars[i].gap.set(gap);
		let off = (id + 1) / (gap + 1);
		this.bars[i].offset.set(off);
		id++;
	}
}

BarsSet.prototype.destroy = function()
{
	for (let i in this.bars)
		this.bars[i].destroy();

	this.bars = {};
}

function Bars(name, data, max, texture, tint, width, height, gap = 1., offset = .5)
{
	this.bars = [];
	this.max = max;
	this.texture = texture;
	this.name = name;
	
	this.updateMeshes = function()
	{
		let gap = this.gap.value;
		let width = 1. / (this.bars.length * (gap + 1));

		for (let i = 0; i < this.bars.length; i++)
		{
			let offset = this.offset.value;
			this.bars[i].mesh.position.x = (i + offset) / this.bars.length;
			this.bars[i].mesh.scale.x = width;
		}
	}
	
	this.offset = new PropertySimple(offset, this.updateMeshes, this);
	this.gap = new PropertySimple(gap, this.updateMeshes, this);
	
	this.root = new THREE.Object3D();
	
	for (let i = 0; i < data.length; i++)
	{
		let bar = new Bar(name, i, texture, this.max, tint);
		bar.value.set(data[i]);
		this.root.add(bar.mesh);
		this.bars.push(bar);
	}

	this.root.scale.x = width;
	this.root.scale.y = height;
	this.updateMeshes();
}

Bars.prototype.setBrightness = function(brightness)
{
	for (let i in this.bars)
		this.bars[i].setBrightness(brightness);
}

Bars.prototype.setCallbacks = function(onPick, onUnpick, scope)
{
	for (let i in this.bars)
		this.bars[i].setCallbacks(onPick, onUnpick, scope);
}

Bars.prototype.setMax = function(max)
{
	this.max = max;
	for (let i = 0; i < this.bars.length; i++)
		this.bars[i].max.set(this.max);
}

Bars.prototype.setData = function(data, max, texture = 0)
{
	this.max = max;
	for (let i = 0; i < data.length; i++)
	{
		this.bars[i].value.set(data[i]);
		this.bars[i].max.set(this.max)
	}
}

Bars.prototype.setTexture = function(texture)
{
	for (let i = 0; i < this.bars.length; i++)
	{
		this.bars[i].setTexture(texture);
	}
}

Bars.prototype.setTint = function(tintColor)
{
	let color = new THREE.Color(tintColor);
	for (let i = 0; i < this.bars.length; i++)
	{
		this.bars[i].setTint(color);
	}
}

Bars.prototype.destroy = function()
{
	for (let i = 0; i < this.bars.length; i++)
		this.bars[i].value.set(0, .5, this.bars[i].destroy, this.bars[i]);
}

function Bar(name, id, texture, max, tint)
{
	this.name = name;
	this.id = this.id;

	this.name = name;
	this.id = id;
	this.updateMesh = function()
	{
		let v = this.value.value;
		let h = (v / this.max.value);
		this.mesh.scale.y = h;
		this.mesh.position.y = h * .5;
	}
	
	this.max = new PropertySimple(max, this.updateMesh, this);

	this.value = new PropertySimple(0, this.updateMesh, this);
	let barGeo = new THREE.BoxGeometry(1, 1, 0);
	let material = this._initShader(texture, tint);
	this.mesh = new THREE.Mesh( barGeo, material );
	this.mesh.bar = this;
	window.app.hoverableBars.push(this.mesh);
	
	this.updateMesh();

	window.addEventListener( 'resize', this.onResize.bind(this), false );
}

Bar.prototype.setCallbacks = function(onPick, onUnpick, scope)
{
	this.onPick = onPick;
	this.onUnpick = onUnpick;
	this.callbacksScope = scope;
}

Bar.prototype.setBrightness = function(brightness)
{
	this.mesh.material.uniforms.brightness.value = brightness;
}

Bar.prototype.setTexture = function(texture)
{
	this.mesh.material.uniforms.colorTexture.value = texture;
}
Bar.prototype.setTint = function(tint)
{
	this.mesh.material.uniforms.tintColor.value = tint;
}

Bar.prototype.pick = function()
{
	this.mesh.material.uniforms.glowIntencity.value = 2.;

	const text = document.createElement( 'div' );
	text.className = 'label';
	text.style.color = 'rgb(255, 255, 255)';
	text.textContent = this.value.values[1].toString();
	text.style.backgroundColor = '#000000';
	
	let label = new CSS2DObject( text );
	
	this.mesh.parent.add(label);
	label.position.copy(new THREE.Vector3(this.mesh.position.x, this.mesh.scale.y + .03, 0));
	this.hoverLabel = label;

	this.onPick.call(this.callbacksScope, this.name, this.id);
}

Bar.prototype.unpick = function()
{
	this.mesh.material.uniforms.glowIntencity.value = .75;
	this.mesh.parent.remove(this.hoverLabel);
	this.onUnpick.call(this.callbacksScope, this.name, this.id);
}

Bar.prototype.onResize = function()
{
	let ratio = window.innerHeight / window.innerWidth;
	this.mesh.material.uniforms.scale.value = new THREE.Vector2( 6.66, 6.66 * ratio);
}

Bar.prototype._initShader = function(texture, tint)
{
	let tintColor = new THREE.Color(tint);
	const vertShader = "\
		varying vec2 localPos;\
		varying vec2 vUv;\
		void main()\
			{\
				vec4 mvPosition = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
				localPos = mvPosition.xy;\
				vUv = uv;\
				gl_Position = mvPosition;\
			}";
	
	const fragShader = "\
	uniform float rotation;\
	uniform vec2 scale;\
	uniform float glowIntencity;\
	uniform float brightness;\
	uniform sampler2D colorTexture;\
	uniform vec3 tintColor;\
	varying vec2 localPos;\
	varying vec2 vUv;\
	void main()\
	{\
		float x = scale.x * localPos.x * cos(rotation) - scale.y * localPos.y * sin(rotation);\
		float y = scale.x * localPos.x * sin(rotation) + scale.y * localPos.y * cos(rotation);\
		vec2 tex = fract(vec2(x, y));\
		float shadow = 1. - pow(1. - vUv.x, 3.);\
		float glow = pow(vUv.y, 6.);\
		vec4 col = texture2D( colorTexture, tex );\
		vec4 tint = vec4(tintColor, 1.);\
		gl_FragColor = mix(col, tint, 1. - shadow) + glow * glowIntencity + brightness;\
	}\
	\
	"
	let ratio = window.innerHeight / window.innerWidth;
	const uniforms = {
		'brightness' : {value : .0},
		'glowIntencity' : { value: .75},
		'rotation': { value: 3.1416 * .15 },
		'scale': { value: new THREE.Vector2( 6.66, 6.66 * ratio) },
		'colorTexture': { value: texture },
		'tintColor' : {value: new THREE.Vector3(tintColor.r, tintColor.g, tintColor.b)}

	};
	
	const material = new THREE.ShaderMaterial( {

		uniforms: uniforms,
		vertexShader: vertShader,
		fragmentShader: fragShader

	} );
	
	return material;
}

Bar.prototype.destroy = function()
{
	this.mesh.geometry.dispose();
	this.mesh.material.dispose();
	this.mesh.removeFromParent();
}

export default BarsSet;