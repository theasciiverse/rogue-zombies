import "./prototype.js";
import Level from "./level.js";
import * as metrics from "./metrics.js";
import * as sfx from "./sfx.js";


await metrics.init([45, 30]);
sfx.init();

let renderer = new metrics.Renderer();
document.querySelector("main").prepend(renderer.node);

const { tileCount } = metrics;
let level = new Level({renderer, tileCount});
level.play();
