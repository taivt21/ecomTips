"use strict";

const { SuccessResponse } = require("../core/success.response");
const {
  createComment,
  getCommentsByParentId,
  deleteComment,
} = require("../services/comment.service");

class CommentController {
  createComment = async (req, res, next) => {
    new SuccessResponse({
      message: "Comment created",
      metadata: await createComment(req.body),
    }).send(res);
  };
  getCommentsByParentId = async (req, res, next) => {
    new SuccessResponse({
      message: "Get comments by parentId successfully",
      metadata: await getCommentsByParentId(req.query),
    }).send(res);
  };
  deleteComment = async (req, res, next) => {
    new SuccessResponse({
      message: "delete comment successfully",
      metadata: await deleteComment(req.body),
    }).send(res);
  };
}

module.exports = new CommentController();
