import {
  getUserProfileService,
  updateUserProfileService,
  changePasswordService,
  deleteUserService
} from "../services/user.service.js";

export const getUserProfile = async (req, res) => {
  try {
    const profile = await getUserProfileService(req.user.id);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const updated = await updateUserProfileService(req.user.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await changePasswordService(req.user.id, oldPassword, newPassword);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await deleteUserService(req.user.id);
    res.json({ message: "Usuario eliminado", user: deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};