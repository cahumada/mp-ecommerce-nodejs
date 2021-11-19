var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var port = process.env.PORT || 3000;

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var app = express();

// SDK de Mercado Pago
const mercadopago = require("mercadopago");
// Agrega credenciales
mercadopago.configure({
  access_token:
    "APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398",
  integrator_id: "dev_24c65fb163bf11ea96500242ac130004",
});

var notifications = [];

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("assets"));

app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/detail", function (req, res) {
  res.render("detail", req.query);
});

app.post("/payment", urlencodedParser, function (req, res) {
  // console.log("payment-req", req.body);

  let preference = {
    items: [
      {
        id: "1234",
        title: req.body.title,
        currency_id: "ARS",
        unit_price: parseFloat(req.body.price),
        picture_url: new URL(
          req.body.img,
          "https://cahumada-mp-ecommerce-nodejs.herokuapp.com/"
        ).href,
        quantity: parseInt(req.body.unit),
      },
    ],
    external_reference: "cahumada85@gmail.com",
    payer: {
      name: "Lalo",
      surname: "Landa",
      email: "test_user_63274575@testuser.com",
      phone: {
        area_code: "11",
        number: 22223333,
      },
      address: {
        street_name: "Falsa",
        street_number: 123,
        zip_code: "1111",
      },
    },
    back_urls: {
      success: "https://cahumada-mp-ecommerce-nodejs.herokuapp.com/success",
      failure: "https://cahumada-mp-ecommerce-nodejs.herokuapp.com/failure",
      pending: "https://cahumada-mp-ecommerce-nodejs.herokuapp.com/pending",
    },
    auto_return: "approved",
    notification_url:
      "https://cahumada-mp-ecommerce-nodejs.herokuapp.com/notifications",
    payment_methods: {
      excluded_payment_methods: [
        {
          id: "amex",
        },
      ],
      excluded_payment_types: [
        {
          id: "atm",
        },
      ],
      installments: 6,
    },
    statement_descriptor: "CERTIFICACION MP",
  };

  mercadopago.preferences
    .create(preference)
    .then(function (response) {
      //console.log("response", response);
      // Este valor reemplazará el string "<%= global.id %>" en tu HTML
      global.id = response.body.id;

      res.redirect(response.body.init_point);
      //res.render("/detail", { preference: data });
    })
    .catch(function (error) {
      console.error(error);
      res.sendStatus(500);
    });
});

app.get("/success", function (req, res) {
  res.render("success", req.query);
});

app.get("/failure", function (req, res) {
  res.render("failure", req.query);
});

app.get("/pending", function (req, res) {
  res.render("pending", req.query);
});

app.post("/notifications", urlencodedParser, function (req, res) {
  res.render("notifications", req.body);
});

app.get("/notifications", function (req, res) {
  res.jsonp(req);
});

app.listen(port);
