import "./random.js";
import Level from "./level.js";
import * as metrics from "./metrics.js";


await metrics.init([45, 30]);

const { tileCount, tileSize } = metrics;
let renderer = new metrics.Renderer(tileCount, tileSize)
document.body.prepend(renderer.node);

let level = new Level({renderer, tileCount});
level.play();
