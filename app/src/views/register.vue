<template>
  <div class="register_container">
      <div class="register_box">
          <!-- 头像区域 -->
          <div class="avatar_box">
              <img src="../assets/logo.jpg" alt="">
          </div>
          <!-- 注册表单区域 -->
          <el-form ref="registerFormRef" :model="registerForm" :rules="registerFormRules" label-width="0px" class="register_form">
            <!-- 用户名 -->
            <el-form-item prop="username" class="username">
                <el-input id="username" v-model="registerForm.userId" prefix-icon="iconfont icon-user" placeholder="输入您的用户名"></el-input>
            </el-form-item>
            <!-- 密码 -->
            <el-form-item prop="password" class="password">
                <el-input id="password" v-model="registerForm.pw" prefix-icon="iconfont icon-3702mima" type="password" placeholder="输入您的密码"></el-input>
            </el-form-item>
            <!-- 再次输入密码 -->
            <el-form-item prop="password2" class="password">
                <el-input id="password" v-model="registerForm.pw2" prefix-icon="iconfont icon-3702mima" type="password" placeholder="再次输入您的密码以确认"></el-input>
            </el-form-item>
            <!-- 验证邮箱 -->
            <el-form-item prop="email" class="email">
                <el-input id="email" v-model="registerForm.authEmail" prefix-icon="iconfont icon-morentouxiang" placeholder="输入您的邮箱地址"></el-input>
            </el-form-item>
            <!-- 按钮 -->
            <el-form-item class="btns">
                <el-button type="primary" @click="register">注册</el-button>
                <el-button type="info" @click="resetRegisterForm">重置</el-button>
            </el-form-item>
          </el-form>
      </div>
  </div>
</template>

<script>
export default {
  data () {
    var checkEmail = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入邮箱'));
        } else {
          if (this.ruleForm.authEmail !== '') {
            var regx = /[A-Za-z0-9]+([_.][A-Za-z0-9]+)*@([A-Za-z0-9-]+.)+[A-Za-z]{2,6}$/
            if (regx.test(this.ruleForm.authEmail)) {
                callback(new Error('邮箱格式错误'));
            }
          }
          callback();
        }
      };
    var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.ruleForm.pw) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
    return {
    // 登录表单的数据绑定对象
      registerForm: {
        userId: null,
        pw: null,
        pw2: null,
        authEmail: null
      },
      // 表单的验证规则对象
      registerFormRules: {
        // 验证用户名是否合法
        userId: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        pw: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        pw2: [
            { validator: validatePass2, trigger: 'blur'}
        ],
        // 验证邮箱是否合法
        authEmail: [
            { validator: checkEmail, trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮，重置表单
    resetRegisterForm () {
      // console.log(this);
      this.$refs.registerFormRef.resetFields()
    },
    register () {
      this.$refs.registerFormRef.validate(async (valid) => {
        // console.log(valid)
        if (!valid) return 0
        this.registetForm.pw2 = null
        var postForm = {
            userId: this.registerForm.userId,
            pw: this.registerForm.pw,
            authEmail: this.registerForm.authEmail
        }
        const { data: res } = await this.$http.post('auth/sign-up', postForm)
        if (res.meta.status !== 200) return this.$message.error('服务器异常，请重试!')
        if (res.data.code === null) {
            this.$message.success('注册成功!请登录')
            this.$router.push('/login')
        }
        else return this.$message.error(res.data.msg)
        console.log(res)
      })
    }
  }
}
</script>

<style lang="less" scoped>
.register_container{
    background-color: #2b4b6b;
    height: 100%;
}
.register_box{
    width: 550px;
    height: 400px;
    background-color: #fff;
    border-radius: 10px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    .avatar_box{
        height: 150px;
        width: 150px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%,-50%);
        background-color: #fff;
        img{
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
    }
}
.btns{
    display: flex;
    justify-content: flex-end;
    position: absolute;
    right: 30px;
    top: 160px;
}
.register_form{
    position: absolute;
    top: 120px;
    left: 0px;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}
.forget{
    position: absolute;
    right:20px;
    top:100px;
}
.register{
    position: absolute;
    left:200px;
    top: 165px;
}
</style>
