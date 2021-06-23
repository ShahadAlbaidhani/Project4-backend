const express = require('express');
const router = express.Router();
const protectRoute = require("../util/protectRoute")

// Import Response, Ticket, and Technician model
const Response = require('../models/Response')
const Ticket = require("../models/Ticket");
const Technician = require('../models/Technician');

// POST - Create a Response
router.post('/new' ,protectRoute, async(req, res) => {
    try {
    const newResponse = new Response(req.body)
    const technicianId = Technician.findById(req.technician._id)
    const ticketId = Ticket.findById(req.ticket._id)
    // const technicianId = "60bb8958c1528730e0d1477c"
    // const ticketId = "60bcb128bab6f70fca2227d5"
    newResponse.technician = technicianId;
    newResponse.ticket = ticketId;
    await newResponse.save()
    res.status(200).json({
            message: "Your response was created successfully..", newResponse})
    }catch(err){
        res.status(400).json({
        name : err.name ,
        message:err.message,
        url : req.originalUrl
        })
    }
})

// Show all Response
router.get("/allResponses" ,protectRoute, async(req, res) => {
    try {
        const allResponses = await Response.find()
        res.status(200).json({allResponses})
    }catch(err) {
        res.status(400).json({
            name : err.name ,
            message:err.message,
            url : req.originalUrl
        })
    }  
})

// GET - Display a Response
router.get("/:id",protectRoute, async(req, res) => {
    try{
        const responseId = req.params.id
        const response = await Response.findById(responseId)
        if(!response){
            throw new Error("Responses doesn't exist!!")
        }
    res.status(200).json(response)
    }catch(err){
        res.status(400).json({
            name : err.name ,
            message:err.message,
            url : req.originalUrl
           })
    }

})

// PUT - Update a Response
router.put("/edit/:id" ,protectRoute, async(req, res) => {
    try {
        const {text} = req.body
        const responseId = req.params.id
        const editResponse = await Response.findByIdAndUpdate(responseId, req.body, {new: true})
        if(!editResponse){
            throw new Error("Response doesn't exist!!")
        } 
        res.status(200).json({
            message: "Your response updated successfully..", editResponse
        })
    }catch(err){
        res.status(400).json({
            name : err.name ,
            message:err.message,
            url : req.originalUrl
           })
    }
})

// DELETE a Response
router.delete('/delete/:id' ,protectRoute, async(req, res) => {
    try{
        const responseId = req.params.id
        const deleteResponse = await Response.findByIdAndDelete(responseId)
        if(!deleteResponse) throw new Error("Response doesn't exist!!")
        res.status(201).json({
            message: "Your response deleted successfully..", deleteResponse})
    }catch(err) {
        res.status(404).json({
            name : err.name ,
            message:err.message,
            url : req.originalUrl
           })
    }
})

module.exports = router
