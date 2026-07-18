import Review from "../models/review.js"

export async function createReview(req, res) {
    if (req.user == null) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }
    try {
        const existing = await Review.findOne({
            productId: req.body.productId,
            userEmail: req.user.email
        })
        if (existing) {
            res.status(400).json({ message: "You already reviewed this product" })
            return
        }
        const review = new Review({
            productId: req.body.productId,
            userEmail: req.user.email,
            userName: `${req.user.firstName} ${req.user.lastName}`,
            rating: req.body.rating,
            comment: req.body.comment,
            isAnonymous: req.body.isAnonymous ?? false
        })
        await review.save()
        res.json({ message: "Review created successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error creating review" })
    }
}

export async function getReviewForProduct(req, res) {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 })
        const publicReview = reviews.map(r => ({
            _id: r._id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            userName: r.isAnonymous ? "Anonymous" : r.userName,
            isAnonymous: r.isAnonymous,
            isOwn: req.user != null && r.userEmail === req.user.email
        }))
        res.json(publicReview)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error fetching reviews" })
    }
}

// PUT /reviews/:id - owner of the review, or admin
export async function updateReview(req, res) {
    if (req.user == null) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }
    try {
        const review = await Review.findById(req.params.id)
        if (!review) {
            res.status(404).json({ message: "Review not found" })
            return
        }
        if (review.userEmail !== req.user.email && !req.user.isAdmin) {
            res.status(403).json({ message: "You can only edit your own review" })
            return
        }

        if (req.body.rating != null) review.rating = req.body.rating
        if (req.body.comment != null) review.comment = req.body.comment
        if (req.body.isAnonymous != null) review.isAnonymous = req.body.isAnonymous

        await review.save()
        res.json({ message: "Review updated successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error updating review" })
    }
}

// DELETE /reviews/:id - owner of the review, or admin
export async function deleteReview(req, res) {
    if (req.user == null) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }
    try {
        const review = await Review.findById(req.params.id)
        if (!review) {
            res.status(404).json({ message: "Review not found" })
            return
        }
        if (review.userEmail !== req.user.email && !req.user.isAdmin) {
            res.status(403).json({ message: "You can only delete your own review" })
            return
        }
        await Review.findByIdAndDelete(req.params.id)
        res.json({ message: "Review deleted successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error deleting review" })
    }
}

export async function getReviewStats(req, res) {
    try {
        const stats = await Review.aggregate([
            {
                $group: {
                    _id: "$productId",
                    averageRating: { $avg: "$rating" },
                    reviewCount: { $sum: 1 }
                }
            }
        ])
        const statsMap = {}
        stats.forEach(s => {
            statsMap[s._id] = {
                averageRating: s.averageRating,
                reviewCount: s.reviewCount
            }
        })
        res.json(statsMap)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error fetching review stats" })
    }
}

export async function getAllReviews(req, res) {
    if (req.user == null || !req.user.isAdmin) {
        res.status(403).json({ message: "Forbidden" })
        return
    }
    try {
        const pageSize = parseInt(req.params.pageSize) || 10
        const pageNumber = parseInt(req.params.pageNumber) || 1

        const total = await Review.countDocuments()
        const totalPages = Math.ceil(total / pageSize)

        const reviews = await Review.find()
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)

        res.json({
            reviews: reviews,
            totalPages: totalPages,
            total: total
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error fetching reviews" })
    }
}