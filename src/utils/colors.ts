import { ColorResolvable } from "discord.js";

function rand_RGBInt() {
  return Math.floor(Math.random() * 256);
}
export function generateRandomColorResolvable(): ColorResolvable {
  return [rand_RGBInt(), rand_RGBInt(), rand_RGBInt()];
}
