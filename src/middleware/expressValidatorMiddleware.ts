import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { TypedReqHandler } from '../types/core/apiHandler';

const expressValidatorMiddleware: TypedReqHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const httpError = createHttpError.BadRequest()
        httpError.validationErrors = errors.array()
        return next(httpError);
    }
    next();
};

export default expressValidatorMiddleware