require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");

const { ApolloServer, ApolloError } = require("apollo-server-express");
const {
  ApolloServerPluginLandingPageLocalDefault,
} = require("apollo-server-core");

const typeDefs = require("./graphql/typeDefs/index");
const resolvers = require("./graphql/resolver/index");
const fs = require("fs");
const path = require("path");
const dbConnection = require("./dbconnection/db");
// const userResolver = require("./graphql/resolver/userResolve");

const app = express();
app.use(express.json());

app.use(express.json({ limit: "100mb", extended: true }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],

  context: ({ req, res }) => {
    // console.log("🚀 ~ req:", req);

    const token = req.headers.authorization || "";
    // console.log("token : " + token);
    if (!token) return new Error("Not authenticated");

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET, (err, res) => {
        if (err) {
          console.log("token expired");
          // return "token expired";
          throw new ApolloError("Invalid or expired token.", "UNAUTHENTICATED");
        }
        return res;
      });
      // console.log("🚀 ~index file user ~ user:", user);

      // if (user === "token expired") {
      //   return res.json({ status: "error", data: "token expired" });
      // }
      return { user };
    } catch (error) {
      console.log("error msg : " + error.message);
      throw new ApolloError("Invalid or expired token.", "UNAUTHENTICATED");
      // return new Error(error.message);
    }
  },
});

// Await the server.start() before applying the middleware
async function startServer() {
  await server.start();
  server.applyMiddleware({ app });
}

// Call the startServer function
startServer().then(() => {
  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`Server is Running at: ${port} :)`);
  });
});

dbConnection();
