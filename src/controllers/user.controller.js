import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const registerUser = asyncHandler( async (req,res) => {
    
    // get user details from frontend
    const { fullName, email, username, password } = req.body 

    // validation - not empty
    if ([fullName, email, username, password].some((field)=>
        field?.trim() === "")){
        throw new ApiError(400, "All fields are required!");
    }
    // check user exists or not
    const existedUser = User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with username or email already exists");
    }

    // check for images
    const avatarLocalpath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalpath){
        throw new ApiError(400, "Avatar file is required!");
    }

    // upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalpath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) throw new ApiError(400, "There is some issue in uploading avatar image");

    // create user object
    // save data in DB
    const user = await User.create({
        fullName,
        username : username.toLowerCase(),
        email,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",

    });

    // remove accessToken and password from response
    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    
    if(!createduser) throw new Error(500, "There is some issue with user creation !");    

    // return response
    return res.status(201, json(new ApiResponse(200, createduser, "User registered successfully!")))
})




