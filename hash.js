import crypto from "crypto";
import path from "path";
import fs from "fs";
import stream from "stream";
import util from "util";

const pipeline = util.promisify(stream.pipeline);

export default async function calcFileHashes(dir, filter = () => true) {
    let hashJobs = [];
    let hashes = "";
    for (let filename of (await fs.promises.readdir(dir)).filter(filter)) {
        let file = fs.createReadStream(path.join(dir, filename));
        let hash = crypto.createHash("BLAKE2s256");
        let promise = pipeline(file, hash).then(() => {
            hashes += hash.digest("hex") + " " + filename + "\n";
        });
        hashJobs.push(promise);
    }
    await Promise.all(hashJobs);
    await fs.promises.writeFile(path.join(dir, new Date().toISOString().replace(/:/g, "-") + ".hashes"), hashes);
}

calcFileHashes("sde", s => s.includes(".json")).catch(console.error);