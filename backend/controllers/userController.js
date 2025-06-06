import User from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../middlewares/asyncHandler.js";
import createToken from "../utils/createToken.js";

//Create User
const createUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    
    //Check if all fields are filled
    if (!username || !email || !password) {
        throw new Error("Please fill in all fields");
    }

    //If the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) res.status(400).send("User already exists");


    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Create user
    const newUser = new User({username, email, password: hashedPassword});

    //Save user in the database
    try {
        await newUser.save();
        createToken(res, newUser._id)

        res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            isAdmin: newUser.isAdmin,
        
        })
        
    } catch (error) {
        res.status(400);
        throw new Error("Invalid data user");
    }
}); 

//LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    //Check if user is already in de database
    const existingUser = await User.findOne({ email });
    
    if (existingUser){
        const isPasswordValid = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (isPasswordValid){
         createToken(res, existingUser._id);   
        
         res.status(201).json({
            _id: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
            isAdmin: existingUser.isAdmin,
         });
    } else {
        res.status(401).json({message: "Invalid Password"});
    }
} else {
    res.status(401).json({message: "User not found"});
}
});

//LOGOUT USER
const logoutCurrentUser = asyncHandler(async (req, res)=>{
    res.cookie("jwt", "",{
    httpOnly: true,
    expires: new Date(0)
})
  res.status(200).json({mesage: "Logged out successfully"});

});

//GET ALL USERS
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

//Specific user
const getCurrentUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user){
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

//Update user
const updateCurrentUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user){
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
    
    if(req.body.password){
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        user.password = hashedPassword;
    }

    const updateUser = await user.save();

    res.json({
        _id: updateUser._id,
        username: updateUser.username,
        email: updateUser.email,
        isAdmin: updateUser.isAdmin,
    });
} else {
    res.status(404);
    throw new Error("User not found");
}

});

export { 
    createUser, 
    loginUser, 
    logoutCurrentUser, 
    getAllUsers, 
    getCurrentUserProfile, 
    updateCurrentUserProfile 
};