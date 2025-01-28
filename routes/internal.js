var express = require('express');
const {
    getFaqList,
    getFaqById,
    createFaq,
    updateFaq,
    deleteFaq,

    getFaqCategoryList,
    getFaqCategoryById,
    createFaqCategory,
    updateFaqCategory,
    deleteFaqCategory,

    getTypeList,
} = require("../controller/internal/faqController");
var router = express.Router();

router.get('/type-list', getTypeList)
router.get('/faq', getFaqList)
router.get('/faq/:id', getFaqById)
router.post('/faq', createFaq)
router.patch('/faq/:id', updateFaq)
router.delete('/faq/:id', deleteFaq)

router.get('/topic', getFaqCategoryList)
router.get('/topic/:topic_id', getFaqCategoryById)
router.post('/topic', createFaqCategory)
router.patch('/topic/:topic_id', updateFaqCategory)
router.delete('/topic/:topic_id', deleteFaqCategory)

module.exports = router;
