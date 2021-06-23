require('dotenv').config();
const express = require('express')
const app = express();
const mongoose = require('mongoose')
const path = require('path')

const PORT = process.env.PORT;
const cors = require('cors')


app.use(express.static(path.join(__dirname, "build")));

mongoose.connect(process.env.mongoDBURL , {useNewUrlParser:true , useUnifiedTopology: true} ,() => console.log('connected to the database'))


app.use(express.json())
app.use(express.urlencoded({extended: false}));

// var whitelist = ["http://localhost:3000", "https://itfixsaudi.herokuapp.com/"];

// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       var message =
//         "The CORS policy for this application does not allow access from origin " +
//         origin;
//       callback(new Error(message), false);
//     }
//   },
// };

app.use(cors());

app.use('/api/v1/user', require("./routes/user"))
app.use('/api/v1/technician', require("./routes/technician"))
app.use('/api/v1/ticket', require("./routes/ticket"))

app.use('/api/v1/review', require("./routes/reviews"))
app.use('/api/v1/order', require("./routes/order"))
app.use('/api/v1/response', require("./routes/response"))


app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });

app.listen(PORT, console.log(`server is running on port ${PORT}`))

