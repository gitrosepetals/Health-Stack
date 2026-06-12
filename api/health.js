module.exports = (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'lumen-api', runtime: 'node' });
};
