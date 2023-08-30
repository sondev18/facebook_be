const { sendResponse, AppError, catchAsync } = require('../helpers/utils');
const User = require('../models/User');
const Friend = require('../models/Friend')
const bcrypt = require('bcryptjs')
const {createReadStream} = require('fs');
const sendMail = require('../helpers/sendMail');

const userController ={}; 

userController.register = catchAsync(async(req, res , next) => {

    let {name, email, password} = req.body;

    let user = await User.findOne({email})
    if(user) throw new AppError(400, 'User already exits', 'register error')
    
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    user = await User.create({email,name,password})
    
    
    sendResponse(
        res,
        200,
        true,
        {user},
        null,
        "Register User Success"
    )
})

userController.getAllUsers = catchAsync(async(req,res,next) => {
    let {page, limit , ...filter} = req.query
    const currentUserId = req.userId
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const filterConditions = [{isDeleted: false}]
    if(filter.name) {
        filterConditions.push({
            name: {$regex: filter.name, $options:"i"},
        })
    }
    const filterCriteria = filterConditions.length ? {$and: filterConditions} : {}
    const count = await User.countDocuments(filterCriteria)
    const totalPages = Math.ceil(count / limit)
    const offset = limit * (page -1)
    let users = await User.find(filterCriteria)
        .sort({createdAt: -1})
        .skip(offset)
        .limit(limit)

    const promises = users.map(async (user) => {
       let temp = user.toJSON();
        temp.friendship = await Friend.findOne({
        $or:[
            {from: currentUserId, to: user._id},
            {from: user._id, to:currentUserId}
        ]
        })
        return temp;
    })
    const usersWithFriendship = await Promise.all(promises)
    return sendResponse(
        res,
        200,
        true,
        {users:usersWithFriendship, totalPages, count},
        null,
        "Update user success"
    )
    
})  

userController.getCurrentUser = catchAsync(async(req,res,next) => {
    const currentUserId = req.userId;
    const user = await User.findById(currentUserId);
    if(!user) throw new AppError(400, "User not Found", "Get current user error")

    return sendResponse(
        res,
        200,
        true,
        user,
        null,
        "Get Current User successful"
    )
})

userController.getSingUser = catchAsync(async(req,res,next) => {
    const currentUserId = req.userId;
    const userId = req.params.id

    let user = await User.findById(userId);
    if(!user) throw new AppError(400, "User not Found", "Get current user error")
    
    user = user.toJSON();
    user.friendship = await Friend.findOne({
        $or:[
            {from: currentUserId, to: user._id},
            {from: user._id, to:currentUserId}
        ]
    })
    
    return sendResponse(
        res,
        200,
        true,
        user,
        null,
        "Get Sign User successful"
    )
})

userController.updateProfile = catchAsync(async(req,res,next) => {
    const currentUserId = req.userId;
    const userId = req.params.id

    if(userId !== currentUserId) throw new AppError(400, "Permission required", "Update User Error")
    let user = await User.findById(userId);
    if(!user) throw new AppError(400, "User not Found", "Get current user error")

    const allows = [
        "name",
        "avatarUrl",
        "coverUrl",
        "aboutMe",
        "city",
        "address",
        "country",
        "company",
        "jobTitle",
        "facebookLink",
        "instagramLink",
        "linkedinLink",
        "twitterLink",
        "phoneNumber"
    ]
    allows.forEach((field) => {
        if(req.body[field] !== undefined){
            user[field] = req.body[field];
        }
    })
    await User.create(user)
    return sendResponse(
        res,
        200,
        true,
        user,
        null,
        "Update user success"
    )
})
// forgot password
userController.forgotPassword = catchAsync(async(req, res, next) => {
    const {email} = req.body;
    let user = await User.find({ email }, "+password");
    if (!user.length) {
      throw new AppError(400, "User Not Exists", "Reset Password Error");
    }
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("12345678", salt);
    let templateVars = { name: user[0]?.name, password: 12345678 };
    let subject = "Reset Password";
    await sendMail({ template: "template", templateVars, subject, to: email });
    user = await User.updateOne({ email: email }, { password: password });  
    sendResponse(res, 200, true, user, null, "Reset Password Success");
})

module.exports = userController;