<template>
  <div class="forget_container">
    <div class="forget_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.jpg" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <el-form
        status-icon
        ref="forgetForm"
        :model="forgetForm"
        :rules="forgetFormRules"
        label-width="0px"
        class="forget_form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username" class="username">
          <el-input
            id="username"
            v-model="forgetForm.username"
            prefix-icon="iconfont icon-user"
            placeholder="输入您的用户名"
          ></el-input>
        </el-form-item>
        <!-- 验证邮箱 -->
        <el-form-item prop="email" class="email">
          <el-input
            id="email"
            v-model="forgetForm.email"
            prefix-icon="iconfont icon-morentouxiang"
            placeholder="输入您注册时使用的邮箱地址"
          ></el-input>
        </el-form-item>
        <!-- 新密码 -->
        <el-form-item prop="password" class="password">
          <el-input
            id="password"
            v-model="forgetForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
            show-password
            placeholder="输入新的密码"
          ></el-input>
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
          <el-button type="primary" @click="resetPassword" icon="el-icon-check"
            >提交修改申请</el-button
          >
          <el-button
            type="info"
            @click="restForgetForm"
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
    callback(new Error("验证邮箱不能为空"));
    } else {
    var regx =
        /[A-Za-z0-9]+([_.][A-Za-z0-9]+)*@([A-Za-z0-9-]+.)+[A-Za-z]{2,6}$/;
    if (!regx.test(this.forgetForm.email)) {
        callback(new Error("邮箱格式错误"));
    }
    callback();
    }
    };
    return {
      // 登录表单的数据绑定对象
      forgetForm: {
        username: '',
        password: '',
        email: '',
        
      },
      // 表单的验证规则对象
      forgetFormRules: {
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
        // 验证邮箱是否合法
        email: [{ validator: checkEmail, trigger: "blur" }],
      },
    };
  },
  methods: {
    // 点击重置按钮，重置登录表单
    restForgetForm() {
      // console.log(this);
      this.$refs.forgetForm.resetFields();
    },
    resetPassword() {
      this.$refs.forgetForm.validate(async (valid) => {
        // console.log(valid)
        if (!valid) return 0;
        var postForm = {
          userId: this.forgetForm.username,
          pw: this.forgetForm.password,
        };
        const res = await this.$http.post("auth/modify-pw", postForm);
        console.log(res);
        if (res.status !== 200)
          return this.$message.error("服务器异常，请重试!");
        else if (res.data.code === 10102)
          return this.$message.error("该用户不存在，请检查输入");
        else if (res.data !== null && ('code' in res.data)) {
          return this.$message.error(res.data.msg);
        }
        else {
          this.$message.success("修改密码成功，请登录!");
          this.$router.push("/login");
        }
      });
    }
  },
};
</script>

<style lang="less" scoped>
.forget_container {
  background-color: #2b4b6b;
  height: 100%;
}
.forget_box {
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
  top: 200px;
}
.forget_form {
  position: absolute;
  top: 120px;
  left: 0px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>
