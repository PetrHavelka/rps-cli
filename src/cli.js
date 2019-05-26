const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const Rps = require('./rps');

const opt = [
  { name: 'help', alias: 'h', type: Boolean, description: "Prints this help" },
  { name: 'verbose', alias: 'v', type: Boolean, description: "Prints more information" },
  { name: 'test', alias: 't', type: Boolean, description: "Will print information about parsed first 10 lines" },
  { name: 'file', defaultOption: true, description: "Path to file to process" },
  { name: 'line', alias: 'l', defaultValue: '\n', description: "Line delimiter in file" },
  { name: 'delimiter', alias: 'd', defaultValue: ';', description: "Columns delimiter in file" },
  { name: 'columns', alias: 'c', defaultValue: '0,1', description: "Index of Start and End column. Use 2 column indexes separated by comma. Example: 3,4"},
  { name: 'format', alias: 'f', description: "Date format - see moment() documentation (https://momentjs.com/docs/#/parsing/string/)"},
  { name: 'skipFirstLine', alias: 's', type: Boolean, description: "Skip first line in file"},
];

const sections = [
  {
    header: 'RPS tool for calculation Request Per Second from log file.',
    content: 'It will load {italic file}. One line is one request. Line is split by {italic delimiter}. Start and end DateTime is parsed from specified {italic columns}. RPS is calculated.'
  },
  {
    header: 'Usage',
    content: '$ rps <file> [parameters]'
  },
  {
    header: 'Options',
    optionList: opt
  },
  {
    header: 'Examples',
    content: [
      {
        example: "rps file.csv -t",
        description: "Print first 10 line parsed to check if values are correctly loaded."
      },
      {
        example: "rps results-2019-05-24T08.17.17.521Z.csv -c 3,4 -f \"DD-MM-YYYY HH:mm:ss,SSS\" -s",
        description: "Calculate RPS from perf logs."
      }
    ]

  }
];

function checkOptions(options) {
  let unknown = options._unknown || [];
  if (unknown.length > 0) return false;
  if (!options.delimiter) return false;
  if (!options.file) return false;
  return true;
}

async function execute() {

  const options = commandLineArgs(opt, { partial: true });

  if (!checkOptions(options)) {
    if (!options.help) console.error("Invalid command: %O", options._unknown);
    const usage = commandLineUsage(sections);
    console.log(usage);
  } else {
    await new Rps(options).process();
  }
}

module.exports = execute;