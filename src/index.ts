import "./prototype.js";
import Level from "./level.js";
import * as metrics from "./metrics.js";


await metrics.init([45, 30]);

let renderer = new metrics.Renderer();
document.querySelector("main").prepend(renderer.node);

const { tileCount } = metrics;
let level = new Level({renderer, tileCount});
level.play();
