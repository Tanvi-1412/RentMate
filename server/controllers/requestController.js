const Request = require('../models/Request');
const { createRequest, updateRequestStatus } = require('../services/requestService');
const { sendSuccess, sendError } = require('../utils/response');
const { logActivity } = require('../utils/logger');

const sendBuyOrRentRequest = async (req, res, next) => {
  try {
    const request = await createRequest(req.user.userId, req.body);

    await logActivity({
      actorId: req.user.userId,
      action: 'USER_SENT_REQUEST',
      targetType: 'REQUEST',
      targetId: request._id,
      req,
    });

    return sendSuccess(res, 201, 'Request sent successfully to seller', request);
  } catch (error) {
    next(error);
  }
};

const getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ sellerId: req.user.userId })
      .populate('productId', 'title price transactionType images availability')
      .populate('requesterId', 'name course studyYear profileImage approximateLocation status isVerified')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Incoming requests fetched', requests);
  } catch (error) {
    next(error);
  }
};

const getOutgoingRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ requesterId: req.user.userId })
      .populate('productId', 'title price transactionType images availability ownerId')
      .populate('sellerId', 'name course studyYear profileImage approximateLocation status isVerified')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Outgoing requests fetched', requests);
  } catch (error) {
    next(error);
  }
};

const acceptRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return sendError(res, 404, 'Request not found');

    if (request.sellerId.toString() !== req.user.userId && req.user.role !== 'ADMIN') {
      return sendError(res, 403, 'Only the seller can accept this request');
    }

    const updated = await updateRequestStatus(request, 'ACCEPTED', req.user.userId);

    await logActivity({
      actorId: req.user.userId,
      action: 'USER_ACCEPTED_REQUEST',
      targetType: 'REQUEST',
      targetId: request._id,
      req,
    });

    return sendSuccess(res, 200, 'Request accepted successfully', updated);
  } catch (error) {
    next(error);
  }
};

const rejectRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return sendError(res, 404, 'Request not found');

    if (request.sellerId.toString() !== req.user.userId && req.user.role !== 'ADMIN') {
      return sendError(res, 403, 'Only the seller can reject this request');
    }

    const updated = await updateRequestStatus(request, 'REJECTED', req.user.userId);

    return sendSuccess(res, 200, 'Request rejected', updated);
  } catch (error) {
    next(error);
  }
};

const cancelRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return sendError(res, 404, 'Request not found');

    if (request.requesterId.toString() !== req.user.userId && req.user.role !== 'ADMIN') {
      return sendError(res, 403, 'Only the requester can cancel this request');
    }

    const updated = await updateRequestStatus(request, 'CANCELLED', req.user.userId);

    return sendSuccess(res, 200, 'Request cancelled successfully', updated);
  } catch (error) {
    next(error);
  }
};

const completeRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return sendError(res, 404, 'Request not found');

    if (
      request.sellerId.toString() !== req.user.userId &&
      request.requesterId.toString() !== req.user.userId &&
      req.user.role !== 'ADMIN'
    ) {
      return sendError(res, 403, 'Unauthorized to complete this request');
    }

    const updated = await updateRequestStatus(request, 'COMPLETED', req.user.userId);

    return sendSuccess(res, 200, 'Transaction marked as completed', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendBuyOrRentRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  completeRequest,
};
