const fs = require('fs');
const moment = require('moment');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

class Rps {

  constructor(opts) {
    this._opts = opts;
    let columns = this._opts.columns.split(",");
    this._startIndex = columns[0];
    this._endIndex = columns[1];
  }

  async process() {
    let data = await readFile(this._opts.file);
    await this.processFile(data);
  }

  async processFile(data) {
    let fileContent = data.toString();

    let startDt = [];
    let endDt = [];
    let line = 0;
    fileContent.split(this._opts.line).forEach((row) => {
      if (this._opts.test && line >= 10) return;
      if (this._opts.skipFirstLine && line == 0) {
        line++;
        return;
      }

      row = row.trim();
      if (!row) return;

      let parts = row.split(this._opts.delimiter);

      if (parts.length <= this._startIndex || parts.length <= this._endIndex) {
        throw new Error(`Invalid columns. Max columns is ${parts.length}`);
      }

      startDt.push(moment(parts[this._startIndex], this._opts.format));
      endDt.push(moment(parts[this._endIndex], this._opts.format));

      if (this._opts.test) {
        if (line > 10) return;
        console.log("Line #%i: '%s' -> %s - '%s' -> %s", line + 1, parts[this._startIndex], startDt[startDt.length - 1].toISOString(), parts[this._endIndex], endDt[endDt.length - 1].toISOString());
      }

      line++;
    });

    if (this._opts.test) return;

    startDt.sort();
    endDt.sort();

    // startDt.forEach((dt) => console.log(dt.toISOString()));
    // endDt.forEach((dt) => console.log(dt.toISOString()));

    let maxDt = endDt[endDt.length - 1];

    let rps = 0;
    let startIndex = 0;
    let endIndex = 0;
    let now = moment(startDt[0]).subtract(startDt[0].millisecond(), "ms");
    let count = 0;
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    do {
      while (startIndex < startDt.length && startDt[startIndex].isSameOrBefore(now)) {
        rps++;
        startIndex++;
      }
      while (endIndex < endDt.length && endDt[endIndex].isSameOrBefore(now)) {
        rps--;
        endIndex++;
      }

      if (this._opts.verbose) {
        console.log("%s - %i req/s", now.toISOString(), rps);
      }

      if (min > rps) min = rps;
      if (max < rps) max = rps;

      sum += rps;
      count++;
      now = now.add(1, "second");
    } while (now.isBefore(maxDt));

    console.log("Stats: Min: %i req/s, Max: %i req/s, Avg: %f req/s", min, max, sum/count);

  }

}

module.exports = Rps;