var express = require('express');
var router = express.Router();
// const {jwtInfluencerMiddleware} = require("../middleware/authMiddleware");

const {
    getFaqList,
    getFaqByTopic,
    getTopicDetail,
} = require("../controller/api/faqController");

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

// ----- API
router.get('/faq', getFaqList)
router.get('/faq/detail/:id', getTopicDetail)
router.get('/faq/:topic_id', getFaqByTopic)
module.exports = router;
