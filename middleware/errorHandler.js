const { CustomApiError } = require("../error/custom-error")

const errorHandler = (err, req, res, next) => {
    console.error('Error handler called:', err);
    
    // Handle CustomApiError instances
    if (err instanceof CustomApiError) {
        return res.status(err.errCode).json({ error: err.message })
    }
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message).join(', ')
        return res.status(400).json({ error: messages })
    }
    
    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]
        return res.status(400).json({ error: `${field} already exists` })
    }
    
    // Handle Mongoose cast errors (invalid ObjectId, etc.)
    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid data format' })
    }
    
    // Default error response
    res.status(500).json({ error: err.message || 'Something went wrong' })
}

module.exports = errorHandler