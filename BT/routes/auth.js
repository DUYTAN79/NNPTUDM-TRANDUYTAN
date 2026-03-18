var express = require("express");
var router = express.Router();
let userController = require('../BT/controllers/users')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let fs = require('fs');
const { CheckLogin } = require("../utils/authHandler");
const { ChangePasswordValidator, validatedResult, CreateAnUserValidator } = require("../utils/validateHandler");

router.post('/register', CreateAnUserValidator, validatedResult, async function (req, res, next) {
    try {
        let { username, password, email } = req.body;
        let newUser = await userController.CreateAnUser(
            username, password, email, "69b0ddec842e41e8160132b8", "", "https://i.sstatic.net/l60Hf.png", false, 0
        )
        res.send({
            message: "Đăng ký thành công",
            user: {
                username: newUser.username,
                email: newUser.email,
                fullName: newUser.fullName,
                avatarUrl: newUser.avatarUrl,
                status: newUser.status,
                role: newUser.role
            }
        })
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
})

router.post('/changepassword', CheckLogin, ChangePasswordValidator, validatedResult, async function (req, res, next) {
    try {
        let { oldPassword, newPassword } = req.body;
        let userId = req.user._id;
        let user = req.user;
        
        // Kiểm tra mật khẩu cũ
        if (!bcrypt.compareSync(oldPassword, user.password)) {
            res.status(404).send({
                message: "mật khẩu cũ không chính xác"
            })
            return;
        }
        
        // Kiểm tra mật khẩu mới không giống mật khẩu cũ
        if (oldPassword === newPassword) {
            res.status(404).send({
                message: "mật khẩu mới không được giống mật khẩu cũ"
            })
            return;
        }
        
        // Cập nhật mật khẩu mới
        let updatedUser = await userController.UpdatePassword(userId, newPassword);
        
        res.send({
            message: "thay đổi mật khẩu thành công"
        })
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
})

router.post('/login', async function (req, res, next) {
    try {
        let { username, password } = req.body;
        let user = await userController.GetAnUserByUsername(username);
        if (!user) {
            res.status(404).send({
                message: "thong tin dang nhap sai"
            })
            return;
        }
        if (user.lockTime > Date.now()) {
            res.status(404).send({
                message: "ban dang bi ban"
            })
            return
        }
        if (bcrypt.compareSync(password, user.password)) {
            user.loginCount = 0;
            if (typeof user.save === 'function') await user.save();
            let token = jwt.sign({
                id: user._id
            }, 'secret', {
                expiresIn: '1h'
            })
            res.send(token)
        } else {
            user.loginCount = (user.loginCount || 0) + 1;
            if (user.loginCount == 3) {
                user.loginCount = 0;
                user.lockTime = Date.now() + 3600 * 1000
            }
            if (typeof user.save === 'function') await user.save();
            res.status(404).send({
                message: "thong tin dang nhap sai"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }

})
router.get('/me',CheckLogin,function(req,res,next){
    res.send(req.user)
})



module.exports = router;