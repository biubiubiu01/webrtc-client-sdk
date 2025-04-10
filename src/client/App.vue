<template>
  <div class="app-container">
    <div class="local">
      <div>本地视频画面</div>
      <video autoplay ref="localVideoRef" class="local-video video"></video>
    </div>
    <button class="close-button" @click="handleClose">挂断</button>
    <div class="remote">
      <div>远程视频画面</div>
      <video autoplay ref="remoteVideoRef" class="remote-video video"></video>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import WebRTCSdk from "../index";

const localVideoRef = ref();
const remoteVideoRef = ref();

const roomId = "room123";

const userId = `user-${location.search.split("=")[1]}`;

const sdk = new WebRTCSdk({
  signalingUrl: "ws://127.0.0.1:8999",
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
});

onMounted(async () => {
  await sdk.init();
  sdk.connect(roomId, userId).then(() => {
    localVideoRef.value.srcObject = sdk.localStream;
  });

  // 监听远程流
  sdk.on("remote-stream", (stream) => {
    remoteVideoRef.value.srcObject = stream;
  });

  sdk.on("disconnect", () => {
    localVideoRef.value.srcObject = null;
    remoteVideoRef.value.srcObject = null;
  });
});

function handleClose() {
  sdk.disconnect();
}
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  align-items: center;
  width: 100%;
  .close-button {
    margin: 0 20px;
  }
  .local,
  .remote {
    text-align: center;
  }
  .video {
    width: 300px;
    height: 300px;
    &.local-video {
      margin-right: 20px;
    }
  }
}
</style>
