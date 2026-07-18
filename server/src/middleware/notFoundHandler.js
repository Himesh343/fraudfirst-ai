import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req, res, next) {
  next(new ApiError("The requested API endpoint was not found.", 404, "ROUTE_NOT_FOUND"));
}
