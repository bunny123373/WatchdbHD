module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/mongodb.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/models/Content.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        type: String
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
const CastSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"]({
    name: {
        type: String,
        required: true
    },
    character: {
        type: String
    },
    image: {
        type: String
    }
});
const CrewSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"]({
    name: {
        type: String,
        required: true
    },
    job: {
        type: String
    },
    image: {
        type: String
    }
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
    ],
    cast: [
        CastSchema
    ],
    crew: [
        CrewSchema
    ],
    trailerUrl: {
        type: String
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
const Content = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.Content || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model("Content", ContentSchema);
const __TURBOPACK__default__export__ = Content;
}),
"[project]/src/app/api/tmdb/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mongodb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$Content$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/models/Content.ts [app-route] (ecmascript)");
;
;
;
const GENRE_CACHE = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const EXISTING_IDS_CACHE = {
    ids: new Set(),
    timestamp: 0
};
const EXISTING_IDS_CACHE_DURATION = 60 * 1000;
async function getExistingTmdbIds() {
    if (Date.now() - EXISTING_IDS_CACHE.timestamp < EXISTING_IDS_CACHE_DURATION && EXISTING_IDS_CACHE.ids.size > 0) {
        return EXISTING_IDS_CACHE.ids;
    }
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        const contents = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$Content$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find({
            tmdbId: {
                $exists: true,
                $ne: null
            }
        }).select("tmdbId").lean();
        const ids = new Set(contents.map((c)=>c.tmdbId).filter(Boolean));
        EXISTING_IDS_CACHE.ids = ids;
        EXISTING_IDS_CACHE.timestamp = Date.now();
        return ids;
    } catch (error) {
        console.error("Error fetching existing tmdbIds:", error);
        return new Set();
    }
}
function filterExistingMovies(items, existingIds) {
    return items.filter((item)=>existingIds.has(item.tmdbId));
}
async function fetchWithCache(url, cacheKey) {
    const cached = GENRE_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    const response = await fetch(url);
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`TMDB API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    GENRE_CACHE.set(cacheKey, {
        data,
        timestamp: Date.now()
    });
    return data;
}
function transformResults(items, genreMap, existingIds) {
    let filteredItems = items;
    if (existingIds && existingIds.size > 0) {
        filteredItems = filteredItems.filter((item)=>existingIds.has(item.id));
    }
    return filteredItems.slice(0, 20).map((item)=>({
            tmdbId: item.id,
            title: item.title || item.name,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
            banner: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "",
            description: item.overview,
            year: (item.release_date || item.first_air_date || "").split("-")[0],
            rating: Math.round(item.vote_average * 10) / 10,
            genreIds: item.genre_ids || [],
            genres: item.genre_ids?.map((id)=>genreMap.get(id)).filter(Boolean) || [],
            type: item.media_type,
            originalLanguage: item.original_language || ""
        }));
}
async function getGenreMap(tmdbType, apiKey) {
    const genreData = await fetchWithCache(`https://api.themoviedb.org/3/genre/${tmdbType}/list?api_key=${apiKey}`, `${tmdbType}_genres`);
    return new Map(genreData.genres?.map((g)=>[
            g.id,
            g.name
        ]) || []);
}
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const type = searchParams.get("type") || "movie";
    const action = searchParams.get("action");
    const filterExisting = searchParams.get("filterExisting") !== "false";
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey || apiKey === "YOUR_TMDB_API_KEY") {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "TMDB API key not configured"
        }, {
            status: 500
        });
    }
    if (action === "details") {
        const id = searchParams.get("id");
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "ID is required"
            }, {
                status: 400
            });
        }
        const tmdbType = type === "series" ? "tv" : "movie";
        try {
            const response = await fetch(`https://api.themoviedb.org/3/${tmdbType}/${id}?api_key=${apiKey}&language=en-US`);
            const data = await response.json();
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data
            });
        } catch (error) {
            console.error("TMDB details error:", error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Failed to fetch details"
            }, {
                status: 500
            });
        }
    }
    if (action === "genres") {
        try {
            const movieGenres = await fetchWithCache(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`, "movie_genres");
            console.log("Movie genres response:", movieGenres);
            const tvGenres = await fetchWithCache(`https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}`, "tv_genres");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: {
                    movieGenres: movieGenres.genres || [],
                    tvGenres: tvGenres.genres || []
                }
            });
        } catch (error) {
            console.error("TMDB genres error:", error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Failed to fetch genres"
            }, {
                status: 500
            });
        }
    }
    if (action === "discover") {
        try {
            const existingIds = filterExisting ? await getExistingTmdbIds() : new Set();
            const genreId = searchParams.get("genreId");
            const tmdbType = type === "series" ? "tv" : "movie";
            let url = `https://api.themoviedb.org/3/discover/${tmdbType}?api_key=${apiKey}&sort_by=popularity.desc`;
            if (genreId) {
                url += `&with_genres=${genreId}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            if (data.results) {
                const genreResponse = await fetch(`https://api.themoviedb.org/3/genre/${tmdbType}/list?api_key=${apiKey}`);
                const genreData = await genreResponse.json();
                const genreMap = new Map(genreData.genres?.map((g)=>[
                        g.id,
                        g.name
                    ]) || []);
                let filteredResults = data.results.filter((item)=>existingIds.has(item.id));
                const results = filteredResults.slice(0, 20).map((item)=>({
                        tmdbId: item.id,
                        title: item.title || item.name,
                        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
                        banner: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "",
                        description: item.overview,
                        year: (item.release_date || item.first_air_date || "").split("-")[0],
                        rating: Math.round(item.vote_average * 10) / 10,
                        genreIds: item.genre_ids || [],
                        genres: item.genre_ids?.map((id)=>genreMap.get(id)).filter(Boolean) || []
                    }));
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    data: results
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: []
            });
        } catch (error) {
            console.error("TMDB discover error:", error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Failed to discover content"
            }, {
                status: 500
            });
        }
    }
    if (action === "popular") {
        try {
            const existingIds = filterExisting ? await getExistingTmdbIds() : new Set();
            const tmdbType = type === "series" ? "tv" : "movie";
            console.log(`Fetching popular ${tmdbType}`);
            const response = await fetch(`https://api.themoviedb.org/3/${tmdbType}/popular?api_key=${apiKey}&language=en-US&page=1`);
            if (!response.ok) {
                console.error("TMDB API error:", response.status);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    data: []
                });
            }
            const data = await response.json();
            const genreResponse = await fetch(`https://api.themoviedb.org/3/genre/${tmdbType}/list?api_key=${apiKey}`);
            const genreData = await genreResponse.json();
            const genreMap = new Map(genreData.genres?.map((g)=>[
                    g.id,
                    g.name
                ]) || []);
            if (data.results) {
                const filteredResults = data.results.filter((item)=>existingIds.has(item.id));
                const results = filteredResults.slice(0, 20).map((item)=>({
                        tmdbId: item.id,
                        title: item.title || item.name,
                        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
                        banner: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "",
                        description: item.overview,
                        year: (item.release_date || item.first_air_date || "").split("-")[0],
                        rating: Math.round(item.vote_average * 10) / 10,
                        genreIds: item.genre_ids || [],
                        genres: item.genre_ids?.map((id)=>genreMap.get(id)).filter(Boolean) || []
                    }));
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    data: results
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: []
            });
        } catch (error) {
            console.error("TMDB popular error:", error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: []
            });
        }
    }
    if (action === "trending") {
        try {
            const existingIds = filterExisting ? await getExistingTmdbIds() : new Set();
            const timeWindow = searchParams.get("timeWindow") || "week";
            const movieResponse = await fetch(`https://api.themoviedb.org/3/trending/movie/${timeWindow}?api_key=${apiKey}`);
            if (!movieResponse.ok) {
                console.error("TMDB trending movie error:", movieResponse.status);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    data: []
                });
            }
            const movieData = await movieResponse.json();
            const tvResponse = await fetch(`https://api.themoviedb.org/3/trending/tv/${timeWindow}?api_key=${apiKey}`);
            if (!tvResponse.ok) {
                console.error("TMDB trending TV error:", tvResponse.status);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    data: []
                });
            }
            const tvData = await tvResponse.json();
            const allResults = [
                ...movieData.results || [],
                ...tvData.results || []
            ].filter((item)=>existingIds.has(item.id)).sort((a, b)=>b.vote_average - a.vote_average).slice(0, 20);
            const results = allResults.map((item)=>({
                    tmdbId: item.id,
                    title: item.title || item.name,
                    type: item.media_type,
                    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
                    banner: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "",
                    description: item.overview,
                    year: (item.release_date || item.first_air_date || "").split("-")[0],
                    rating: Math.round(item.vote_average * 10) / 10,
                    genreIds: item.genre_ids || []
                }));
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: results
            });
        } catch (error) {
            console.error("TMDB trending error:", error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: []
            });
        }
    }
    if (action === "toprated") {
        try {
            const existingIds = filterExisting ? await getExistingTmdbIds() : new Set();
            const tmdbType = type === "series" ? "tv" : "movie";
            const genreMap = await getGenreMap(tmdbType, apiKey);
            const response = await fetch(`https://api.themoviedb.org/3/${tmdbType}/top_rated?api_key=${apiKey}&language=en-US&page=1`);
            const data = await response.json();
            if (data.results) {
                const results = transformResults(data.results, genreMap, existingIds);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    data: results
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: []
            });
        } catch (error) {
            console.error("TMDB toprated error:", error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: []
            });
        }
    }
    if (action === "upcoming") {
        try {
            const existingIds = filterExisting ? await getExistingTmdbIds() : new Set();
            const tmdbType = type === "series" ? "tv" : "movie";
            const genreMap = await getGenreMap(tmdbType, apiKey);
            let url = `https://api.themoviedb.org/3/${tmdbType}/`;
            url += tmdbType === "movie" ? "upcoming" : "on_the_air";
            url += `?api_key=${apiKey}&language=en-US&page=1`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.results) {
                const results = transformResults(data.results, genreMap, existingIds);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    data: results
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: []
            });
        } catch (error) {
            console.error("TMDB upcoming error:", error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: []
            });
        }
    }
    if (action === "bygenre") {
        try {
            const existingIds = filterExisting ? await getExistingTmdbIds() : new Set();
            const genreId = searchParams.get("genreId");
            if (!genreId) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: "genreId required"
                }, {
                    status: 400
                });
            }
            const tmdbType = type === "series" ? "tv" : "movie";
            const genreMap = await getGenreMap(tmdbType, apiKey);
            const response = await fetch(`https://api.themoviedb.org/3/discover/${tmdbType}?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc&language=en-US&page=1`);
            if (!response.ok) {
                console.error("TMDB bygenre API error:", response.status);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: `TMDB API error: ${response.status}`
                }, {
                    status: 500
                });
            }
            const data = await response.json();
            if (data.results) {
                const results = transformResults(data.results, genreMap, existingIds);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    data: results
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: []
            });
        } catch (error) {
            console.error("TMDB bygenre error:", error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Failed to fetch by genre"
            }, {
                status: 500
            });
        }
    }
    if (action === "bylanguage") {
        try {
            const existingIds = filterExisting ? await getExistingTmdbIds() : new Set();
            const language = searchParams.get("language") || "te";
            const tmdbType = type === "series" ? "tv" : "movie";
            const genreMap = await getGenreMap(tmdbType, apiKey);
            const response = await fetch(`https://api.themoviedb.org/3/discover/${tmdbType}?api_key=${apiKey}&with_original_language=${language}&sort_by=popularity.desc&language=en-US&page=1`);
            if (!response.ok) {
                console.error("TMDB bylanguage API error:", response.status, await response.text());
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: `TMDB API error: ${response.status}`
                }, {
                    status: 500
                });
            }
            const data = await response.json();
            if (data.results) {
                const results = transformResults(data.results, genreMap, existingIds);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    data: results
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: []
            });
        } catch (error) {
            console.error("TMDB bylanguage error:", error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Failed to fetch by language"
            }, {
                status: 500
            });
        }
    }
    if (action === "indian") {
        try {
            const existingIds = filterExisting ? await getExistingTmdbIds() : new Set();
            const tmdbType = type === "series" ? "tv" : "movie";
            const genreMap = await getGenreMap(tmdbType, apiKey);
            const languages = [
                "te",
                "hi",
                "ta",
                "ml",
                "kn",
                "mr",
                "bn",
                "gu"
            ];
            const allResults = [];
            for (const lang of languages){
                const response = await fetch(`https://api.themoviedb.org/3/discover/${tmdbType}?api_key=${apiKey}&with_original_language=${lang}&sort_by=popularity.desc&language=en-US&page=1`);
                const data = await response.json();
                if (data.results) {
                    allResults.push(...data.results.slice(0, 5));
                }
            }
            const uniqueResults = allResults.reduce((acc, item)=>{
                const existing = acc.find((i)=>i.id === item.id);
                if (!existing) {
                    acc.push(item);
                }
                return acc;
            }, []);
            const sortedResults = uniqueResults.sort((a, b)=>b.vote_average - a.vote_average).slice(0, 20);
            const results = transformResults(sortedResults, genreMap, existingIds);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: results
            });
        } catch (error) {
            console.error("TMDB indian error:", error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: []
            });
        }
    }
    if (!query) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Query required"
        }, {
            status: 400
        });
    }
    try {
        const tmdbType = type === "series" ? "tv" : "movie";
        const response = await fetch(`https://api.themoviedb.org/3/search/${tmdbType}?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const genreResponse = await fetch(`https://api.themoviedb.org/3/genre/${tmdbType}/list?api_key=${apiKey}`);
            const genreData = await genreResponse.json();
            const genreMap = new Map(genreData.genres?.map((g)=>[
                    g.id,
                    g.name
                ]) || []);
            const results = data.results.slice(0, 10).map((item)=>({
                    tmdbId: item.id,
                    title: item.title || item.name,
                    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
                    banner: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "",
                    description: item.overview,
                    year: (item.release_date || item.first_air_date || "").split("-")[0],
                    rating: Math.round(item.vote_average * 10) / 10,
                    genreIds: item.genre_ids || [],
                    genres: item.genre_ids?.map((id)=>genreMap.get(id)).filter(Boolean) || []
                }));
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: results
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: []
        });
    } catch (error) {
        console.error("TMDB search error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: []
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0fe1ab0e._.js.map