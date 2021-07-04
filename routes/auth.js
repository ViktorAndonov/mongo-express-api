const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const auth = require('../verifyToken');
const { registerValidation, loginValidation, updateValidation } = require('../validation');
const emailConfirmEmail = require('../emails/confirmEmail');
const emailAccountDeactivated = require('../emails/accountDeactivated');

// Email Transporter object (need to send email with nodemailer)
const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
});


// REGISTER
router.post('/register', async (req, res) => {
    // Validate data with Joi schemas
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Check if the user is already in the database
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send('Email already exists! Please login.');

    // Hash the password!
    const salt = 12;
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create verification secret for email conformation
    const verificationSecret = Math.random().toString(36).substr(2,10);

    // Get the user IP address
    const ip = req.ip;
    
    // Creating a new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        verification_secret: verificationSecret,
        ip_address: ip
    });
    try {
        const saveUser = await user.save();
        res.send(saveUser);
    } catch (err) {
        res.status(400).send(err);
    }

    // Send confirmation email to the user email with the verification token
    const verificationLink = process.env.APP_URL + '/api/user/confirm?verify=' + verificationSecret;

    const verificationEmail = {
        from: process.env.EMAIL,
        to: req.body.email,
        subject: 'Confirm your email address',
        // email markup - email folder
        html: emailConfirmEmail(req.body.name, verificationLink)
    };
    transporter.sendMail(verificationEmail, (error, info) => {
        if (error) {
            return console.log(error);
        }
        res.status(200).send({
            message: 'Verification email send!',
            message_id: info.messageId
        });
    });
});


// CONFIRM (verify) USER EMAIL
router.get('/confirm', async (req, res) => {

    // Check the DB for the verification code
    const checkSecret = await User.findOne({ verification_secret: req.query.verify });

    if (checkSecret) {
        // verify the user by setting verified_at date
        // "useFindAndModify: false" - fix for some b.s. about mongoose and mongo conflict.
        await User.findOneAndUpdate(
            { verification_secret: req.query.verify }, 
            { verified_at: Date.now(), verification_secret: null }, 
            { useFindAndModify: false }, 
            (err, res)=> {
                if (err) {
                    console.log(err);
                    console.log('Something went wrong while verifying the user.');
                } else {
                    console.log('Verification successful!');
                }
          });
        
        // send status "OK"
        return res.status(200).send(`<h1>Your email is verified, you can <a href="${process.env.APP_URL}/api/user/login">login now</a>.</h1>`);
    } else {
        return res.status(401).send('<h1>Something went wrong or your verification code is not correct. Try again latter.</h1>');
    }
});


// LOGIN
router.post('/login', async (req, res) => {

    // Validate data with Joi schemas
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Check if the email exist
    let user = await User.findOne({ email: req.body.email });
    if ( ! user ) return res.status(400).send('Email is not found.');

    // Check is password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if ( ! validPassword ) return res.status(400).send('Invalid password!');

    // Check if user has confirmed his email
    if ( ! user.verified_at ) return res.status(401).send('Please confirm your email. Confirmation link was emailed to you, <a href="#">click here</a> to resend the confirmation email.');

    // Check if user was soft deleted & re-activate his account
    let message = 'Login successful.';
    if ( user.deleted_at ) {
        user.deleted_at = undefined;
        user.save();

        message = 'Your account was re-activated.';
        console.log('Account re-activated.');
        
        // TODO: Send an email that the user's account was re-activated.
    }

    // Create and assign JWT token
    const token = jwt.sign({ 
        _id: user._id,
        name: user.name
    }, 
    process.env.TOKEN_SECRET, 
    { 
        expiresIn: '10m' 
    });
    
    res.header('auth-token', token).send({token, message});
    // ...redirect here to the app dashboard...
});


// EDIT USER / UPDATE
router.patch('/:userId', auth, async (req, res) => {
    // Validate data with Joi schemas
    const { error } = updateValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    // Create user object based on what is updated
    const user = {}
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) {
        // Hash the password!
        const salt = 12;
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        // Add it, hashed to the object.
        user.password = hashedPassword;
    }

    // Update the db with the user object
    try {
        const updateUser = await User.updateOne({
            _id: req.params.userId 
        }, { $set: user });
        console.log('User updated!');
        res.status(200).send('Your details have been updated.');
    } catch (err) {
        res.json({ message: err });
    }
});


// DELETE USER "Soft Delete" - just check field deleted_at instead of actually deleting, then check for this at login and register.
router.delete('/:userId', auth, async (req, res) => {
    try {
        const softDeleteUser = await User.updateOne({
            _id: req.params.userId
        }, { 
            $set: {
                deleted_at: Date.now()
            }
        });
        console.log('User (soft) deleted!');
        res.status(200).send('Your account is deactivated and it will be deleted in 60 days. Login to your account again to reactivate your account.');
    } catch (err) {
        res.json({ message: err });
    }    
});

module.exports = router;