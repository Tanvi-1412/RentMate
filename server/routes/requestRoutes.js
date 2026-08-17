const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const checkCollege = require('../middleware/checkCollege');
const validate = require('../middleware/validate');
const { requestValidator } = require('../validators/requestValidator');
const {
  sendBuyOrRentRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  completeRequest,
} = require('../controllers/requestController');

router.use(authenticate, checkCollege);

router.post('/', requestValidator, validate, sendBuyOrRentRequest);
router.get('/incoming', getIncomingRequests);
router.get('/outgoing', getOutgoingRequests);

router.patch('/:id/accept', acceptRequest);
router.patch('/:id/reject', rejectRequest);
router.patch('/:id/cancel', cancelRequest);
router.patch('/:id/complete', completeRequest);

module.exports = router;
