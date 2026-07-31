import { logColor } from "./log-color"


export async function asyncDelay(millesconds: number = 0, verbose = false) {
  if( millesconds <= 0) return

  if(verbose) {
    logColor(`Delayng for ${millesconds / 1000}s`)
  }

  await new Promise(resolve => setTimeout(resolve, millesconds))
}