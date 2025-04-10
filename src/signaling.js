import io from "socket.io-client";
export default class SignalingClient {
  constructor(url) {
    this.socket = io(url);
    this.events = {};

    this.socket.addEventListener("message", (event) => {
      const data = event;
      this.emit("message", data);
    });
  }

  on(event, callback) {
    this.events[event] = this.events[event] || [];
    this.events[event].push(callback);
  }

  send(topic, data) {
    this.socket.emit(topic, data);
  }

  disconnect() {
    this.socket.close();
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(data));
    }
  }
}
