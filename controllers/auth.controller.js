const User = require('../models/User');
const { catchAsync, sendResponse, AppError } = require('../helpers/utils')
const bcrypt = require('bcryptjs')

const authController ={}; 

authController.login = catchAsync(async(req, res, next) => {
    const {email, password} = req.body;

    let user = await User.findOne({email}, "+password")
    if(!user) throw new AppError(400, 'Invalid credentials', 'login error')
    
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) throw new AppError(400, 'Wrong password', 'login error Pasword')
    
    const accessToken = await user.generateToken()
    
    sendResponse(
        res,
        200,
        true,
        {user, accessToken},
        null,
        "Login User Success"
    )
})


module.exports = authController;