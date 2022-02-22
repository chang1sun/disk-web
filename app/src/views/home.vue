<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header class="header" name="home-header">
      <img class="home-title" src="../assets/logo.png" />
      <div class="global-search">
        <el-autocomplete
          v-model="query"
          :fetch-suggestions="querySearchAsync"
          placeholder="请输入想要搜索的内容"
          @select="handleSelect"
        ></el-autocomplete>
      </div>
      <div class="user-profile">
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            <el-avatar>
              {{ profile.userId.charAt(0).toUpperCase() }}
            </el-avatar>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="profile"
              ><i class="el-icon-edit el-icon--right"></i
              >个人信息</el-dropdown-item
            >
            <el-dropdown-item command="modify"
              ><i class="el-icon-setting el-icon--right"></i
              >修改密码</el-dropdown-item
            >
            <el-dropdown-item command="quit" divided
              ><i class="el-icon-switch-button el-icon--right"></i
              >切换账号</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="'170px'">
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="#2b4b6b"
          text-color="#fff"
          :collapse="false"
          router
          :default-active="'/home/contents/' + encodeURIComponent('/')"
        >
          <el-submenu :index="'1'">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <i class="el-icon-folder-opened"></i>
              <span>文件管理</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/home/contents/' + encodeURIComponent('/')"
              @click="saveNavState('/home/contents/' + encodeURIComponent('/'))"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>目录</span>
              </template>
            </el-menu-item>
            <el-menu-item
              :index="'/home/class/pictures'"
              @click="saveNavState('/home/class/pictures')"
            >
              <template slot="title">
                <i class="el-icon-picture-outline"></i>
                <span>图片</span>
              </template>
            </el-menu-item>
            <el-menu-item
              :index="'/home/class/videos'"
              @click="saveNavState('/home/class/videos')"
            >
              <template slot="title">
                <i class="el-icon-video-camera"></i>
                <span>视频</span>
              </template>
            </el-menu-item>
            <el-menu-item
              :index="'/home/class/musics'"
              @click="saveNavState('/home/class/musics')"
            >
              <template slot="title">
                <i class="el-icon-headset"></i>
                <span>音乐</span>
              </template>
            </el-menu-item>
            <el-menu-item
              :index="'/home/class/documents'"
              @click="saveNavState('/home/class/documents')"
            >
              <template slot="title">
                <i class="el-icon-notebook-1"></i>
                <span>文件</span>
              </template>
            </el-menu-item>
          </el-submenu>
          <el-submenu :index="'2'">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <i class="el-icon-connection"></i>
              <span>分享与转存</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/home/record'"
              @click="saveNavState('/home/record')"
            >
              <template slot="title">
                <i class="el-icon-toilet-paper"></i>
                <span>分享记录</span>
              </template>
            </el-menu-item>
            <el-menu-item
              :index="'/home/face-to-face-share'"
              @click="saveNavState('/home/face-to-face-share')"
            >
              <template slot="title">
                <i class="el-icon-position"></i>
                <span>面对面分享</span>
              </template>
            </el-menu-item>
          </el-submenu>
          <el-menu-item :index="'/home/statistic'">
            <template slot="title">
              <i class="el-icon-s-data"></i>
              <span>统计与分析</span>
            </template>
          </el-menu-item>
          <el-menu-item :index="'/home/recycle-bin'">
            <template slot="title">
              <i class="el-icon-delete"></i>
              <span>回收站</span>
            </template>
          </el-menu-item>
        </el-menu>
        <div class="left-size">
          <el-progress
            type="dashboard"
            :percentage="percentage"
            :color="colors"
          ></el-progress>
          <div class="size-desc">
            <p>已用空间</p>
            <span>{{
            displaySize(parseInt(profile.usedSize)) +
            " / " +
            displaySize(parseInt(profile.totalSize))
          }}</span>
          </div>
          
        </div>
      </el-aside>
      <!-- 右侧主体区域 -->
      <el-main>
        <!-- 对话框 -->
        <el-dialog title="用户信息" :visible.sync="dialogProfileVisible">
          <el-descriptions title="用户信息">
            <el-descriptions-item label="用户名">{{
              profile.userId
            }}</el-descriptions-item>
            <el-descriptions-item label="电子邮箱"
              >{{ profile.authEmail
              }}<el-button
                type="text"
                @click="openEmailInput"
                icon="el-icon-edit"
                size="small"
                class="email-show-btn"
              >
              </el-button
            ></el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag size="small">良好</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">{{
              profile.registerTime
            }}</el-descriptions-item>
            <el-descriptions-item label="拥有文件数">{{
              profile.fileNum
            }}</el-descriptions-item>
            <el-descriptions-item label="已上传的文件数">{{
              profile.fileUploadNum
            }}</el-descriptions-item>
          </el-descriptions>
        </el-dialog>
        <el-dialog
          title="修改密码"
          :visible.sync="dialogModifyVisible"
          width="40%"
        >
          <el-form
            :model="modifyForm"
            :rules="modifyFormRules"
            ref="modifyForm"
            status-icon
          >
            <el-form-item label="当前密码">
              <el-input placeholder="请输入当前密码" v-model="modifyForm.oldPw">
              </el-input>
            </el-form-item>
            <el-form-item label="新密码">
              <el-input
                placeholder="请输入新的密码"
                v-model="modifyForm.newPw"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button @click="dialogModifyVisible = false">取消 </el-button>
              <el-button type="primary" @click="modifyPw">提交 </el-button>
            </el-form-item>
          </el-form>
        </el-dialog>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
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
    return {
      // 以下为用户资料所需data
      profile: {
        userId: "",
        registerTime: "",
        authEmail: "",
        fileNum: "",
        fileUploadNum: "",
        usedSize: "",
        totalSize: "",
      },
      // 修改密码表单
      modifyForm: {
        oldPw: "",
        newPw: "",
      },
      modifyFormRules: {
        newPw: [{ validator: validatePass, trigger: "blur" }],
      },
      // 以下为全局搜索data
      // 搜索推荐
      results: [],
      // 搜索输入
      query: "",
      // 搜索超时
      timeout: null,
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: "",
      dialogProfileVisible: false,
      dialogModifyVisible: false,
      percentage: 0,
      colors: [
        { color: "#5cb87a", percentage: 60 },
        { color: "#e6a23c", percentage: 90 },
        { color: "#f56c6c", percentage: 100 },
      ],
    };
  },
  created() {
    this.profile.userId = window.localStorage.getItem("userId");
    this.activePath = window.localStorage.getItem("activePath");
  },
  methods: {
    displaySize(size) {
      if (size === 0 || !size) {
        return "";
      } else if (size < 1000) return String(size) + "B";
      else if (size > 1024 && size < 1048576)
        return String((size / 1024).toFixed(1)) + "KB";
      else if (size > 1048576 && size < 1073741824)
        return String((size / 1048576).toFixed(1)) + "MB";
      else return String((size / 1073741824).toFixed(1)) + "GB";
    },
    // 点击按钮，切换按钮的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.localStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    },
    // 加载用户信息
    loadProfile() {
      this.$http.get(this.profile.userId + "/profile").then((res) => {
        if (res.status !== 200) {
          return this.$message.error("服务器异常，请重试!");
        } else if (res.data !== null && "code" in res.data) {
          return this.$message.error(res.data.msg);
        } else {
          this.profile = res.data;
          this.percentage = Math.round(
            (parseInt(this.profile.usedSize) /
              parseInt(this.profile.totalSize)) *
              100
          );
          this.profile.userId = window.localStorage.getItem("userId");
        }
      }).catch();
    },
    openEmailInput() {
      this.$prompt("请输入邮箱", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern:
          /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
        inputErrorMessage: "邮箱格式不正确",
      })
        .then(({ value }) => {
          this.$http
            .post(this.profile.userId + "/profile/modify", { authEmail: value })
            .then((res) => {
              if (res.status !== 200)
                return this.$message.error("服务器异常，请重试!");
              else if (res.data !== null && "code" in res.data) {
                return this.$message.error(res.data.msg);
              } else {
                this.loadProfile();
              }
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入",
          });
        });
    },
    // 以下是全局搜索的方法
    // 加载搜索提示
    loadAll() {
      return [
        { value: "三全鲜食（北新泾店）", address: "长宁区新渔路144号" },
        {
          value: "Hot honey 首尔炸鸡（仙霞路）",
          address: "上海市长宁区淞虹路661号",
        },
        {
          value: "新旺角茶餐厅",
          address: "上海市普陀区真北路988号创邑金沙谷6号楼113",
        },
      ];
    },
    querySearchAsync(queryString, cb) {
      var restaurants = this.restaurants;
      var results = queryString
        ? restaurants.filter(this.createStateFilter(queryString))
        : restaurants;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 3000 * Math.random());
    },
    createStateFilter(queryString) {
      return (query) => {
        return (
          query.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        );
      };
    },
    handleSelect(item) {
      console.log(item);
    },
    handleCommand(command) {
      if (command === "quit") {
        // 清空token
        window.localStorage.clear();
        // 跳转到登录页
        this.$router.push("/login");
      } else if (command === "profile") {
        this.dialogProfileVisible = true;
      } else if (command === "modify") {
        this.dialogModifyVisible = true;
      }
    },
    modifyPw() {
      const data = {
        userId: this.profile.userId,
        oldPw: this.modifyForm.oldPw,
        newPw: this.modifyForm.newPw,
      };
      this.$http.post("auth/modify-pw", data).then((res) => {
        if (res.status !== 200) {
          return this.$message.error("服务器异常，请重试!");
        } else if (res.data !== null && "code" in res.data) {
          if (res.data.code === 10110) {
            return this.$message.warn("当前密码输入错误，更改失败");
          }
          return this.$message.error(res.data.msg);
        } else if (res.data !== null) {
          this.getContentList();
          this.dialogModifyVisible = false;
          return this.$message.success("设置成功!");
        }
      });
    },
  },
  mounted() {
    this.loadProfile();
    this.restaurants = this.loadAll();
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background: #2b4b6b;
  color: #fff;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  font-size: 20px;
  height: 120px;
}
.el-aside {
  background: #2b4b6b;
  color: #fff;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}

.global-search {
  position: absolute;
  top: 10px;
  right: 400px;
}
.home-title {
  display: inline-block;
  margin: -1px;
  width: 200px;
  height: 60px;
  border: none;
}
.user-profile {
  position: absolute;
  top: 10px;
  right: 20px;
}
.email-show-btn {
  position: absolute;
  top: 125px;
  right: 260px;
}
.size-desc {
  position: absolute;
  font-size: 12px;
  top: 115px;
  right: 20px;
}
.left-size {
  position: absolute;
  left: 20px;
  bottom: 50px;
}
/deep/ .el-progress__text {
  color: #fff;
}
.el-avatar {
  background: #3399cc;
}
</style>
