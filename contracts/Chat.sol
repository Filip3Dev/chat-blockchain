//SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;

contract Chat {
    struct Message {
        string message;
        string username;
        string language;
        uint256 date;
    }

    struct Room {
        string name;
    }

    Message[] public messages;
    Room[] public rooms;

    mapping(uint => uint) private messagesInRoom;
    mapping(uint => uint) private messageToRoom;
    mapping(uint => string[]) private roomToUsers;
    mapping(string => uint[]) private userToRooms;

    event MessageCreated(uint indexed code, string message, string username, string language, uint256 date, uint roomId);
    event RoomCreated(uint indexed code, string name);
    event UserJoinedRoom(string indexed userCode, uint roomCode);
    event UserLeftRoom(string indexed userCode, uint roomCode);

    modifier validRoomId(uint roomId) {
        require(roomId < rooms.length);
        _;
    }

    modifier userNotInRoom(uint roomCode, string memory userCode) {
        bool notInRoom = true;
        uint pointer = 0;
        string[] memory roomUsers = roomToUsers[roomCode];
        bytes memory userCodeBytes = bytes(userCode);

        while (notInRoom && pointer < roomUsers.length) {
            bytes memory currentUserBytes = bytes(roomUsers[pointer]);
            if (keccak256(userCodeBytes) == keccak256(currentUserBytes)) {
                notInRoom = false;
            }
            pointer++;
        }

        require(notInRoom);
        _;
    }

    function createMessage(string memory messageStr, string memory username, string memory language, uint256 date, uint roomId) external returns (uint) {
        Message memory message = Message(messageStr, username, language, date);
        messages.push(message);

        uint messageId = messages.length - 1;
        messageToRoom[messageId] = roomId;
        messagesInRoom[roomId] += 1;

        emit MessageCreated(messageId, messageStr, username, language, date, roomId);

        return messageId;
    }

    function createRoom(string memory name) external returns (uint) {
        Room memory room = Room(name);
        rooms.push(room);

        uint roomId = rooms.length - 1;
        messagesInRoom[roomId] = 0;

        emit RoomCreated(roomId, name);

        return roomId;
    }

    function getMessage(uint messageCode) external view returns (uint code, string memory message, string memory username, string memory language, uint256 date, uint roomId) {
        Message memory innerMsg = messages[messageCode];
        return (messageCode, innerMsg.message, innerMsg.username, innerMsg.language, innerMsg.date, messageToRoom[messageCode]);
    }

    function getRoomMessages(uint roomId) external view returns (uint[] memory) {
        uint[] memory result = new uint[](messagesInRoom[roomId]);
        uint amount = 0;
        for (uint index = 0; index < messages.length; index++) {
            if (messageToRoom[index] == roomId) {
                result[amount] = index;
                amount++;
            }
        }
        return result;
    }

    function getRoom(uint roomCode) external view returns (uint code, string memory name) {
        Room memory room = rooms[roomCode];
        return (roomCode, room.name);
    }

    function getRooms() external view returns (uint[] memory) {
        uint[] memory result = new uint[](rooms.length);
        for (uint index = 0; index < rooms.length; index++) {
            result[index] = index;
        }
        return result;
    }

    function getUserRooms(string memory userCode) external view returns (uint[] memory) {
        return userToRooms[userCode];
    }

    function joinRoom(string memory userCode, uint roomCode) external validRoomId(roomCode) userNotInRoom(roomCode, userCode) returns (uint[] memory) {
        userToRooms[userCode].push(roomCode);
        roomToUsers[roomCode].push(userCode);

        emit UserJoinedRoom(userCode, roomCode);

        return userToRooms[userCode];
    }

    function leaveRoom(string memory userCode, uint roomCode) external validRoomId(roomCode) returns (bool) {
        bool result = _clearUserRooms(userCode, roomCode) && _clearRoomUsers(roomCode, userCode);
        if (result) {
            emit UserLeftRoom(userCode, roomCode);
        }

        return result;
    }

    function _clearUserRooms(string memory userCode, uint roomCode) internal returns (bool) {
        bool found = false;
        uint pointer = 0;
        uint roomsLength = userToRooms[userCode].length;

        while (!found && pointer < roomsLength) {
            if (userToRooms[userCode][pointer] == roomCode) {
                // This sets the array position to '0' and we want it gone, so we will do a bit of hacking
                // with the array by moving the last element into this one and decreasing it's length.
                // This can be done because order is irrelevant and it's a O(1) on the blockchain, it'd be
                // much worse if order mattered.
                // delete userToRooms[userCode][pointer];
                userToRooms[userCode][pointer] = userToRooms[userCode][roomsLength - 1];

                emit UserLeftRoom(userCode, roomCode);

                found = true;
            } else {
                pointer++;
            }
        }

        return found;
    }

    function _clearRoomUsers(uint roomCode, string memory userCode) internal returns (bool) {
        bool found = false;
        uint pointer = 0;
        uint usersLength = roomToUsers[roomCode].length;
        bytes memory userCodeBytes = bytes(userCode);

        while (!found && pointer < usersLength) {
            bytes memory currentUserCodeBytes = bytes(roomToUsers[roomCode][pointer]);
            if (keccak256(currentUserCodeBytes) == keccak256(userCodeBytes)) {
                // This sets the array position to '0' and we want it gone, so we will do a bit of hacking
                // with the array by moving the last element into this one and decreasing it's length.
                // This can be done because order is irrelevant and it's a O(1) on the blockchain, it'd be
                // much worse if order mattered.
                // delete roomToUsers[roomCode][pointer];
                roomToUsers[roomCode][pointer] = roomToUsers[roomCode][usersLength - 1];

                found = true;
            } else {
                pointer++;
            }
        }

        return found;
    }
}