const express = require('express');
const router = express.Router();
const protectRoute = require("../util/protectRoute")

// Import Order, User, and Technician model
const Order = require('../models/Order');
const User = require("../models/User");
const Technician = require('../models/Technician');

// POST - Create an Order
router.post('/new', async (req, res) => {
    try {
        const {technicianId} = req.body
        const {userId} = req.body
        // const { title} = req.body
        // console.log(req.body.order.title)
        const newOrder = new Order(req.body.order)
        console.log(newOrder)
        // const technicianIdd = Technician.findById()
        // const userId = User.findById()
        // const technicianId = "60bb8958c1528730e0d1477c"
        // const userId = "60bb3c71cd473c0ab78a9f2f"
        newOrder.user = userId;
        newOrder.technician = technicianId;
        await newOrder.save()
        res.status(201).json({
            message: "Your order was created successfully..", newOrder
        })
    } catch (err) {
        res.status(400).json({
            name: err.name,
            message: err.message,
            url: req.originalUrl
        })
    }
})

// GET - Display Orders
router.get("/allOrders", async (req, res) => {
    try {
        const allOrders = await Order.find()
        res.status(200).json({ allOrders })
    } catch (err) {
        res.status(400).json({
            name: err.name,
            message: err.message,
            url: req.originalUrl
        })
    }
})

// GET - One Order
router.get('/:id', protectRoute, async (req, res) => {
    try {
        const orderId = req.params.id
        const order = await Order.findById(orderId)
        if (!order) {
            throw new Error("Order does not exist")
        }
        res.status(200).json(order)
    } catch (error) {
        res.status(400).json({
            name: error.name,
            message: error.message,
            url: req.originalUrl
        })
    }
})

// for payment 
router.get("/allOrders/:id", async(req, res) => {
    let id = req.params.id
    try{
        const allOrders = await Order.find({user: id})
        res.status(200).json({allOrders})
    }catch(err){
        res.status(400).json({
            name : err.name ,
            message:err.message,
            url : req.originalUrl
           })
    }
})

// for payment 
router.get("/tech/allOrders/:id", async(req, res) => {
    let id = req.params.id
    try{
        const allOrders = await Order.find({technician: id})
        res.status(200).json({allOrders})
    }catch(err){
        res.status(400).json({
            name : err.name ,
            message:err.message,
            url : req.originalUrl
           })
    }
})

// PUT - Update a Order
router.put("/edit/:id", async (req, res) => {

    try {
        const { title, description, deviceType, softwareType, problemType, location, status, phoneNumber } = req.body
        // const technicianId = req.params.id
        const orderId = req.params.id
        const editOrder = await Order.findByIdAndUpdate(orderId, req.body, { new: true })
        if (!editOrder) throw new Error("Order doesn't exist!!")
        res.status(200).json({
            message: "Your order updated successfully..", editOrder
        })
    } catch (err) {
        res.status(400).json({
            name: err.name,
            message: err.message,
            url: req.originalUrl
        })
    }
})

// DELETE the Order
router.delete('/delete/:id', protectRoute, async (req, res) => {
    try {
        const orderId = req.params.id
        const deleteOrder = await Order.findByIdAndDelete(orderId)
        if (!deleteOrder) throw new Error("Order doesn't exist!!")
        res.status(200).json({
            message: "Your order deleted successfully.."
        }, deleteOrder)
    } catch (err) {
        res.status(400).json({
            name: err.name,
            message: err.message,
            url: req.originalUrl
        })
    }
})

module.exports = router
