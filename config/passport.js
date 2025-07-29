const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user"); // Your user model

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        // Find or create user logic
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            firstName: profile.name.givenName, // <-- add this
            lastName: profile.name.familyName, // <-- add this
          });
        }
        return done(null, user);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id); // or user._id
  });

  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
};
