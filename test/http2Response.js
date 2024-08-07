import test from "ava";
import { testCb } from "./lib/avaTestCb.js";
import Crawler from "../dist/index.js";

test.afterEach(t => {
    t.context.crawler = null;
});

testCb(test, "response statusCode.", async t => {
    t.context.crawler = new Crawler({
        // silence: true,
        timeout: 10000,
        retryInterval: 1000,
        retries: 2,
        jQuery: false,
        http2: true,
    });
    t.context.crawler.add({
        url: "https://nghttp2.org/httpbin/status/200",
        callback: (error, response, done) => {
            t.is(response.statusCode, 200);
            done();
            t.end();
        },
    });
});

testCb(test, "response headers.", async t => {
    t.context.crawler = new Crawler({
        // silence: true,
        retryInterval: 1000,
        retries: 2,
        jQuery: false,
        http2: true,
    });
    t.context.crawler.add({
        url: "https://nghttp2.org/httpbin/status/200",
        callback: (error, response, done) => {
            t.truthy(response.headers);
            t.is(typeof response.headers, "object");
            t.is(response.headers["content-type"], "text/html; charset=utf-8");
            done();
            t.end();
        },
    });
});

testCb(test, "html response body.", async t => {
    t.context.crawler = new Crawler({
        // silence: true,
        retryInterval: 1000,
        retries: 2,
        jQuery: true,
        http2: true,
    });
    t.context.crawler.add({
        url: "https://nghttp2.org/httpbin/html",
        callback: (error, response, done) => {
            t.truthy(response.$);
            t.is(typeof response.$, "function");
            t.is(response.$("body").length, 1);
            done();
            t.end();
        },
    });
});
