class CustomApiError extends Error {
    constructor(message, errorCode) {
        super(message)
        this.errCode = errorCode
    }
}

const createCustomError = (msg, errCode) => {
    return new CustomApiError(msg, errCode)
}

module.exports = {
    CustomApiError,
    createCustomError
}