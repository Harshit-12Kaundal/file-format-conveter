import express from "express";

import {
  searchUsers,
  getUserDetails,
  sendFriendRequest,
  getFriendStatus,
  getIncomingFriendRequests,
  getFriends,
  shareFileWithFriend,
} from "../controller/usertouser.js";
const router = express.Router();

router.get("/friends/status", getFriendStatus);
router.post("/friends/action", sendFriendRequest);
router.get("/friends/requests/:viewerUid", getIncomingFriendRequests);
router.get("/friends/list/:viewerUid", getFriends);
router.post("/friends/share", shareFileWithFriend);
 
router.get("/users/search", searchUsers);
router.get("/users/:uid", getUserDetails);

export default router;