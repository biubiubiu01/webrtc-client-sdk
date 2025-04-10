import SignalingClient from "./signaling";

const defaultConfig = {
  signalingUrl: "ws://127.0.0.1:3000",
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
  mediaConstraints: {
    audio: true,
    video: true,
  },
};

export default class WebRTCSdk {
  constructor(sdkConfig) {
    this.peerConnection = null;
    this.signaling = null;
    this.localStream = null;
    this.remoteStream = null;
    this.events = new Map();
    this.roomId = null;
    this.userId = null;
    this.config = Object.assign({}, defaultConfig, sdkConfig);
  }

  /**
   * 初始化sdk,获取视频流和初始化socket
   */
  async init() {
    try {
      //获取本地音视频流
      this.localStream = await navigator.mediaDevices.getUserMedia({
        ...this.config.mediaConstraints,
      });

      //初始化socket
      this.signaling = new SignalingClient(this.config.signalingUrl);
      this.signaling.on("message", this.handleSignalingMessage.bind(this));
    } catch (error) {
      console.log(error);
      this.emit("error", error);
      throw error;
    }
  }

  /**
   * 连接到房间
   * @param {String} roomId
   * @param {String} userId
   */
  async connect(roomId, userId) {
    this.roomId = roomId;
    this.userId = userId;

    //创建一个peer
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.config.iceServers,
    });

    //监听ice收集候选
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage("/webrtc/candidate", {
          data: event.candidate,
        });
      }
    };

    //处理远程音视频流
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.emit("remote-stream", this.remoteStream);
    };

    //添加本地视频流到peer
    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    //发送加入房间消息
    this.sendSignalingMessage("/webrtc/join");
  }

  /**
   * 发送文本消息
   * @param {String} message
   */
  sendText(message) {
    const dataChannel = this.peerConnection.createDataChannel("webrtc-chat");
    dataChannel.onopen = () => dataChannel.send(message);
    dataChannel.onerror = (error) => this.emit("error", error);
  }

  /**
   * 离开房间
   */
  disconnect() {
    this.peerConnection.close();
    this.signaling.disconnect();
    if (this.localStream && this.localStream.getTracks) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }
    this.emit("disconnect");
  }

  /**
   * 监听事件
   * @param {String} event
   * @param {Function} callback
   */
  on(event, callback) {
    this.events.set(event, callback);
  }

  off(event) {
    this.events.delete(event);
  }

  /**
   * 发送事件
   * @param {String} event
   * @param {*} data
   */
  emit(event, data) {
    const callback = this.events.get(event);
    if (callback) {
      callback(data);
    }
  }

  /**
   * 监听socket消息
   * @param {*} message
   */
  async handleSignalingMessage(message) {
    const { type, data } = message;
    if (data.userId === this.userId) return; //过滤掉自己发送的消息

    const messageData = data.data;

    switch (type) {
      case "offer":
        await this.setRemoteDescription(messageData);
        const answer = await this.peerConnection.createAnswer();
        await this.setLocalDescription(answer);
        this.sendSignalingMessage("/webrtc/answer", {
          data: answer,
        });
        break;
      case "answer":
        await this.setRemoteDescription(messageData);
        break;
      case "candidate":
        const candidate = new RTCIceCandidate(messageData);
        this.peerConnection.addIceCandidate(candidate).catch((error) => {
          this.emit("error", error);
        });
        break;
      case "user-join":
        //新用户加入，创建一个offer
        this.createOffer();
        break;
      case "user-left":
        //用户离开
        this.disconnect();
        break;
      default:
        console.log("未知的消息类型");
        break;
    }
  }

  /**
   * 创建一个offer并发送
   * @param {String} roomId
   */
  async createOffer() {
    const offer = await this.peerConnection.createOffer();
    await this.setLocalDescription(offer);
    this.sendSignalingMessage("/webrtc/offer", {
      data: offer,
    });
  }

  /**
   * 设置本地描述
   * @param {*} description
   */
  async setLocalDescription(description) {
    await this.peerConnection.setLocalDescription(description);
  }

  /**
   * 设置远程描述
   * @param {*} description
   */
  async setRemoteDescription(description) {
    await this.peerConnection.setRemoteDescription(description);
  }

  /**
   * 发送信令服务器
   * @param {string} topic
   * @param {*} message
   */
  sendSignalingMessage(topic, message = {}) {
    this.signaling.send(topic, {
      roomId: this.roomId,
      userId: this.userId,
      ...message,
    });
  }
}
