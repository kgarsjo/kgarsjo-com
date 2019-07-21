#!/usr/bin/env node
import * as yargs from 'yargs';
import packageZipToS3 from './packageZipToS3';

const getArgvAsArray = (argvValue: any = []): string[] => (
    Array.isArray(argvValue) ? argvValue as string[] : [argvValue as string]
);

yargs.command(
    'write',
    'Package files to s3', 
    (y) => y
        .alias('n', 'name')
        .alias('d','directory')
        .alias('r','root'),
    (argv) => {
        packageZipToS3({
            packageName: argv.name as string,
            dirsToBundle: getArgvAsArray(argv.directory),
            rootsToBundle: getArgvAsArray(argv.root),
        }).catch(console.error);
    }
).help()
.demandCommand();

yargs.parse();