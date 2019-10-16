'use strict';

const contract = artifacts.require('Chat');

const contractAddress = '0x10cbB0F4B3348df82ed6AAeC9C17E8045222fA62';

module.exports = async (callback) => {
  const instance = await contract.at(contractAddress);
  console.log('Allocated contract instance');

  const createRoom = async (room) => {
    const initial = Date.now();
    const result = await instance.createRoom(room);
    const final = Date.now();
    console.log(`Elapsed time creating ${room}: ${(final - initial) / 1000} seconds`);
    return result;
  };

  const findRooms = async () => {
    const initial = Date.now();
    const result = await instance.getRooms();
    const final = Date.now();
    console.log(`Elapsed time retrieving rooms data: ${(final - initial) / 1000} seconds`);
    const parsedResult = result.map((room) => room.toNumber());
    return await findRoomDetails(parsedResult);
  };

  const findRoomDetails = async (roomIds) => {
    const promises = [];
    roomIds.forEach((roomId) => {
      promises.push(instance.getRoom(roomId));
    });
    const initial = Date.now();
    const result = await Promise.all(promises);
    const final = Date.now();
    console.log(`Elapsed time retrieving rooms details: ${(final - initial) / 1000} seconds`);
    const parsedResult = result.map((room) => { return { roomId: room[0].toNumber(), name: room[1] }; });
    console.log(parsedResult);
    return parsedResult;
  };

  // First test, create rooms
  console.log('Creating rooms');
  for (let index = 1; index <= 2; index++) {
    await createRoom(`Room ${index}`);
  }

  // Second test, load the rooms data
  console.log('Querying rooms');
  await findRooms();
  callback();
};