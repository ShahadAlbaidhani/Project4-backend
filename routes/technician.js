const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const protectRoute = require("../util/protectRoute")
const _ = require('lodash')

const mailgun = require("mailgun-js");
const DOMAIN = 'sandboxb250021b8b334366a5e7d753f3b721a9.mailgun.org';
const mg = mailgun({apiKey: process.env.MAIL_GUN_APIKEY, domain: DOMAIN});

// Modeles
const Technician = require('../models/Technician')

// Register
router.post('/register', async (req,res) => {
    try{
        const {email,firstName,lastName,password,image,username,iban,deviceType,softwareType,problemType} = req.body
        const token = jwt.sign({email,firstName,lastName,password,image,username,iban,deviceType,softwareType,problemType}, process.env.JWT_ACC_ACTIVATE, {expiresIn: "30m"})
        const data = {
            from: 'noreply@ITFixSaudi.com',
            to: email,
            subject: 'Account Activation',
            html: `
            <h2>Please click on given link to activate your account</h2>
            <p>${process.env.CLIENT_URL}/technician/activate/${token}</p>`
        };
        mg.messages().send(data, function (error, body) {
            console.log(body);
        });
        res.json({ message: "Email has been sent, please activate your account"})
    }catch(err){
        res.status(401).json({name: err.name ,message: err.message, url: req.originalUrl})
    }
})

// Account activation 
router.get('/activate/:token', async (req, res) => {
    try{
        const {token} = req.params
        if(!token) throw new Error("The token does not exist!")
        jwt.verify(token,process.env.JWT_ACC_ACTIVATE, function(err, decodedToken){
            if(err) return res.status(400).json({error: 'Incorrect or Expired link. '})
            const {email,firstName,lastName,password,image,username,iban,deviceType,softwareType,problemType} = decodedToken
            const newTech = new Technician({email,firstName,lastName,password,image,username,iban,deviceType,softwareType,problemType});
            newTech.save();
            // res.json({message: "Welcone to our family! Tech", user: newTech, success: true})
            res.redirect('http://localhost:3000/Home')
        })
    }catch(err){
        res.status(401).json({ name: err.name, message: err.message, url: req.originalUrl })
    }
})

// Login
router.post('/login', async (req, res)=>{
    const {username, password } = req.body
    try{
        let technician = await Technician.findOne({username: username})
        if(technician == null) throw new Error('Wrong username!') 

        if(!bcrypt.compareSync(password, technician.password)) throw new Error("Wrong password!")
        technician.password= undefined; // To prevent it from sending the password
        let user = technician
        let token = jwt.sign({user}, process.env.SECRETKEY , {expiresIn: 60*60*1000 })
        res.json({message:"Welcome back! Tech", token})
    }catch(err){
        res.status(401).json({name: err.name ,message: err.message, url: req.originalUrl})
    }
})

// Show all Technicians
router.get("/allTechnicians" , async(req, res) => {
    try {
        const allTechnicians = await Technician.find()
        res.status(200).json({allTechnicians})
    }catch(err) {
        res.status(400).json({name : err.name ,message:err.message,url : req.originalUrl})
    }  
})

// Show One Technician
router.get('/:id', async (req, res) =>{
    try{
        const techId = req.params.id
        const technician = await Technician.findById(techId)
        if(!technician) throw new Error("Technician does not exist")
        res.status(200).json(technician)
    }catch(err){
        res.status(400).json({name: err.name ,message: err.message, url: req.originalUrl})
    }
})

// Update Technician
router.put('/update/:id', async (req,res) => {
    try{
        const techId = req.params.id
        const updateTechnician = await Technician.findByIdAndUpdate(techId, req.body, {new:true})
        if(!updateTechnician) throw new Error("Technician does not exist")
        res.status(200).json({message: "Technician has been successfully updated", updateTechnician})
    }catch(err){
        res.status(400).json({name: err.name ,message: err.message, url: req.originalUrl})
    }
})

// Delete Technician
router.delete('/delete/:id', async(req,res)=>{
    try{
        const techId = req.params.id
        const deleteTechnician = await Technician.findByIdAndDelete(techId)
        if(!deleteTechnician) throw new Error("Technician does not exist")
        res.status(200).json({message:"Technician has been deleted successfully"})
    }catch(err){
        res.status(400).json({name: err.name ,message: err.message, url: req.originalUrl})
    }
})

// Change Password
router.put('/changePassword/:id', async (req,res) => {
    try{
        const techId = req.params.id
        const tech = await Technician.findById(techId)
        if(bcrypt.compareSync(req.body.oldPassword, tech.password)){
            let salt = bcrypt.genSaltSync()
            let hash = bcrypt.hashSync(req.body.newPassword, salt)
            await Technician.findByIdAndUpdate(techId, {password: hash})
            res.json({message: "Password has been updated successfully"})
        }else{
            throw new Error("Password Incorrect")
        }
    }catch(err){
        res.status(400).json({ name: err.name, message: err.message, url: req.originalUrl })
    }
})

// Reset Password Via Email Routes

router.put('/forgotPassword', async (req, res) => {
    try {
        const { email } = req.body
        await Technician.findOne({ email }, (err, tech) => {
            if (err || !tech) return res.status(400).json({ error: "User with this email address does not exist!!" })
            const token = jwt.sign({ _id: tech._id }, process.env.RESET_PASSWORD_KEY, { expiresIn: "30m" })
            const data = {
                from: 'noreply@ITFixSaudi.com',
                to: email,
                subject: 'Reset Password',
                html: `
                <h2>Please click on given link to reset your password</h2>
                <p>${process.env.CLIENT_URL}/technician/resetpassword/${token}</p>`
            };
            return tech.updateOne({ resetLink: token }, function (err, success) {
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

router.get('/resetPassword/:resetLink', async (req,res) => {
    const {resetLink} = req.params
    res.redirect(`http://localhost:3000/technician/resetPassword/${resetLink}`)
})

router.put('/resetPassword/:resetLink', async (req, res) => {
    try {
        const {resetLink} = req.params
        const { newPassword } = req.body.user
        if (!resetLink) throw new Error("Authentication error")
        jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function (error, decodedData) {
            if (error) return res.status(401).json({ error: "Incorrect token or expired" })
            Technician.findOne({ resetLink }, (err, tech) => {
                if (err || !tech) return res.status(400).json({ error: "User with this token does not exist!!" })

                const obj = {
                    password: newPassword
                }

                tech = _.extend(tech, obj)
                tech.save((err, result) => {
                    if (err) return res.status(400).json({ error: "reset password error" })
                    res.status(200).json({ message: "Your password has been successfully changed" })
                })
            })
        })
    } catch (err) {
        res.status(400).json({ name: err.name, message: err.message, url: req.originalUrl })
    }
})


module.exports = router