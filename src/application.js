import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

export function Application()
{
	const canvas = document.getElementById('container');
	const scene = new THREE.Scene();
	scene.background = new THREE.Color("#151515");
	const camera = new THREE.OrthographicCamera(-2, 20, 8, -8);
	//const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
	const renderer = new THREE.WebGLRenderer({ canvas: canvas});
	renderer.setSize( window.innerWidth, window.innerHeight );

	const labelRenderer = new CSS2DRenderer();
	labelRenderer.setSize( window.innerWidth, window.innerHeight );
	document.getElementById('labels').appendChild( labelRenderer.domElement );
	camera.position.z = 15;
	//camera.position.x = 7.5;

	let clock = new THREE.Clock(true);

	this.updates = [];

	let ratio = window.innerWidth / window.innerHeight;
	if (ratio < 1)
	{
		scene.rotateZ(-3.1416 * .5);
		scene.translateX(-7);
	}

	function update() {
		let dt = clock.getDelta();
		renderer.render( scene, camera );
		labelRenderer.render( scene, camera );
		for (let i in window.app.updates)
			window.app.updates[i].update(dt);
	}

	renderer.setAnimationLoop( update );
	this.scene = scene;
	this.activeCamera = camera;
	this.renderer = renderer;
	this.labelsRenderer = labelRenderer;

	this.hoveredBar = undefined;
	this.hoverableBars = [];

	window.addEventListener( 'resize', this.onResize.bind(this), false );
	window.addEventListener('mousemove', this.checkIntersections.bind(this), false);
}

Application.prototype.checkIntersections = function(e)
{
	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();

	// 20px and 150px are canvas paddings
	mouse.x = ((e.clientX - 20) / window.innerWidth) * 2 - 1;
	mouse.y = -((e.clientY - 150) / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(mouse, this.activeCamera);

	const intersects = raycaster.intersectObjects([this.barsRoot], true);
	if (intersects.length == 0)
	{
		if (!this.hoveredBar)
			return;

		this.hoveredBar.bar.unpick();
		this.hoveredBar = undefined;
		
		return;
	}

	if (intersects[0].object == this.hoveredBar)
		return;

	intersects[0].object.bar.pick();
	if(this.hoveredBar)
		this.hoveredBar.bar.unpick();
	this.hoveredBar = intersects[0].object;

}

Application.prototype.onResize = function()
{
	this.activeCamera.aspect = window.innerWidth / window.innerHeight;
	this.activeCamera.updateProjectionMatrix();
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	this.labelsRenderer.setSize( window.innerWidth, window.innerHeight );
}

Application.prototype.sickBastardEaster = function()
{
	this.scene.background = new THREE.TextureLoader().load("./public/textures/sick_bastard.jpg");
	this.scene.backgroundIntensity = .1;
}

Application.prototype.setEasterBack = function()
{
	this.scene.background = new THREE.TextureLoader().load("./public/textures/easter_back.jpg");
	this.scene.backgroundIntensity = .1;
}