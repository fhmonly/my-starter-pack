const db = require("../../config/database/connection")
const {checkPartnerExistTable, getFilesAws} = require("../../util/util")
const axios = require("axios")
const moment = require("moment")

// getFaqList,
// getFaqByTopic,
/**
 * getFaqList
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.getFaqList = async (req, res, next) => {
    try {
        const {lang, type} = req.query
        if (!lang || !type) return res.status(400).json({message: "Bad Request"})

        let query = db("topics")
            .where("type_id", type)
            .orderBy("id", "asc")
            .whereNot("status", 0)
            .select(
                "id",
                "status",
                "image",
            )

        if (lang) {
            query = query.select(
                `name_${lang} as name`,
            )
        }

        const result = await query
        if (!result.length) return res.status(404).json({message: "Data not found"})

        const data = await Promise.all(result.map(async (item) => {
            return {
                ...item,
                image_url: await getFilesAws(item.image) ?? null
            }
        }))

        res.status(200).json({
            message: "Success",
            data
        })
    } catch (e) {
        console.log(e)
        // return res.status(e.response.status).json({
        //     message: e.response.data.message
        // })
    }
}

/**
 * getFaqByTopic
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.getFaqByTopic = async (req, res, next) => {
    try {
        const {lang, type, search} = req.query
        const {topic_id} = req.params
        if (!lang || !topic_id) return res.status(400).json({message: "Bad Request"})

        let query = db("faqs")
            .orderBy("id", "asc")
            .where({
                status: 1,
            })
            .select(
                "faqs.id",
                "faqs.status",
            )
            .where("topic_id", topic_id)
        if (type) {
            query = query.leftJoin("faq_types", "faq_types.faq_id", "faqs.id")
                .where("faq_types.type_id", type)
        }
        if (lang) {
            query = query.select(
                `faqs.question_${lang} as question`,
                `faqs.answer_${lang} as answer`,
            )
        }
        if (search) {
            query = query.where(function () {
                this.whereRaw(`LOWER(faqs.question_${lang}) like ?`, [`%${search.toLowerCase()}%`])
                    .orWhereRaw(`LOWER(faqs.answer_${lang}) like ?`, [`%${search.toLowerCase()}%`])
            })
        }

        const data = await query
        console.log(data)
        res.status(200).json({
            message: "Success",
            data
        })
    } catch (e) {
        console.log(e)
        // return res.status(e.response.status).json({
        //     message: e.response.data.message
        // })
    }
}


exports.getTopicDetail = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { lang } = req.query;
        if (!lang) return res.status(400).json({ message: "Bad Request" });
        if (!id) return res.status(400).json({ message: "Bad Request" });

        const data = await db("faqs")
            .where({
                "faqs.id": id,
                "faqs.status": 1
            })
            .select(
                'faqs.id',
                `faqs.question_${lang} as question`,
                `faqs.answer_${lang} as answer`,
                `topics.name_${lang} as topic_name`,
                `faqs.topic_id`,
                'faqs.publish_date',
                'faqs.author_name',
            )
            .leftJoin("topics", "topics.id", "faqs.topic_id")
            .first();

        if (!data) return res.status(404).json({ message: "Data not found" });

        data.types_collect = (await db("faq_types")
            .where({
                "faq_types.faq_id": id,
            })
            .leftJoin("types", "types.id", "faq_types.type_id")
            .orderBy("types.id", "asc")
                .pluck("types.name")
            ) ?? [];

        const otherData = await db("faqs")
            .where({
                "faqs.status": 1,
                "faqs.topic_id": data.topic_id
            })
            .whereNot({
                "faqs.id": id
            })
            .select(
                'faqs.id',
                `faqs.question_${lang} as question`,
                `faqs.answer_${lang} as answer`,
                `topics.name_${lang} as topic_name`,
            )
            .leftJoin("topics", "topics.id", "faqs.topic_id")
            .limit(5)
            .orderBy("faqs.id", "desc")

        delete data.topic_id;
        data.publish_date = moment(data.publish_date).format("DD MMM YYYY");

        return res.status(200).json({
            message: "Success",
            data: {
                ...data,
                other: otherData
            }
        });
    } catch (e) {
        console.log(e);
        return res.status(e.response.status).json({
            message: e.response.data.message
        });
    }
}
