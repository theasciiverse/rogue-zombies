import Being from "./being.js";


const CHARS = ["z", "Z"];
const COLORS = ["DarkOliveGreen", "LightSlateGray", "Olive", "OliveDrab", "SaddleBrown", "GoldenRod", "DarkSeaGreen"];

export default class Zombie extends Being {
	visual = {ch:CHARS.random(), fg:COLORS.random()};
}
