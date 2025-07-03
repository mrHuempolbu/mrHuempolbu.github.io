import {TextureLoader} from 'three';

const textureLoader = new TextureLoader();

const textureFiles = 
{
	"Beer" : "./public/textures/beer.jpg",
	"Spirits" : "./public/textures/spirits.jpg",
	"Piss" : "./public/textures/piss.jpg",
	"Shots" : "./public/textures/shots.jpg",
	"Wine" : "./public/textures/wine.jpg",

	"Chang" : "./public/textures/chang.jpg",
	"Leo" : "./public/textures/leo.jpg",
	"Singha" : "./public/textures/singha.png",
	"San Mig Light" : "./public/textures/SanMigLight.jpg",
	"Tiger" : "./public/textures/tiger.jpg",
	"San Miguel Blanca" : "./public/textures/blanca.jpg",
	"Heineken" : "./public/textures/heineken.jpg",
	"Heineken Zero" : "./public/textures/heineken0.jpg",
	"My beer" : "./public/textures/mybeer.jpg",

	"SangSom" : "./public/textures/sangsom.jpg",
	"Hong Thong" : "./public/textures/hongthong.jpg",
	"Absolut" : "./public/textures/absolut.jpg",
	"Gordon" : "./public/textures/gordon.jpg",
	"Red Label" : "./public/textures/redlabel.jpg",
	"Jameson" : "./public/textures/jameson.jpg",
	"Fireball" : "./public/textures/fireball.jpg",
	"Jack Daniels" : "./public/textures/jackdaniels.jpg",
	"Smirnoff" : "./public/textures/smirnoff.jpg",
	"Gilbeys" : "./public/textures/gilbeys.jpg",
	"Regency" : "./public/textures/regency.jpg",
	"Jagermeister" : "./public/textures/jagermeister.jpg",
	"Tequila" : "./public/textures/sierra.jpg",
	"Bombay" : "./public/textures/bombay.jpg",

	"Red Wine" : "./public/textures/redwine.jpg",
	"White Wine" : "./public/textures/whitewine.jpg",
	"Tequila Rose" : "./public/textures/tequilarose.jpg",
	"Sambuca" : "./public/textures/sambuca.jpg",
	"Malibu" : "./public/textures/malibu.jpg",
	"Spy" : "./public/textures/spy.jpg",
	"Smirnoff Ice" : "./public/textures/smirnoffice.jpg",
	"Bacardi" : "./public/textures/bacardi.jpg",
	"Baileys" : "./public/textures/baileys.jpg",
	"Full Moon" : "./public/textures/fullmoon.jpg",

	"Juice" : "./public/textures/juice.jpg",
	"Schweppes" : "./public/textures/schweppes.jpg",
	"Coke" : "./public/textures/coke.jpg",
	"Soda" : "./public/textures/soda.jpg",
	"Water" : "./public/textures/water.jpg",
	"Red Bull" : "./public/textures/redbull.jpg",

	"Money" : "./public/textures/money.jpg",
	"Barfines" : "./public/textures/barfines.jpg",
	"Ladydrinks" : "./public/textures/ladydrinks.jpg",
	"Ringabells" : "./public/textures/ringabells.jpg"
}

export const sellsTextures = 
{
	"Beer" : textureFiles["Beer"],
	"Shots" : textureFiles["Shots"],
	"Wine" : textureFiles["Wine"],
	"Piss" : textureFiles["Piss"],
	"Spirits" : textureFiles["Spirits"]
}

export const sepTexturePaths = 
{
	"Money" : textureFiles["Money"],
	"Barfines" : textureFiles["Barfines"],
	"Ladydrinks" : textureFiles["Ladydrinks"],
	"Ringabells" : textureFiles["Ringabells"]
}

const textures = {};
for (let i in textureFiles)
		textures[i] = textureLoader.load(textureFiles[i]);

export {textures};

export const tintColors = 
{
	"None" : "#000000",
	"Green" : "#00ff00",
	"Yellow" : "#ffff00",
	"Pink" : "#ff00ff",
	"Blue" : "#0000ff",
	"Red" : "#ff0000",
	"Shit" : "#665a2c",
	"Aqua" : "#00ffff"
}

export const defaultTint = tintColors["None"];
export const defaultSellsTexture = textures["Beer"];
export const defaultSample = "by hour";

let ratio = window.innerWidth / window.innerHeight;
export const isVertical = (ratio < 1);
export const defaultBarsWidth = (ratio >= 1) ? 12 : 8;
export const defaultBarsHeight = (ratio >= 1) ? 4 : 8;

export const hourNames = ["16", "17", "18", "19", "20", "21", "22", "23", "00", "01", "02"];
export const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const monthNames = ["November 2023", "December", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November 2024"];
export const seasonNames = ["highseason", "lowseason"];
export const dayShortNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const monthShortNames = ["Nov23", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov24"];


export const sampleDataLength = 
{
	"by hour" : 11,
	"by day" : 7,
	"by month" : 13,
	"by season" : 2
}
export const separateDataNames = ["Sells", "Money", "Ladydrinks", "Ringabells", "Barfines"];
export const beerNames = ["Chang", "Leo", "Singha", "San Mig Light", "San Miguel Blanca", "Heineken", "Heineken Zero", "My beer", "Tiger"];
export const spiritNames = ["SangSom", "Hong Thong", "Fireball", "Absolut", "Smirnoff", "Gilbeys", "Bombay", "Red Label", "Jameson", "Regency", "Jagermeister", "Gordon", "Jack Daniels", "Tequila"];
export const softNames = ["Red Wine", "White Wine", "Tequila Rose", "Sambuca", "Malibu", "Spy", "Smirnoff Ice", "Bacardi", "Baileys", "Full Moon", ];
export const nonAlcoNames = ["Juice", "Coke", "Schweppes", "Soda", "Water", "Red Bull"];
export const otherNames = ["Money", "Ladydrinks", "Ringabells", "Barfines"];