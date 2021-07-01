const transformContent = {
    start() {
        this.LF = 0x0A;
        this.utf8Decoder = new TextDecoder("utf-8");
        this.truncFormer = new Uint8Array(0);
    },
    transform(chunk, controller) {
        let startIndex = 0;
        for(let i = 0; i < chunk.length; i++) {
            if(chunk[i] === this.LF) {
                let line = chunk.subarray(startIndex, i);
                if(startIndex === 0) {
                    let truncLatter = line;
                    let truncWhole = new Uint8Array(this.truncFormer.length + truncLatter.length);
                    truncWhole.set(this.truncFormer);
                    truncWhole.set(truncLatter, this.truncFormer.length);
                    line = truncWhole;
                }
                let item = JSON.parse(this.utf8Decoder.decode(line));
                if(item) {
                    controller.enqueue(item);
                }
                startIndex = i + 1;
            }
        }
        let remain = chunk.slice(startIndex);
        this.truncFormer = remain ? remain : new Uint8Array(0);
    }
};

export class JSONLParseStream extends TransformStream {
    constructor() {
        super({...transformContent});
    }
}

