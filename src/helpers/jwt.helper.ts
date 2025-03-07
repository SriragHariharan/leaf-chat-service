import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import logger from './logger';

// Reopen the Request interface and add user object to it
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/* Validate the access token from the request header and attach the decoded user to the request object. */
export function validateAccessToken(req: Request, _res: Response, next: NextFunction): void {
  logger.debug(`Entering validateAccessToken method.`, { method: "validateAccessToken", layer: "middleware" });
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      logger.error(`Unauthorized request: Authorization header is missing.`, { layer: "middleware" });
      return next(createHttpError.Unauthorized("Unauthorized request, authorization header is required."));
    }

    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];
    if (!token) {
      logger.error(`Unauthorized request: Token is missing.`, { layer: "middleware" });
      return next(createHttpError.Unauthorized("Unauthorized request, token is required."));
    }

    logger.info(`Validating access token.`, { layer: "middleware" });
    const resp = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    req.user = resp;

    logger.info(`Successfully validated access token. UserID: ${req.user?.aud}`, { layer: "middleware" });
    next();
  } catch (error) {
    logger.error(`Error in validateAccessToken:`, { error, layer: "middleware" });
    return next(createHttpError.Unauthorized("Unauthorized request"));
  } finally {
    logger.debug(`Exiting validateAccessToken method.`, { method: "validateAccessToken", layer: "middleware" });
  }
}

/* Verify a token and return the decoded payload. */
export const verifyToken = (token: string) => {
  logger.debug(`Entering verifyToken method.`, { method: "verifyToken", layer: "helper" });
  try {
    logger.info(`Verifying token.`, { layer: "helper" });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);

    logger.info(`Successfully verified token. UserID: ${decoded?.aud}`, { layer: "helper" });
    return decoded;
  } catch (error) {
    logger.error(`Error in verifyToken: Invalid token.`, { error, layer: "helper" });
    return null;
  } finally {
    logger.debug(`Exiting verifyToken method.`, { method: "verifyToken", layer: "helper" });
  }
};