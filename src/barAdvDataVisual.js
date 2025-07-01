import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import * as Constants from './defaultVars.js'

export function AdvDataBar(root, props)
{
	/*
	let barGeo = new THREE.BoxGeometry(1, 1, 0);
	let material = this._initShader(props["texture"]);
	this.mesh = new THREE.Mesh( barGeo, material );

	let height = (props.q3 - props.q1) / props["max"];
	height *= Constants.defaultBarsHeight;
	let y = (props.q1 + props.q3) / props["max"] * .5 * Constants.defaultBarsHeight;
	this.mesh.position.copy(new THREE.Vector3(0, y, 0));
	
	this.mesh.scale.copy(new THREE.Vector3(1., height, .1));
	root.add(this.mesh);
*/
	let info = "min: " + props.min.toString() + "\nmax: " + props.max.toString();
	info += "\nSSD: " + Math.sqrt(props.variance).toFixed(1);
	info += "\nmean: " + props.mean.toFixed(1);
	info += "\nQ1: " + props.q1.toString() + "\nQ3: " + props.q3.toFixed(0);
	info += "\nmedian: " + props.median.toString() + "\nIQM: " + props.iqm.toFixed(0);

	const textEl = document.createElement( 'div' );
	textEl.className = 'label';
	textEl.style.color = 'rgb(255, 255, 255)';
	textEl.textContent = info;
	textEl.style.textAlign = 'right';
	textEl.style.width = "120px";
	textEl.style.whiteSpace = "pre-line";
	
	this.infoLabel = new CSS2DObject( textEl );
	this.infoLabel.center.copy(new THREE.Vector2(1, 1));
	this.infoLabel.position.copy(new THREE.Vector3(1.5, 0, 0));
	root.add(this.infoLabel);
}

AdvDataBar.prototype.makeLabel = function(text, position)
{
	const textEl = document.createElement( 'div' );
	textEl.className = 'label';
	textEl.style.color = 'rgb(255, 255, 255)';
	textEl.textContent = text;
	textEl.style.textAlign = 'right';
	textEl.style.borderBottom = '1px solid #FFFFFF';
	textEl.style.width = "80px";
	let label = new CSS2DObject( textEl );
	
	this.mesh.parent.add(label);
	label.position.copy(position);
	label.center.copy(new THREE.Vector2(1, 1));
	return label;
}

AdvDataBar.prototype.destroy = function()
{
	//this.mesh.removeFromParent();
	this.infoLabel.removeFromParent();
}

AdvDataBar.prototype._initShader = function(texture)
{
	const vertShader = "\
		varying vec2 localPos;\
		varying vec2 vUv;\
		void main()\
			{\
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\
				localPos = mvPosition.xy;\
				vUv = uv;\
				gl_Position = projectionMatrix * mvPosition;\
			}";
	
	const fragShader = "\
	uniform float rotation;\
	uniform vec2 scale;\
	uniform sampler2D colorTexture;\
	varying vec2 localPos;\
	varying vec2 vUv;\
	void main()\
	{\
		float x = localPos.x * cos(rotation) - localPos.y * sin(rotation);\
		float y = localPos.x * sin(rotation) + localPos.y * cos(rotation);\
		vec2 tex = fract(vec2(x, y) * scale);\
		gl_FragColor = texture2D( colorTexture, tex );\
	}\
	\
	"

	const uniforms = {
		'rotation': { value: 3.1416 * .15 },
		'scale': { value: new THREE.Vector2( .5, .5 ) },
		'colorTexture': { value: texture },

	};
	
	const material = new THREE.ShaderMaterial( {

		uniforms: uniforms,
		vertexShader: vertShader,
		fragmentShader: fragShader

	} );
	
	return material;
}