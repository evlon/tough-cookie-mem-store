'use strict'
import toughCookieLib from 'tough-cookie'
import util from 'util'
// const util = require('util')
const { Store, permuteDomain, pathMatch, Cookie } = toughCookieLib;

// const fs = require('fs')

/**
 * Class representing a JSON Object store.
 *
 * @augments Store
 */
class JsonObjectCookieStore extends Store {
    /**
     * Creates a new JSON file store in the specified file.
     *
     * @param {object} cookieJsonObject - The json object in which the store can save cookie.
     */
    constructor(dataJson) {
        super()
        this.synchronous = true
        this.idx = {}
        // this.filePath = filePath
        /* istanbul ignore else  */
        if (util.inspect.custom) {
            this[util.inspect.custom] = this._inspect
        }

        /* istanbul ignore else  */
        if (dataJson) {
            for (const domainName in dataJson) {
                for (const pathName in dataJson[domainName]) {
                    for (const cookieName in dataJson[domainName][pathName]) {
                        dataJson[domainName][pathName][cookieName] = Cookie.fromJSON(
                            JSON.stringify(dataJson[domainName][pathName][cookieName])
                        )
                    }
                }
            }

            this.idx = dataJson;
        }


    }

    /**
     * 
     * @returns cookie object : JsonObject 
     */
    getJsonCookieObject(){
        return Object.assign({},this.idx);
    }

    /**
     * The findCookie callback.
     *
     * @callback JsonObjectCookieStore~findCookieCallback
     * @param {Error} error - The error if any.
     * @param {Cookie} cookie - The cookie found.
     */

    /**
     * Retrieve a cookie with the given domain, path and key.
     *
     * @param {string} domain - The cookie domain.
     * @param {string} path - The cookie path.
     * @param {string} key - The cookie key.
     * @param {JsonObjectCookieStore~findCookieCallback} cb - The callback.
     */
    findCookie(domain, path, key, cb) {
        if (!this.idx[domain]) {
            cb(null, undefined)
        } else if (!this.idx[domain][path]) {
            cb(null, undefined)
        } else {
            cb(null, this.idx[domain][path][key] || null)
        }
    }

    /**
     * The findCookies callback.
     *
     * @callback JsonObjectCookieStore~allowSpecialUseDomainCallback
     * @param {Error} error - The error if any.
     * @param {Cookie[]} cookies - Array of cookies.
     */

    /**
     * The findCookies callback.
     *
     * @callback JsonObjectCookieStore~findCookiesCallback
     * @param {Error} error - The error if any.
     * @param {Cookie[]} cookies - Array of cookies.
     */

    /**
     * Locates cookies matching the given domain and path.
     *
     * @param {string} domain - The cookie domain.
     * @param {string} path - The cookie path.
     * @param {JsonObjectCookieStore~allowSpecialUseDomainCallback} allowSpecialUseDomain - The callback.
     * @param {JsonObjectCookieStore~findCookiesCallback} cb - The callback.
     */
    findCookies(domain, path, allowSpecialUseDomain, cb) {
        const results = []

        if (typeof allowSpecialUseDomain === 'function') {
            cb = allowSpecialUseDomain
            allowSpecialUseDomain = false
        }

        if (!domain) {
            cb(null, [])
        }

        let pathMatcher
        if (!path) {
            pathMatcher = function matchAll(domainIndex) {
                for (const curPath in domainIndex) {
                    const pathIndex = domainIndex[curPath]
                    for (const key in pathIndex) {
                        results.push(pathIndex[key])
                    }
                }
            }
        } else {
            pathMatcher = function matchRFC(domainIndex) {
                Object.keys(domainIndex).forEach(cookiePath => {
                    if (pathMatch(path, cookiePath)) {
                        const pathIndex = domainIndex[cookiePath]
                        for (const key in pathIndex) {
                            results.push(pathIndex[key])
                        }
                    }
                })
            }
        }

        const domains = permuteDomain(domain, allowSpecialUseDomain) || [domain]
        const idx = this.idx
        domains.forEach(curDomain => {
            const domainIndex = idx[curDomain]
            if (!domainIndex) {
                return
            }
            pathMatcher(domainIndex)
        })

        cb(null, results)
    }

    /**
     * The putCookie callback.
     *
     * @callback JsonObjectCookieStore~putCookieCallback
     * @param {Error} error - The error if any.
     */

    /**
     * Adds a new cookie to the store.
     *
     * @param {Cookie} cookie - The cookie.
     * @param {JsonObjectCookieStore~putCookieCallback} cb - The callback.
     */
    putCookie(cookie, cb) {
        if (!this.idx[cookie.domain]) {
            this.idx[cookie.domain] = {}
        }
        if (!this.idx[cookie.domain][cookie.path]) {
            this.idx[cookie.domain][cookie.path] = {}
        }
        this.idx[cookie.domain][cookie.path][cookie.key] = cookie
        cb(null)
    }

    /**
     * The updateCookie callback.
     *
     * @callback JsonObjectCookieStore~updateCookieCallback
     * @param {Error} error - The error if any.
     */

    /**
     * Update an existing cookie.
     *
     * @param {Cookie} oldCookie - The old cookie.
     * @param {Cookie} newCookie - The new cookie.
     * @param {JsonObjectCookieStore~updateCookieCallback} cb - The callback.
     */
    updateCookie(oldCookie, newCookie, cb) {
        this.putCookie(newCookie, cb)
    }

    /**
     * The removeCookie callback.
     *
     * @callback JsonObjectCookieStore~removeCookieCallback
     * @param {Error} error - The error if any.
     */

    /**
     * Remove a cookie from the store.
     *
     * @param {string} domain - The cookie domain.
     * @param {string} path - The cookie path.
     * @param {string} key - The cookie key.
     * @param {JsonObjectCookieStore~removeCookieCallback} cb - The callback.
     */
    removeCookie(domain, path, key, cb) {
        /* istanbul ignore else  */
        if (this.idx[domain] && this.idx[domain][path] && this.idx[domain][path][key]) {
            delete this.idx[domain][path][key]
        }
        cb(null)
    }

    /**
     * The removeCookies callback.
     *
     * @callback JsonObjectCookieStore~removeCookiesCallback
     * @param {Error} error - The error if any.
     */

    /**
     * Removes matching cookies from the store.
     *
     * @param {string} domain - The cookie domain.
     * @param {string} path - The cookie path.
     * @param {JsonObjectCookieStore~removeCookiesCallback} cb - The callback.
     */
    removeCookies(domain, path, cb) {
        /* istanbul ignore else  */
        if (this.idx[domain]) {
            if (path) {
                delete this.idx[domain][path]
            } else {
                delete this.idx[domain]
            }
        }
        cb(null)
    }

    /**
     * The removeAllCookies callback.
     *
     * @callback JsonObjectCookieStore~removeAllCookiesCallback
     * @param {Error} error - The error if any.
     */

    /**
     * Removes all cookies from the store.
     *
     * @param {JsonObjectCookieStore~removeAllCookiesCallback} cb - The callback.
     */
    removeAllCookies(cb) {
        const self = this;
        Object.keys(this.idx).forEach(k => delete self.idx[k])
        // this.idx = {}
        cb(null)
    }

    /**
     * The getAllCookies callback.
     *
     * @callback JsonObjectCookieStore~getAllCookiesCallback
     * @param {Error} error - The error if any.
     * @param {Array} cookies - An array of cookies.
     */

    /**
     * Produces an Array of all cookies from the store.
     *
     * @param {JsonObjectCookieStore~getAllCookiesCallback} cb - The callback.
     */
    getAllCookies(cb) {
        const cookies = []
        const idx = this.idx

        const domains = Object.keys(idx)
        domains.forEach(domain => {
            const paths = Object.keys(idx[domain])
            paths.forEach(path => {
                const keys = Object.keys(idx[domain][path])
                keys.forEach(key => {
                    /* istanbul ignore else  */
                    if (key !== null) {
                        cookies.push(idx[domain][path][key])
                    }
                })
            })
        })

        cookies.sort((a, b) => {
            return (a.creationIndex || 0) - (b.creationIndex || 0)
        })

        cb(null, cookies)
    }

    /**
     * Returns a string representation of the store object for debugging purposes.
     *
     * @returns {string} - The string representation of the store.
     * @private
     */
    _inspect() {
        return `{ idx: ${util.inspect(this.idx, false, 2)} }`
    }

}

export default JsonObjectCookieStore
