import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

import {Application} from "./src/application.js"
import BarsMain from './src/barsMain.js'

document.addEventListener("DOMContentLoaded", main);



function main()
{
	window.app = new Application();
	let stats = new BarsMain(window.app.scene, 12, 4);
	return;
}
