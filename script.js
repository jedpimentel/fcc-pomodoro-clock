var DEFAULT_WORK_MINS = 25;
var DEFAULT_BREAK_MINS = 05;
var SEGMENT_LIMIT = 99;

var timerTime = DEFAULT_WORK_MINS * 60;

var clock = {}
clock.time = DEFAULT_WORK_MINS * 60;
document.addEventListener("DOMContentLoaded", function(event) {
	clock.work    = new SegmentCounter( "work-time", DEFAULT_WORK_MINS , 'i', 'k'),
	clock.break   = new SegmentCounter("break-time", DEFAULT_BREAK_MINS, 'o', 'l'),
	clock.screen  = document.getElementById("time-left");
	clock.state   = document.getElementById("time-state");
	clock.tick    = 'stopped' //states: 'stopped', 'running', 'paused' 
	clock.segment = "work";
	
	updateSegmentState();
	
	button[7] = screenTick;
	button[' '] = start;  //space
	button[String.fromCharCode(13)] = stop;//enter button
	
	updateScreen();
});

function updateScreen() {
	var time = clock.time;
	var minutes = Math.floor(time/60);
	var seconds = time % 60;
	clock.screen.innerHTML = intNumDigits(minutes, 2) + ':' + intNumDigits(seconds, 2);
}

function screenTick() {
	clock.time--;
	if (clock.time == 0) {
		playHorn(clipHorn);
	}
	if (clock.time <  0) {
		switchSegment();
	}
	updateScreen();
	click('very-low');
}

var tickdown = false;
function start() {
	click();
	if (!tickdown) {
		clock.tick = 'running';
		tickdown = setInterval(screenTick, 1000);
	} else {
		clock.tick = 'paused';
		pause();
	}
	updateSegmentState();
}

function pause() {
	clearTimeout(tickdown);
	tickdown = false;
	clock.tick = 'paused';
	updateSegmentState();
}

function stop() {
	click()
	pause()
	clock.segment = 'work';
	clock.tick = 'stopped';
	clock.time = clock.work.minutes * 60;
	updateScreen();
	updateSegmentState();
}

function switchSegment() {
	if (clock.segment === "work") {
		clock.segment = "break";
		clock.time = clock.break.minutes * 60;
	} else {
		clock.segment = 'work';
		clock.time = clock.work.minutes * 60;
	}
	updateSegmentState();
}

function updateSegmentState() {
	var message = clock.segment.toUpperCase();
	if (clock.tick == "paused") {
		message += ' = PAUSED ='
	} else if (clock.tick == "stopped") {
		message += ' = STOPPED ='
	} else {
		message += ' TIME!!!'
	}
	clock.state.innerHTML = message;
}

// there will be two segment counters (work/break), time is integer minutes
// DOM element will be connected exlusively to this object
function SegmentCounter(id, minutes, plusChar, minusChar) {
	
	var element = document.getElementById(id);
	this.minutes = minutes;
	element.innerHTML = intNumDigits(minutes, 2);
	
	var segment = this;
	function minutesPlus(minsToAdd) {
		var newMinutes = segment.minutes + minsToAdd;
		if(1 <= newMinutes && newMinutes <= SEGMENT_LIMIT) {
			click('low');
			segment.minutes = newMinutes;
			element.innerHTML = intNumDigits(newMinutes, 2)
		}
		if (clock.tick === 'stopped') {
			stop(); //stop() will update the internal clock.time value
			click('low');//overrides the click() inside stop()
			updateScreen(); //will send clock.time to HTML
		}
	}
	
	this.minUp   = function() {minutesPlus(+1)};
	this.minDown = function() {minutesPlus(-1)};
	
	//this is for the "key handler"
	button[plusChar]  = this.minUp;
	button[minusChar] = this.minDown;
}

// K E Y   P R E S S   H A N D L E R (generic "key handler")
// add function to 'button.keyboardChar' to have it handled
// to be replaced with visual interface
var button = {}
document.addEventListener("keypress", function(event) {
	var keyChar = String.fromCharCode(event.which);
	//console.log(keyChar);
	if (button[keyChar]) {
		button[keyChar]()
	}
});

//converts int num to number string with zero padding
function intNumDigits(intNum, digitCount) {
	var digits = intNum.toString();
	if (digits.length > digitCount) {
		return intNum;
	}
	return '0'.repeat(digitCount-digits.length) + digits;
}

var clipHorn  = new Audio('air horn.mp3');
function playHorn() {
	if (clock.segment === 'break') {
		setTimeout(function(){
			clipHorn.currentTime = 0;
			clipHorn.play();
			}, 450);
	}
  clipHorn.play();
}

var clipClick = new Audio('click.mp3');
function click() {
	console.log(arguments[0]);
	if (arguments[0] === 'low') {
		clipClick.volume = 0.20;
	} else if (arguments[0] === 'very-low') {
		clipClick.volume = 0.005;
	} else {
		clipClick.volume = 1.00;
	}
	console.log(clipClick.volume);
	clipClick.currentTime = 0;
	clipClick.play();
}

