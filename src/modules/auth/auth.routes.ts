import express from 'express';
import { loginController } from './login.controller';
import { logoutAllController, logoutController } from './logout.controller';
import { refreshTokenController, refreshTokenWithBodyController } from './refresh.controller';
import { registerController } from './register.controller';

var router = express.Router();

router.post('/register', registerController)
router.post('/login', loginController)
// router.post('/activate-account', ...accountActivationController)
router.get('/logout', logoutController)
router.get('/logout-all', logoutAllController)
router.get('/refresh', refreshTokenController)
router.post('/refresh', refreshTokenWithBodyController)

export const authRouter = router;