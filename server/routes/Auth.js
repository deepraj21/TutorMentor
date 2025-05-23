import express from 'express';
import { authenticateUser, getuserData, adminSignup, adminSignin, getAdminData } from '../controller/Authentication.js';

const router = express.Router();

router.post('/', authenticateUser);
router.get('/get-data/:id',getuserData);

router.post('/admin-signup', adminSignup);
router.post('/admin-signin', adminSignin);
router.get('/get-admin-data/:id', getAdminData);

export default router;