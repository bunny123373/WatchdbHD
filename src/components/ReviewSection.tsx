"use client";

import { useState, useEffect } from "react";
import { Star, Send, User } from "lucide-react";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewSectionProps {
  contentId: string;
}

export default function ReviewSection({ contentId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ totalReviews: 0, avgRating: 0 });
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [contentId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?contentId=${contentId}`);
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, userName, rating, comment }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviews([data.review, ...reviews]);
        setStats((prev) => ({
          totalReviews: prev.totalReviews + 1,
          avgRating: prev.totalReviews === 0
            ? rating
            : Number(((prev.avgRating * prev.totalReviews + rating) / (prev.totalReviews + 1)).toFixed(1))
        }));
        setUserName("");
        setRating(5);
        setComment("");
      } else {
        setError("Failed to submit review");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 p-4 sm:p-6 bg-[#0E1015] rounded-xl border border-[#1F232D]">
      <h3 className="text-xl font-bold text-white mb-4">Reviews & Ratings</h3>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-[#141414] rounded-lg">
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          <span className="text-2xl font-bold text-white">{stats.avgRating}</span>
          <span className="text-gray-400">/ 5</span>
        </div>
        <span className="text-gray-400 text-sm">{stats.totalReviews} reviews</span>
      </div>

      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-[#141414] rounded-lg">
        <h4 className="text-white font-medium mb-3">Write a Review</h4>
        
        <div className="mb-3">
          <label className="text-gray-400 text-sm mb-1 block">Your Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              maxLength={30}
              className="w-full pl-10 pr-4 py-2 bg-[#1F232D] border border-[#2a2f3d] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="text-gray-400 text-sm mb-1 block">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-600"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="text-gray-400 text-sm mb-1 block">Your Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
            maxLength={500}
            rows={3}
            className="w-full px-4 py-2 bg-[#1F232D] border border-[#2a2f3d] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none"
          />
          <span className="text-gray-500 text-xs">{comment.length}/500</span>
        </div>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      {/* Reviews List */}
      <div>
        <h4 className="text-white font-medium mb-3">
          {reviews.length} Review{reviews.length !== 1 ? "s" : ""}
        </h4>
        
        {loading ? (
          <p className="text-gray-400">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-400">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {reviews.map((review) => (
              <div key={review._id} className="p-4 bg-[#141414] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{review.userName}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{review.comment}</p>
                <span className="text-gray-500 text-xs mt-2 block">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
