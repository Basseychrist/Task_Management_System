const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const ejsLayouts = require("express-ejs-layouts");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const flash = require("connect-flash");

// Import the database connection function
const connectDB = require("./config/database");

// Import the Swagger Definition from the new file
const swaggerDefinition = require("./doc/swaggerDef.json"); // <--- MODIFIED

// Load config
dotenv.config({ path: "./.env" });

// Passport config
require("./config/passport")(passport);

// Connect to DB
connectDB();

const app = express();

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
app.set("views", path.join(__dirname, "views")); // <--- MODIFIED: Set the views directory
app.use(ejsLayouts);
app.set("layout", "./layouts/main"); // Set default layout for authenticated views

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Sessions
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

// Connect Flash (must be after session middleware)
app.use(flash());

// Set global var (for EJS to access user info and flash messages)
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  res.locals.messages = require("express-messages")(req, res); // Make flash messages available in EJS
  next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/tasks", require("./routes/tasks"));
app.use("/users", require("./routes/users")); // For user profile or specific user details

// Swagger API Documentation setup
const swaggerOptions = {
  swaggerDefinition, // <--- MODIFIED: Use the imported definition directly
  apis: ["./routes/*.js"], // Path to the API routes files (where JSDoc comments are)
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port http://localhost:${PORT}`
  )
);
