// error handler
import { constants } from "../constants.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      res.status(statusCode).json({
        title: "Validation Error",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case constants.FORBIDDEN:
      res.status(statusCode).json({
        title: "Forbidden Error",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case constants.NOT_FOUND:
      res.status(statusCode).json({
        title: "Not Found Error",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case constants.UNAUTHORIZED:
      res.status(statusCode).json({
        title: "Unauthorized Error",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case constants.SERVER_ERROR:
      res.status(statusCode).json({
        title: "Server Error",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    default:
      res.status(500).json({
        title: "Unknown Error",
        message: err.message,
        stackTrace: err.stack,
      });
      break;
  }
};
