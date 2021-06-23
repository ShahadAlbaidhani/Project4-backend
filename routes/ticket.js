const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const protectRoute = require('../util/protectRoute')

// Models 
const Ticket = require('../models/Ticket')
const User = require('../models/User')

// Create a Ticket
router.post('/create' ,protectRoute, async (req,res) =>{
    try{
        const newTicket = new Ticket(req.body)
        const userId = User.findById(req.user._id)
        // const userId = '60bb3c71cd473c0ab78a9f2f'
        newTicket.user = userId
        await newTicket.save()
        res.status(201).json({message: "A new Ticket has been created", newTicket})
    }catch(err){
        res.status(400).json({ name: error.name, message: error.message, url: req.originalUrl })
    }
})

// Show all Tickets
router.get("/allTickets" ,protectRoute, async(req, res) => {
    try {
        const allTickets = await Ticket.find()
        res.status(200).json({allTickets})
    }catch(err) {
        res.status(400).json({name : err.name ,message:err.message,url : req.originalUrl})
    }  
})

// Update a Ticket
router.put('/update/:id',protectRoute, async(req,res)=>{
    try{
        const {title,content} = req.body
        const ticketId = req.params.id
        const updateTicket = await Ticket.findByIdAndUpdate(ticketId, req.body, {new: true})
        if(!updateTicket) throw new Error("Ticket does not exist")
        res.status(200).json({ messge: "Ticket has been successfully updated", updateTicket })
    }catch(err){
        res.status(400).json({ name: error.name, message: error.message, url: req.originalUrl })
    }
})
// Delete a Ticket 
router.delete("/delete/:id",protectRoute, async (req, res) => {
    try {
        const ticketId = req.params.id;
        const deleteTicket = await Ticket.findByIdAndDelete(ticketId)
        if(!deleteTicket) throw new Error("Ticket does not exist")
        res.status(200).json({ messge: "Ticket has been successfully deleted"})
    } catch (error) {
        res.status(400).json({ name: error.name, message: error.message, url: req.originalUrl })
    }
})
// Show One Ticket
router.get('/:id',protectRoute, async (req,res) => {
    try{
    const ticketId = req.params.id
    const ticket = await Ticket.findById(ticketId)
    if(!ticket){
        throw new Error("Ticket does not exist")
    }
    res.status(200).json(ticket)
    }catch(error){
        res.status(400).json({ name: error.name, message: error.message, url: req.originalUrl })
    }
})

module.exports = router