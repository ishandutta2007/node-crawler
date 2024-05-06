import { HttpProxyAgent, HttpsProxyAgent } from "hpagent";
import http2Wrapper from "http2-wrapper";
import { cleanObject, getType, isValidUrl } from "./lib/utils.js";

export const getValidOptions = (options: unknown): Object => {
    const type = getType(options);
    if (type === "string") {
        try {
            if (isValidUrl(options as string)) return { url: options };
            options = JSON.parse(options as string);
            return options as Object;
        } catch (e) {
            throw new TypeError(`Invalid options: ${JSON.stringify(options)}`);
        }
    } else if (type === "object") {
        const prototype = Object.getPrototypeOf(options);
        if (prototype === Object.prototype || prototype === null) return options as Object;
    }
    throw new TypeError(`Invalid options: ${JSON.stringify(options)}`);
};

export const alignOptions = (options: any): any => {
    const crawlerOnlyOptions = [
        "forceUTF8",
        "incomingEncoding",
        "jQuery",
        "retryTimeout",
        "timeout",
        "priority",
        "proxy",
        "retries",
        "preRequest",
        "callback",
        "release",
    ];
    const deprecatedOptions = ["uri", "qs", "strictSSL", "gzip", "jar", "jsonReviver", "jsonReplacer", "json", "skipEventRequest"].concat(
        crawlerOnlyOptions
    );
    const defaultagent = {
        https: new HttpsProxyAgent({
            proxy: options["proxy"],
        }),
        http: new HttpProxyAgent({
            proxy: options["proxy"],
        }),
    };

    const gotOptions = {
        ...options,
        url: options.url ?? options.uri,
        searchParams: options.qs,
        rejectUnauthorized: options.strictSSL,
        decompress: options.gzip,
        cookieJar: options.jar,
        parseJson: options.jsonReviver,
        stringifyJson: options.jsonReplacer,
    };

    // http2 proxy
    if (options.http2 === true && options.proxy) {
        const { proxies: Http2Proxies } = http2Wrapper;
        const protocol = options.proxy.startsWith("https") ? "https" : "http";
        const http2Agent =
            protocol === "https"
                ? new Http2Proxies.HttpsOverHttp2({
                    proxyOptions: { url: options.proxy },
                })
                : new Http2Proxies.HttpOverHttp2({
                    proxyOptions: { url: options.proxy },
                });
        gotOptions.agent = http2Agent;
    } else {
        gotOptions.agent = gotOptions.agent ?? (options.proxy ? defaultagent : undefined);
    }

    if (gotOptions.encoding === null) {
        gotOptions.responseType = gotOptions.responseType ?? "buffer";
        delete gotOptions.encoding;
    }

    Object.keys(gotOptions).forEach(key => {
        if (deprecatedOptions.includes(key)) {
            delete gotOptions[key];
        }
    });
    cleanObject(gotOptions);
    return gotOptions;
};
