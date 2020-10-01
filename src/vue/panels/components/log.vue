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
  <!-- <div class="logs">
    <div class="date">{{log.creationDate | formatDate}}</div>
    <div class="username">{{username.length > 0 ? username : "unknown"}}</div>
    <div class="content">{{texte}}</div>
  </div> -->

  <md-table-row>
    <md-table-cell>{{log.creationDate | formatDate}}</md-table-cell>
    <md-table-cell>{{username.length > 0 ? username : "unknown"}}
    </md-table-cell>
    <md-table-cell>{{texte}}</md-table-cell>
  </md-table-row>
</template>

<script>
import { LOGS_EVENTS } from "spinal-service-ticket/dist/Constants";
import moment from "moment";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";

export default {
  name: "logVue",
  props: ["log"],
  data() {
    return {
      texte: "",
      username: "",
    };
  },
  mounted() {
    this.formatEvent();
  },
  methods: {
    async formatEvent() {
      this.username =
        this.log.user && this.log.user.name ? this.log.user.name : "";

      if (this.log.event == LOGS_EVENTS.creation) {
        this.texte = "created";
      } else if (this.log.event == LOGS_EVENTS.archived) {
        this.texte = "archived";
      } else if (this.log.event == LOGS_EVENTS.unarchive) {
        this.texte = "unarchived";
      } else {
        const promises = this.log.steps.map((el) =>
          SpinalGraphService.getNodeAsync(el)
        );

        Promise.all(promises).then((result) => {
          const step1 = result[0].name.get();
          const step2 = result[1].name.get();
          const pre = this.log.event == LOGS_EVENTS.moveToNext ? true : false;
          // this.log.event == LOGS_EVENTS.moveToNext
          //   ? "moving forward"
          //   : "move back";

          this.texte = pre
            ? `Passed from ${step1} to ${step2}`
            : `Backward from ${step1} to ${step2}`;
        });
      }
    },
  },
  filters: {
    formatDate(data) {
      // return moment(parseInt(data)).format("MMM Do YYYY");
      return moment(data).fromNow();
    },
  },
};
</script>

<style scoped>
.logs {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-between;
}

.logs .date {
  width: 30%;
  display: flex;
  justify-content: center;
  align-items: center;
  /* color: #448aff; */
}

.logs .username {
  width: 30%;
  display: flex;
  justify-content: center;
  align-items: center;
  /* color: #448aff; */
}

.logs .content {
  width: 39%;
  display: flex;
  justify-content: center;
  align-items: center;
  /* color: #448aff; */
}
</style>