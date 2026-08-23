import express, { type Request, type Response } from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/route', (req: Request, res: Response) => {
  res.json({ message: 'Route endpoint received' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
