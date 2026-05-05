export const checkAndUpdateUsage = async (user) => {
  const today = new Date().toISOString().split("T")[0];
  const last = user.lastUsageReset.toISOString().split("T")[0];

  if (today !== last) {
    user.aiUsageCount = 0;
    user.lastUsageReset = new Date();
  }
  if (user.aiUsageCount >= user.aiUsageLimit) {
    throw new Error("Daily usage limit reached");
  }
  user.aiUsageCount += 1;
  await user.save();
};
