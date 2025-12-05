
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('update', (data) => {
    console.log('Received update:', JSON.stringify(data, null, 2));
});

socket.on('disconnect', () => {
    console.log('Disconnected');
});

setTimeout(() => {
    console.log('Timeout reached, exiting...');
    socket.disconnect();
    process.exit(0);
}, 10000);
