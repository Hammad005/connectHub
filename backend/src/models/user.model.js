import mongoose from 'mongoose';

const userScheema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        fullName: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        profilePic:{
            public_id: {
                type: String,
                default: ""
            },
            url: {
                type: String,
                default: ""
            },
        }
    },
    {timestamps: true}
);

const User = mongoose.model("User", userScheema);
export default User;