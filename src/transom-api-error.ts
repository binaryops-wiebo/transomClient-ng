export class TransomApiError {
    constructor(
        public httpStatusCode: number,
        public errorCode: string,
        public errorText: string
    ) {

    }
}