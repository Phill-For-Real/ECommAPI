const { Order } = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const { Promise } = require('mongoose');
const router = express.Router();

//get all orders
router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate('user', 'name')
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

//get an order by Id
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({
      path: 'orderItems',
      populate: { path: 'product', populate: 'order' },
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

//create a new order
router.post('/', async (req, res) => {
  const orderItemIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );

  const orderItemIdsResolved = await orderItemIds;

  const totalPrices = await Promise.all(
    orderItemIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        'product',
        'price'
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let order = new Order({
    orderItems: orderItemIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
    dateOrdered: req.body.dateOrdered,
  });

  order = await order.save();

  if (!order) return res.status(400).send('the order cannot be created');
  res.send(order);
});

//update an order
router.put('/:id', async (req, res) => {
  const order = await Order.findById(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!order) return res.status(404).send('the order cannot be created');
  res.send(order);
});

//delete an order and its order items
router.delete('/:id', (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndDelete(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: 'the order has been deleted' });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'order not found' });
      }
    })
    .catch((err) => {
      return err.status(400).json({ success: false, error: err });
    });
});

//get aggregate total of all orders
router.get('/get/totalsales', async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } },
  ]);

  if (!totalSales) {
    return res.status(400).send('The total sales cannot be generated');
  }
  res.send({ totalSales: totalSales.pop().totalSales });
});

//get count of total orders
router.get(`/get/count`, async (req, res) => {
  const orderCount = await Order.countDocuments();

  if (!orderCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    orderCount: orderCount,
  });
});

//get a list of orders by user Id
router.get(`/get/userorders/:userId`, async (req, res) => {
  const userOrderCount = await Order.find({ user: req.params.userId })
    .populate({
      path: 'orderItems',
      populate: { path: 'product', populate: 'order' },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderCount) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderCount);
});

module.exports = router;
