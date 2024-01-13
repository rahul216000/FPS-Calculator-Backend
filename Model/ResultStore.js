const mongoose = require('mongoose');

const Results = mongoose.model('Results', {
    url: { type: String },
    result: { type: Object }
});

module.exports = Results