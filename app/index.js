import { me as device } from "device";
import document from "document";
import clock from "clock";
import { readFileSync } from "fs";

clock.granularity = 'seconds';
console.log('hello from app');

const eTime = document.getElementById("time");
const eGraph = document.getElementById("graph");

const TIME_PERIOD = 30;
const NUM_TIME_PERIODS = 24;

const firstTime = new Date();
firstTime.setHours(7);
firstTime.setMinutes(0);

const lastTime = new Date();
lastTime.setHours(18);
lastTime.setMinutes(30);

console.log("FIRST TIME " + firstTime);
console.log("LAST TIME " + lastTime);

function zpad(n) {
  return ("0" + n).slice(-2);
}

function getMaskForTime(d) {
  return document.getElementById("mask-" + zpad(d.getHours()) + zpad(d.getMinutes()))
}

function initializeGraph() {
  // Evenly distribute the time-period masks across the width of the graph.
  let mWidth = Math.floor(device.screen.width / NUM_TIME_PERIODS);
  let gWidth = mWidth * NUM_TIME_PERIODS;
  eGraph.x = Math.ceil((device.screen.width - gWidth) / 2);
  eGraph.width = gWidth
  let d = new Date(firstTime);
  let x = 0;
  while (d <= lastTime) {
    const e = getMaskForTime(d);
    e.x = x;
    e.width = mWidth;
    x += mWidth;
    let [p10, p90] = getForecast(d);
    console.log("  FORECAST " + zpad(d.getHours()) + zpad(d.getMinutes()) + " = " + p10 + " - " + p90)
    e.y = Math.floor(eGraph.height * (1 - p90))
    e.height = Math.floor(eGraph.height - Math.floor(eGraph.height * p10) - e.y);
    d.setMinutes(d.getMinutes() + TIME_PERIOD);
  }
}


let forecasts = readFileSync("/mnt/assets/resources/forecasts.json", "json")["forecasts"];
function getForecast(d) {
  let m = d.getMinutes();
  m += d.getHours() * 60;
  let n = (m - (7 * 60)) / 30;
  n = n % forecasts.length;
  return [
    forecasts[n].pv_estimate10 / 5.0,
    forecasts[n].pv_estimate90 / 5.0,
  ];
}

initializeGraph()

clock.ontick = function (evt) {
  eTime.text = ("0" + evt.date.getHours()).slice(-2) + ":" +
    ("0" + evt.date.getMinutes()).slice(-2);
};