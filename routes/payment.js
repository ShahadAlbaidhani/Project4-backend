const express = require('express');
const bodyParser = require("body-parser")
const stripe = require("stripe")(process.env.SK)
const router = express.Router();
const cors = require('cors')

// Import Order, User, and Technician model
const Order = require('../models/Order');

router.post("/checkout/:id", cors(), async (req, res) => {
	const orderId = req.params.id
	let { amount, id} = req.body
	try {
		const payment = await stripe.paymentIntents.create({
			amount,
			currency: "SAR",
			description: "ITFixSaudi",
			payment_method: id,
			confirm: true
		})
		console.log("Payment", payment)
		const editOrder = await Order.findByIdAndUpdate(orderId, {paymentId: payment.id}, {new: true})
        if(!editOrder) throw new Error("Order doesn't exist!!")
        res.status(200).json({
            message: "The payment method done successfully..", editOrder})
	} catch (error) {
		console.log("Error", error)
		res.json({
			message: "Payment failed",
			success: false,
		})
	}
})

// PUT - Update a Order
router.put("/update/:id" , async(req, res) => {
    try {
        const {paymentId} = req.body
        const orderId = req.params.id
        const editOrder = await Order.findByIdAndUpdate(orderId, req.body, {new: true})
        if(!editOrder) throw new Error("Order doesn't exist!!")
        res.status(200).json({
            message: "The payment method done successfully..", editOrder})
    }catch (err) {
        res.status(400).json({
            name : err.name ,
            message:err.message,
            url : req.originalUrl
           })
    }
})

module.exports = router;