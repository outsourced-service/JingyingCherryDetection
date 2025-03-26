export default {
    nickname: { required: true, message: '请输入昵称', trigger: 'blur' },
    phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }, {
        validator: (rule: any, value: any, callback: any) => {
            if (!/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/g.test(value)) {
                callback(new Error('请输入正确的手机号'))
            } else {
                callback()
            }
        },
        trigger: 'blur'
    }],
    username: { required: true, message: '请输入账号', trigger: 'blur' },
    password: { required: true, message: '请输入密码', trigger: 'blur' },
    is_login: { required: true, message: '请选择是否允许登录后台', trigger: 'blur' },
    avatar_id: { required: true, message: '请传入头像', trigger: 'blur' },
    role_pk: [{ required: true, message: '请选择角色', trigger: 'blur' }, {
        validator: (rule: any, value: any, callback: any) => {
            if (!value?.length) {
                callback(new Error('请选择角色'))
            } else {
                callback()
            }
        },
        trigger: 'blur'
    }],
    company_company: { required: false, message: '请选择所在企业', trigger: 'blur' },
}