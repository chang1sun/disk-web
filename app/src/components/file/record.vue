<template>
  <el-container class="block">
    <el-switch
      class="reverse-switch"
      v-model="reverse"
      active-color="#13ce66"
      inactive-color="#409eff"
      active-text="时间正序"
      inactive-text="时间倒序"
    >
    </el-switch>
    <el-radio-group v-model="showOption" class="show-option">
      <el-radio-button :label="0" size="medium">显示全部</el-radio-button>
      <el-radio-button :label="1" size="medium">只看分享</el-radio-button>
      <el-radio-button :label="2" size="medium">只看转存</el-radio-button>
    </el-radio-group>
    <el-row class="date-picker">
      <span style="font-size: 14px; font-weight: bold">显示范围&nbsp;&nbsp;</span>
      <el-date-picker
      v-model="daterange"
      type="daterange"
      align="right"
      unlink-panels
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      :picker-options="pickerOptions">
    </el-date-picker>
    </el-row>
    <el-container class="record-box">
      <el-scrollbar
        style="width: 100%; height: 100%; overflow-y: auto;"
        v-infinite-scroll="load"
        infinite-scroll-disabled="disabled"
        :key="recordTableKey"
      >
        <el-timeline class="record-list" :reverse="reverse">
          <el-timeline-item
            :key="item.id+Math.random()"
            v-for="item in recordList"
            :timestamp="new Date(+item.createTime).toLocaleString()"
            placement="top"
            type="primary"
            size="large"
          >
            <el-card>
              <h4 v-if="item.type == 1">分享了文件<el-button type="text">{{ item.docName }}</el-button></h4>
              <h4 v-else>转存了文件<el-button type="text">{{ item.docName }}</el-button></h4>
              <p v-if="new Date(+item.expireTime).getTime() >= Date.now()">{{ '失效日期: ' + new Date(+item.expireTime).toLocaleString() }}</p>
              <p v-else style="color: #ff6666">此分享已失效</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-scrollbar>
      <p v-if="loading" class="loading">
        <span></span>
      </p>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      userId: "",
      showOption: 0, // 展示选项
      count: 0, //起始页数值为0
      pageSize: 5,
      loading: false,
      totalPages: "", //取后端返回内容的总页数
      reverse: false,
      recordList: [],
      recordTableKey: 121,
      daterange: [],
      pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
    };
  },
  computed: {
    noMore() {
      //当起始页数大于总页数时停止加载
      if (this.count != 0 && this.count >= this.totalPages - 1) {
        this.$message.info("没有更多了!");
      }
      return this.count >= this.totalPages - 1;
    },
    disabled() {
      return this.loading || this.noMore;
    },
  },
  watch: {
    showOption: 'refreshRecordList',
    daterange: 'refreshRecordList',
  },
  methods: {
    load() {
      //滑到底部时进行加载
      this.loading = true;
      setTimeout(() => {
        this.count += 1; //页数+1
        this.getRecordList(); //调用接口，此时页数+1，查询下一页数据
      }, 2000);
    },
    getMillisecond(date) {
      if (date) {
        return date.getTime();
      }
      return 0;
    },
    async refreshRecordList() {
      console.log(this.daterange)
      this.count = 0
      const params = {
        offset: this.count * this.pageSize,
        limit: this.pageSize,
        start_time: this.getMillisecond(this.daterange[0]),
        end_time: this.getMillisecond(this.daterange[1]),
        type: this.showOption,
      };
      await this.$http
        .get(this.userId + "/files/share-records", { params: params })
        .then((res) => {
          if (res.status !== 200)
            return this.$message.error("请求服务器异常，请重试!");
          else if (res.data !== null && "code" in res.data) {
            return this.$message.error(res.data.msg);
          } else {
            this.loading = false;
            this.recordTableKey = Math.random();
            this.recordList = res.data.list;
            this.totalPages = Math.ceil(res.data.count / this.pageSize);
          }
        });
    },
    async getRecordList() {
      console.log(this.daterange)
      const params = {
        offset: this.count * this.pageSize,
        limit: this.pageSize,
        start_time: this.getMillisecond(this.daterange[0]),
        end_time: this.getMillisecond(this.daterange[1]),
        type: this.showOption,
      };
      await this.$http
        .get(this.userId + "/files/share-records", { params: params })
        .then((res) => {
          if (res.status !== 200)
            return this.$message.error("请求服务器异常，请重试!");
          else if (res.data !== null && "code" in res.data) {
            return this.$message.error(res.data.msg);
          } else {
            this.loading = false;
            this.recordTableKey = Math.random();
            this.recordList = this.recordList.concat(res.data.list);
            this.totalPages = Math.ceil(res.data.count / this.pageSize);
          }
        });
    },
  },
  created() {
    this.userId = window.localStorage.getItem("userId");
    this.getRecordList();
  },
};
</script>
<style lang="less" scoped>
.record-box {
  width: 85%;
  height: 80%;
  position: absolute;
  left: 210px;
  top: 150px;
}
/deep/.el-scrollbar__wrap {
  overflow-x: hidden;
}
/deep/.el-scrollbar__thumb {
  background-color: #2b4b6b;
}
.reverse-switch {
  display: block;
  position: absolute;
  right: 50px;
  top: 100px;
}
.show-option {
  position: absolute;
  left: 200px;
  top: 90px;
}
.record-list {
  position: absolute;
  width: 80%;
}
.date-picker {
  position: absolute;
  right: 400px;
  top: 90px;
}
.no-more {
  position: absolute;
  bottom: 10%;
}
.loading span {
  position: absolute;
  right: 10%;
  bottom: 10%;
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #409eff;
  border-left: transparent;
  animation: zhuan 0.5s linear infinite;
  border-radius: 50%;
}
@keyframes zhuan {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>