/* ***********************
 * Require Statements
 *************************/
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file
const express = require("express");

const morgan = require("morgan");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const app = express();
// Passport config
require("./config/passport")(passport);
// Load config

/******************* *
 *routes constant required statements
 *************************/
// const { getNav } = require("./controllers/accountController");
const accountRoutes = require("./routes/accountRoute");
const utilities = require("./routes/utilities"); // Make sure this is correct
const baseController = require("./controllers/baseController");
const errorRoute = require("./routes/errorRoute");
const auth = require("./routes/auth");
const tasks = require("./routes/tasks");

// Import the database connection function
const connectDB = require("./config/database");
// Import the Swagger Definition from the new file
const swaggerDefinition = require("./doc/swaggerDef.json"); // <--- MODIFIED

// Connect to DB
connectDB();

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// View Engine and Templates
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // default layout

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  res.locals.user = req.user || null; // Make user object available in views
  next();
});

app.use(utilities.checkJWTToken);

app.use(async (req, res, next) => {
  res.locals.navigation = await utilities.getNav(req.user);
  next();
});

app.use((req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.locals.loggedin = 1;
  }
  next();
});

// Routes
/*************************/
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});
app.use("/account", accountRoutes);
app.use("/tasks", tasks);
app.use("/auth", auth);
app.get("/dashboard", utilities.checkLogin, (req, res) => {
  res.render("dashboard", {
    title: "Dashboard",
    user: req.user || res.locals.user,
  });
});

// API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(
    swaggerJsdoc({
      swaggerDefinition,
      apis: ["./doc/swaggerDef.json"], // Path to the API routes files (where JSDoc comments are)
    })
  )
);

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message: err.message,
    error: process.env.NODE_ENV === "development" ? err : {},
    nav: await utilities.getNav(),
    user: req.user || res.locals.user || null, // <-- Add this line
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port http://localhost:${PORT}`
  )
);
