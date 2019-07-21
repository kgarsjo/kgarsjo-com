import chalk from 'chalk';

const error = (...messages: string[]) => console.error(chalk.red(...messages));
const start = (...messages: string[]) => console.info(chalk.blue(...messages));
const complete = (...messages: string[]) => console.info(chalk.green(...messages));

interface CommonOperationProps {
    getStartMessage: (...args: any[]) => string,
    successMessage: string,
    errorMessage: string,
}

interface AsyncOperationProps<R> extends CommonOperationProps {
    operationFn: (...args: any[]) => Promise<R>,
}

interface OperationProps<R> extends CommonOperationProps {
    operationFn: (...args: any[]) => R,
}

export const describeAsyncOperation = <R>({
    getStartMessage,
    operationFn,
    successMessage,
    errorMessage,
}: AsyncOperationProps<R>) => async (...args: any[]): Promise<R> => {
    start(getStartMessage(...args));
    try {
        const result = await operationFn(...args);
        complete(successMessage);
        return result;
    } catch (e) {
        error(`${errorMessage} : ${e.message}`);
        throw e;
    }
};

export const describeOperation = <R>({
    operationFn,
    ...rest
}: OperationProps<R>) => describeAsyncOperation({
    ...rest,
    operationFn: (...args) => Promise.resolve(operationFn(...args)),
});