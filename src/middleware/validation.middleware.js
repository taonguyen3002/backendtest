/**
 * Validation Middleware
 * Validate request data before reaching controller
 */

const validateRequest = (validator, method = "validateCreateUser") => {
  return async (req, res, next) => {
    try {
      const validation = validator[method](req.body);

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validation.errors,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
