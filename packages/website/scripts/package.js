const { packageZipToS3 } = require('@kgarsjo-com/packaging');
packageZipToS3({
    packageName: 'KgarsjoComWebsite',
    dirsToBundle: ['./build'],
});