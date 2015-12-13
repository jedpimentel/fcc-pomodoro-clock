/* N E V E R   F O R G E T T I ,   M O M'S   S P A G E T T I */
/* 
	TO DO:
		replace the the 'break' in 'clock-break' with onother name
*/

var DEFAULT_WORK_MINS = 25;
var DEFAULT_BREAK_MINS = 05;
var SEGMENT_LIMIT = 99;

var timerTime = DEFAULT_WORK_MINS * 60;

var START_BUTTON_INITIAL = 'START'; // clock.tick = "stopped"
var START_BUTTON_UNPAUSED = 'PAUSE' // clock.tick = "tunning"
var START_BUTTON_PAUSED = 'START'; //c lock.tick = "stopped"
// I used "START" again, instead of "CONTINUE" since it would've messed up the monospace style.

var clock = {}
clock.time = DEFAULT_WORK_MINS * 60;
document.addEventListener("DOMContentLoaded", function(event) {
	clock.work    = new SegmentCounter( "work-time", DEFAULT_WORK_MINS , 'i', 'k'),
	clock.break   = new SegmentCounter("break-time", DEFAULT_BREAK_MINS, 'o', 'l'),
	clock.screen  = document.getElementById("timer-time");
	clock.state   = document.getElementById("timer-start");
	clock.tick    = 'stopped' //states: 'stopped', 'running', 'paused' 
	clock.segment = "work"; //states: 'work', 'break'
	
	updateSegmentState();
	
	button[7] = screenTick;
	button[' '] = start;  //space
	button[String.fromCharCode(13)] = stop;//enter button
	
	updateScreen();
	
	
	/* CLICK HANDLERS START */
	function setClickEvent(id, f) {
		var target = document.getElementById(id);
		target.addEventListener("click", f);
	}
	setClickEvent(    "work-up", clock.work.minUp);
	setClickEvent(  "work-down", clock.work.minDown);
	setClickEvent(   "break-up", clock.break.minUp);
	setClickEvent( "break-down", clock.break.minDown);
	setClickEvent("timer-reset", stop);
	setClickEvent("timer-start", start);
	/* CLICK HANDLERS END */
	
	/* MOUSEWHEEL HANDLERS START */
	function setScrollEvent(id, scrollUpFunction, scrollDownFunction) {
		var target = document.getElementById(id);
		target.addEventListener("mousewheel", function(event) {
			if (event.deltaY < 0) { scrollUpFunction(); }
			if (event.deltaY > 0) { scrollDownFunction(); }
		});
		
	}
	setScrollEvent( "work-counter", clock.work.minUp , clock.work.minDown);
	setScrollEvent("break-counter", clock.break.minUp, clock.break.minDown);
	
	
	
	
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
	//var message = clock.segment.toUpperCase();
	var message = '';
	if (clock.tick == "paused") {
		// counter was paused aftert running
		message = START_BUTTON_PAUSED;
	} else if (clock.tick == "stopped") {
		// counter was reset or hasn't started yet
		message = START_BUTTON_INITIAL
	} else {
		// counter is running
		message = START_BUTTON_UNPAUSED;
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
	var padding = "";
	var zeros = digitCount-digits.length;
	while (0 < zeros--) {
		padding += "0";
	}
	return padding + digits;
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
	//console.log(arguments[0]);
	if (arguments[0] === 'low') {
		clipClick.volume = 0.20;
	} else if (arguments[0] === 'very-low') {
		clipClick.volume = 0.005;
	} else {
		clipClick.volume = 1.00;
	}
	//console.log(clipClick.volume);
	clipClick.currentTime = 0;
	clipClick.play();
}

