require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { createServer } = require("http");

const { ApolloServer, ApolloError } = require("apollo-server-express");
const {
  ApolloServerPluginLandingPageLocalDefault,
} = require("apollo-server-core");
const { makeExecutableSchema } = require("@graphql-tools/schema");

const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");

// const { execute, subscribe } = require("graphql");
// const { SubscriptionServer } = require("subscriptions-transport-ws");

const typeDefs = require("./graphql/typeDefs/index");
const resolvers = require("./graphql/resolver/index");

const schema = makeExecutableSchema({ typeDefs, resolvers });

const fs = require("fs");
const path = require("path");
const dbConnection = require("./dbconnection/db");

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.json({ limit: "100mb", extended: true }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

async function startServer() {
  const apolloServer = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
    context: ({ req }) => {
      // console.log("🚀 ~ startServer ~ req:", req.headers);
      const token = req.headers.authorization || "";
      if (!token) return new Error("Not authenticated");

      try {
        const user = jwt.verify(token, process.env.JWT_SECRET, (err, res) => {
          if (err) {
            throw new ApolloError(
              "Invalid or expired token.",
              "UNAUTHENTICATED"
            );
          }
          return res;
        });
        return { user };
      } catch (error) {
        throw new ApolloError("Invalid or expired token.", "UNAUTHENTICATED");
      }
    },
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: "/graphql" });

  const httpServer = createServer(app);
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  useServer({ schema }, wsServer);

  httpServer.listen(process.env.PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`
    );
    console.log(
      `🚀 Subscriptions ready at ws://localhost:${process.env.PORT}${apolloServer.graphqlPath}`
    );
  });
}

startServer();
dbConnection();
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],

//   context: ({ req, res }) => {
//     // console.log("🚀 ~ req:", req);

//     const token = req.headers.authorization || "";
//     // console.log("token : " + token);
//     if (!token) return new Error("Not authenticated");

//     try {
//       const user = jwt.verify(token, process.env.JWT_SECRET, (err, res) => {
//         if (err) {
//           console.log("token expired");
//           // return "token expired";
//           throw new ApolloError("Invalid or expired token.", "UNAUTHENTICATED");
//         }
//         return res;
//       });
//       // console.log("🚀 ~index file user ~ user:", user);

//       // if (user === "token expired") {
//       //   return res.json({ status: "error", data: "token expired" });
//       // }
//       return { user };
//     } catch (error) {
//       console.log("error msg : " + error.message);
//       throw new ApolloError("Invalid or expired token.", "UNAUTHENTICATED");
//       // return new Error(error.message);
//     }
//   },
// });

// // Apply ApolloServer middleware to Express app
// async function startApolloServer() {
//   await server.start();
//   server.applyMiddleware({ app });

//   // Create WebSocket server after ApolloServer starts
//   const wsServer = new WebSocketServer({
//     server: httpServer,
//     path: "/graphql",
//   });
//   useServer({ server: wsServer }, server);
// }

// // Start ApolloServer and WebSocket server
// startApolloServer().then(() => {
//   const port = process.env.PORT;
//   httpServer.listen(port, () => {
//     console.log(`Server is Running at: ${port} :)`);
//   });
// });

// Await the server.start() before applying the middleware
// async function startServer() {
//   // const httpServer = createServer(app);

//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//     plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],

//     context: ({ req, res }) => {
//       // console.log("🚀 ~ req:", req.headers.token);

//       const token = req.headers.token || "";
//       // console.log("token : " + token);
//       if (!token) return new Error("Not authenticated");

//       try {
//         const user = jwt.verify(token, process.env.JWT_SECRET, (err, res) => {
//           if (err) {
//             console.log("token expired");
//             // return "token expired";
//             throw new ApolloError(
//               "Invalid or expired token.",
//               "UNAUTHENTICATED"
//             );
//           }
//           return res;
//         });
//         // console.log("🚀 ~index file user ~ user:", user);

//         // if (user === "token expired") {
//         //   return res.json({ status: "error", data: "token expired" });
//         // }
//         return { user };
//       } catch (error) {
//         console.log("error msg : " + error.message);
//         throw new ApolloError("Invalid or expired token.", "UNAUTHENTICATED");
//         // return new Error(error.message);
//       }
//     },
//   });

//   // SubscriptionServer.create(
//   //   {
//   //     typeDefs,
//   //     resolvers,
//   //     execute,
//   //     subscribe,
//   //     onConnect: async (connectionParams, webSocket, context) => {
//   //       const req = {
//   //         headers: { token: connectionParams?.authentication },
//   //       };
//   //       // const user = await getMe(req);

//   //       const token = req.headers.token || "";
//   //       // console.log("token : " + token);
//   //       if (!token) return new Error("Not authenticated");

//   //       try {
//   //         const user = jwt.verify(token, process.env.JWT_SECRET, (err, res) => {
//   //           if (err) {
//   //             console.log("token expired");
//   //             // return "token expired";
//   //             throw new ApolloError(
//   //               "Invalid or expired token.",
//   //               "UNAUTHENTICATED"
//   //             );
//   //           }
//   //           return res;
//   //         });
//   //         // console.log("🚀 ~index file user ~ user:", user);

//   //         // if (user === "token expired") {
//   //         //   return res.json({ status: "error", data: "token expired" });
//   //         // }
//   //         return { user };
//   //       } catch (error) {
//   //         console.log("error msg : " + error.message);
//   //         throw new ApolloError("Invalid or expired token.", "UNAUTHENTICATED");
//   //         // return new Error(error.message);
//   //       }

//   //       // return { id: user?._id, DSAId: user?.DSAId };
//   //     },
//   //   },
//   //   { server: httpServer, path: server.graphqlPath }
//   // );

//   await server.start();
//   server.applyMiddleware({ app, path: "/graphql" });

//   const httpServer = http.createServer(app);
//   const wsServer = new WebSocketServer({
//     server: httpServer,
//     path: "/graphql",
//   });

//   useServer({ schema: server.schema }, wsServer);

//   httpServer.listen(process.env.PORT, () => {
//     console.log(`Server is Running at: ${process.env.PORT} :)`);
//   });
// }
// startServer();

// Call the startServer function
// startServer().then(() => {
//   const port = process.env.PORT;
//   app.listen(port, () => {
//     console.log(`Server is Running at: ${port} :)`);
//   });
// });

// dbConnection();
