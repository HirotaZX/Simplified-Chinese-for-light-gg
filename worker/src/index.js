// Cloudflare Workers doesn't support full functional TransformStream yet.
// import { JSONLParseStream } from './jsonl-parse-stream'
import { Router } from 'itty-router'

const router = Router()

router.get("/", () => {
    return new Response("Hello, Guardian.")
})

router.get("/search", async ({ query, headers }) => {
    let results = []
    const name = query.q
    const contentType = headers.get('Content-Type')
    if (!name) { 
        return new Response("Invalid Parameters!", { status: 400 })
    }
    
    const jsonlStream = await SC4LIGHTGG_KV.get('items', { type: 'stream' }) // JSONL stream encoded in UTF-8
    const reader = jsonlStream.getReader()

    const LF = 0x0A
    const utf8Decoder = new TextDecoder("utf-8")
    let truncFormer = new Uint8Array(0)
    let { value, done } = await reader.read()

    while(!done) {
        let startIndex = 0
        for(let i = 0; i < value.length; i++) {
            if(value[i] === LF) {
                let line = value.subarray(startIndex, i)

                if(startIndex === 0) {
                    let truncLatter = line
                    let truncWhole = new Uint8Array(truncFormer.length + truncLatter.length)
                    truncWhole.set(truncFormer)
                    truncWhole.set(truncLatter, truncFormer.length)
                    line = truncWhole
                }
                let item = JSON.parse(utf8Decoder.decode(line))

                if(item.name.includes(name)) {
                    results.push(item)
                    if(results.length >= 10) {
                        reader.cancel()
                    }
                }

                startIndex = i + 1
            }
        }
        let remain = value.slice(startIndex)
        truncFormer = remain ? remain : new Uint8Array(0)

        ;({ value, done } = await reader.read())
    }

    let resp = new Response()
    const mimeType = contentType ? contentType.split(';')[0] : 'text/html'
    switch(mimeType) {
        case 'application/json':
            resp = new Response(JSON.stringify(results), {
                status: 200,
                headers: {
                    'Content-Type' : 'application/json; charset=utf-8'
                }
            })
            break
        case 'text/html':
        default:
            let htmlString = '';
            for(let item of results) {
                htmlString += `
                <div style="display: flex;width: 100%;height: 64px;border-style: solid;border-color: gray;border-width: 1px;background-color: #1a1a20;color: #aaa;">
                    <img src="https://www.bungie.net${item.icon}" alt="${item.name}" style="height: 60px; border-style: solid; border-color: gray; border-width: 2px;"/>
                    <div style="display: flex;margin-left: 5px;flex-direction: column;">
                        <a href="https://www.light.gg/db/items/${item.hash}" target="_self" style="color: #09f;font-size: 24px;text-decoration: none;">${item.name}</a>
                        <span style="font-size: 18px;">${item.type} / ${item.tier}</span>
                    </div>  
                </div>
                `
            }
            resp = new Response(htmlString, {
                status: 200,
                headers: {
                    'Content-Type' : 'text/html; charset=utf-8'
                }
            })
            break
    }
    return resp
})

router.get("/query", () => {
    return new Response("Under Construction.", { status: 503 })
})

router.all("*", () => {
    return new Response("Illegal Access Detected!", { status: 404 })
})

addEventListener('fetch', event => {
    event.respondWith(router.handle(event.request))
})