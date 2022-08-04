const destination = require('../models/Destination');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const Destinations = await destination.find({}).populate('popupText');
    res.render('Destinations/index', { Destinations })
}

module.exports.renderNewForm = (req, res) => {
    res.render('Destinations/new');
}

module.exports.createDestination = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.Destination.location,
        limit: 1
    }).send()
    if(geoData.body.features.length==0){
        req.flash('error', 'Cannot Find that Location!');
        return res.redirect('/Destinations/new');
    }
    const Destination = new destination(req.body.Destination);
    Destination.geometry = geoData.body.features[0].geometry;
    
    Destination.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    Destination.author = req.user._id;
    await Destination.save();
    req.flash('success', 'Successfully made a new Destination!');
    res.redirect(`/Destinations/${Destination._id}`)
}

module.exports.showDestination = async (req, res,) => {
    const Destination = await destination.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!Destination) {
        req.flash('error', 'Cannot find that Destination!');
        return res.redirect('/Destinations');
    }
    res.render('Destinations/show', { Destination });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const Destination = await destination.findById(id)
    if (!Destination) {
        req.flash('error', 'Cannot find that Destination!');
        return res.redirect('/Destinations');
    }
    res.render('Destinations/edit', { Destination });
}

module.exports.updateDestination = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.Destination.location,
        limit: 1
    }).send()
    const { id } = req.params;
    if(geoData.body.features.length==0){
        req.flash('error', 'Cannot find that Location!Please re-enter Location');
        return res.redirect(`/Destinations/${id}/edit`);
    }
    const Destination = await destination.findByIdAndUpdate(id, { ...req.body.Destination });
    Destination.geometry = geoData.body.features[0].geometry;
    
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    Destination.images.push(...imgs);
    await Destination.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await Destination.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated Destination!');
    res.redirect(`/Destinations/${Destination._id}`)
}

module.exports.deleteDestination = async (req, res) => {
    const { id } = req.params;
    await destination.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Destination')
    res.redirect('/Destinations');
}