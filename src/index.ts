import express, { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from TypeScript + Node.js backend!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
