<template>
  <div>
    <div v-if="!accessPermit">
      <el-empty
        description="分享不见啦！可能是因为过期了～"
        v-if="!tokenExist"
      ></el-empty>
      <div class="access-share-container" v-else>
        <el-card class="access-share-panel">
          <div slot="header" class="panel-header">
            <span style="font-size: 14px; font-weight: bold">{{
              "来自用户" + shareGlimpse.uploader + "的分享：" + getDocName()
            }}</span>
          </div>
          <div class="panel-body">
            <el-form>
              <el-form-item>
                <el-input
                  v-model="password"
                  placeholder="请输入提取码"
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  @click="submitShareAccess()"
                  class="access-btn"
                  >提交</el-button
                >
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </div>
    </div>
    <div v-else>
      <el-page-header @back="backToHome" content="分享详情"> </el-page-header>
      <el-container name="share-detail-container">
        <el-header name="share-detail-header">
          <p style="font-size: 18px; bold">
            <i class="el-icon-folder-opened" v-if="shareDetail.isDir === 1"></i
            ><i class="el-icon-document" v-else></i>{{ shareDetail.docName }}
          </p>
          <el-row class="share-desc">
            <el-col :span="6">
              <span style="font-size: 14px">
                <i class="el-icon-time"></i>
                {{ shareDetail.createTime }}
              </span>
            </el-col>
            <el-col :span="6">
              <span style="font-size: 14px; bold">
                {{ "过期时间：" + getExpireFormat() }}
              </span>
            </el-col>
            <el-col :span="6">
              <span style="font-size: 14px; bold">
                {{ "总大小：" + displaySize() }}
              </span>
            </el-col>
            <el-col :span="6">
              <span style="font-size: 14px; bold">
                {{ "浏览次数：" + shareDetail.viewNum }}
              </span>
            </el-col>
          </el-row>
          <div class="btns">
            <el-badge :value="shareDetail.saveNum" :max="99">
              <el-button type="primary" icon="el-icon-receiving"
                >转存
              </el-button>
            </el-badge>
            <el-button type="primary" icon="el-icon-receiving" plain
              >下载到本地
            </el-button>
          </div>
        </el-header>
        <el-main name="share-detail-main">
          <el-card class="share-preview">
            <el-skeleton animated>
              <template slot="template">
                <el-skeleton-item
                  variant="image"
                  style="width: 100%; height: 440px"
                />
              </template>
            </el-skeleton>
          </el-card>
        </el-main>
      </el-container>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      userId: "",
      token: "",
      password: "",
      shareGlimpse: {},
      shareDetail: {},
      tokenExist: false,
      accessPermit: false,
    };
  },
  methods: {
    displaySize() {
      const size = this.shareDetail.docSize;
      if (size === 0 || !size) {
        return "";
      } else if (size < 1000) return String(size) + "B";
      else if (size > 1024 && size < 1048576)
        return String((size / 1024).toFixed(1)) + "KB";
      else if (size > 1048576 && size < 1073741824)
        return String((size / 1048576).toFixed(1)) + "MB";
      else return String((size / 1073741824).toFixed(1)) + "GB";
    },
    getShareInfo() {
      this.$http.get("share/" + this.token + "/glimpse").then((res) => {
        if (res.status !== 200)
          return this.$message.error("请求服务器异常，请重试!");
        else if (res.data !== null && "code" in res.data) {
          if (res.data.code === 10108) {
            return this.$message.error("未找到该链接对应的分享！");
          }
          return this.$message.error(res.data.msg);
        } else if (res.data !== null) {
          this.tokenExist = true;
          this.shareGlimpse = res.data;
        }
      });
    },
    submitShareAccess() {
      this.$http
        .get("files/share/" + this.token, {
          params: { password: this.password },
        })
        .then((res) => {
          if (res.status !== 200)
            return this.$message.error("请求服务器异常，请重试!");
          else if (res.data !== null && "code" in res.data) {
            if (res.data.code === 10108) {
              return this.$message.error("未找到该链接对应的分享！");
            } else if (res.data.code === 10111) {
              return this.$message.error("提取码错误！");
            }
            return this.$message.error(res.data.msg);
          } else if (res.data !== null) {
            this.shareDetail = res.data;
            this.accessPermit = true;
          }
        });
    },
    subStrNum(str, len) {
      var strLen = str.length;
      var strCut = "";
      var strLength = 0;
      for (let i = 0; i < strLen; i++) {
        var charStr = str.charAt(i); //使用charAt获取单个字符；
        strLength++;
        if (encodeURI(charStr).length > 4) {
          //使用encodeURI获取编码长度
          strLength++;
        }
        strCut = strCut.concat(charStr); //单个字符进行合并
        if (strLength >= len) {
          strCut = strCut.concat("..."); //大于指定长度后合并'...'并返回此字符串
          return strCut;
        }
      }
      if (strLength < len) {
        return str;
      }
    },
    getDocName() {
      return this.subStrNum(this.shareGlimpse.docName, 15);
    },
    backToHome() {
      this.$router.push("/home/contents/" + encodeURIComponent("/"));
    },
    getExpireFormat() {
      const val = +this.shareDetail.expireHour;
      if (val <= 24) {
        return "今天";
      } else if (val > 24 && val <= 24 * 7) {
        return Math.floor(val / 24) + "天后";
      } else if (val > 24 * 7 && val <= 24 * 30) {
        return Math.floor(val / 24 / 7) + "周后";
      } else if (val > 24 * 30) {
        return Math.floor(val / 24 / 30) + "月后";
      }
      console.log("not possible");
      return "";
    },
  },
  created() {
    this.userId = window.localStorage.getItem("userId");
    this.token = this.$route.params.token;
    this.getShareInfo();
  },
};
</script>
<style lang="less" scoped>
.access-share-panel {
  width: 400px;
  height: 200px;
  background-color: #2b4b6b;
  color: #fff;
  border-radius: 10px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.share-detail-container {
  margin-left: 20px;
}
.share-preview {
  width: 70%;
  height: 60%;
  position: absolute;
  left: 55%;
  top: 60%;
  transform: translate(-50%, -50%);
}
.btns {
  position: absolute;
  top: 110px;
  right: 40px;
}
.share-desc {
  position: absolute;
  width: 50%;
  left: 30%;
}
</style>