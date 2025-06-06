import express from 'express';

//Controllers
import { 
    createUser,
    loginUser, 
    logoutCurrentUser, 
    getAllUsers,
    getCurrentUserProfile,
    updateCurrentUserProfile,
}from '../controllers/userController.js';

//middlewares
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware.js';


const router = express.Router();

//Create users and Get All users
router.route("/").post(createUser).get(authenticate, authorizeAdmin, getAllUsers);
//logIn user
router.post("/auth", loginUser);
//logOut
router.post("/logout", logoutCurrentUser);
//Specific user and Update user
router.route("/profile").get(authenticate, getCurrentUserProfile).put(authenticate, updateCurrentUserProfile);

export default router;