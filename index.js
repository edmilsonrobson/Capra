require("dotenv").config();
const axios = require("axios");
const moment = require("moment");
const config = require("./config.json");
const lodash = require("lodash");

const { sampleSize } = lodash;
const intercomAccessToken = process.env.INTERCOM_ACCESS_TOKEN;
const SEARCH_CONVERSATIONS_ENDPOINT =
    "https://api.intercom.io/conversations/search";
const LIST_ALL_ADMINS_ENDPOINT = "https://api.intercom.io/admins";

const { conversationFilters, adminParticipants, conversationSampleSize } =
    config;
const { minimumReplies, maximumAgeInDays } = conversationFilters;

if (!intercomAccessToken) {
    console.log("MISSING INTERCOM ACCESS TOKEN");
    return;
}

const headers = {
    Authorization: `Bearer ${intercomAccessToken}`,
    "Content-Type": "application/json",
};

console.log("Searching for conversations...");
console.log(`...in the past ${maximumAgeInDays} days`);
console.log(`...with at least ${minimumReplies} replies`);
console.log(
    `...taking a sample of ${conversationSampleSize} conversations per admin`
);

const xDaysInThePastTimestamp = moment()
    .subtract(maximumAgeInDays, "days")
    .unix();

let adminsToFilter = [];

const listAllAdmins = async () => {
    try {
        const { data } = await axios.get(LIST_ALL_ADMINS_ENDPOINT, {
            headers,
        });
        const { admins } = data;
        const filteredAdmins = admins.filter((admin) =>
            adminParticipants.includes(admin.email)
        );
        adminsToFilter = filteredAdmins.map((admin) => ({
            id: admin.id,
            name: admin.name,
        }));
    } catch (e) {
        console.log(e);
    }
};

const searchConversations = async (adminIds) => {
    try {
        const { data } = await axios.post(
            SEARCH_CONVERSATIONS_ENDPOINT,
            {
                query: {
                    operator: "AND",
                    value: [
                        {
                            field: "created_at",
                            operator: ">",
                            value: xDaysInThePastTimestamp,
                        },
                        {
                            field: "admin_assignee_id",
                            operator: "IN",
                            value: adminIds,
                        },
                        {
                            field: "statistics.count_conversation_parts",
                            operator: ">",
                            value: minimumReplies,
                        },
                    ],
                },
            },
            {
                headers,
            }
        );

        return data;
    } catch (e) {
        const {
            response: {
                data: { errors },
            },
        } = e;
        console.log(errors);
        return [];
    }
};

const generateConversationLink = (id) =>
    `https://app.intercom.com/a/apps/qzw05t6c/conversations/${id}`;

const run = async () => {
    console.time("Total time running this script");
    await listAllAdmins();
    console.log("\n");
    console.log("*******************************");
    console.log("******* YOUR ASSIGNMENT *******");
    console.log("*******************************");
    for (const admin of adminsToFilter) {
        console.log("\n");
        console.log("*******************************");
        console.log(`FROM: ${admin.name}`);
        console.log("*******************************");
        const conversationsData = await searchConversations([admin.id]);
        const { conversations } = conversationsData;
        if (!conversations.length) {
            return;
        }
        const sampleConversations = sampleSize(
            conversations,
            conversationSampleSize
        );
        const assignments = sampleConversations.map((conversation) => ({
            id: conversation.id,
            link: generateConversationLink(conversation.id),
            replies: conversation.statistics.count_conversation_parts,
            createdAt: moment
                .unix(conversation.created_at)
                .format("MMMM DD, YYYY - HH:mm"),
        }));

        assignments.forEach((conversation) => {
            console.log("\n");
            console.log(`${conversation.createdAt}`);
            console.log(`Link: ${conversation.link}`);
        });
    }

    console.timeEnd("Total time running this script");
};

run();
