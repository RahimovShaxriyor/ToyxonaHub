import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import {
  authLimiter,
  loginLimiter,
  registerLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
} from '../../middleware/rate-limiter.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from './auth.validation.js';

const router = Router();

router.post('/register', registerLimiter, validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authLimiter, validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/send-otp', otpSendLimiter, validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', otpVerifyLimiter, validate(verifyOtpSchema), authController.verifyOtp);

export default router;
