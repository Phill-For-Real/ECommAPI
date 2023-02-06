// imported modules
const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const urlPrefix = process.env.API_URL;
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

//CORS usage and options
app.use(cors());
app.options('*', cors());

//middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(authJwt());
app.use(errorHandler);

//routers
const productsRouter = require('./routers/products');
const categoriesRouter = require('./routers/categories');
const ordersRouter = require('./routers/orders');
const usersRouter = require('./routers/users');
app.use(`${urlPrefix}/products`, productsRouter);
app.use(`${urlPrefix}/categories`, categoriesRouter);
app.use(`${urlPrefix}/orders`, ordersRouter);
app.use(`${urlPrefix}/users`, usersRouter);

//Database connection
mongoose
  .connect(process.env.CONNECTION_STRING, {
    dbName: process.env.DB_NAME,
  })
  .then(() => {
    console.log('DATABASE connection is ready');
  })
  .catch((error) => {
    console.log(error);
  });

const PORT = proces.env.PORT;

// listeners
app.listen(PORT, () => {
  console.log('App has started listening');
});
