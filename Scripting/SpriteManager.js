
/* label represents the user choosen title of the sprte
 * id represents a permenant number used as an id, a parameter in the sprite and the index in the sprites array.
 * image represents the index of the used costume in the assets array
 * position is a standard vector2 but is only intagers (pixels)
 * scale (in %) is pretty mutch the same as size in Scratch but you can strech it.
 * rotation is in degrees like Scratch where 90 is normal and 0 is the image rotated 90 anti-clockwise.
 * effects are currently unused but could be used to store things like blur.
  * isgizmo is if it is a gizmo like the camera or a sprite without a costume. These don't scale and are hidden in play mode.
 */

//Responsable for storing where all the costumes are located.
imagePaths = new Array();
sprites = new Array();

// Sprite references are [in scene, li, thumbnail]
spriteInstances = new Array();

// The sprites you have clicked on. You can select multiple sprites at a time.
selectedSprites = new Array();

var spriteList;
var stage;
var stageWrapper;

var playing = false;

// This is the camera the user uses when they are in the game. It can move rotate and zoom allowing for easy scrolling and cinamatics. It is controlled by a script.
var gameCamera = {
		"position": {"x": 0, "y": 0},
		"viewport": undefined,
		"scale": 1,
		"rotation": 90
};

// Different camera allows user to look further than the starting camera position.
var sceneCamera = {
		"position": {"x": 500, "y": 0},
		"viewport": undefined,
		"scale": 2,
		"rotation": 90
};
// Current camera
var camera;

// resize stage and set data when window resized or opened.
function sizeStage() {
	
	stage = document.getElementById("stage")
	stageWrapper = document.getElementById("stageWrapper");

	var targetHeight = stageWrapper.offsetHeight;

	stage.style.height = targetHeight + "px";
	
	gameCamera.viewport = {"x": stageWrapper.offsetWidth, "y": stageWrapper.offsetHeight};
	sceneCamera.viewport = {"x": stageWrapper.offsetWidth, "y": stageWrapper.offsetHeight};
}

// add event listeners for the size of the stage
window.addEventListener("resize", sizeStage);

document.addEventListener("click", function(event){
        var targetElement = event.target || event.srcElement;
        console.log(targetElement.tagName.toLowerCase());
});

// TODO: Rewrite the function so it gets images from paint editor and loads from save.
function loadImages() {
	
	// create image list to load prototype images
	imagePaths[0] = "SampleCostumes/duck.png";
	imagePaths[1] = "SampleCostumes/goat.png";
	imagePaths[2] = "SampleCostumes/grass.png";
}

//Function for easily adding a new sprite. All paramaters are optional.
function newSpriteProperties(image, label, position, scale, rotation, effects, isgizmo) {
	id = sprites.indexOf(undefined);
	if(id == -1) { id = sprites.length; }
	
	sprites[id] = {
			"label": label || "Sprite " + (id + 1),
			"id": id,
			"image": image || -1,
			"position": position || {"x": 0, "y": 0},
			"scale": scale || {"x": 1, "y": 1},
			"rotation": rotation || 90,
			"effects": effects || {},
			"isgizmo": isgizmo || false
	};
	return id;
}

// TODO: Rewrite the function so it loads paramaters from save.
// Create some defualt sprites.
function getSprites(){
	newSpriteProperties(1);
	newSpriteProperties(2);
	newSpriteProperties(1);
	
	sprites[1].scale.x = .4;
	sprites[1].scale.y = .4;
	sprites[1].position.y = -200;
	sprites[0].position.x = 500;
}

function newSprite(){
	var id = newSpriteProperties();
	displayItem(sprites[id],id);
}

function removeSprite(id) {
	
	// Remove sprite from stage
	stage.removeChild(spriteInstances[id][0])
	
	// Remove sprite from sprite list
	spriteList.removeChild(spriteInstances[id][1]);
	
	// Remove sprite from array
	sprites[id] = undefined;
};

function displayItem(sprite, index){
	
	function createDeleteButton(sprite) {
		var deleteButton = document.createElement("SPAN");
		deleteButton.classList.add("closeBtn");
		
		var closeText = document.createTextNode("\xD7");
		deleteButton.appendChild(closeText);
		listItemContainer.appendChild(deleteButton);
		
		deleteButton.onclick = function() {removeSprite(sprite.id)}
	}
	
	function createThumbnail(sprite) {
		// Create an image for the thumbnail
		var thumbnail = document.createElement("IMG");
		
		// If the sprite has no thumbnail, display an error, otherwise display the thumbnail.
		if(sprite.image == -1) {
			thumbnail.src = "Icons/ThumbnailNotFound.svg";
			thumbnail.alt = "Thumbnail for "+sprite.label+" not found";
		} else {
			thumbnail.src = imagePaths[sprite.image];
			thumbnail.alt = "Thumbnail for "+sprite.label;
		}
		// Add the thumbnail to the list item.
		listItemContainer.appendChild(thumbnail);
		
		return thumbnail;
	}
	
	function createLabel(sprite) {
		// Create a label showing the sprites name
		var label = document.createTextNode(sprite.label);
		listItemContainer.appendChild(label);
	}
	
	// Creates the sprite on the stage
	function createStageSprite(sprite) {
		// Create an image for the sprite
		var image = document.createElement("IMG");
		
		// If the sprite has no thumbnail, display an error, otherwise display the thumbnail.
		if(sprite.image == -1) {
			image.src = "Icons/ThumbnailNotFound.svg";
			image.alt = sprite.label;
		} else {
			image.src = imagePaths[sprite.image];
			image.alt = sprite.label;
		}
		image.classList.add("sprite");
		// Add the thumbnail to the list item.
		stage.appendChild(image);
		
		return image;
	}
	
	// If there is no sprite then exit early
	if (!sprite){
		spriteInstances[index] = undefined;
		return;
	}
	
	// Create list item
	var listItem = document.createElement("LI");
	var listItemContainer = document.createElement("DIV");
	createDeleteButton(sprite);
	spriteInstances[index] = [createStageSprite(sprite),
			listItem,
			createThumbnail(sprite)];
	createLabel(sprite);
	listItemContainer.classList.add("listItemContainer");
	listItem.appendChild(listItemContainer);
	// Add the list item to the list.
	spriteList.appendChild(listItem);
}

function displaySpriteList(){
	loadImages();
	getSprites();
	
	// Create a list for the sprites
	spriteList = document.createElement("UL");
	sprites.forEach(displayItem);
	
	// Add the sprite list to the right place.
	document.getElementById("spriteList").appendChild(spriteList);
}

function renderAllSprites() {
	function renderSprite(sprite){
		var instance = spriteInstances[sprite.id][0];
		
		var targetSize = {
			"x": (instance.naturalWidth * sprite.scale.x) / camera.scale,
			"y": (instance.naturalHeight * sprite.scale.y) / camera.scale
		};
		
		var targetPosition = {
			"x": (sprite.position.x - camera.position.x) / camera.scale + camera.viewport.x / 2,
			"y": (sprite.position.y - camera.position.y) / camera.scale + camera.viewport.y / 2
		};
		console.log(targetSize);
		
		instance.style.width = targetSize.x + "px";
		instance.style.height = targetSize.y + "px";
		
		instance.style.left = targetPosition.x + "px";
		instance.style.bottom = targetPosition.y + "px";
	}
	if(playing){
		camera = gameCamera;
	}else{
		camera = sceneCamera;
	}
	
	sprites.forEach(renderSprite);
}