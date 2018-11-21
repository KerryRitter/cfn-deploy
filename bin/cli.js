#!/usr/bin/env node
const yargs = require('yargs');
const updateNotifier = require('update-notifier');
const isInstalledGlobally = require('is-installed-globally');
const pckg = require('../package.json');
const lib = require('../index');
const defaultLogger = require('../libs/loggers/defaultLogger');


yargs
  .option('stackname', {
    describe: 'The name associated with the stack',
  })
  .option('template', {
    describe: 'Path to template file',
  })
  .option('parameters', {
    alias: 'params',
    describe: 'Path to parameter file or parameter string',
  })
  .array('parameters')
  .option('tags', {
    describe: 'Path to tags file or tags string',
  })
  .array('tags')
  .option('region', {
    describe: 'AWS region',
    default: 'us-east-1',
  })
  .option('capabilities', {
    describe: 'IAM capabilities',
  })
  .option('profile', {
    describe: 'Load profile from shared credentials file',
  })
  .option('accesskey', {
    describe: 'AWS Access Key',
  })
  .option('secretkey', {
    describe: 'AWS Secret Access Key',
  })
  .version(false) // Set custom version option to avoid "[boolean]" flag in help
  .option('version', {
    describe: 'Show version number',
  })
  .help(false) // Set custom help option to avoid "[boolean]" flag in help
  .option('help', {
    describe: 'Show help',
  });

// Show help and version manually
if (yargs.argv.version) {
  console.log(pckg.version);
  process.exit(); /* eslint-disable-line no-process-exit */
}
if (yargs.argv.help) {
  yargs.showHelp('log');
  process.exit(); /* eslint-disable-line no-process-exit */
}

// Make sure we have all we need
yargs.demandOption(['stackname', 'template']);

// Set update notifier
updateNotifier({
  pkg: pckg,
  updateCheckInterval: 0,
  // @ts-ignore (DefinitelyTyped is missing isGlobal setting)
  isGlobal: isInstalledGlobally,
}).notify();


// Call the library with cli arguments
const args = yargs.argv;
const events = lib(args);

// Start logger
defaultLogger(args, events);


// Exit process properly on error
let hasErrored = false;
events.on('ERROR', () => {
  hasErrored = true;
});

events.on('FINALLY', () => {
  if (hasErrored) {
    process.exit(1); /* eslint-disable-line no-process-exit */
  }
});
