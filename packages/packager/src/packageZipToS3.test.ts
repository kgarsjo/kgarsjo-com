import * as childProcess from 'child_process';
import * as fs from 'fs';

describe('packageZipToS3', () => {
    const packageName = 'MyPackage';
    const zipBuffer = Buffer.alloc(0);

    const mockAddLocalFile = jest.fn();
    const mockAddLocalFolder = jest.fn();
    const mockDescribeStacks = jest.fn();
    const mockPutObject = jest.fn();
    const mockToBuffer = jest.fn();

    let packageZipToS3: (...any: any) => Promise<any>;

    beforeEach(() => jest.mock('adm-zip', () => class {
        addLocalFile(...args: any) { return mockAddLocalFile(...args); }
        addLocalFolder(...args: any) { return mockAddLocalFolder(...args); }
        toBuffer(...args: any) { return mockToBuffer(...args); }
    }));

    beforeEach(() => jest.mock('aws-sdk', () => ({
        CloudFormation: class {
            describeStacks(...args: any) { return mockDescribeStacks(...args); }
        },
        S3: class {
            putObject(...args: any) { return mockPutObject(...args); }
        },
    })));

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'info').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    beforeEach(() => jest.spyOn(Date, 'now').mockReturnValue(1563747918398));

    beforeEach(() => {
        packageZipToS3 = require('./packageZipToS3').default;
    });

    afterEach(() => jest.restoreAllMocks());

    describe('when fails fetching build output bucket name', () => {
        beforeEach(() => mockDescribeStacks.mockReturnValue({
            promise: jest.fn().mockRejectedValue('Failed to fetch'),
        }));

        it('should reject with the error message', async () => {
            const error = await packageZipToS3({ packageName }).catch((e: Error) => e) as Error;
            expect(error).toEqual('Failed to fetch');
        });
    });

    describe('when succeeds fetching build output bucket name', () => {
        beforeEach(() => mockDescribeStacks.mockReturnValue({
            promise: jest.fn().mockResolvedValue({
                Stacks: [
                    {
                        Outputs: [
                            {
                                OutputKey: 'BuildOutputBucketName',
                                OutputValue: 'MyOutputBucketName',
                            }
                        ]
                    }
                ]
            }),
        }));

        describe('when bundling via adm-zip fails', () => {
            beforeEach(() => mockToBuffer.mockImplementation(() => {
                throw new Error('Failed to zip');
            }));
    
            it('should reject with the error message', async () => {
                const error = await packageZipToS3({ packageName }).catch((e: Error) => e) as Error;
                expect(error.message).toEqual('Failed to zip');
            });
        });

        describe('when bundling via adm-zip succeeds', () => {
            beforeEach(() => mockToBuffer.mockReturnValue(zipBuffer));

            describe('when uploading bundle to S3 fails', () => {
                beforeEach(() => mockPutObject.mockReturnValue({
                    promise: jest.fn().mockRejectedValue('Failed to upload'),
                }));

                it('should reject with the error message', async () => {
                    const error = await packageZipToS3({ packageName }).catch((e: Error) => e) as Error;
                    expect(error).toEqual('Failed to upload');
                });
            });
    
            describe('when uploading bundle to S3 succeeds', () => {
                beforeEach(() => mockPutObject.mockReturnValue({
                    promise: jest.fn().mockReturnValue(Promise.resolve()),
                }));

                describe('when writing manifest fails', () => {
                    beforeEach(() => jest.spyOn(childProcess, 'execSync').mockImplementation(() => {
                        throw new Error('ExecSync failed');
                    }));

                    it('should reject with the error message', async () => {
                        const error = await packageZipToS3({ packageName }).catch((e: Error) => e) as Error;
                        expect(error.message).toEqual('ExecSync failed');
                    });
                });

                describe('when writing manifest succeeds', () => {
                    beforeEach(() => jest.spyOn(childProcess, 'execSync').mockImplementation(() => Buffer.alloc(0)));
                    beforeEach(() => jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {}));
                    beforeEach(async () => await packageZipToS3({
                        packageName,
                        dirsToBundle: ['foo', 'bar'],
                        filesToBundle: ['baz.txt', 'quux.md'],
                        rootsToBundle: ['quop', 'blep'],
                    }));

                    it('should add the correct files and folders to the zip', () => {
                        expect(mockAddLocalFolder).toHaveBeenCalledWith('foo', 'foo');
                        expect(mockAddLocalFolder).toHaveBeenCalledWith('bar', 'bar');
                        expect(mockAddLocalFile).toHaveBeenCalledWith('baz.txt');
                        expect(mockAddLocalFile).toHaveBeenCalledWith('quux.md');
                        expect(mockAddLocalFolder).toHaveBeenCalledWith('quop');
                        expect(mockAddLocalFolder).toHaveBeenCalledWith('blep');
                    });

                    it('should upload the zip to the correct S3 bucket and key', () => {
                        expect(mockPutObject).toHaveBeenCalledWith({
                            Body: zipBuffer,
                            Bucket: 'MyOutputBucketName',
                            Key: 'MyPackage/1563747918398.zip',
                        })
                    });

                    it('should write a manifest to the correct directory', () => {
                        expect(childProcess.execSync).toHaveBeenCalledWith('mkdir -p package/');
                        expect(fs.writeFileSync).toHaveBeenCalledWith(
                            './package/manifest.json',
                            JSON.stringify(
                                { MyPackageBucketKey: 'MyPackage/1563747918398.zip' },
                                null,
                                2,
                            ),
                        )
                    });
                });
            });
        });
    });
});