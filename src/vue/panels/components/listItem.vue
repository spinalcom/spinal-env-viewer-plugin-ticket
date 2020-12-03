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
  <md-content class="t_container md-srollbar">
    <md-list class="myList">
      <slot></slot>
      <md-list-item v-for="item in data"
                    :key="item.id"
                    @click="select(item.id)">
        <div class="color"
             v-if="item.color"
             :style="{'background-color' : item.color}"></div>
        <span class="md-list-item-text">{{item.name}}</span>
        <md-icon>keyboard_arrow_right</md-icon>
      </md-list-item>
    </md-list>
  </md-content>
</template>

<script>
export default {
  name: "contextsVue",
  props: {
    data: {},
  },
  data() {
    return {};
  },
  methods: {
    select(id) {
      this.$emit("select", id);
    },
  },
};
</script>

<style scoped>
.t_container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.t_container .myList .color {
  width: 5px;
  height: 50px;
  margin-right: 10px;
}
</style>

<style>
.t_container .myList .md-ripple {
  width: unset !important;
}
</style>