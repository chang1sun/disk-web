<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/loginlogo.jpg" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <el-form
        status-icon
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
        label-width="0px"
        class="login_form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username" class="username">
          <el-input
            id="username"
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
            placeholder="输入您的用户名"
          ></el-input>
        </el-form-item>
        <!-- 忘记密码 -->
        <el-form-item class="forget">
          <el-link type="info" @click="jumpToForget">忘记密码？</el-link>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password" class="password">
          <el-input
            id="password"
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
            placeholder="输入您的密码"
            show-password
          ></el-input>
        </el-form-item>
        <!-- 注册跳转 -->
        <el-form-item class="register">
          <el-link type="primary" @click="jumpToRegister"
            >没有账号？注册一个<i class="el-icon-caret-right el-icon--right"></i
          ></el-link>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login" icon="el-icon-check"
            >登录</el-button
          >
          <el-button
            type="info"
            @click="resetLoginForm"
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
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: null,
        password: null,
      },
      // 表单的验证规则对象
      loginFormRules: {
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
        // 验证密码是否合法
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    // 点击重置按钮，重置登录表单
    resetLoginForm() {
      // console.log(this);
      this.$refs.loginFormRef.resetFields();
    },
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        // console.log(valid)
        if (!valid) return 0;
        var postForm = {
          userId: this.loginForm.username,
          pw: this.loginForm.password,
        };
        const res = await this.$http.post("auth/sign-in", postForm);
        console.log(res);
        if (res.status !== 200)
          return this.$message.error("服务器异常，请重试!");
        else if (res.data.code === 10102) {
          return this.$message.error("用户名或密码错误，请重新输入");
        }
        else if (res.data !== null && ('code' in res.data)) {
          return this.$message.error(res.data.msg);
        }
        else if (res.data !== null) {
          this.$message.success("登录成功!");
          localStorage.setItem("userId", postForm.userId)
          localStorage.setItem("token", res.data.token);
          this.$router.push('/' + postForm.userId + '/contents/' + encodeURIComponent('/'));
        }
      });
    },
    jumpToRegister() {
      this.$router.push("/register");
    },
    jumpToForget() {
      this.$router.push("/forget");
    },
  },
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 550px;
  height: 400px;
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
  top: 160px;
}
.login_form {
  position: absolute;
  top: 120px;
  left: 0px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.forget {
  position: absolute;
  right: 20px;
  top: 100px;
}
.register {
  position: absolute;
  left: 200px;
  top: 220px;
}
</style>
