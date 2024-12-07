const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");
/*
const addUserRoutes = require("./routes/addFriends");
const frontPageRoute = require("./routes/frontPage");
*/
const app = express();
//here we register the routes

const cors = require("cors"); // Import the cors package

//const app = express();

// Enable CORS for all routes and origins
app.use(cors());

// Or, if you want to allow only specific origins:
// app.use(cors({ origin: 'http://your-frontend-domain.com' }));

//app.use(bodyParser.urlencoded());//inside urlendcoded, we can configure it..
//this is great for data formats or for requests that hold data in the format of x-www-form-urlencoded (form) this
//this is the default data that data has if submitted through a form post request.
//but we don't use form data here we dont have form so, we will use as
//we initializing it..but we will intialize it differently here,
app.use(bodyParser.json()); //good for apllication/json official name found in header
//we want to use badoy parser with the json method which is able to parse json data from incoming requests
//this is good for application json
//and this is how the data would be appended to the request that reaches our server
//so we needed this middleware to parse incoming json data so that we are able to extract it on the body
//because that will be added by our body parser, this body field on the incoming request..
//so we can now extract as req.body.title aisa waisa

//But how we can test this, we can't make form and submitt because we would get back to x-www-from-urlencoded again
//and would also not realistic test because, we don't use form like this when working with rest api
//so we will working with postman to send request...
//later from frontend we will send request..

//app.use(showFriendsRoutes);//we will forward any incoming request
//or we can add extra path..so that all request wouldn't go directly to this route..
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH,  DELETE"
  );
  res.setHeader("Acess-Control-Allow-Headers", "Content-Type, Authorization");

  //because graph denies all request's except post and get
  //so, option req that is automatically send is declined by graphql
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
  //next to reach request to other middleware and now, all response
  //will have the above headers included
});
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn: (err) => {
      if (!err.orginalError) {
        return err;
      }
      //this is the error we can add or added in the error object
      const data = err.originalError.data;
      const message = err.message || "An Error Occured.";
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    },
  })
);
/*
app.use("/add", addUserRoutes);
app.use(frontPageRoute);
*/
mongoose
  .connect(
    "mongodb+srv://shaileshjoshi:shailesh@cluster0.wllwf.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then((result) => {
    //if connection successful so start server otherwise, return errror
    console.log("connected to the mongodb database");
    app.listen(8080);
    //change <db_passwrod with user shailesh password and we can change user to from shailesh to anything
    // mongodb+srv://shailesh:<db_password>@cluster0.wwomf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
  })
  .catch((err) => console.log(err));
//we need connection url to connect to the database
