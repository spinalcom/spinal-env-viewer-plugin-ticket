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
  <v-popover offset="16"
             :auto-hide="false"
             :open="show">

    <md-button class="tooltip-target md-fab md-mini md-primary">
      <md-icon>add</md-icon>
    </md-button>

    <template slot="popover">
      <div class="popoverContainer">
        <div class="_popoverContent">
          <md-field>
            <label>Step name</label>
            <md-input v-model="name"></md-input>
          </md-field>

          <div>
            <slider-picker class="colorPicker"
                           v-model="color" />
          </div>

        </div>

        <div class="_popoverBtn">
          <!-- <a class="btn"
             v-close-popover>Close</a>
          <a class="btn"
             :disabled="disabled()"
             @click="addStep"
             v-close-popover>ADD</a> -->

          <md-button class="btn md-dense md-primary"
                     v-close-popover>Close</md-button>

          <md-button class="btn md-dense md-primary"
                     :disabled="disabled()"
                     @click="addStep"
                     v-close-popover>ADD</md-button>

        </div>
      </div>

    </template>
  </v-popover>
</template>

<script>
import { Slider } from "vue-color";

export default {
  name: "addItemsPopover",
  components: {
    "slider-picker": Slider,
  },
  data() {
    return {
      name: "",
      color: "#000000",
      show: false,
    };
  },
  methods: {
    OpenAttribute() {
      this.show = !this.show;
    },
    addStep() {
      const color =
        typeof this.color === "string" ? this.color : this.color.hex;

      this.$emit("addStep", { name: this.name, color });
      this.name = "";
      this.color = "#000000";
    },
    disabled() {
      return this.name.trim().length === 0 || !this.color;
    },
  },
};
</script>

<style scoped>
.popoverContainer {
  width: 200px;
  height: 200px;
}

.popoverContainer ._popoverContent {
  height: 150px;
}

.popoverContainer ._popoverContent .colorPicker {
  width: 100%;
  height: 100px;
}

.popoverContainer ._popoverBtn {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.popoverContainer ._popoverBtn .btn {
  font-size: 15px;
  margin-right: 10px;
  cursor: pointer;
}
</style>