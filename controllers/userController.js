import axios from "axios";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import OTP from "../models/otp.js";
import User from "../models/user.js";
import { Resend } from "resend";


dotenv.config();

export function createUser(req,res){
    if(req.body.role == "admin"){
        if(req.user!= null){
            if(req.user.role != "admin"){
                res.status(403).json({
                    message : "You are not authorized to create an admin accounts"
                })
                return
            }
        }else{
            res.status(403).json({
                message : "You are not authorized to create an admin accounts. Please login first"
            })
            return
        }
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10)

    const user = new User({
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email,
        password : hashedPassword,
        role : req.body.role,
    })


    user.save().then(
        ()=>{
            res.json({
                message : "User created successfully"
            })
        }
    ).catch(
        ()=>{
            res.json({
                message : "Failed to create user"
            })
        }
    )
}

// Add this to your backend controller
export async function getAllUsers(req, res) {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can view all users" });
        }

        // Get all users from database
        const users = await User.find({}, { password: 0 }); // Exclude passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
}

export function loginUser(req,res){
    const email = req.body.email
    const password = req.body.password

    User.findOne({email : email}).then(
        (user)=>{
            if(user == null){
                res.status(404).json({
                    message : "User not found"
                })
            }else{
                const isPasswordCorrect = bcrypt.compareSync(password , user.password)
                if(isPasswordCorrect){
                    const token = jwt.sign(
                        {
                            email : user.email,
                            firstName : user.firstName,
                            lastName : user.lastName,
                            role : user.role,
                            img : user.img
                        },
                         process.env.JWT_KEY
                    )
                    res.json({
                        token : token,
                        message : "Login successful",
                        role : user.role,
                        
                    })

                }else{
                    res.status(401).json({
                        message : "Invalid password",
                    })
                }
            }

        }
    )
    
}
export async function loginWithGoogle(req,res){
    const token = req.body.accessToken;
    if(token == null){
        res.status(400).json({
            message: "Access token is required"
        });
        return;
    }
    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    console.log(response.data);

    const user = await User.findOne({
        email: response.data.email
    })
    
    if(user == null){
        const newUser = new User(
            {
                email: response.data.email,
                firstName: response.data.given_name,
                lastName: response.data.family_name,
                password: "googleUser",
                img: response.data.picture 
            }
        )
        await newUser.save();
        const token = jwt.sign(
            {
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
                img: newUser.img
            },
             process.env.JWT_KEY
        )
        res.json({
            message: "Login successful",
            token: token,
            role: newUser.role
        })

    }else{

        const token = jwt.sign(
            {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                img: user.img
            },
            process.env.JWT_KEY
        )
        res.json({
            message: "Login successful",
            token: token,
            role: user.role
        })

    }

}



const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTP(req, res) {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const randomOTP = Math.floor(100000 + Math.random() * 900000);

    await OTP.deleteMany({ email });

    const otp = new OTP({ email, otp: randomOTP });
    await otp.save();

    // 💌 Send email using Resend
    const { data, error } = await resend.emails.send({
      // ✅ Must be a valid address you own or verified on Resend
      from: "Elora Beauty <onboarding@resend.dev>",
      to: email,
      subject: "Resetting password for Elora Beauty",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Elora Beauty</h2>
          <p>Use the following OTP to reset your password:</p>
          <h1 style="color: #E91E63;">${randomOTP}</h1>
          <p>This code will expire soon. Please do not share it with anyone.</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Email send error:", error);
      return res.status(500).json({ message: "Failed to send OTP", error });
    }

    console.log("✅ Email sent successfully:", data?.id);

    return res.status(200).json({
      message: "OTP sent successfully",
      otp: randomOTP,
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}


export function getUser(req,res){
    if(req.user == null){
        res.status(403).json({
            message: "You are not authorized to view user details"
        })
        return
    }else{
        res.json({
            ...req.user
        })
    }
}



export async function resetPassword(req,res){
    const otp  = req.body.otp
    const email = req.body.email
    const newPassword = req.body.newPassword
    console.log(otp)
    const response = await OTP.findOne({
        email : email
    })
    
    if(response==null){
        res.status(500).json({
            message : "No otp requests found please try again"
        })
        return
    }
    if(otp == response.otp){
        await OTP.deleteMany(
            {
                email: email
            }
        )
        console.log(newPassword)

        const hashedPassword = bcrypt.hashSync(newPassword, 10)
        const response2 = await User.updateOne(
            {email : email},
            {
                password : hashedPassword
            }
        )
        res.json({
            message : "password has been reset successfully"
        })
    }else{
        res.status(403).json({
            meassage : "OTPs are not matching!"
        })
    }
}

// In your user controller

export async function getProfile(req, res) {
    if (!req.user) {
        return res.status(403).json({ message: "Not logged in" });
    }

    const user = await User.findOne({ email: req.user.email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        img: user.img || "https://avatar.iran.liara.run/public/boy?username=Ash",
    });
}

 
export async function updateEmail(req,res){
    try {
        const { newEmail } = req.body;
        if (!newEmail) {
            return res.status(400).json({ message: "New email is required" });
        }
        // req.user.email comes from the token
        const updatedUser = await User.findOneAndUpdate(
            { email: req.user.email },
            { email: newEmail },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "Email updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating email:", error);
        res.status(500).json({ message: "Server error" });
    }
}


export function isAdmin(req){
    if(req.user == null){
        return false
    }
    if(req.user.role != "admin"){
        return false
    }
    return true
}

//repo name change
