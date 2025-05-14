import { Request, Response, NextFunction } from "express";
import { RequestHandler } from "express";

/**
 * Wraps an async controller function to properly handle express middleware errors
 * This fixes the TypeScript error where express expects void | Promise<void> but our controllers return Response
 */
export const wrapAsync = (fn: Function): RequestHandler => {
  // Create a handler function that conforms to Express's RequestHandler type
  return function (req: Request, res: Response, next: NextFunction): void {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      next(err);
    });
  } as RequestHandler;
};
