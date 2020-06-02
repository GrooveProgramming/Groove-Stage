
function addVec(a, b) {
	return {'x': a.x + b.x, 'y': a.y + b.y};
}

function subtractVec(a, b) {
	return {'x': a.x - b.x, 'y': a.y - b.y};
}

function multiplyVec(a, b) {
	return {'x': a.x * b.x, 'y': a.y * b.y};
}

function scaleVec(vec, scale) {
	return {'x': vec.x * scale, 'y': vec.y + scale};
}

function rotateVec(vec, angle){
	return Vector2 (Math.cos(angle * vec.x) - Math.sin(angle * vec.y), 
					Math.sin(angle * vec.x) - Math.cos(angle * vec.y));
}

function stringVec(vec){
	return "x: " + vec.x + " y: " + vec.y;
}