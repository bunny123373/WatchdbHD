module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/src/lib/mongodb.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const MONGODB_URI = ("TURBOPACK compile-time value", "mongodb+srv://Balujeswanth:Baluflix123@cluster0.hqqoxgl.mongodb.net/baluflix?retryWrites=true&w=majority");
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null
    };
}
async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000
        };
        cached.promise = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].connect(MONGODB_URI, opts).then((mongoose)=>{
            return mongoose;
        });
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error("MongoDB connection error:", e);
        throw e;
    }
    return cached.conn;
}
const __TURBOPACK__default__export__ = connectDB;
}),
"[project]/src/lib/dbconnect.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mongodb.ts [app-rsc] (ecmascript)");
;
}),
"[project]/src/models/Content.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const EpisodeSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"]({
    episodeNumber: {
        type: Number,
        required: true
    },
    episodeTitle: {
        type: String,
        required: true
    },
    embedIframeLink: {
        type: String
    },
    downloadLink: {
        type: String,
        required: true
    },
    quality: {
        type: String
    }
});
const SeasonSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"]({
    seasonNumber: {
        type: Number,
        required: true
    },
    episodes: [
        EpisodeSchema
    ]
});
const ContentSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"]({
    type: {
        type: String,
        required: true,
        enum: [
            "movie",
            "series"
        ]
    },
    title: {
        type: String,
        required: true
    },
    poster: {
        type: String,
        required: true
    },
    banner: {
        type: String
    },
    description: {
        type: String
    },
    year: {
        type: String
    },
    language: {
        type: String
    },
    category: {
        type: String
    },
    quality: {
        type: String
    },
    rating: {
        type: Number
    },
    tags: [
        {
            type: String
        }
    ],
    embedIframeLink: {
        type: String
    },
    downloadLink: {
        type: String
    },
    seasons: [
        SeasonSchema
    ],
    tmdbId: {
        type: Number
    },
    tmdbGenreIds: [
        {
            type: Number
        }
    ],
    tmdbGenres: [
        {
            type: String
        }
    ]
}, {
    timestamps: true
});
const Content = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.Content || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model("Content", ContentSchema);
const __TURBOPACK__default__export__ = Content;
}),
"[project]/src/app/series/[id]/SeriesDetailsClient.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/series/[id]/SeriesDetailsClient.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/series/[id]/SeriesDetailsClient.tsx <module evaluation>", "default");
}),
"[project]/src/app/series/[id]/SeriesDetailsClient.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/series/[id]/SeriesDetailsClient.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/series/[id]/SeriesDetailsClient.tsx", "default");
}),
"[project]/src/app/series/[id]/SeriesDetailsClient.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$series$2f5b$id$5d2f$SeriesDetailsClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/app/series/[id]/SeriesDetailsClient.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$series$2f5b$id$5d2f$SeriesDetailsClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/app/series/[id]/SeriesDetailsClient.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$series$2f5b$id$5d2f$SeriesDetailsClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/app/series/[id]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SeriesDetailsPage,
    "generateMetadata",
    ()=>generateMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dbconnect$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/dbconnect.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mongodb.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$Content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/models/Content.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$series$2f5b$id$5d2f$SeriesDetailsClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/series/[id]/SeriesDetailsClient.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/constants.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
async function getSeries(id) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])();
        const series = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$Content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].findById(id).lean();
        if (!series) return null;
        return {
            _id: String(series._id || ""),
            title: String(series.title || ""),
            poster: String(series.poster || ""),
            banner: series.banner ? String(series.banner) : "",
            description: series.description ? String(series.description) : "",
            year: series.year ? String(series.year) : "",
            rating: series.rating != undefined ? Number(series.rating) : undefined,
            quality: series.quality ? String(series.quality) : "",
            language: series.language ? String(series.language) : "",
            type: String(series.type || "series"),
            tags: Array.isArray(series.tags) ? series.tags.map(String) : [],
            seasons: Array.isArray(series.seasons) ? series.seasons : [],
            category: series.category ? String(series.category) : "",
            tmdbId: series.tmdbId != undefined ? Number(series.tmdbId) : undefined,
            tmdbGenreIds: Array.isArray(series.tmdbGenreIds) ? series.tmdbGenreIds.map(Number) : undefined,
            tmdbGenres: Array.isArray(series.tmdbGenres) ? series.tmdbGenres.map(String) : undefined,
            createdAt: series.createdAt ? new Date(series.createdAt) : new Date(),
            updatedAt: series.updatedAt ? new Date(series.updatedAt) : new Date()
        };
    } catch (error) {
        console.error("Failed to fetch series:", error);
        return null;
    }
}
async function getSimilarSeries(language, excludeId) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])();
        const series = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$Content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].find({
            type: "series",
            language: language,
            _id: {
                $ne: excludeId
            }
        }).limit(10).lean();
        return series.map((s)=>({
                _id: String(s._id || ""),
                title: String(s.title || ""),
                poster: String(s.poster || ""),
                banner: s.banner ? String(s.banner) : "",
                description: s.description ? String(s.description) : "",
                year: s.year ? String(s.year) : "",
                rating: s.rating != undefined ? Number(s.rating) : undefined,
                quality: s.quality ? String(s.quality) : "",
                language: s.language ? String(s.language) : "",
                type: String(s.type || "series"),
                tags: Array.isArray(s.tags) ? s.tags.map(String) : [],
                seasons: Array.isArray(s.seasons) ? s.seasons : [],
                category: s.category ? String(s.category) : "",
                tmdbId: s.tmdbId != undefined ? Number(s.tmdbId) : undefined,
                tmdbGenreIds: Array.isArray(s.tmdbGenreIds) ? s.tmdbGenreIds.map(Number) : undefined,
                tmdbGenres: Array.isArray(s.tmdbGenres) ? s.tmdbGenres.map(String) : undefined,
                createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
                updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date()
            }));
    } catch (error) {
        console.error("Failed to fetch similar series:", error);
        return [];
    }
}
async function generateMetadata({ params }) {
    const { id } = await params;
    const series = await getSeries(id);
    if (!series) {
        return {
            title: "Series Not Found"
        };
    }
    const title = `${series.title} ${series.year ? `(${series.year})` : ""} - Watch Online`;
    const description = series.description || `Watch ${series.title} online in HD quality. ${series.language} web series.`;
    const imageUrl = series.poster || series.banner || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].ogImage;
    const url = `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/series/${id}`;
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
            siteName: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].name,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: series.title
                }
            ],
            type: "video.tv_show",
            locale: "en_US"
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [
                imageUrl
            ]
        },
        alternates: {
            canonical: url
        }
    };
}
async function SeriesDetailsPage({ params }) {
    const { id } = await params;
    const series = await getSeries(id);
    if (!series) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    }
    const similarSeries = await getSimilarSeries(series.language || "Telugu", id);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$series$2f5b$id$5d2f$SeriesDetailsClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
        series: series,
        similarSeries: similarSeries
    }, void 0, false, {
        fileName: "[project]/src/app/series/[id]/page.tsx",
        lineNumber: 134,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/app/series/[id]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/series/[id]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b3e1c432._.js.map