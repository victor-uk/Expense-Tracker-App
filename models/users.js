const { Schema, model } = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please provide name"],
        trim: true,
        maxLength: [15, "Name cannot exceed length"],
        minLength: [2, "Name must exceed length"]
    },
    email: {
        type: String,
        required: [true, "Please provide email"],
        trim: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i, "Invalid email address"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "I don't need to tell you to provide your password innit"],
    },
    income: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    categories: {
        type: [String],
        default: () => ["Groceries", "Leisure", "Electronics", "Utilities", "Health", "Uncategorised"]
    }
},{
    methods: {
        createJWT() {
            return jwt.sign({
                id: this._id, name: this.name
            // eslint-disable-next-line no-undef
            }, process.env.JWT_SECRET, {expiresIn: '1d'})
        },
    }

})

UserSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

module.exports = model("User", UserSchema)

//When you call User.create({...})
//this.password in the pre-save middleware references the password property of the in-memory document instance created from your input object. The document is not yet in the database, but it exists in memory and is accessible via this in the middleware.