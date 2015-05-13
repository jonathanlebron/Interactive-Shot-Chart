"use strict";

var scale = 7;
var padding = 8;
var games = document.getElementById("games");
var homeTeam, awayTeam;

// Setup KineticJS to handle drawing on canvas
var stage = new Kinetic.Stage({
	container: 'container',
    width: 658,
    height: 350
});

var layer = new Kinetic.Layer();

var text = new Kinetic.Text({
    x: stage.width()/2 - 80,
    y: 20,
    fontFamily: 'Helvetica Neue',
    fontSize: 14,
    text: '',
    fill: 'black',
});

var textBkgd = new Kinetic.Rect({
    x: 0,
    y: 0,
	width: 0,
	height: 0,
	fill: 'white',
	opacity: 0.8
});

// This function is called when a user selects a game from drop down
function showShotChart() {
 	homeTeam = games.options[games.selectedIndex].getAttribute("home");
	awayTeam = games.options[games.selectedIndex].getAttribute("away");
	layer.removeChildren();
	document.getElementById("awayTeam").innerHTML = "<h3>"+awayTeam+"</h3>";
	document.getElementById("homeTeam").innerHTML = "<h3>"+homeTeam+"</h3>";
	parseCSV();
}

// Get CSV file and use Papa.parse to get necessary data.
function parseCSV() {
	var file = "http://localhost:8000/data/" + games.value;
	Papa.parse(file, {
		download: true,
		header: true,
		dynamicTyping: true,
		complete: function(results) {
			parseData(results.data);
			display();
		}
	});
}

function drawText(info, team) {
	text.setText(info);

	var mousePos = stage.getPointerPosition();
	var x = mousePos.x + (team === homeTeam ? -100: 15);
	var y = mousePos.y + (mousePos.y > 50 ? -50 : 10);

	text.setX(x);
	text.setY(y);

	textBkgd.setX(text.getPosition().x - (padding/2));
	textBkgd.setY(text.getPosition().y - (padding/2));
	textBkgd.setWidth(text.getWidth() + padding);
	textBkgd.setHeight(text.getHeight() + padding);

	layer.draw();
}

// Iterate through data and draw each shot made/missed
function parseData(results) {
	for (var i = 0; i < results.length; i++) {
		var shot = results[i];
		var player = shot["player"];
		var result = shot["result"];
		var x = shot["y"];
		var y = shot["x"];
		var team = shot["team"];
		if (result && x && y) {
			var circle = new Kinetic.Circle({
				x: (team !== homeTeam ? x*scale : stage.getWidth() - x*scale),
				y: (team !== homeTeam ? y*scale : stage.getHeight() - y*scale),
				radius: 7,
				fill: (result === "made" ? "green" : "red"),
				stroke: "black",
				strokeWidth: 2,
			});
			circle.player = player;
			circle.result = result;
			circle.shotType = shot["type"];
			circle.shotTime = shot["time"];
			circle.shotDistance = shot["y"];
			circle.period = shot["period"];
			circle.team = team;
			circle.on('mouseover', function() {
				this.setRadius(9);
				textBkgd.show();
				drawText(
					this.player + "\n" +
					this.result + " " + this.shotType + "\nat " + this.shotTime + " in period " +
					this.period
				, this.team);
			});
			circle.on('mouseout', function() {
				this.setRadius(7);
				textBkgd.hide();
				drawText("");
			});
			layer.add(circle);
		}
	}
}

function display() {
	layer.add(textBkgd);
	layer.add(text);
	stage.add(layer);
}
