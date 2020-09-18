<!--
Copyright 2020 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
  <md-content class="logs_container md-scrollbar">

    <md-table class="logs_table md-scrollbar">
      <md-table-row>
        <md-table-head>Date</md-table-head>
        <md-table-head>User</md-table-head>
        <md-table-head>Action</md-table-head>
      </md-table-row>

      <log-vue v-for="(log,index) of logs"
               :key="index"
               :log="log"></log-vue>

    </md-table>

  </md-content>
</template>

<script>
import logVue from "./log.vue";

export default {
  name: "logsTemplate",
  props: {
    logs: {},
  },
  components: {
    "log-vue": logVue,
  },
  data() {
    return {};
  },
  methods: {},
};
</script>

<style scoped>
.logs_container {
  width: 100%;
  height: 100%;
  background-color: transparent;
  overflow: auto;
}

.logs_container .logs_table {
  background-color: transparent;
}
</style>