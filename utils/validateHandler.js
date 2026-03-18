let { body, validationResult } = require('express-validator')
module.exports = {
    validatedResult: function (req, res, next) {
        let result = validationResult(req);
        if (result.errors.length > 0) {
            res.status(404).send(result.errors.map(
                function (e) {
                    return {
                        [e.path]: e.msg
                    }
                }
            ))
        } else {
            next()
        }
    },
    CreateAnUserValidator: [
        body('username').notEmpty().withMessage("username khong duoc rong").bail().isAlphanumeric().withMessage("username khong duoc chua ki tu dac biet"),
        body('email').notEmpty().withMessage("email khong duoc rong").bail().isEmail().withMessage("email sai dinh dang").normalizeEmail(),
        body('password').notEmpty().withMessage("password khong duoc rong").bail().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage(" password it naht 8 ki tu trong do co it nhat 1 ki tu dac biet, 1 ki tu in hoa, 1 ki tu thuong , 1 ki tu so"),
        body("avatarUrl").optional({
            checkFalsy: true
        }).isURL().withMessage("URL sai dinh dang")
    ],
    ModifyAnUser: [
        body('username').isEmpty().withMessage("khong duoc thay doi username"),
        body('email').isEmpty().withMessage("email khong thay doi"),
        body('password').optional().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage(" password it naht 8 ki tu trong do co it nhat 1 ki tu dac biet, 1 ki tu in hoa, 1 ki tu thuong , 1 ki tu so"),
        body("avatarUrl").optional({
            checkFalsy: true
        }).isURL().withMessage("URL sai dinh dang"),
        body("role").optional().isMongoId().withMessage("role khong hop le"),
        body('images').optional().isArray({
            min: 1
        }).withMessage("hinh anh co it nhat 1"),
        body('images.*').isURL().withMessage("URL hinh anh phai hop le")
    ],
    ChangePasswordValidator: [
        body('oldPassword').notEmpty().withMessage("mật khẩu cũ không được để trống"),
        body('newPassword').notEmpty().withMessage("mật khẩu mới không được để trống").bail()
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minNumbers: 1,
                minSymbols: 1,
                minUppercase: 1
            }).withMessage("mật khẩu mới phải ít nhất 8 ký tự gồm: 1 ký tự đặc biệt, 1 ký tự in hoa, 1 ký tự thường, 1 số")
    ]
}