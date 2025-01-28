const db = require("../../config/database/connection")
const {checkPartnerExistTable, getFilesAws} = require("../../util/util")
const axios = require("axios")
const {errorHandlerSyntax, MYSQL_ERROR} = require("../../middleware/errorHandler/errorHandlerMiddleware")

const urlInternalSeo = `${process.env.URL_INTERNAL_SEO}`;

// getFaqList,
// getFaqById,
// createFaq,
// updateFaq,
// deleteFaq,
/**
 * getFaqList
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.getFaqList = async (req, res, next) => {
    try {
        const {page, limit, search} = req.query

        let lang = 'en'

        let query = db("faqs")
            .leftJoin("topics", "topics.id", "faqs.topic_id")
            .select(
                "faqs.id as id",
                "faqs.topic_id as topic_id",
                "topics.name_en as topic_name_en",
                "topics.name_id as topic_name_id",
                "faqs.question_en as question_en",
                "faqs.question_id as question_id",
                "faqs.answer_en as answer_en",
                "faqs.answer_id as answer_id",
                "faqs.status as status",
                "faqs.author_name as author_name",
                "faqs.publish_date as publish_date",
            )
            .whereNot({
                "faqs.status": "0",
            })
            .orderBy("faqs.created_at", "asc")

        let totalAll = await query.clone()
        if(page && limit) {
            query = query.offset((page - 1) * limit).limit(limit)
        }

        if(search) {
            query = query.where(function () {
                this.whereRaw(`LOWER(faqs.question_en) LIKE ?`, [`%${search.toLowerCase()}%`])
                    .orWhereRaw(`LOWER(faqs.question_id) LIKE ?`, [`%${search.toLowerCase()}%`])
            })
        }
        const ResData = await query

        const data = ResData.map((item) => {
            let AliasStatus = {
                0: "Draft",
                1: "Published",
                2: "Scheduled",
                3: "Archived",
            }

            let status = AliasStatus[item.status]

            if (lang === "en") {
                return {
                    id: item.id,
                    topic_id: item.topic_id,
                    topic_name: item.topic_name_en,
                    question: item.question_en,
                    answer: item.answer_en,
                    status: status,
                    author_name: item.author_name,
                    publish_date: item.publish_date,
                }
            }else{
                return {
                    id: item.id,
                    topic_id: item.topic_id,
                    topic_name: item.topic_name_id,
                    question: item.question_id,
                    answer: item.answer_id,
                    status: status,
                    author_name: item.author_name,
                    publish_date: item.publish_date,
                }
            }
        })

        const infoPage = {
            current_page: parseInt(page),
            record_min: data.length > 0 ? (page - 1) * limit + 1 : 0,
            record_max: data.length,
            total_record: totalAll.length,
            total_page: parseInt(Math.ceil(totalAll.length / limit)),
        }

        res.status(200).json({
            message: "success",
            data,
            infoPage
        })
    } catch (e) {
        console.log(e)
        next(errorHandlerSyntax(e, MYSQL_ERROR));
    }
}

/**
 * getFaqById
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.getFaqById = async (req, res, next) => {
    try {
        const {id} = req.params
        if (!id) return res.status(400).json({message: "Bad Request"})

        const data = await db("faqs")
            .leftJoin("topics", "topics.id", "faqs.topic_id")
            .select(
                "faqs.id as id",
                "faqs.topic_id as topic_id",
                "topics.name_en as topic_name_en",
                "topics.name_id as topic_name_id",
                "faqs.question_en as question_en",
                "faqs.question_id as question_id",
                "faqs.answer_en as answer_en",
                "faqs.answer_id as answer_id",
                "faqs.status as status",
                "faqs.author_name as author_name",
                "faqs.publish_date as publish_date",
            )
            .where({
                "faqs.id": id,
            })
            .whereNot({
                "faqs.status": "0",
            })
            .first()

        const faqType = await db("faq_types")
            .select(
                "id",
                "faq_id",
                "type_id",
            )
            .where({
                "faq_id": id,
            })

        if (!data) return res.status(404).json({message: "Not Found"})

        data.type = faqType.map((item) => {
            return item.type_id
        })

        res.status(200).json({
            message: "success",
            data
        })
    } catch (e) {
        console.log(e)
        next(errorHandlerSyntax(e, MYSQL_ERROR));
    }
}

/**
 * createFaq
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.createFaq = async (req, res, next) => {
    try {
        const {topic_id, question_en, question_id, answer_en, answer_id, status, type_id, author_name, publish_date} = req.body
        if (!topic_id || !question_en || !question_id || !answer_en || !answer_id || !status || !type_id || !author_name || !publish_date) return res.status(400).json({message: "Bad Request"})

        const check = await db("faqs")
            .where({
                topic_id,
                question_en,
                question_id,
            })
            .first()
        if (check) return res.status(400).json({message: "Data already exists"})

        const result = await db("faqs")
            .insert({
                topic_id,
                question_en,
                question_id,
                answer_en,
                answer_id,
                status,
                author_name,
                publish_date,
            }).returning("id")

        if(type_id.length > 0) {
            for (let i = 0; i < type_id.length; i++) {
                await db("faq_types")
                    .insert({
                        faq_id: result[0].id,
                        type_id: type_id[i],
                    })
            }
        }

        const dataSeoSave = {
            category_slug: 'faq',
            category_id: result[0].id,
            event_name: 'view',
            title: question_id,
            keywords: question_id,
            description: question_id + ' ' + answer_id,
            datas: false,
        }
        console.log(`${urlInternalSeo}`, "url seo")
        console.log(dataSeoSave, "data seo")
        await axios.post(`${urlInternalSeo}add`, dataSeoSave)

        res.status(200).json({
            message: "success",
        })
    } catch (e) {
        console.log(e)
        next(errorHandlerSyntax(e, MYSQL_ERROR));
    }
}

/**
 * updateFaq
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.updateFaq = async (req, res, next) => {
    try {
        const {id} = req.params
        const {topic_id, question_en, question_id, answer_en, answer_id, status, type_id, author_name, publish_date} = req.body
        if (!id || !topic_id || !question_en || !question_id || !answer_en || !answer_id || !status || !type_id || !author_name || !publish_date) return res.status(400).json({message: "Bad Request"})

        const check = await db("faqs")
            .where({
                topic_id,
                question_en,
                question_id,
            })
            .whereNot({
                id
            })
            .first()
        if (check) return res.status(400).json({message: "Data already exists"})

        await db("faqs")
            .where({
                id
            })
            .update({
                topic_id,
                question_en,
                question_id,
                answer_en,
                answer_id,
                status,
                author_name,
                publish_date,
            })

        await db("faq_types").where({
                faq_id: id,
            }).del()
        if(type_id.length > 0) {
            for (let i = 0; i < type_id.length; i++) {
                await db("faq_types")
                    .insert({
                        faq_id: id,
                        type_id: type_id[i],
                    })
            }
        }

        const dataSeoSave = {
            category_slug: 'faq',
            category_id: id,
            event_name: 'view',
            title: question_id,
            keywords: question_id,
            description: question_id + ' ' + answer_id,
            datas: null,
        }
        console.log(`${urlInternalSeo}update`, "url seo")
        console.log(dataSeoSave, "data seo")
        await axios.patch(`${urlInternalSeo}update`, dataSeoSave)

        res.status(200).json({
            message: "success",
        })
    } catch (e) {
        console.log(e)
        next(errorHandlerSyntax(e, MYSQL_ERROR));
    }
}

/**
 * deleteFaq
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.deleteFaq = async (req, res, next) => {
    try {
        const {id} = req.params
        if (!id) return res.status(400).json({message: "Bad Request"})

        await db("faq_types")
            .where({
                faq_id: id,
            })
            .del()

        await db("faqs")
            .where({
                id
            })
            .update({
                status: 0,
            })

        // delete seo
        const dataSeo = {
            category_slug: 'faq',
            category_id: id,
        }
        await axios.delete(`${urlInternalSeo}delete`, {params: dataSeo})

        res.status(200).json({
            message: "success",
        })
    } catch (e) {
        console.log(e)
        next(errorHandlerSyntax(e, MYSQL_ERROR));
    }
}

// getFaqCategoryList,
// getFaqCategoryById,
// createFaqCategory,
// updateFaqCategory,
// deleteFaqCategory,
/**
 * getFaqCategoryList
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.getFaqCategoryList = async (req, res, next) => {
    try{
        const {page, limit} = req.query
        let lang = 'en'

        let query = db("topics")
            .select(
                "topics.id",
                "topics.name_en",
                "topics.name_id",
                "topics.image",
                "topics.status",
                "types.name as type_name",
                "types.id as type_id",
            )
            .whereNot({
                "topics.status": 0,
            })
            .leftJoin("types", "types.id", "topics.type_id")
            .orderBy("topics.created_at", "asc")

        let totalAll = await query.clone()
        if(page && limit) {
            query = query.offset((page - 1) * limit).limit(limit)
        }
        const ResData = await query

        const data = await Promise.all(ResData.map(async (item) => {
            let image_url = await getFilesAws(item.image);
            if (lang === "en") {
                return {
                    id: item.id,
                    name: item.name_en + " (" + item.type_name + ")",
                    status: item.status,
                    image: image_url,
                    type: item.type_name,
                    type_id: item.type_id,
                }
            }else{
                return {
                    id: item.id,
                    name: item.name_id + " (" + item.type_name + ")",
                    status: item.status,
                    image: image_url,
                    type: item.type_name,
                    type_id: item.type_id,
                }
            }
        }));

        const infoPage = {
            current_page: parseInt(page),
            record_min: data.length > 0 ? (page - 1) * limit + 1 : 0,
            record_max: data.length,
            total_record: totalAll.length,
            total_page: parseInt(Math.ceil(totalAll.length / limit)),
        }

        res.status(200).json({
            message: "success",
            data,
            infoPage
        })
    } catch (e) {
        console.log(e)
        // next(errorHandlerSyntax(e, MYSQL_ERROR));
    }
}

/**
 * getFaqCategoryById
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.getFaqCategoryById = async (req, res, next) => {
    try{
        const {topic_id} = req.params
        if (!topic_id) return res.status(400).json({message: "Bad Request"})

        const result = await db("topics")
            .select(
                "topics.id",
                "topics.name_en",
                "topics.name_id",
                "topics.image",
                "topics.status",
                "types.name as type_name",
            )
            .leftJoin("types", "types.id", "topics.type_id")
            .where({
                "topics.id": topic_id,
                "topics.status": "1",
            })
            .first()

        if (!result) return res.status(404).json({message: "Not Found"})

        let image_url = null
        if (result.image){
            image_url = await getFilesAws(result.image);
            result.image_url = image_url
        }

        res.status(200).json({
            message: "success",
            data: result
        })
    } catch (e) {
        console.log(e)
        next(errorHandlerSyntax(e, MYSQL_ERROR));
    }
}

/**
 * createFaqCategory
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.createFaqCategory = async (req, res, next) => {
    try{
        const {name_en, name_id, image, type_id} = req.body
        if (!name_en || !name_id || !image || !type_id) return res.status(400).json({message: "Bad Request"})

        const result = await db("topics")
            .insert({
                name_en,
                name_id,
                image,
                status: 1,
                type_id,
            })

        res.status(200).json({
            message: "success",
        })
    } catch (e) {
        console.log(e)
        next(errorHandlerSyntax(e, MYSQL_ERROR));
    }
}

/**
 * updateFaqCategory
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.updateFaqCategory = async (req, res, next) => {
    try{
        const {topic_id} = req.params
        const {name_en, name_id, image, type_id} = req.body
        if (!topic_id || !name_en || !name_id || !type_id) return res.status(400).json({message: "Bad Request"})

        if (image === null){
            await db("topics")
                .where({
                    id: topic_id
                })
                .update({
                    name_en,
                    name_id,
                    type_id,
                })
        }else{
            await db("topics")
                .where({
                    id: topic_id
                })
                .update({
                    name_en,
                    name_id,
                    image,
                    type_id,
                })
        }

        res.status(200).json({
            message: "success",
        })
    } catch (e) {
        console.log(e)
        next(errorHandlerSyntax(e, MYSQL_ERROR));
    }
}

/**
 * deleteFaqCategory
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.deleteFaqCategory = async (req, res, next) => {
    try{
        const {topic_id} = req.params
        if (!topic_id) return res.status(400).json({message: "Bad Request"})

        const result = await db("topics")
            .where({
                id: topic_id
            })
            .update({
                status: 0,
            })

        res.status(200).json({
            message: "success",
        })
    } catch (e) {
        console.log(e)
        next(errorHandlerSyntax(e, MYSQL_ERROR));
    }
}

/**
 * getTypeList
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.getTypeList = async (req, res, next) => {
    try{
        const result = await db("types")
            .select(
                "id",
                "name",
            )
            .orderBy("id", "asc")

        res.status(200).json({
            message: "success",
            data: result
        })
    } catch (e) {
        console.log(e)
        next(errorHandlerSyntax(e, MYSQL_ERROR));
    }
}
