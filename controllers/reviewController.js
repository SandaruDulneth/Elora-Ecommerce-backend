// controllers/reviewController.js
import Review from "../models/review.js";
import { isAdmin } from "./userController.js";

// PUBLIC: list all reviews + summary
export async function getReview(req, res) {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).lean();
    const count = reviews.length;
    const average = count
      ? reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / count
      : 0;
    res.json({ average, count, reviews });
  } catch (err) {
    res.status(500).json({
      message: "Failed to get reviews",
      error: err.message,
    });
  }
}

export async function saveReview(req, res) {
  if (!req.user) {
    return res.status(403).json({ message: "You need to sign in  to add a review" });
  }

  // Generate next reviewId: REV00001, REV00002, ...
  let newReviewID = "REV00001";
  const lastReview = await Review.find().sort({ reviewId: -1 }).limit(1);
  if (lastReview.length > 0) {
    const lastId = lastReview[0].reviewId;
    const idNumber = parseInt(lastId.replace("REV", ""), 10);
    const padded = String(idNumber + 1).padStart(5, "0");
    newReviewID = "REV" + padded;
  }

  await Review.create({
    reviewId: newReviewID,
    usersName: `${req.user.firstName} ${req.user.lastName}`,
    email: req.user.email,
    comment: req.body.comment,
    rating: req.body.rating,
  });

  res.json({ message: "Response submitted successfully" });
}

export async function updateReview(req, res) {
  if (!req.user) {
    return res.status(403).json({ message: "You need to sign in to edit a review" });
  }

  const { reviewId, comment, rating } = req.body;

  try {
    const review = await Review.findOne({ reviewId });
    if (!review) return res.status(404).json({ message: "No review found for this ID" });
    if (req.user.email !== review.email) {
      return res.status(403).json({ message: "You can only edit your own reviews!" });
    }

    await Review.updateOne(
      { reviewId },                 // ⬅️ add filter
      { $set: { comment, rating } } // ⬅️ set fields
    );

    res.json({ message: "Review updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update review", error: err.message });
  }
}

export async function deleteReview(req, res) {
  const { reviewId } = req.body;

  if (!req.user) {
    return res.status(403).json({ message: "you need to sign in first to delete reviews !" });
  }

  try {
    const review = await Review.findOne({ reviewId });
    if (!review) return res.status(404).json({ message: "No review found for this ID" });

    if (req.user.email === review.email || isAdmin(req)) {
      await Review.deleteOne({ reviewId });
      return res.json({ message: "Review deleted successfully" });
    }

    return res.status(403).json({ message: "You can only delete your own reviews!" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete review", error: err.message });
  }
}
