const socket = new WebSocket("ws://backend:8080/ws/game");

socket.onopen = () => {
  console.log("WebSocket connection opened");
  socket.send("Hello from the client!");
};

socket.onmessage = (event) => {
  console.log("Message received:", event.data);
};

socket.onclose = (event) => {
  console.log(
    `WebSocket connection closed: code=${event.code}, reason=${event.reason}`
  );
};

socket.onerror = (error) => {
  console.error("WebSocket error:", error);
};

export default socket;
