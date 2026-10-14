import express from 'express';
import { prisma } from '../prisma.js';
 
const router = express.Router();
const friendshipState = new Map();
const pairKey = (a, b) => [String(a), String(b)].sort().join(':');
const friendRequestModel = prisma?.friendRequest;
const fileShareNotificationModel = prisma?.fileShareNotification;
 
export const getFriendStatus = async (req, res) => {
  const { viewerUid, targetUid } = req.query;
 
  if (!viewerUid || !targetUid || viewerUid === targetUid) {
    return res.json({ status: 'self_or_signed_out' });
  }
 
  if (!friendRequestModel) {
    const record = friendshipState.get(pairKey(viewerUid, targetUid));
    if (!record) return res.json({ status: 'none' });
    if (record.status === 'friends') return res.json({ status: 'friends' });
    if (record.requesterUid === viewerUid) return res.json({ status: 'pending_outgoing' });
    return res.json({ status: 'pending_incoming' });
  }
 
  try {
    const viewer = await prisma.user.findUnique({ where: { uid: String(viewerUid) } });
    const target = await prisma.user.findUnique({ where: { uid: String(targetUid) } });
 
    if (!viewer || !target) return res.json({ status: 'none' });
 
    const outgoing = await friendRequestModel.findUnique({
      where: {
        requesterId_recipientId: {
          requesterId: viewer.id,
          recipientId: target.id,
        },
      },
    });
 
    const incoming = await friendRequestModel.findUnique({
      where: {
        requesterId_recipientId: {
          requesterId: target.id,
          recipientId: viewer.id,
        },
      },
    });
 
    if (outgoing?.status === 'ACCEPTED' || incoming?.status === 'ACCEPTED') {
      return res.json({ status: 'friends' });
    }
 
    if (outgoing?.status === 'PENDING') {
      return res.json({ status: 'pending_outgoing' });
    }
 
    if (incoming?.status === 'PENDING') {
      return res.json({ status: 'pending_incoming' });
    }
 
    return res.json({ status: 'none' });
  } catch (error) {
    console.error('Friend status lookup failed:', error);
    return res.status(500).json({ error: 'Friend status lookup failed' });
  }
};
 
export const getIncomingFriendRequests = async (req, res) => {
  const { viewerUid } = req.params;
 
  if (!viewerUid) return res.status(400).json({ error: 'Viewer is required' });
 
  if (!friendRequestModel) {
    return res.json([]);
  }
 
  try {
    const recipient = await prisma.user.findUnique({
      where: { uid: String(viewerUid) },
      select: { id: true },
    });
 
    if (!recipient) return res.status(404).json({ error: 'User not found' });
 
    const [requests, fileShares] = await Promise.all([
      friendRequestModel.findMany({
      where: {
        recipientId: recipient.id,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        requester: {
          select: {
            uid: true,
            name: true,
            email: true,
            avatarSeed: true,
            avatarStyle: true,
          },
        },
      },
      }),
      fileShareNotificationModel
        ? fileShareNotificationModel.findMany({
            where: { recipientId: recipient.id },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              fileId: true,
              fileName: true,
              createdAt: true,
              sender: { select: { uid: true, name: true, email: true, avatarSeed: true, avatarStyle: true } },
            },
          })
        : Promise.resolve([]),
    ]);
 
    const friendNotifications = requests.map((request) => ({
      id: request.id,
      type: 'friend_request',
      requesterUid: request.requester.uid,
      name: request.requester.name,
      email: request.requester.email,
      avatarSeed: request.requester.avatarSeed,
      avatarStyle: request.requester.avatarStyle,
      createdAt: request.createdAt,
      message: 'sent you a friend request',
    }));
 
    const fileNotifications = fileShares.map((share) => ({
      id: share.id,
      type: 'file_share',
      requesterUid: share.sender.uid,
      name: share.sender.name,
      email: share.sender.email,
      avatarSeed: share.sender.avatarSeed,
      avatarStyle: share.sender.avatarStyle,
      fileId: share.fileId,
      fileName: share.fileName,
      createdAt: share.createdAt,
      message: `shared ${share.fileName} with you`,
    }));
 
    return res.json([...friendNotifications, ...fileNotifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    ));
  } catch (error) {
    console.error('Incoming friend requests lookup failed:', error);
    return res.status(500).json({ error: 'Incoming friend requests lookup failed' });
  }
};
 
export const shareFileWithFriend = async (req, res) => {
  const { viewerUid, targetUid, fileId, fileName } = req.body || {};
 
  if (!viewerUid || !targetUid || !fileId || !fileName || viewerUid === targetUid) {
    return res.status(400).json({ error: 'Invalid file share payload' });
  }
 
  if (!fileShareNotificationModel) {
    return res.status(503).json({ error: 'File sharing is not available until Prisma Client is regenerated' });
  }
 
  try {
    const [sender, recipient] = await Promise.all([
      prisma.user.findUnique({ where: { uid: String(viewerUid) }, select: { id: true } }),
      prisma.user.findUnique({ where: { uid: String(targetUid) }, select: { id: true } }),
    ]);
 
    if (!sender || !recipient) return res.status(404).json({ error: 'User not found' });
 
    const friendship = await friendRequestModel.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { requesterId: sender.id, recipientId: recipient.id },
          { requesterId: recipient.id, recipientId: sender.id },
        ],
      },
      select: { id: true },
    });
 
    if (!friendship) return res.status(403).json({ error: 'You can only share files with friends' });
 
    const notification = await fileShareNotificationModel.create({
      data: { senderId: sender.id, recipientId: recipient.id, fileId: String(fileId), fileName: String(fileName) },
    });
 
    return res.status(201).json({ ok: true, id: notification.id });
  } catch (error) {
    console.error('File share failed:', error);
    return res.status(500).json({ error: 'File share failed' });
  }
};
 
export const getFriends = async (req, res) => {
  const { viewerUid } = req.params;
 
  if (!viewerUid) return res.status(400).json({ error: 'Viewer is required' });
  if (!friendRequestModel) return res.json([]);
 
  try {
    const viewer = await prisma.user.findUnique({
      where: { uid: String(viewerUid) },
      select: { id: true },
    });
 
    if (!viewer) return res.status(404).json({ error: 'User not found' });
 
    const requests = await friendRequestModel.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: viewer.id }, { recipientId: viewer.id }],
      },
      select: {
        requester: { select: { uid: true, name: true, email: true, avatarSeed: true, avatarStyle: true } },
        recipient: { select: { uid: true, name: true, email: true, avatarSeed: true, avatarStyle: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
 
    return res.json(requests.map(({ requester, recipient }) => (
      requester.uid === String(viewerUid) ? recipient : requester
    )));
  } catch (error) {
    console.error('Friends lookup failed:', error);
    return res.status(500).json({ error: 'Friends lookup failed' });
  }
};
 
export const searchUsers = async (req, res) => {
  const query = req.query.q?.trim();
  if (!query) return res.json([]);
 
  try {
    const users = await prisma.user.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      select: { uid: true, name: true, avatarSeed: true, avatarStyle: true },
      take: 8,
    });
 
    res.json(users.map(({ avatarSeed, avatarStyle, ...user }) => ({
      ...user,
      photo_url: avatarSeed,
      avatar_style: avatarStyle,
    })));
  } catch (error) {
    console.error("User search failed:", error);
    res.status(500).json({ error: "Search failed" });
  }
};
 
export const getUserDetails = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { uid: req.params.uid },
      select: {
        id: true,
        uid: true,
        name: true,
        bio: true,
        avatarSeed: true,
        avatarStyle: true,
        createdAt: true,
      },
    });
 
    if (!user) return res.status(404).json({ error: 'User not found' });
 
    const conversionCount = await prisma.fileConversion.count({
      where: { userId: user.id },
    });
 
    const totalActions = await prisma.changeEvent.count({
      where: { userId: user.id },
    });
 
    const typeGroups = await prisma.fileConversion.groupBy({
      by: ['type'],
      where: { userId: user.id },
      _count: { type: true },
      orderBy: { _count: { type: 'desc' } },
      take: 1,
    });
    const mostUsedType = typeGroups[0]?.type || null;
 
    const events = await prisma.changeEvent.findMany({
      where: { userId: user.id },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
 
    const dayKey = (d) => d.toISOString().slice(0, 10);
    const daySet = new Set(events.map((e) => dayKey(e.createdAt)));
 
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      if (daySet.has(dayKey(d))) streak++;
      else break;
    }
 
    const countsByDate = {};
    events.forEach((e) => {
      const k = dayKey(e.createdAt);
      countsByDate[k] = (countsByDate[k] || 0) + 1;
    });
 
    const activityGrid = [];
    for (let i = 62; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      const k = dayKey(d);
      activityGrid.push({ date: k, count: countsByDate[k] || 0 });
    }
 
    const { avatarSeed, avatarStyle, id, ...profile } = user;
    res.json({
      ...profile,
      photo_url: avatarSeed,
      avatar_style: avatarStyle,
      conversionCount,
      totalActions,
      mostUsedType,
      streak,
      activityGrid,
    });
  } catch (error) {
    console.error('User profile lookup failed:', error);
    res.status(500).json({ error: 'Profile lookup failed' });
  }
};
 
export const sendFriendRequest = async (req, res) => {
  const { viewerUid, targetUid, action } = req.body || {};
 
  if (!viewerUid || !targetUid || viewerUid === targetUid) {
    return res.status(400).json({ error: 'Invalid friend request payload' });
  }
 
  if (!friendRequestModel) {
    const key = pairKey(viewerUid, targetUid);
    const existing = friendshipState.get(key);
 
    switch (action) {
      case 'request': {
        if (existing?.status === 'friends') return res.json({ ok: true, status: 'friends' });
        if (existing && existing.requesterUid === viewerUid) return res.json({ ok: true, status: 'pending_outgoing' });
        if (existing && existing.requesterUid !== viewerUid) return res.json({ ok: true, status: 'pending_incoming' });
 
        friendshipState.set(key, {
          requesterUid: viewerUid,
          recipientUid: targetUid,
          status: 'pending',
        });
        return res.json({ ok: true, status: 'pending_outgoing' });
      }
      case 'accept': {
        if (!existing) return res.json({ ok: true, status: 'none' });
        if (existing.requesterUid === viewerUid) return res.status(400).json({ error: 'You cannot accept your own friend request' });
 
        friendshipState.set(key, {
          requesterUid: existing.requesterUid,
          recipientUid: existing.recipientUid,
          status: 'friends',
        });
        return res.json({ ok: true, status: 'friends' });
      }
      case 'remove': {
        friendshipState.delete(key);
        return res.json({ ok: true, status: 'none' });
      }
      default:
        return res.status(400).json({ error: 'Unsupported action' });
    }
  }
 
  try {
    const viewer = await prisma.user.findUnique({
      where: { uid: String(viewerUid) },
    });
    const target = await prisma.user.findUnique({
      where: { uid: String(targetUid) },
    });
 
    if (!viewer || !target) {
      return res.status(404).json({ error: 'User not found' });
    }
 
    const outgoing = await friendRequestModel.findUnique({
      where: {
        requesterId_recipientId: {
          requesterId: viewer.id,
          recipientId: target.id,
        },
      },
    });
 
    const incoming = await friendRequestModel.findUnique({
      where: {
        requesterId_recipientId: {
          requesterId: target.id,
          recipientId: viewer.id,
        },
      },
    });
 
    switch (action) {
      case 'request': {
        if (outgoing?.status === 'ACCEPTED' || incoming?.status === 'ACCEPTED') {
          return res.json({ ok: true, status: 'friends' });
        }
 
        if (outgoing?.status === 'PENDING') {
          return res.json({ ok: true, status: 'pending_outgoing' });
        }
 
        if (incoming?.status === 'PENDING') {
          return res.json({ ok: true, status: 'pending_incoming' });
        }
 
        await friendRequestModel.create({
          data: {
            requesterId: viewer.id,
            recipientId: target.id,
            status: 'PENDING',
          },
        });
 
        return res.json({ ok: true, status: 'pending_outgoing' });
      }
 
      case 'accept': {
        if (outgoing?.status === 'ACCEPTED' || incoming?.status === 'ACCEPTED') {
          return res.json({ ok: true, status: 'friends' });
        }
 
        if (outgoing?.status === 'PENDING') {
          return res.status(400).json({ error: 'You cannot accept your own friend request' });
        }
 
        if (!incoming || incoming.status !== 'PENDING') {
          return res.json({ ok: true, status: 'none' });
        }
 
        await friendRequestModel.update({
          where: {
            requesterId_recipientId: {
              requesterId: target.id,
              recipientId: viewer.id,
            },
          },
          data: {
            status: 'ACCEPTED',
          },
        });
 
        return res.json({ ok: true, status: 'friends' });
      }
 
      case 'remove': {
        if (outgoing) {
          await friendRequestModel.delete({
            where: {
              requesterId_recipientId: {
                requesterId: viewer.id,
                recipientId: target.id,
              },
            },
          });
        }
 
        if (incoming) {
          await friendRequestModel.delete({
            where: {
              requesterId_recipientId: {
                requesterId: target.id,
                recipientId: viewer.id,
              },
            },
          });
        }
 
        return res.json({ ok: true, status: 'none' });
      }
 
      default:
        return res.status(400).json({ error: 'Unsupported action' });
    }
  } catch (error) {
    console.error('Friend request action failed:', error);
    return res.status(500).json({ error: 'Friend request action failed' });
  }
};
 