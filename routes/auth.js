const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const User = mongoose.model("User")
const crypto = require('crypto')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { JWT_SECRET } = require("../keys")
const requireLogin = require('../middleware/requireLogin')
const nodemailer = require('nodemailer')
const { getMaxListeners } = require("process")

// const sendgridTransport = require('nodemailer-sendgrid-transport')

// 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



const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "elishalazar9@gmail.com",
        pass: "qbtgxewiphhprkfn"
    }
})
// router.get("/protected", requireLogin, (req, res) => {
//     res.send("hello user")
// })

router.post('/signup', (req, res) => {

    const { name, email, password } = req.body
    console.log(name, email, password)
    if (!email || !password || !name) {
        return res.status(422).json({ error: 'Please add all fields ' })
    }
    User.findOne({ email: email })
        .then((savedUser) => {
            if (savedUser) {
                return res.status(422).json({ error: 'User already exists with that email' })

            }
            bcrypt.hash(password, 12)
                .then(password => {
                    console.log(password, "P")

                    const user = new User({
                        name,
                        email,
                        password
                    })

                    user.save()
                        .then(user => {
                            res.json({
                                message: 'Saved Successfully '
                            })
                        })
                        .catch(err => {
                            console.log(err);
                        })
                })

        })
        .catch(err => {
            console.log(err);
        })
})


router.post('/signin', (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(422).json({ error: 'please add email or password' })

    }
    User.findOne({ email: email })
        .then(savedUser => {
            if (!savedUser) {
                return res.status(422).json({ error: 'invalid Email or password' })
            }

            bcrypt.compare(password, savedUser.password)
                .then(doMatch => {
                    if (doMatch) {
                        // res.json({ message: 'successfully signed in' })
                        const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET)
                        const { _id, name, email } = savedUser
                        res.json({
                            token, user: {
                                _id, name, email
                            }, message: "logged in successfully"
                        })
                    }

                    else {
                        return res.status(422).json({ error: 'Invaild email or password' })
                    }

                })

                .catch(err => {
                    console.log(err);
                })
        })
})


router.post('/reset-password', (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
        }
        const token = buffer.toString('hex')
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    return res.status(422).json({
                        error: 'User dont exists with the email'
                    })
                }
                user.resetToken = token
                user.expireToken = Date.now() + 3600000
                user.save().then((result) => {
                    transporter.sendMail({
                        to: user.email,
                        from: "elishalazar9@gmail.com",
                        subject: 'password reset reset',
                        html: `
                        <p> You requested for password reset </p>
                         click in this<a href="http://localhost:3000/new-password/${token}">link</a> to reset password 
                    `
                    }).then(() => {

                        res.json({ message: "check your email" })
                    }).catch(err => {
                        console.log(err.message)
                    })
                })
            })
    })
})


router.post('/newpassword/', (req, res) => {
    const newPassword = req.body.password

    const sendToken = req.body.token

    User.findOne({
        resetToken: sendToken, expireToken: {
            $gt: Date.now()
        }
    }).then(user => {
        if (!user) {

            return res.status(422).json({ error: 'Try again session expired' })
        }

        console.log(user, "user")
        bcrypt.hash(newPassword, 12).then(hashedpassword => {
            user.password = hashedpassword,
                user.name = "updated"
            user.resetToken = undefined
            user.expireToken = undefined
            user.save().then((saveduser) => {
                console.log(newPassword, "newPassword", saveduser)
                res.json({ message: 'password update success' })
            })
        })
    }).catch(err => {
        console.log(err);
    })
})


module.exports = router
