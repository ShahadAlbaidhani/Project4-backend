const express = require('express');
const router = express.Router();
const protectRoute = require("../util/protectRoute")

// Import Review, User, and Technician model
const Review = require('../models/Reviews');
const User = require("../models/User");
const Technician = require('../models/Technician');

// POST - Create a Review
router.post('/new' ,protectRoute, async(req, res) => {
    try {
    const newReview = new Review(req.body)
    const technicianId = Technician.findById(req.technician._id)
    // const technicianId = "60bb8958c1528730e0d1477c"
    const userId = User.findById(req.user._id)
    // const userId = "60bb3c71cd473c0ab78a9f2f"
    newReview.user = userId;
    newReview.technician = technicianId;
    await newReview.save()
     res.status(201).json({message: "Your review was created successfully..", newReview})
    }catch(err){
        res.status(400).json({
        name : err.name ,
        message:err.message,
        url : req.originalUrl
        })
    }
})

// Show all Review
router.get("/allReviews" , async (req, res) => {
    try {
        const allReviews = await Review.find()
        res.status(200).json({allReviews})
    }catch(err) {
        res.status(400).json({
            name : err.name ,
            message:err.message,
            url : req.originalUrl
        })
    }  
})

// Show One Review
router.get('/:id', async (req,res) => {
    try{
    const reviewId = req.params.id
    const review = await Review.findById(reviewId)
    if(!review){
        throw new Error("Review doesn't exist")
    }
    res.status(200).json(review)
    }catch(error){
        res.status(400).json({ 
            name: error.name, 
            message: error.message, 
            url: req.originalUrl 
        })
    }
})

// PUT - Update a Review
router.put("/edit/:id" ,protectRoute, async(req, res) => {
    try {
        const {text} = req.body
        const reviewId = req.params.id
        const editReview = await Review.findByIdAndUpdate(reviewId, req.body, {new: true})
        if(!editReview) throw new Error("Review doesn't exist!!")
        res.status(200).json({
            message: "Your review updated successfully..", editReview})
    }catch (err) {
        res.status(400).json({
            name : err.name ,
            message:err.message,
            url : req.originalUrl
           })
    }
})

// DELETE a Review
router.delete('/delete/:id' ,protectRoute, async (req, res) => {
    try{
        const reviewId = req.params.id
        const deleteReview = await Review.findByIdAndDelete(reviewId)
        if(!deleteReview) throw new Error("Review doesn't exist!!")
        res.status(200).json({ message: "Your review deleted successfully.."})
    }catch(err) {
        res.status(400).json({
            name : err.name ,
            message:err.message,
            url : req.originalUrl
           })
    }
})

module.exports = router