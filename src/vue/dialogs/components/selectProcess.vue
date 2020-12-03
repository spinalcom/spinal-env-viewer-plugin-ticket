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
  <div class="select_container">
    <!-- <div class="dialogTitle">Select Ticket Process</div> -->
    <div class="content">
      <div class="section">
        <link-template :title="'Select Context'"
                       :data="data"
                       :itemSelected="contextId"
                       @create="createContext"
                       @select="selectContext"
                       :showBtn="true"></link-template>
      </div>

      <div class="section">
        <link-template :title="'Select Process'"
                       :data="processes"
                       :itemSelected="processId"
                       @create="createProcess"
                       @select="selectProcess"
                       :showBtn="contextId && contextId.length > 0">
        </link-template>

      </div>

      <div class="section">
        <link-template :title="'Select Common Incident'"
                       :subTitle="'(optional) it will be the ticket name'"
                       :data="incidents"
                       :itemSelected="incidentId"
                       @select="selectIncident"
                       @create="createCommonIncident"
                       :showBtn="showCreatBtn()"></link-template>

      </div>
    </div>

  </div>
</template>

<script>
import linkerTemplateVue from "./linkerTemplate.vue";

export default {
  name: "selectProcess",
  props: {
    data: {},
    contextId: {},
    processes: {},
    processId: {},
    incidents: {},
    incidentId: {},
  },
  components: {
    "link-template": linkerTemplateVue,
  },
  methods: {
    showCreatBtn() {
      return (
        this.contextId &&
        this.contextId.length > 0 &&
        this.processId &&
        this.processId.length > 0
      );
    },

    selectContext(id) {
      this.$emit("selectContext", id);
    },

    selectProcess(id) {
      this.$emit("selectProcess", id);
    },

    selectIncident(id) {
      this.$emit("selectIncident", id);
    },

    createCommonIncident() {
      this.$emit("createCommonIncident");
    },

    createContext() {
      this.$emit("createContext");
    },

    createProcess() {
      this.$emit("createProcess");
    },
  },
};
</script>

<style scoped>
.select_container {
  width: 100%;
  height: 100%;
}
/* .select_container .dialogTitle {
  height: 50px;
  text-align: center;
} */
.select_container .content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
}
.select_container .content .section {
  width: 33%;
  border: 1px solid grey;
  border-radius: 4% 4% 0 0;
  padding: 15px;
}
</style>