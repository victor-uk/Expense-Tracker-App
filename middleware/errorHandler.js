const { CustomApiError } = require("../error/custom-error")

const errorHandler = (err, req, res) => {
    console.error('Error handler called:', err);
    if (err instanceof CustomApiError) {
        return res.status(err.errCode).json({ msg: err.message })
    }
    res.status(500).json({ msg: err.message || 'Something went wrong' })
}

module.exports = errorHandler