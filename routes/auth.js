const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const User = mongoose.model("User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { JWT_SECRET } = require("../keys")
const requireLogin = require('../middleware/requireLogin')


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








module.exports = router
