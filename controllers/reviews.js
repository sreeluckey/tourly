const destination = require('../models/Destination');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const Destination = await destination.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    Destination.reviews.push(review);
    await review.save();
    await Destination.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/Destinations/${Destination._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await destination.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/Destinations/${id}`);
}
