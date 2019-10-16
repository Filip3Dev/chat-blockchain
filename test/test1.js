'use strict';

const Chat = artifacts.require('./Chat.sol');

contract('Chat', (accounts) => {
  it('should create a new room', async () => {
    const instance = await Chat.deployed();
    const roomId = await instance.createRoom.call('Example room');
    // The contract returns a BigNumber here, calling 'toNumber' allows for a strictEqual comparison
    assert.strictEqual(roomId.toNumber(), 0, 'This wasn\'t the first room to be created.');
  });
  it('should find rooms', async () => {
    const instance = await Chat.deployed();
    const searchId = 1;

    // Generate example data
    for (let counter = 0; counter <= searchId; counter++) {
      await instance.createRoom.sendTransaction(`Example room ${counter + 1}`);
    }

    // Find room
    const room = await instance.getRoom.call(searchId);
    assert.strictEqual(room[0].toNumber(), searchId, 'Incorrect room found');
    assert.strictEqual(room[1], 'Example room 2', 'Incorrect room found');
  });
  it('should find all rooms', async () => {
    const instance = await Chat.deployed();

    // Find rooms
    const roomIds = await instance.getRooms.call();
    assert.strictEqual(roomIds.length, 2, 'Incorrect ammount of rooms found');
  });
  it('should create a new message', async () => {
    const instance = await Chat.deployed();
    const roomId = await instance.createRoom.sendTransaction('Example room');
    const messageId = await instance.createMessage.call('Hello world', 'First user', 'ES', Date.now(), roomId);
    // The contract returns a BigNumber here, calling 'toNumber' allows for a strictEqual comparison
    assert.strictEqual(messageId.toNumber(), 0, 'This wasn\'t the first message to be created.');
  });
  it('should find messages', async () => {
    const instance = await Chat.deployed();

    await instance.createRoom.sendTransaction('Example room');
    const mockUser = 'Example user';
    const language = 'ES';
    const messageDate = Date.now();

    const searchId = 1;

    // Generate example data
    for (let counter = 0; counter <= searchId; counter++) {
      await instance.createMessage.sendTransaction(`Message ${counter + 1}`, mockUser, language, messageDate, 0);
    }

    // Find message
    const message = await instance.getMessage.call(searchId);
    assert.strictEqual(message[0].toNumber(), searchId, 'Invalid message body');
    assert.strictEqual(message[1], 'Message 2', 'Invalid message body');
    assert.strictEqual(message[2], mockUser, 'Invalid message user');
    assert.strictEqual(message[3], language, 'Invalid message language');
    // The contract returns a BigNumber here, calling 'toNumber' allows for a strictEqual comparison
    assert.strictEqual(message[4].toNumber(), messageDate, 'Invalid message date');
  });
  it('should find all messages', async () => {
    const instance = await Chat.deployed();

    // Find rooms
    const roomIds = await instance.getMessages.call();
    assert.strictEqual(roomIds.length, 2, 'Incorrect ammount of messages found');
  });
  it('should find room messages', async () => {
    const instance = await Chat.deployed();

    // We use a new room here since the previous test already registered a few messages
    await instance.createRoom.sendTransaction('Example room');
    const mockUser = 'Example user';
    const language = 'ES';
    const messageDate = Date.now();

    const searchId = 3;

    // Generate example data
    for (let counter = 0; counter <= searchId; counter++) {
      await instance.createMessage.sendTransaction(`Message ${counter + 1}`, mockUser, language, messageDate, 1);
    }

    // Find messages
    const messages = await instance.getRoomMessages.call(1);
    // Since searchId begins on 0, it's the length minus one.
    assert.strictEqual(messages.length, searchId + 1, 'Incorrect ammount of messages found');
  });
  it('user joins room', async () => {
    const instance = await Chat.deployed();

    await instance.joinRoom.sendTransaction('EXAMPLEMONGOID', 1);
    await instance.joinRoom.sendTransaction('EXAMPLEMONGOID', 2);

    const userRooms = await instance.getUserRooms.call('EXAMPLEMONGOID');
    assert.strictEqual(userRooms.length, 2, 'User hasn\'t joined the expected rooms');
  });
  it('user can\'t join room that doesn\'t exist', async () => {
    const instance = await Chat.deployed();

    try {
      await instance.joinRoom.sendTransaction('EXAMPLEMONGOID', 99);
    } catch (err) {
      // Expected error since the transaction will be rejected by the validation
    }

    const userRooms = await instance.getUserRooms.call('EXAMPLEMONGOID');
    assert.strictEqual(userRooms.length, 2, 'User hasn\'t joined the expected rooms');
  });
  it('user leaves room', async () => {
    const instance = await Chat.deployed();

    await instance.leaveRoom.sendTransaction('EXAMPLEMONGOID', 2);

    const userRooms = await instance.getUserRooms.call('EXAMPLEMONGOID');
    assert.strictEqual(userRooms.length, 1, 'User hasn\'t left the expected rooms');
  });
  it('user doesn\'t leave rooms he hasn\'t joined', async () => {
    const instance = await Chat.deployed();

    await instance.leaveRoom.sendTransaction('EXAMPLEMONGOID', 3);

    const userRooms = await instance.getUserRooms.call('EXAMPLEMONGOID');
    assert.strictEqual(userRooms.length, 1, 'User has left an unexpected room');
  });
  it('user can\'t join a room twice', async () => {
    const instance = await Chat.deployed();

    try {
      await instance.joinRoom.sendTransaction('EXAMPLEMONGOID', 1);
    } catch (err) {
      // Expected error since the transaction will be rejected by the validation
    }

    const userRooms = await instance.getUserRooms.call('EXAMPLEMONGOID');
    assert.strictEqual(userRooms.length, 1, 'User joined the room twice...');
  });
  it('user can rejoin a room', async () => {
    const instance = await Chat.deployed();

    await instance.joinRoom.sendTransaction('EXAMPLEMONGOID', 2);

    const userRooms = await instance.getUserRooms.call('EXAMPLEMONGOID');
    assert.strictEqual(userRooms.length, 2, 'User couldn\'t rejoin room');
  });
});