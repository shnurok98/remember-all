const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.send('<h3>API made by Shnurok</h3><h4>Contacts: shnurok-98@mail.ru</h4>'));

module.exports = router;