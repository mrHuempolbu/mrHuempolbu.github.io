import * as THREE from 'three';

export function BarsScale(defaultScale, defaultPos, scene)
{
	this.currentScale = defaultScale;
	this.defaultPos = defaultPos;
	this.cornerDots = [];
	this.borderLines = [];

	for (let i = 0; i < 4; i++)
	{
		let x = i % 2;
		let y = (i - x) / 2;

		let dotMesh = this._makeGeometry([.15, .15], new THREE.Vector3(x, y, 0));
		scene.add(dotMesh);
		
		this.cornerDots.push(dotMesh);
	}
	for (let i = 0; i < 4; i++)
	{

	}
}

BarsScale.prototype._makeGeometry = function(size, position)
{
	let barGeo = new THREE.BoxGeometry(size[0], size[1], 0.);
	let material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent : true, opacity: .5 });
	let mesh = new THREE.Mesh(barGeo, material);
	mesh.position.copy(position);
	console.log(mesh);
	return mesh;
}