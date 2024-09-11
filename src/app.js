import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credential: true,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  })
);
app.use(express.static("public"));
app.use(cookieParser());

// routes import

import userRouter from "./routes/user.js";
import sellerRouter from "./routes/seller.js";
import buyerRouter from "./routes/buyer.js";
import likeRouter from "./routes/likes.js"
// routes declaration

app.use("/api/v1/users", userRouter);
app.use("/api/v1/sellers", sellerRouter);
app.use("/api/v1/buyers", buyerRouter);
app.use("/api/v1/likes", likeRouter);

export { app };
