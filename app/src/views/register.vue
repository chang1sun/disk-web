<template>
  <div class="register_container">
    <div class="register_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/loginlogo.jpg" alt="" />
      </div>
      <!-- 注册表单区域 -->
      <el-form
        ref="registerForm"
        status-icon
        :model="registerForm"
        :rules="registerFormRules"
        label-width="0px"
        class="register_form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username" class="username">
          <el-input
            id="username"
            v-model="registerForm.username"
            prefix-icon="iconfont icon-user"
            placeholder="输入您的用户名"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password" class="password">
          <el-input
            id="password"
            v-model="registerForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
            show-password
            placeholder="输入您的密码"
          ></el-input>
        </el-form-item>
        <!-- 再次输入密码 -->
        <el-form-item prop="repeat" class="repeat">
          <el-input
            id="repeat"
            v-model="registerForm.repeat"
            prefix-icon="iconfont icon-3702mima"
            type="password"
            show-password
            placeholder="再次输入您的密码以确认"
          ></el-input>
        </el-form-item>
        <!-- 验证邮箱 -->
        <el-form-item prop="email" class="email">
          <el-input
            id="email"
            v-model="registerForm.email"
            prefix-icon="iconfont icon-morentouxiang"
            placeholder="输入您的邮箱地址"
            >
          </el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button
            type="primary"
            icon="el-icon-arrow-left"
            @click="returnToLogin"
            class="return_to_login"
            >返回登录</el-button
          >
          <el-button type="primary" @click="register" icon="el-icon-check"
            >注册</el-button
          >
          <el-button
            type="info"
            @click="resetRegisterForm"
            icon="el-icon-refresh-left"
            >重置</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    var checkEmail = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入邮箱"));
      } else {
        var regx =
          /[A-Za-z0-9]+([_.][A-Za-z0-9]+)*@([A-Za-z0-9-]+.)+[A-Za-z]{2,6}$/;
        if (!regx.test(this.registerForm.email)) {
          callback(new Error("邮箱格式错误"));
        }
        callback();
      }
    };
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (value.length < 6) {
        callback(new Error("长度需大于6"));
      } else {
        if (this.registerForm.repeat !== "") {
          this.$refs.registerForm.validateField("repeat");
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.registerForm.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      // 登录表单的数据绑定对象
      registerForm: {
        username: "",
        password: "",
        repeat: "",
        email: "",
      },
      // 表单的验证规则对象
      registerFormRules: {
        // 验证密码是否合法
        password: [{ validator: validatePass, trigger: "blur" }],
        repeat: [{ validator: validatePass2, trigger: "blur" }],
        // 验证用户名是否合法
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        // 验证邮箱是否合法
        email: [{ validator: checkEmail, trigger: "blur" }],
      },
    };
  },
  methods: {
    // 点击重置按钮，重置表单
    resetRegisterForm() {
      // console.log(this);
      this.$refs.registerForm.resetFields();
    },
    register() {
      this.$refs.registerForm.validate(async (valid) => {
        // console.log(valid)
        if (!valid) return 0;
        var postForm = {
          userId: this.registerForm.username,
          pw: this.registerForm.password,
          authEmail: this.registerForm.email,
        };
        const res = await this.$http.post("auth/sign-up", postForm);
        if (res.status !== 200)
          return this.$message.error("服务器异常，请重试!");
        else if (res.data.code == 10101){
          return this.$message.error("该用户名已存在");
        }
        else if (res.data !== null && ('code' in res.data)) {
          return this.$message.error(res.data.msg);
        }
        else {
          this.$message.success("注册成功!请登录");
          this.$router.push("/login");
        }
        // console.log(res)
      });
    },
    returnToLogin() {
      this.$router.push("/login");
    },
  },
};
</script>

<style lang="less" scoped>
.register_container {
  background-color: #2b4b6b;
  height: 100%;
}
.register_box {
  width: 550px;
  height: 500px;
  background-color: #fff;
  border-radius: 10px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    height: 150px;
    width: 150px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.btns {
  display: flex;
  justify-content: flex-end;
  position: absolute;
  right: 30px;
  bottom: -80px;
}
.register_form {
  position: absolute;
  top: 120px;
  left: 0px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>
