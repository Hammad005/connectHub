import User from "../models/user.model.js";
import bcrypt from 'bcryptjs'
import { generateToken } from "../utils/jwt.utils.js";
import cloudinary from "../lib/cloudinary.js";


export const signup = async (req, res) => {
    const { email, fullName, password } = req.body;
    try {
        if (!email || !fullName || !password) {
            return res.status(400).json({ success: false, message: "Please fill in all fields" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: "Email already exists" })
        }

        //Hashed Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            fullName,
            password: hashedPassword
        });
        if (newUser) {
            //Generate JWT token 
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                success: true,
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic
            })
        } else {
            res.status(400).json({ success: false, message: "Invalid User Data" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please fill in all fields" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid Credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: "Invalid Credentials" });
        }

        generateToken(user._id, res);
        res.status(200).json({
            success: true,
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
        });
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;
        if (!profilePic) {
            return res.status(400).json({ success: false, message: "Profile Pic Is Required" });
        }

        // if updating a photo
        const user = await User.findOne(userId);
        const profileImageId = user?.profilePic.public_id;
        if (profileImageId) {
            const photoDeleted = await cloudinary.uploader.destroy(profileImageId);
            const uploadResponse = await cloudinary.uploader.upload(profilePic, { folder: "connectHub/Profile" });
            const updatedUser = await User.findByIdAndUpdate(userId, {
                profilePic: {
                    public_id: uploadResponse.public_id,
                    url: uploadResponse.secure_url
                }
            },
                { new: true }
            )
            return res.status(200).json({ success: true, updatedUser })
        }

        //if uploading new photo
        const uploadResponse = await cloudinary.uploader.upload(profilePic, { folder: "connectHub/Profile" });
        const updatedUser = await User.findByIdAndUpdate(userId, {
            profilePic: {
                public_id: uploadResponse.public_id,
                url: uploadResponse.secure_url
            }
        },
            { new: true }
        )
        res.status(200).json({ success: true, updatedUser })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};