import { Router } from 'express';
import {
  getAllUsers,
  registerNewUser,
  getUserById,
  deleteUser,
  updateUser,
  verifyUserEmail,
  resendVerificationEmail,
  sendPasswordReset,
  resetPassword,
  changeUserRole,
  deactivateUser,
  reactivateUser,
} from '../controllers/users.js';
import {
  validateAuthentication,
  validateAdminRole,
} from '../middleware/auth.js';

const router = Router();

router.get('/get-all-users', validateAuthentication, validateAdminRole, getAllUsers);
router.get('/get-user-by-id/:userId', validateAuthentication, getUserById);
router.post('/register', registerNewUser);
router.put('/verify-user-email/:userId/:uniqueString', verifyUserEmail);
router.put('/account/update/:userId', validateAuthentication, updateUser);
router.post('/verify/resend-email/:email', resendVerificationEmail);
router.post('/send-password-reset', sendPasswordReset);
router.post('/reset-password/:userId/:uniqueString', resetPassword);
router.put('/account/update/:userId', validateAuthentication, updateUser);
router.put(
  '/account/change-role/:userId',
  validateAuthentication,
  validateAdminRole,
  changeUserRole
);
router.put(
  '/account/deactivate/:userId',
  validateAuthentication,
  validateAdminRole,
  deactivateUser
);
router.put(
  '/account/reactivate/:userId',
  validateAuthentication,
  validateAdminRole,
  reactivateUser
);
router.delete(
  '/delete-user/:userId',
  validateAuthentication,
  validateAdminRole,
  deleteUser
);

export default router;
