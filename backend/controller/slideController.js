import User from "../models/userModel.js";
import handleAsyncError from "../middleware/handleAsyncError.js";

// Send Slide Data (Potential Matches)
export const sendSlideData = handleAsyncError(async (req, res, next) => {
  const currentUser = req.user;

  // IDs to exclude: Self, Right Swipes, Left Swipes, Matches
  const exclusionIds = [
    currentUser._id,
    ...currentUser.rightSwipes,
    ...currentUser.leftSwipes,
    ...currentUser.matches,
    ...currentUser.likes,
  ];

  // Filter based on gender preference
  let filter = {
    _id: { $nin: exclusionIds },
    isVerified: true, // Only show verified users
  };

  // If interestedIn is specific (MALE/FEMALE), filter by that.
  // If OTHER or generally interested, logic might differ but basic expectation is exact match or open.
  // Assuming basic matching for now:
  if (
    currentUser.interestedIn === "MALE" ||
    currentUser.interestedIn === "FEMALE"
  ) {
    filter.gender = currentUser.interestedIn;
  }

  // Fetch users, limit to 20 for one batch
  const users = await User.find(filter)
    .select(
      "name gender year branch bio profilePics interests greenFlags redFlags",
    ) // Select relevant fields for card
    .limit(5);

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

// Right Swipe
export const rightSwipe = handleAsyncError(async (req, res, next) => {
  const { id: targetUserId } = req.params;
  const currentUser = req.user;

  // Validate target user
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Prevent self-swipe
  if (targetUserId === currentUser.id) {
    return res
      .status(400)
      .json({ success: false, message: "Cannot swipe yourself" });
  }

  // Enforce free-user swipe limit
  const SWIPE_LIMIT_FREE = 3;
  const PREMIER_HOURLY_LIMIT = 15;
  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  if (!currentUser.isPremium) {
    const rightCount = Array.isArray(currentUser.rightSwipes)
      ? currentUser.rightSwipes.length
      : 0;
    // Limit: Total 3 swipes for free users
    if (rightCount >= 3) {
      return res.status(403).json({
        success: false,
        message: "Free limit reached (3 swipes). Upgrade to Premier for more.",
      });
    }
  } else {
    // Premier users: enforce hourly swipe cap (15/hr)
    const timestamps = Array.isArray(currentUser.rightSwipeTimestamps)
      ? currentUser.rightSwipeTimestamps
      : [];
    const recentCount = timestamps.filter(
      (t) => new Date(t).getTime() > oneHourAgo,
    ).length;
    if (recentCount >= 15) {
      return res.status(403).json({
        success: false,
        message: "Premier hourly swipe limit reached (15 per hour).",
      });
    }
  }

  // Add to rightSwipes if not already there
  // Using $addToSet logic via Mongoose array methods or direct update
  // Since we might need to modify 'matches', let's stick to document instance save or findOneAndUpdate

  if (currentUser.rightSwipes.includes(targetUserId)) {
    return res
      .status(200)
      .json({ success: true, message: "Already swiped right" });
  }

  // Check for Match
  // We need to check if targetUser has swiped requestor right
  let isMatch = false;

  if (
    targetUser.rightSwipes.some(
      (id) => id.toString() === currentUser._id.toString(),
    )
  ) {
    isMatch = true;

    // Update Both Users' matches using $addToSet to avoid race/dupes nicely
    await User.findByIdAndUpdate(currentUser._id, {
      $addToSet: { matches: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { matches: currentUser._id },
    });

    // We already pushed to rightSwipes on currentUser in memory, need to save that ONLY if we didn't use update above?
    // Actually, let's use document save for currentUser to be safe with the push.
    // But we just did updateById...
    // Let's refactor to be atomic / consistent.

    // Re-add matches to memory to return correct state if needed?
    // Or just simpler:
  }

  // Save currentUser changes (rightSwipes push)
  // Converting match update to standard save flow to avoid conflicting updates
  if (isMatch) {
    // Ensure match is in array
    if (!currentUser.matches.includes(targetUserId))
      currentUser.matches.push(targetUserId);
    // We handled targetUser update separately via atomic update or need to save targetUser?
    // Let's atomic update targetUser to be safe
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { matches: currentUser._id },
    });
  }

  // Save updates if no match (or just save currentUser changes if any above)
  if (!isMatch && !currentUser.rightSwipes.includes(targetUserId)) {
    // We used findByIdAndUpdate above for atomic push if match.
    // The previous logic was:
    // if (!currentUser.rightSwipes.includes(targetUserId)) { currentUser.rightSwipes.push(targetUserId); }
    // But we replaced that with atomic update below.
  }

  // Add to rightSwipes atomically (if not already there)
  await User.findByIdAndUpdate(currentUser._id, {
    $addToSet: { rightSwipes: targetUserId },
    $push: { rightSwipeTimestamps: new Date() },
  });

  // NEW: Add to targetUser's rightSwipesReceived
  await User.findByIdAndUpdate(targetUserId, {
    $addToSet: { rightSwipesReceived: currentUser._id },
  });

  res.status(200).json({
    success: true,
    match: isMatch,
    message: isMatch ? "It's a Match!" : "Right swipe recorded",
  });
});

// Left Swipe
export const leftSwipe = handleAsyncError(async (req, res, next) => {
  const { id: targetUserId } = req.params;
  const currentUser = req.user;

  if (targetUserId === currentUser.id) {
    return res
      .status(400)
      .json({ success: false, message: "Cannot swipe yourself" });
  }

  // Add to leftSwipes
  if (!currentUser.leftSwipes.includes(targetUserId)) {
    currentUser.leftSwipes.push(targetUserId);
    await currentUser.save();
  }

  res.status(200).json({
    success: true,
    message: "Left swipe recorded",
  });
});

// Like (Super Like / Direct// Like (acts as Right Swipe but without UI transition usually, or defined by frontend)
export const like = handleAsyncError(async (req, res, next) => {
  const { id: targetUserId } = req.params;
  const currentUser = req.user;

  // 1. Prevent Self-Like
  if (targetUserId === currentUser.id) {
    return res
      .status(400)
      .json({ success: false, message: "Cannot like yourself" });
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // 2. Enforce Limits (Same as Right Swipe)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (!currentUser.isPremium) {
    const rightCount = Array.isArray(currentUser.rightSwipes)
      ? currentUser.rightSwipes.length
      : 0;
    if (rightCount >= 3) {
      return res.status(403).json({
        success: false,
        message: "Free limit reached (3 swipes). Upgrade to Premier for more.",
      });
    }
  } else {
    // Premier hourly limit
    const timestamps = Array.isArray(currentUser.rightSwipeTimestamps)
      ? currentUser.rightSwipeTimestamps
      : [];
    const recentCount = timestamps.filter(
      (t) => new Date(t).getTime() > oneHourAgo,
    ).length;
    if (recentCount >= 15) {
      return res.status(403).json({
        success: false,
        message: "Premier hourly swipe limit reached (15 per hour).",
      });
    }
  }

  // 3. Update Swipe Data (Counts towards limit)
  // Use addToSet to avoid duplicates if user clicks like multiple times
  await User.findByIdAndUpdate(currentUser._id, {
    $addToSet: {
      likes: targetUserId,
      rightSwipes: targetUserId,
    },
    $push: { rightSwipeTimestamps: new Date() },
  });

  // 4. Update Target
  await User.findByIdAndUpdate(targetUserId, {
    $addToSet: { likesReceived: currentUser._id },
  });

  // 5. Check for Match (Mutual Like)
  // If targetUser has ALREADY right-swiped current user, IT IS A MATCH!
  // Even if I "Like" them, it counts as a match if they swiped me right.
  let isMatch = false;
  if (
    targetUser.rightSwipes.some(
      (id) => id.toString() === currentUser._id.toString(),
    )
  ) {
    isMatch = true;

    // Update Both Users' matches
    await User.findByIdAndUpdate(currentUser._id, {
      $addToSet: { matches: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { matches: currentUser._id },
    });
  }

  res.status(200).json({
    success: true,
    message: isMatch ? "It's a Match!" : "User liked",
    match: isMatch,
  });
});

// Report
export const report = handleAsyncError(async (req, res, next) => {
  const { id: targetUserId } = req.params;
  const { reason } = req.body;
  const currentUser = req.user;

  if (!reason) {
    return res
      .status(400)
      .json({ success: false, message: "Reason is required" });
  }

  // Since reportsMade is an array of objects, we push a new object
  const reportData = {
    reportedUser: targetUserId,
    reason,
    createdAt: new Date(),
  };

  await User.findByIdAndUpdate(currentUser._id, {
    $push: { reportsMade: reportData },
  });

  res.status(200).json({
    success: true,
    message: "User reported successfully",
  });
});
