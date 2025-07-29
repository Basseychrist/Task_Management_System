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

const accountRoutes = require("./routes/accountRoute");
const utilities = require("./routes/utilities");
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

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "./layouts/main"); // Set default layout for authenticated views

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Sessions (all session middleware)
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

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

/* ***********************
 * Middleware
 * ************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

app.use(cookieParser());
app.use(utilities.checkJWTToken);
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});
/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

// Routes
/*************************/
app.use(express.static("public"));
// app.use(static);
app.get("/", (req, res) => {
  res.render("index", { title: "Home" }); // Use index.ejs
});
app.use("/account", accountRoutes);
app.use("/", errorRoute);
app.use("/tasks", tasks);
app.use("/auth", auth);

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

// Error handling
app.use(utilities.handleErrors(baseController.buildHome));
app.use(errorRoute); // This should be after all other routes, as a catch-all error handler

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
