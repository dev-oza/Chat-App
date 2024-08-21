import { userSocketIDS } from "../app.js";

export const getOtherMembers = (members, userId) => (members.filter((m) => (m._id.toString() !== userId.toString())))

export const getSockets = (users=[]) => users.map((user) => userSocketIDS.get(user.toString()));

export const getBase64 = (file) => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;