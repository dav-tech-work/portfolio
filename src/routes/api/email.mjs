import express from 'express';
const router = express.Router();

router.get('/email', (req, res) => {
  const email = 'danielarribasvelazquez@dav-tech.work';
  res.json({ email });
});

export default router;
