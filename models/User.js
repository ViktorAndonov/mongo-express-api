const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 1512
    },
    ip_address: {
        type: String,
        min: 6,
        max: 15,
        data: {
            country_name: String,
            region_name: String,
            city: String,
            zip: String,
            time_zone: String,
        }
    },
    user_agent: {
        type: String
    },
    last_logins: {
        type: Date,
        ip_address: [
            {}, {}
        ]
    },
    registered_at: {
        type: Date,
        default: Date.now
    },
    verified_at: {
        type: Date,
    },
    verification_secret: {
        type: String,
        max: 256,
        expireAfterSeconds: 86400
    },
    edited_at: {
        type: Date
    },
    deleted_at: {
        type: Date
    }
});

module.exports = mongoose.model('User', UserSchema);