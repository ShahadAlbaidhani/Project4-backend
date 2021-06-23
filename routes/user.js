const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const protectRoute = require('../util/protectRoute')

const mailgun = require("mailgun-js");
const DOMAIN = 'sandboxb250021b8b334366a5e7d753f3b721a9.mailgun.org';
const mg = mailgun({ apiKey: process.env.MAIL_GUN_APIKEY, domain: DOMAIN });

// Models 
const User = require('../models/User')

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { email, firstName, lastName, password, image, username } = req.body
        const token = jwt.sign({ email, firstName, lastName, password, image, username }, process.env.JWT_ACC_ACTIVATE, { expiresIn: "30m" })
        const data = {
            from: 'noreply@ITFixSaudi.com',
            to: email,
            subject: 'Account Activation',
            html: `
            <h2>Please click on given link to activate your account</h2>
            <p>${process.env.CLIENT_URL}/user/activate/${token}</p>`
        };
        mg.messages().send(data, function (error, body) {
            console.log(body);
        });
        res.json({ message: "Email has been sent, please activate your account" })
    } catch (err) {
        res.status(401).json({ name: err.name, message: err.message, url: req.originalUrl })
    }
})

// Account activation 
router.get('/activate/:token', async (req, res) => {
    try {
        const { token } = req.params
        if (!token) throw new Error("The token does not exist!")
        jwt.verify(token, process.env.JWT_ACC_ACTIVATE, function (err, decodedToken) {
            if (err) return res.status(400).json({ error: 'Incorrect or Expired link. ' })
            const { email, firstName, lastName, password, image, username } = decodedToken
            const newUser = new User({ email, firstName, lastName, password, image, username });
            newUser.save();
            // res.json({ message: "Welcone to our family!", user: newUser, success: true })
            res.redirect('http://localhost:3000/Home')
        })
    } catch (err) {
        res.status(401).json({ name: err.name, message: err.message, url: req.originalUrl })
    }
})

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body
    try {
        let user = await User.findOne({ username: username })

        if (user == null) throw new Error('Wrong username!')
        if (!bcrypt.compareSync(password, user.password)) throw new Error("Wrong password!")
        user.password = undefined; // To prevent it from sending the password
        let token = jwt.sign({ user }, process.env.SECRETKEY, { expiresIn: 60 * 60 * 1000 })
        res.json({ message: "Welcome back!", token })
    } catch (err) {
        res.status(401).json({ name: err.name, message: err.message, url: req.originalUrl })
    }
})

// Show One User 
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId)
        if (!user) throw new Error("User does not exist")
        res.status(200).json(user)
    } catch (err) {
        res.status(400).json({ name: err.name, message: err.message, url: req.originalUrl })
    }
})

// Update User
router.put('/update/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const updateUser = await User.findByIdAndUpdate(userId, req.body, { new: true })
        if (!updateUser) throw new Error("User does not exist")
        res.status(200).json({ message: "User has been successfully updated", updateUser })
    } catch (err) {
        res.status(400).json({ name: err.name, message: err.message, url: req.originalUrl })
    }
})

// Delete User
router.delete('/delete/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const deleteUser = await User.findByIdAndDelete(userId)
        if (!deleteUser) throw new Error("User does not exist")
        res.status(200).json({ message: "User has been deleted successfully" })
    } catch (err) {
        res.status(400).json({ name: err.name, message: err.message, url: req.originalUrl })
    }
})

// Change Password
router.put('/changePassword/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId)
        if (bcrypt.compareSync(req.body.oldPassword, user.password)) {
            let salt = bcrypt.genSaltSync()
            let hash = bcrypt.hashSync(req.body.newPassword, salt)
            await User.findByIdAndUpdate(userId, { password: hash })
            res.json({ message: "Password has been updated successfully" })
        } else {
            throw new Error("Password Incorrect")
        }
    } catch (err) {
        res.status(400).json({ name: err.name, message: err.message, url: req.originalUrl })
    }
})

// Reset Password Via Email Routes

router.put('/forgotPassword', async (req, res) => {
    try {
        const { email } = req.body
        await User.findOne({ email }, (err, user) => {
            if (err || !user) return res.status(400).json({ error: "User with this email address does not exist!!" })
            const token = jwt.sign({ _id: user._id }, process.env.RESET_PASSWORD_KEY, { expiresIn: "30m" })
            const data = {
                from: 'noreply@ITFixSaudi.com',
                to: email,
                subject: 'Reset Password',
                html: `
                <h2>Please click on given link to reset your password</h2>
                <p>${process.env.CLIENT_URL}/user/resetPassword/${token}</p>`
            };
            return user.updateOne({ resetLink: token }, function (err, success) {
                if (err) res.status(400).json({ error: "reset password link error" })
                mg.messages().send(data, function (error, body) {
                    console.log(body);
                });
                res.json({ message: "Email has been sent, kindly follow the instruction" })
            })
        })

    } catch (err) {
        res.status(400).json({ name: err.name, message: err.message, url: req.originalUrl })
    }
})

router.get('/resetPassword/:resetLink', async (req, res) => {
    const { resetLink } = req.params
    res.redirect(`http://localhost:3000/user/resetPassword/${resetLink}`)
})

router.put('/resetPassword/:resetLink', async (req, res) => {
    try {
        const { resetLink } = req.params
        console.log(resetLink)
        const { newPassword } = req.body.user
        if (!resetLink) throw new Error("Authentication error")
        jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function (error, decodedData) {
            if (error) return res.status(401).json({ error: "Incorrect token or expired" })
            User.findOne({ resetLink }, (err, user) => {
                if (err || !user) return res.status(400).json({ error: "User with this token does not exist!!" })

                const obj = {
                    password: newPassword
                }
                user = _.extend(user, obj)
                user.save((err, result) => {
                    if (err) return res.status(400).json({ error: err })
                    res.status(200).json({ message: "Your password has been successfully changed" })
                    // res.redirect('http://localhost:3000/Home')
                })
            })
        })
    } catch (err) {
        res.status(400).json({ name: err.name, message: err.message, url: req.originalUrl })
    }
})

module.exports = router