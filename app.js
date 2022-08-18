const express = require('express')
const app = express()
const mongoose = require("mongoose")
const cors = require("cors")
const PORT = 8000
const { MONGOURI } = require('./keys')


require("./models/user")
require("./models/post")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: true }))
app.use(require('./routes/auth'))
app.use(require('./routes/post'))



mongoose
    .connect(MONGOURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    .then(() => console.log("We are connected with database :)")) //Success
    .catch((err) => {
        console.log("DB Connection Error :( -------> ", err); //Failed
    });

app.listen(PORT, () => {
    console.log("servser is running on ", PORT);
})