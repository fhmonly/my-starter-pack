import express from 'express'
import { registerController } from '../controller/auth/register';
import { loginController } from '../controller/auth/login';
import { logoutAllController, logoutController } from '../controller/auth/logout';
import { refreshTokenController, refreshTokenWithBodyController } from '../controller/auth/refresh';
var router = express.Router();

router.post('/register', ...registerController)
router.post('/login', ...loginController)
// router.post('/activate-account', ...accountActivationController)
router.get('/logout', ...logoutController)
router.get('/logout-all', ...logoutAllController)
router.get('/refresh', ...refreshTokenController)
router.post('/refresh', ...refreshTokenWithBodyController)

export default router;