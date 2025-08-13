"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fkaushalbhatt%2FDownloads%2Fkaushal_portfolio%2Fapp%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fkaushalbhatt%2FDownloads%2Fkaushal_portfolio%2Fapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fkaushalbhatt%2FDownloads%2Fkaushal_portfolio%2Fapp%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fkaushalbhatt%2FDownloads%2Fkaushal_portfolio%2Fapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_kaushalbhatt_Downloads_kaushal_portfolio_app_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"/Users/kaushalbhatt/Downloads/kaushal_portfolio/app/app/api/auth/[...nextauth]/route.ts\",\n    nextConfigOutput,\n    userland: _Users_kaushalbhatt_Downloads_kaushal_portfolio_app_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmthdXNoYWxiaGF0dCUyRkRvd25sb2FkcyUyRmthdXNoYWxfcG9ydGZvbGlvJTJGYXBwJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRmthdXNoYWxiaGF0dCUyRkRvd25sb2FkcyUyRmthdXNoYWxfcG9ydGZvbGlvJTJGYXBwJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUN1QztBQUNwSDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL2FwcC8/Y2UzOSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMva2F1c2hhbGJoYXR0L0Rvd25sb2Fkcy9rYXVzaGFsX3BvcnRmb2xpby9hcHAvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2F1dGgvWy4uLm5leHRhdXRoXVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL2thdXNoYWxiaGF0dC9Eb3dubG9hZHMva2F1c2hhbF9wb3J0Zm9saW8vYXBwL2FwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fkaushalbhatt%2FDownloads%2Fkaushal_portfolio%2Fapp%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fkaushalbhatt%2FDownloads%2Fkaushal_portfolio%2Fapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n\n\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(_lib_auth__WEBPACK_IMPORTED_MODULE_1__.authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNpQztBQUNRO0FBRXpDLE1BQU1FLFVBQVVGLGdEQUFRQSxDQUFDQyxrREFBV0E7QUFFTyIsInNvdXJjZXMiOlsid2VicGFjazovL2FwcC8uL2FwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlLnRzP2M4YTQiXSwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgTmV4dEF1dGggZnJvbSBcIm5leHQtYXV0aFwiO1xuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tIFwiQC9saWIvYXV0aFwiO1xuXG5jb25zdCBoYW5kbGVyID0gTmV4dEF1dGgoYXV0aE9wdGlvbnMpO1xuXG5leHBvcnQgeyBoYW5kbGVyIGFzIEdFVCwgaGFuZGxlciBhcyBQT1NUIH07XG4iXSwibmFtZXMiOlsiTmV4dEF1dGgiLCJhdXRoT3B0aW9ucyIsImhhbmRsZXIiLCJHRVQiLCJQT1NUIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @next-auth/prisma-adapter */ \"(rsc)/./node_modules/@next-auth/prisma-adapter/dist/index.js\");\n/* harmony import */ var _db__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./db */ \"(rsc)/./lib/db.ts\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\nconst authOptions = {\n    adapter: (0,_next_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__.PrismaAdapter)(_db__WEBPACK_IMPORTED_MODULE_2__.prisma),\n    secret: process.env.NEXTAUTH_SECRET,\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                try {\n                    if (!credentials?.email || !credentials?.password) {\n                        console.log(\"Missing credentials\");\n                        return null;\n                    }\n                    const user = await _db__WEBPACK_IMPORTED_MODULE_2__.prisma.user.findUnique({\n                        where: {\n                            email: credentials.email\n                        }\n                    });\n                    if (!user) {\n                        console.log(\"User not found\");\n                        return null;\n                    }\n                    const isPasswordValid = await bcryptjs__WEBPACK_IMPORTED_MODULE_3___default().compare(credentials.password, user.password);\n                    if (!isPasswordValid) {\n                        console.log(\"Invalid password\");\n                        return null;\n                    }\n                    console.log(\"User authenticated successfully:\", user.email);\n                    return {\n                        id: user.id,\n                        email: user.email,\n                        name: user.name,\n                        role: user.role\n                    };\n                } catch (error) {\n                    console.error(\"Auth error:\", error);\n                    return null;\n                }\n            }\n        })\n    ],\n    session: {\n        strategy: \"jwt\"\n    },\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.role = user.role;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (token && session.user) {\n                session.user.id = token.id || token.sub;\n                session.user.role = token.role;\n            }\n            return session;\n        }\n    },\n    pages: {\n        signIn: \"/auth/signin\"\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFFa0U7QUFDUjtBQUM1QjtBQUNFO0FBRXpCLE1BQU1JLGNBQStCO0lBQzFDQyxTQUFTSix3RUFBYUEsQ0FBQ0MsdUNBQU1BO0lBQzdCSSxRQUFRQyxRQUFRQyxHQUFHLENBQUNDLGVBQWU7SUFDbkNDLFdBQVc7UUFDVFYsMkVBQW1CQSxDQUFDO1lBQ2xCVyxNQUFNO1lBQ05DLGFBQWE7Z0JBQ1hDLE9BQU87b0JBQUVDLE9BQU87b0JBQVNDLE1BQU07Z0JBQVE7Z0JBQ3ZDQyxVQUFVO29CQUFFRixPQUFPO29CQUFZQyxNQUFNO2dCQUFXO1lBQ2xEO1lBQ0EsTUFBTUUsV0FBVUwsV0FBVztnQkFDekIsSUFBSTtvQkFDRixJQUFJLENBQUNBLGFBQWFDLFNBQVMsQ0FBQ0QsYUFBYUksVUFBVTt3QkFDakRFLFFBQVFDLEdBQUcsQ0FBQzt3QkFDWixPQUFPO29CQUNUO29CQUVBLE1BQU1DLE9BQU8sTUFBTWxCLHVDQUFNQSxDQUFDa0IsSUFBSSxDQUFDQyxVQUFVLENBQUM7d0JBQ3hDQyxPQUFPOzRCQUFFVCxPQUFPRCxZQUFZQyxLQUFLO3dCQUFDO29CQUNwQztvQkFFQSxJQUFJLENBQUNPLE1BQU07d0JBQ1RGLFFBQVFDLEdBQUcsQ0FBQzt3QkFDWixPQUFPO29CQUNUO29CQUVBLE1BQU1JLGtCQUFrQixNQUFNcEIsdURBQWdCLENBQzVDUyxZQUFZSSxRQUFRLEVBQ3BCSSxLQUFLSixRQUFRO29CQUdmLElBQUksQ0FBQ08saUJBQWlCO3dCQUNwQkwsUUFBUUMsR0FBRyxDQUFDO3dCQUNaLE9BQU87b0JBQ1Q7b0JBRUFELFFBQVFDLEdBQUcsQ0FBQyxvQ0FBb0NDLEtBQUtQLEtBQUs7b0JBQzFELE9BQU87d0JBQ0xZLElBQUlMLEtBQUtLLEVBQUU7d0JBQ1haLE9BQU9PLEtBQUtQLEtBQUs7d0JBQ2pCRixNQUFNUyxLQUFLVCxJQUFJO3dCQUNmZSxNQUFNTixLQUFLTSxJQUFJO29CQUNqQjtnQkFDRixFQUFFLE9BQU9DLE9BQU87b0JBQ2RULFFBQVFTLEtBQUssQ0FBQyxlQUFlQTtvQkFDN0IsT0FBTztnQkFDVDtZQUNGO1FBQ0Y7S0FDRDtJQUNEQyxTQUFTO1FBQ1BDLFVBQVU7SUFDWjtJQUNBQyxXQUFXO1FBQ1QsTUFBTUMsS0FBSSxFQUFFQyxLQUFLLEVBQUVaLElBQUksRUFBRTtZQUN2QixJQUFJQSxNQUFNO2dCQUNSWSxNQUFNUCxFQUFFLEdBQUdMLEtBQUtLLEVBQUU7Z0JBQ2xCTyxNQUFNTixJQUFJLEdBQUcsS0FBY0EsSUFBSTtZQUNqQztZQUNBLE9BQU9NO1FBQ1Q7UUFDQSxNQUFNSixTQUFRLEVBQUVBLE9BQU8sRUFBRUksS0FBSyxFQUFFO1lBQzlCLElBQUlBLFNBQVNKLFFBQVFSLElBQUksRUFBRTtnQkFDekJRLFFBQVFSLElBQUksQ0FBQ0ssRUFBRSxHQUFHTyxNQUFNUCxFQUFFLElBQWNPLE1BQU1DLEdBQUc7Z0JBQ2pETCxRQUFRUixJQUFJLENBQUNNLElBQUksR0FBR00sTUFBTU4sSUFBSTtZQUNoQztZQUNBLE9BQU9FO1FBQ1Q7SUFDRjtJQUNBTSxPQUFPO1FBQ0xDLFFBQVE7SUFDVjtBQUNGLEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hcHAvLi9saWIvYXV0aC50cz9iZjdlIl0sInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgTmV4dEF1dGhPcHRpb25zIH0gZnJvbSBcIm5leHQtYXV0aFwiO1xuaW1wb3J0IENyZWRlbnRpYWxzUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvY3JlZGVudGlhbHNcIjtcbmltcG9ydCB7IFByaXNtYUFkYXB0ZXIgfSBmcm9tIFwiQG5leHQtYXV0aC9wcmlzbWEtYWRhcHRlclwiO1xuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSBcIi4vZGJcIjtcbmltcG9ydCBiY3J5cHRqcyBmcm9tIFwiYmNyeXB0anNcIjtcblxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zOiBOZXh0QXV0aE9wdGlvbnMgPSB7XG4gIGFkYXB0ZXI6IFByaXNtYUFkYXB0ZXIocHJpc21hKSxcbiAgc2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQsXG4gIHByb3ZpZGVyczogW1xuICAgIENyZWRlbnRpYWxzUHJvdmlkZXIoe1xuICAgICAgbmFtZTogXCJjcmVkZW50aWFsc1wiLFxuICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgZW1haWw6IHsgbGFiZWw6IFwiRW1haWxcIiwgdHlwZTogXCJlbWFpbFwiIH0sXG4gICAgICAgIHBhc3N3b3JkOiB7IGxhYmVsOiBcIlBhc3N3b3JkXCIsIHR5cGU6IFwicGFzc3dvcmRcIiB9XG4gICAgICB9LFxuICAgICAgYXN5bmMgYXV0aG9yaXplKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFjcmVkZW50aWFscz8uZW1haWwgfHwgIWNyZWRlbnRpYWxzPy5wYXNzd29yZCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJNaXNzaW5nIGNyZWRlbnRpYWxzXCIpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xuICAgICAgICAgICAgd2hlcmU6IHsgZW1haWw6IGNyZWRlbnRpYWxzLmVtYWlsIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmICghdXNlcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVc2VyIG5vdCBmb3VuZFwiKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGlzUGFzc3dvcmRWYWxpZCA9IGF3YWl0IGJjcnlwdGpzLmNvbXBhcmUoXG4gICAgICAgICAgICBjcmVkZW50aWFscy5wYXNzd29yZCxcbiAgICAgICAgICAgIHVzZXIucGFzc3dvcmRcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgaWYgKCFpc1Bhc3N3b3JkVmFsaWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSW52YWxpZCBwYXNzd29yZFwiKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiVXNlciBhdXRoZW50aWNhdGVkIHN1Y2Nlc3NmdWxseTpcIiwgdXNlci5lbWFpbCk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiB1c2VyLmlkLFxuICAgICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwsXG4gICAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgICAgICByb2xlOiB1c2VyLnJvbGUsXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQXV0aCBlcnJvcjpcIiwgZXJyb3IpO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgXSxcbiAgc2Vzc2lvbjoge1xuICAgIHN0cmF0ZWd5OiBcImp3dFwiLFxuICB9LFxuICBjYWxsYmFja3M6IHtcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9KSB7XG4gICAgICBpZiAodXNlcikge1xuICAgICAgICB0b2tlbi5pZCA9IHVzZXIuaWQ7XG4gICAgICAgIHRva2VuLnJvbGUgPSAodXNlciBhcyBhbnkpLnJvbGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gdG9rZW47XG4gICAgfSxcbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xuICAgICAgaWYgKHRva2VuICYmIHNlc3Npb24udXNlcikge1xuICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5pZCBhcyBzdHJpbmcgfHwgdG9rZW4uc3ViITtcbiAgICAgICAgc2Vzc2lvbi51c2VyLnJvbGUgPSB0b2tlbi5yb2xlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNlc3Npb247XG4gICAgfSxcbiAgfSxcbiAgcGFnZXM6IHtcbiAgICBzaWduSW46IFwiL2F1dGgvc2lnbmluXCIsXG4gIH0sXG59O1xuIl0sIm5hbWVzIjpbIkNyZWRlbnRpYWxzUHJvdmlkZXIiLCJQcmlzbWFBZGFwdGVyIiwicHJpc21hIiwiYmNyeXB0anMiLCJhdXRoT3B0aW9ucyIsImFkYXB0ZXIiLCJzZWNyZXQiLCJwcm9jZXNzIiwiZW52IiwiTkVYVEFVVEhfU0VDUkVUIiwicHJvdmlkZXJzIiwibmFtZSIsImNyZWRlbnRpYWxzIiwiZW1haWwiLCJsYWJlbCIsInR5cGUiLCJwYXNzd29yZCIsImF1dGhvcml6ZSIsImNvbnNvbGUiLCJsb2ciLCJ1c2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaXNQYXNzd29yZFZhbGlkIiwiY29tcGFyZSIsImlkIiwicm9sZSIsImVycm9yIiwic2Vzc2lvbiIsInN0cmF0ZWd5IiwiY2FsbGJhY2tzIiwiand0IiwidG9rZW4iLCJzdWIiLCJwYWdlcyIsInNpZ25JbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./lib/db.ts":
/*!*******************!*\
  !*** ./lib/db.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst prisma = globalThis.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) {\n    globalThis.prisma = prisma;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZGIudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQzhDO0FBTXZDLE1BQU1DLFNBQVNDLFdBQVdELE1BQU0sSUFBSSxJQUFJRCx3REFBWUEsR0FBRztBQUU5RCxJQUFJRyxJQUF5QixFQUFjO0lBQ3pDRCxXQUFXRCxNQUFNLEdBQUdBO0FBQ3RCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYXBwLy4vbGliL2RiLnRzPzFkZjAiXSwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tICdAcHJpc21hL2NsaWVudCc7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgdmFyIHByaXNtYTogUHJpc21hQ2xpZW50IHwgdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgY29uc3QgcHJpc21hID0gZ2xvYmFsVGhpcy5wcmlzbWEgfHwgbmV3IFByaXNtYUNsaWVudCgpO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBnbG9iYWxUaGlzLnByaXNtYSA9IHByaXNtYTtcbn1cbiJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJwcmlzbWEiLCJnbG9iYWxUaGlzIiwicHJvY2VzcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/db.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/@next-auth","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/@panva","vendor-chunks/oidc-token-hash"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fkaushalbhatt%2FDownloads%2Fkaushal_portfolio%2Fapp%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fkaushalbhatt%2FDownloads%2Fkaushal_portfolio%2Fapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();